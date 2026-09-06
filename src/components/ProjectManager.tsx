"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Download,
  Eye,
  HardHat,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes } from "../data/projects";
import { fetchProjectsFromDataCenter, ProjectWithRowId, projectToRow, readProjectSnapshot } from "../lib/projectData";
import PageHeader from "./ui/PageHeader";
import ProgressBar from "./ui/ProgressBar";
import { RiskBadge, StatusBadge } from "./ui/StatusBadge";
import ProjectForm from "./ProjectForm";
import { appendClientRows, deleteClientRows, updateClientRows } from "../lib/clientDataStore";

function isTailgProject(project: Pick<ProjectWithRowId, "code" | "name">) {
  return /TAILG/i.test(`${project.code ?? ""} ${project.name ?? ""}`);
}

function projectHref(project: ProjectWithRowId) {
  return isTailgProject(project) ? "/projects/tailg" : `/projects/${project.id}`;
}

function projectVisual(project: ProjectWithRowId) {
  if (isTailgProject(project)) return "/media/tailg-site-overview.svg";
  if (project.type === "Hạ tầng") return "/media/infrastructure.svg";
  if (project.type === "Giao thông") return "/media/transport.svg";
  if (project.type === "Công nghiệp") return "/media/industrial.svg";
  return "/media/hero-construction.svg";
}

export default function ProjectManager() {
  const [items, setItems] = useState<ProjectWithRowId[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProjectWithRowId | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [view, setView] = useState<"table" | "grid">("grid");

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchProjectsFromDataCenter());
      setSelectedIds([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu dự án.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const snapshot = readProjectSnapshot();
    if (snapshot.length > 0) setItems(snapshot);

    const timer = window.setTimeout(() => { void load(); }, 0);
    const sync = () => { void load(); };
    window.addEventListener("licogi-data-imported", sync);
    window.addEventListener("licogi-projects-updated", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("licogi-data-imported", sync);
      window.removeEventListener("licogi-projects-updated", sync);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((project) => {
      const matchesSearch = !keyword || [project.name, project.investor, project.province, project.code ?? "", project.manager ?? ""].some((value) => value.toLocaleLowerCase("vi").includes(keyword));
      return matchesSearch && (type === "all" || project.type === type) && (status === "all" || project.status === status);
    });
  }, [items, search, status, type]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = useMemo(() => filteredItems.map((project) => project._rowId).filter((id): id is string => Boolean(id)), [filteredItems]);
  const allVisibleSelected = Boolean(visibleIds.length) && visibleIds.every((id) => selectedSet.has(id));

  async function saveProject(project: ProjectWithRowId) {
    const row = projectToRow(project);
    const method = project._rowId ? "PATCH" : "POST";
    const payload = project._rowId ? { row } : { mode: "append", rows: [row] };
    try {
      const response = await fetch("/api/data/projects", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không lưu được dự án.");
      setEditing(null);
      setShowForm(false);
      setMessage("Đã lưu dữ liệu dự án vào Data Center.");
      await load();
    } catch {
      if (project._rowId) updateClientRows("projects", [project._rowId], row);
      else appendClientRows("projects", [row]);
      setEditing(null);
      setShowForm(false);
      setMessage("API chưa phản hồi; dự án được giữ tạm ở bản ghi cục bộ.");
      await load();
    }
  }

  async function deleteIds(ids: string[], label: string) {
    if (!ids.length) return;
    if (!window.confirm(`Xóa ${label}? Dữ liệu đã xóa không thể khôi phục.`)) return;
    setLoading(true);
    try {
      const response = await fetch("/api/data/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không xóa được dự án.");
      setMessage(`Đã xóa ${ids.length} dự án.`);
      await load();
    } catch {
      deleteClientRows("projects", ids);
      setMessage("API chưa phản hồi; đã xóa khỏi bản ghi cục bộ.");
      await load();
    } finally {
      setLoading(false);
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  function exportCsv() {
    const rows = [
      ["project_code", "project_name", "investor", "type", "province", "status", "value_range", "progress", "manager"],
      ...filteredItems.map((project) => [project.code ?? "", project.name, project.investor, project.type, project.province, project.status, project.valueRange, String(project.progress), project.manager ?? ""]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `licogi-projects-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Project Portfolio"
        title="Danh mục dự án"
        description="Ưu tiên hình ảnh trực quan, tiến độ và trạng thái điều hành để có thể đọc nhanh ở zoom trình duyệt 100%."
        actions={<div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="licogi-btn licogi-btn-primary"><Plus size={17} /> Thêm dự án</button><Link href="/data?entity=projects" className="licogi-btn licogi-btn-secondary"><Upload size={17} /> Import dữ liệu</Link></div>}
      />

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#071426] shadow-[0_18px_55px_rgba(15,23,42,.12)]">
        <div className="grid xl:grid-cols-[1.25fr_.75fr]">
          <div className="relative min-h-[300px] overflow-hidden border-b border-white/10 xl:border-b-0 xl:border-r">
            <Image src="/media/tailg-site-overview.svg" alt="Sơ đồ trực quan dự án TAILG" fill priority sizes="(min-width: 1280px) 60vw, 100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/28 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">Dự án đang điều hành</div>
          </div>
          <div className="flex flex-col justify-center p-6 text-white sm:p-7 xl:p-8">
            <div className="flex items-center gap-3 text-amber-300"><HardHat size={22} /><span className="text-xs font-bold uppercase tracking-[.12em]">TAILG Command Center</span></div>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">Nhà máy TAILG (Việt Nam)</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Sơ đồ 6 đội thi công, Xưởng 1/2/3, nhà xe, hạ tầng, nhật ký ngày và cảnh báo tiến độ được gom vào một màn hình riêng.</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <FeatureMetric value="06" label="Đội" />
              <FeatureMetric value="88,5%" label="Xưởng 1" />
              <FeatureMetric value="341" label="Ngày KH" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/projects/tailg" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400">Mở dashboard <ArrowUpRight size={17} /></Link>
              <Link href="/projects/tailg/update" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">Cập nhật ngày</Link>
            </div>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-[16px] border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">{message}</div> : null}

      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50"><Search size={18} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Tìm tên dự án, chủ đầu tư, tỉnh, mã..." /></label>
          <select value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)} className="rounded-[12px] border border-slate-200 bg-white px-3.5 py-2.5 font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại</option>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)} className="rounded-[12px] border border-slate-200 bg-white px-3.5 py-2.5 font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Đã hoàn thành</option><option value="warranty">Đang bảo hành</option></select>
          <button type="button" onClick={load} className="licogi-btn licogi-btn-secondary"><RefreshCcw size={17} className={loading ? "animate-spin" : ""} /> Tải lại</button>
          <button type="button" onClick={exportCsv} className="licogi-btn licogi-btn-secondary"><Download size={17} /> CSV</button>
          <div className="flex rounded-[12px] border border-slate-200 bg-slate-50 p-1"><button type="button" onClick={() => setView("grid")} className={`grid h-10 w-11 place-items-center rounded-[9px] ${view === "grid" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`} title="Dạng thẻ"><LayoutGrid size={18} /></button><button type="button" onClick={() => setView("table")} className={`grid h-10 w-11 place-items-center rounded-[9px] ${view === "table" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`} title="Dạng bảng"><List size={18} /></button></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Hiển thị <strong className="text-slate-800">{filteredItems.length}</strong> / {items.length} dự án trong Data Center</p><div className="flex flex-wrap gap-2"><button type="button" onClick={toggleAllVisible} className="licogi-btn licogi-btn-secondary">{allVisibleSelected ? "Bỏ chọn" : "Chọn tất cả"}</button>{selectedIds.length ? <button type="button" onClick={() => void deleteIds(selectedIds, `${selectedIds.length} dự án đã chọn`)} className="licogi-btn licogi-btn-danger"><Trash2 size={16} /> Xóa {selectedIds.length}</button> : null}</div></div>
      </section>

      {view === "grid" ? (
        <section className="licogi-scroll max-h-[900px] overflow-y-auto pr-1">
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((project) => {
              const selected = Boolean(project._rowId && selectedSet.has(project._rowId));
              const href = projectHref(project);
              return (
                <article key={project._rowId ?? project.id} className={`group overflow-hidden rounded-[22px] border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${selected ? "border-orange-300 ring-2 ring-orange-100" : "border-slate-200"}`}>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <Image src={projectVisual(project)} alt={`Hình ảnh trực quan ${project.name}`} fill sizes="(min-width:1536px) 31vw, (min-width:1280px) 46vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 flex gap-2"><span className="rounded-lg border border-white/20 bg-slate-950/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">{project.code || "PROJECT"}</span>{isTailgProject(project) ? <span className="rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">Command Center</span> : null}</div>
                    {project._rowId ? <input aria-label={`Chọn ${project.name}`} type="checkbox" checked={selected} onChange={() => toggleRow(project._rowId!)} className="absolute right-4 top-4 h-5 w-5 rounded border-white/70 bg-white accent-orange-600" /> : null}
                    <div className="absolute bottom-4 left-4 right-4"><p className="text-xs font-semibold text-slate-200">{project.type} · {project.province}</p><h3 className="mt-1 line-clamp-2 text-xl font-extrabold leading-tight text-white">{project.name}</h3></div>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-400">Chủ đầu tư</p><p className="mt-1 font-bold text-slate-800">{project.investor || "Chưa cập nhật"}</p></div><div className="flex gap-2"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div></div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <MiniMetric label="Tiến độ" value={`${project.progress}%`} />
                      <MiniMetric label="Sức khỏe" value={String(project.healthScore ?? 0)} />
                      <MiniMetric label="Quy mô" value={project.valueRange || "—"} compact />
                    </div>

                    <div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-500">Tiến độ thực tế</span><span className="font-bold text-orange-600">{project.progress}%</span></div><ProgressBar value={project.progress} tone="orange" /></div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="min-w-0"><p className="truncate text-xs text-slate-400">Phụ trách</p><p className="truncate text-sm font-semibold text-slate-700">{project.manager || "Chưa phân công"}</p></div>
                      <div className="flex shrink-0 gap-2"><Link href={href} className="licogi-btn licogi-btn-primary"><Eye size={16} /> Xem dự án</Link><button type="button" onClick={() => { setEditing(project); setShowForm(true); }} className="licogi-icon-btn" title="Sửa"><Pencil size={16} /></button>{project._rowId ? <button type="button" onClick={() => void deleteIds([project._rowId!], `dự án “${project.name}”`)} className="licogi-icon-btn licogi-icon-btn-danger" title="Xóa"><Trash2 size={16} /></button> : null}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filteredItems.length === 0 ? <EmptyState /> : null}
        </section>
      ) : (
        <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <div className="licogi-table-scroll max-h-[760px] overflow-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 font-bold uppercase text-slate-500 backdrop-blur"><tr><th className="w-12 px-4 py-3"><input aria-label="Chọn tất cả dự án đang hiển thị" type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></th><th className="px-4 py-3">Dự án</th><th className="px-4 py-3">Chủ đầu tư</th><th className="px-4 py-3">Địa điểm</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Tiến độ</th><th className="px-4 py-3">Phụ trách</th><th className="sticky right-0 bg-slate-50/95 px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((project) => {
                  const selected = Boolean(project._rowId && selectedSet.has(project._rowId));
                  return <tr key={project._rowId ?? project.id} className={selected ? "bg-orange-50/60" : "group hover:bg-slate-50/70"}>
                    <td className="px-4 py-3">{project._rowId ? <input aria-label={`Chọn ${project.name}`} type="checkbox" checked={selected} onChange={() => toggleRow(project._rowId!)} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /> : null}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"><Image src={projectVisual(project)} alt="" fill sizes="96px" className="object-cover" /></div><div className="min-w-0"><p className="max-w-[280px] truncate font-bold text-slate-900">{project.name}</p><p className="mt-1 text-xs font-semibold text-slate-400">{project.code} · {project.type}</p></div></div></td>
                    <td className="max-w-[190px] px-4 py-3"><p className="truncate font-semibold text-slate-700">{project.investor}</p></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 font-semibold text-slate-600"><MapPin size={15} className="text-orange-500" /> {project.province}</span></td>
                    <td className="px-4 py-3"><div className="flex flex-col items-start gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div></td>
                    <td className="px-4 py-3"><div className="w-36"><div className="mb-1.5 flex justify-between text-xs"><span className="font-bold text-slate-700">{project.progress}%</span></div><ProgressBar value={project.progress} tone="orange" /></div></td>
                    <td className="px-4 py-3"><p className="font-semibold text-slate-700">{project.manager ?? "Chưa phân công"}</p></td>
                    <td className={`sticky right-0 px-4 py-3 ${selected ? "bg-orange-50" : "bg-white"}`}><div className="flex justify-end gap-1.5"><Link href={projectHref(project)} className="licogi-icon-btn" title="Xem"><Eye size={16} /></Link><button type="button" onClick={() => { setEditing(project); setShowForm(true); }} className="licogi-icon-btn" title="Sửa"><Pencil size={16} /></button>{project._rowId ? <button type="button" onClick={() => void deleteIds([project._rowId!], `dự án “${project.name}”`)} className="licogi-icon-btn licogi-icon-btn-danger" title="Xóa"><Trash2 size={16} /></button> : null}</div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 ? <EmptyState /> : null}
        </section>
      )}

      {showForm ? <ProjectForm key={editing?._rowId ?? "new"} initialProject={editing} onSave={saveProject} onBulkImported={() => { setMessage("Đã import danh sách dự án và lưu vào database."); void load(); }} onCancel={() => { setEditing(null); setShowForm(false); }} /> : null}
    </div>
  );
}

function FeatureMetric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[.07] p-3"><p className="text-xl font-extrabold text-white">{value}</p><p className="mt-1 text-xs font-medium text-slate-400">{label}</p></div>;
}

function MiniMetric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return <div className="min-w-0 rounded-xl bg-slate-50 p-3"><p className="text-xs font-medium text-slate-400">{label}</p><p className={`mt-1 truncate font-bold text-slate-800 ${compact ? "text-xs" : "text-base"}`}>{value}</p></div>;
}

function EmptyState() {
  return <div className="p-12 text-center"><Search className="mx-auto text-slate-300" size={30} /><p className="mt-3 text-sm font-bold text-slate-600">Chưa có dự án phù hợp</p><p className="mt-1 text-xs text-slate-400">Đổi bộ lọc, nhập dữ liệu ở Trung tâm dữ liệu hoặc bấm “Thêm dự án”.</p></div>;
}
