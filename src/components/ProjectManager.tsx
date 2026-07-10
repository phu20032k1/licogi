"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eye,
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
import { fetchProjectsFromDataCenter, ProjectWithRowId, projectToRow } from "../lib/projectData";
import PageHeader from "./ui/PageHeader";
import ProgressBar from "./ui/ProgressBar";
import { RiskBadge, StatusBadge } from "./ui/StatusBadge";
import ProjectForm from "./ProjectForm";

export default function ProjectManager() {
  const [items, setItems] = useState<ProjectWithRowId[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProjectWithRowId | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const importInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchProjectsFromDataCenter());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu dự án.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
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
      setMessage("Đã lưu dữ liệu dự án.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không lưu được dự án.");
    }
  }

  async function deleteProject(project: ProjectWithRowId) {
    if (!project._rowId) return;
    if (!window.confirm(`Xóa dự án “${project.name}”? Dữ liệu đã xóa không thể khôi phục.`)) return;
    const response = await fetch("/api/data/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [project._rowId] }) });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setMessage(data.message ?? "Không xóa được dự án.");
      return;
    }
    setMessage("Đã xóa dự án.");
    await load();
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
        eyebrow="Project Data"
        title="Danh mục dự án"
        description="Danh sách dự án lấy từ Trung tâm dữ liệu. Có thể thêm, sửa, xóa từng dự án tại đây; thêm/xóa/sửa hàng loạt thực hiện trong mục Trung tâm dữ liệu."
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200 hover:bg-orange-700"><Plus size={16} /> Thêm dự án</button>
            <button type="button" onClick={() => importInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><Upload size={16} /> Import tại Data Center</button>
            <input ref={importInputRef} type="hidden" />
          </div>
        }
      />

      {message ? <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">{message}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm tên dự án, chủ đầu tư, tỉnh, mã..." /></label>
          <select value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại</option>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Đã hoàn thành</option><option value="warranty">Đang bảo hành</option></select>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><RefreshCcw size={16} /> Tải lại</button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><Download size={16} /> Xuất CSV</button>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1"><button type="button" onClick={() => setView("table")} className={`grid h-9 w-10 place-items-center rounded-lg ${view === "table" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`} title="Dạng bảng"><List size={17} /></button><button type="button" onClick={() => setView("grid")} className={`grid h-9 w-10 place-items-center rounded-lg ${view === "grid" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`} title="Dạng thẻ"><LayoutGrid size={17} /></button></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>Hiển thị <strong className="text-slate-800">{filteredItems.length}</strong> / {items.length} dự án</span><span>{loading ? "Đang tải dữ liệu..." : "Dữ liệu lấy từ Data Center"}</span></div>
      </section>

      {view === "table" ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Dự án</th><th className="px-4 py-4">Chủ đầu tư</th><th className="px-4 py-4">Địa điểm</th><th className="px-4 py-4">Trạng thái</th><th className="px-4 py-4">Tiến độ</th><th className="px-4 py-4">Sức khỏe</th><th className="px-4 py-4">Phụ trách</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((project) => {
                  const variance = project.progress - (project.plannedProgress ?? project.progress);
                  return <tr key={project._rowId ?? project.id} className="group hover:bg-slate-50/70">
                    <td className="px-5 py-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">{project.type.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="max-w-[270px] truncate font-extrabold text-slate-900">{project.name}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{project.code} · {project.valueRange}</p></div></div></td>
                    <td className="max-w-[190px] px-4 py-4"><p className="truncate font-semibold text-slate-700">{project.investor}</p><p className="mt-1 text-[11px] text-slate-400">{project.type}</p></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 font-semibold text-slate-600"><MapPin size={14} className="text-orange-500" /> {project.province}</span></td>
                    <td className="px-4 py-4"><div className="flex flex-col items-start gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div></td>
                    <td className="px-4 py-4"><div className="w-36"><div className="mb-1.5 flex justify-between text-[11px]"><span className="font-extrabold text-slate-700">{project.progress}%</span><span className={variance < -5 ? "font-bold text-red-600" : "font-bold text-emerald-600"}>{variance >= 0 ? "+" : ""}{variance}%</span></div><ProgressBar value={project.progress} tone={variance < -5 ? "red" : "orange"} /></div></td>
                    <td className="px-4 py-4"><span className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-black ring-1 ${(project.healthScore ?? 0) < 70 ? "bg-red-50 text-red-600 ring-red-100" : (project.healthScore ?? 0) < 85 ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{project.healthScore ?? 0}</span></td>
                    <td className="px-4 py-4"><p className="font-semibold text-slate-700">{project.manager ?? "Chưa phân công"}</p><p className="mt-1 text-[11px] text-slate-400">Chỉ huy trưởng</p></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1.5"><Link href={`/projects/${project.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600" title="Xem trung tâm dự án"><Eye size={15} /></Link><button type="button" onClick={() => { setEditing(project); setShowForm(true); }} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600" title="Sửa"><Pencil size={15} /></button><button type="button" onClick={() => deleteProject(project)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600" title="Xóa"><Trash2 size={15} /></button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 ? <div className="p-12 text-center"><Search className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-bold text-slate-600">Chưa có dự án</p><p className="mt-1 text-xs text-slate-400">Nhập dữ liệu ở Trung tâm dữ liệu hoặc bấm “Thêm dự án”.</p></div> : null}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredItems.map((project) => <article key={project._rowId ?? project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-orange-600">{project.code}</p><h3 className="mt-1 truncate text-base font-black text-slate-900">{project.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{project.investor}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditing(project); setShowForm(true); }} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Pencil size={14} /></button><button type="button" onClick={() => deleteProject(project)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></div></div><div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Địa điểm</p><p className="mt-1 truncate font-bold text-slate-700">{project.province}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Chỉ huy</p><p className="mt-1 truncate font-bold text-slate-700">{project.manager}</p></div></div><div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold text-slate-600">Tiến độ thực tế</span><span className="font-extrabold text-orange-600">{project.progress}%</span></div><ProgressBar value={project.progress} tone="orange" /></div></article>)}
        </section>
      )}

      {showForm ? <ProjectForm key={editing?._rowId ?? "new"} initialProject={editing} onSave={saveProject} onCancel={() => { setEditing(null); setShowForm(false); }} /> : null}
    </div>
  );
}
