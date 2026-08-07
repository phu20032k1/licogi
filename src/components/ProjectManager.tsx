"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, LayoutGrid, List, MapPin, Pencil, Plus, RefreshCcw, Search, Trash2, Upload } from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes } from "../data/projects";
import { fetchProjectsFromDataCenter, ProjectWithRowId, projectToRow } from "../lib/projectData";
import PageHeader from "./ui/PageHeader";
import ProgressBar from "./ui/ProgressBar";
import { RiskBadge, StatusBadge } from "./ui/StatusBadge";
import ProjectForm from "./ProjectForm";
import { appendClientRows, deleteClientRows, updateClientRows } from "../lib/clientDataStore";

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
  const [view, setView] = useState<"table" | "grid">("table");

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
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        eyebrow="Project Data"
        title="Danh mục dự án"
        description="Quản lý dự án, lọc nhanh và thao tác hàng loạt ngay tại danh sách."
        actions={<div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="licogi-btn licogi-btn-primary"><Plus size={16} /> Thêm dự án</button><Link href="/data?entity=projects" className="licogi-btn licogi-btn-secondary"><Upload size={16} /> Import</Link></div>}
      />

      {message ? <div className="rounded-[16px] border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">{message}</div> : null}

      <section className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm tên dự án, chủ đầu tư, tỉnh, mã..." /></label>
          <select value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)} className="rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại</option>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)} className="rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Đã hoàn thành</option><option value="warranty">Đang bảo hành</option></select>
          <button type="button" onClick={load} className="licogi-btn licogi-btn-secondary"><RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Tải lại</button>
          <button type="button" onClick={exportCsv} className="licogi-btn licogi-btn-secondary"><Download size={16} /> CSV</button>
          <div className="flex rounded-[12px] border border-slate-200 bg-slate-50 p-1"><button type="button" onClick={() => setView("table")} className={`grid h-9 w-10 place-items-center rounded-[9px] ${view === "table" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`} title="Dạng bảng"><List size={17} /></button><button type="button" onClick={() => setView("grid")} className={`grid h-9 w-10 place-items-center rounded-[9px] ${view === "grid" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`} title="Dạng thẻ"><LayoutGrid size={17} /></button></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">Hiển thị <strong className="text-slate-800">{filteredItems.length}</strong> / {items.length} dự án</p><div className="flex flex-wrap gap-2"><button type="button" onClick={toggleAllVisible} className="licogi-btn licogi-btn-secondary">{allVisibleSelected ? "Bỏ chọn" : "Chọn tất cả"}</button>{selectedIds.length ? <button type="button" onClick={() => void deleteIds(selectedIds, `${selectedIds.length} dự án đã chọn`)} className="licogi-btn licogi-btn-danger"><Trash2 size={15} /> Xóa {selectedIds.length}</button> : null}</div></div>
      </section>

      {view === "table" ? (
        <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
          <div className="licogi-table-scroll max-h-[720px] overflow-auto">
            <table className="w-full min-w-[1210px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500 backdrop-blur"><tr><th className="w-12 px-4 py-3"><input aria-label="Chọn tất cả dự án đang hiển thị" type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></th><th className="px-5 py-3">Dự án</th><th className="px-4 py-3">Chủ đầu tư</th><th className="px-4 py-3">Địa điểm</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Tiến độ</th><th className="px-4 py-3">Sức khỏe</th><th className="px-4 py-3">Phụ trách</th><th className="sticky right-0 bg-slate-50/95 px-5 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((project) => {
                  const variance = project.progress - (project.plannedProgress ?? project.progress);
                  const selected = Boolean(project._rowId && selectedSet.has(project._rowId));
                  return <tr key={project._rowId ?? project.id} className={selected ? "bg-orange-50/60" : "group hover:bg-slate-50/70"}>
                    <td className="px-4 py-3">{project._rowId ? <input aria-label={`Chọn ${project.name}`} type="checkbox" checked={selected} onChange={() => toggleRow(project._rowId!)} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /> : null}</td>
                    <td className="px-5 py-3"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-slate-100 text-xs font-black text-slate-600">{project.type.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="max-w-[270px] truncate font-extrabold text-slate-900">{project.name}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{project.code} · {project.valueRange}</p></div></div></td>
                    <td className="max-w-[190px] px-4 py-3"><p className="truncate font-semibold text-slate-700">{project.investor}</p><p className="mt-1 text-[11px] text-slate-400">{project.type}</p></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 font-semibold text-slate-600"><MapPin size={14} className="text-orange-500" /> {project.province}</span></td>
                    <td className="px-4 py-3"><div className="flex flex-col items-start gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div></td>
                    <td className="px-4 py-3"><div className="w-36"><div className="mb-1.5 flex justify-between text-[11px]"><span className="font-extrabold text-slate-700">{project.progress}%</span><span className={variance < -5 ? "font-bold text-red-600" : "font-bold text-emerald-600"}>{variance >= 0 ? "+" : ""}{variance}%</span></div><ProgressBar value={project.progress} tone={variance < -5 ? "red" : "orange"} /></div></td>
                    <td className="px-4 py-3"><span className={`grid h-9 w-9 place-items-center rounded-[10px] text-sm font-black ring-1 ${(project.healthScore ?? 0) < 70 ? "bg-red-50 text-red-600 ring-red-100" : (project.healthScore ?? 0) < 85 ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{project.healthScore ?? 0}</span></td>
                    <td className="px-4 py-3"><p className="font-semibold text-slate-700">{project.manager ?? "Chưa phân công"}</p></td>
                    <td className={`sticky right-0 px-5 py-3 ${selected ? "bg-orange-50" : "bg-white"}`}><div className="flex justify-end gap-1.5"><Link href={`/projects/${project.id}`} className="licogi-icon-btn" title="Xem"><Eye size={15} /></Link><button type="button" onClick={() => { setEditing(project); setShowForm(true); }} className="licogi-icon-btn" title="Sửa"><Pencil size={15} /></button>{project._rowId ? <button type="button" onClick={() => void deleteIds([project._rowId!], `dự án “${project.name}”`)} className="licogi-icon-btn licogi-icon-btn-danger" title="Xóa"><Trash2 size={15} /></button> : null}</div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 ? <div className="p-12 text-center"><Search className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-bold text-slate-600">Chưa có dự án</p><p className="mt-1 text-xs text-slate-400">Nhập dữ liệu ở Trung tâm dữ liệu hoặc bấm “Thêm dự án”.</p></div> : null}
        </section>
      ) : (
        <section className="licogi-scroll max-h-[760px] overflow-y-auto pr-1"><div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filteredItems.map((project) => {
          const selected = Boolean(project._rowId && selectedSet.has(project._rowId));
          return <article key={project._rowId ?? project.id} className={`relative rounded-[18px] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-orange-300 ring-2 ring-orange-100" : "border-slate-200"}`}>
            {project._rowId ? <input aria-label={`Chọn ${project.name}`} type="checkbox" checked={selected} onChange={() => toggleRow(project._rowId!)} className="absolute right-4 top-4 h-4 w-4 rounded border-slate-300 accent-orange-600" /> : null}
            <div className="flex items-start justify-between gap-3 pr-7"><div className="min-w-0"><p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-orange-600">{project.code}</p><h3 className="mt-1 truncate text-base font-black text-slate-900">{project.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{project.investor}</p></div><div className="flex gap-1"><button type="button" onClick={() => { setEditing(project); setShowForm(true); }} className="licogi-icon-btn"><Pencil size={14} /></button>{project._rowId ? <button type="button" onClick={() => void deleteIds([project._rowId!], `dự án “${project.name}”`)} className="licogi-icon-btn licogi-icon-btn-danger"><Trash2 size={14} /></button> : null}</div></div>
            <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-[12px] bg-slate-50 p-3"><p className="text-slate-400">Địa điểm</p><p className="mt-1 truncate font-bold text-slate-700">{project.province}</p></div><div className="rounded-[12px] bg-slate-50 p-3"><p className="text-slate-400">Chỉ huy</p><p className="mt-1 truncate font-bold text-slate-700">{project.manager}</p></div></div><div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold text-slate-600">Tiến độ</span><span className="font-extrabold text-orange-600">{project.progress}%</span></div><ProgressBar value={project.progress} tone="orange" /></div>
          </article>;
        })}</div></section>
      )}

      {showForm ? <ProjectForm key={editing?._rowId ?? "new"} initialProject={editing} onSave={saveProject} onBulkImported={() => { setMessage("Đã import danh sách dự án và lưu vào database."); void load(); }} onCancel={() => { setEditing(null); setShowForm(false); }} /> : null}
    </div>
  );
}
