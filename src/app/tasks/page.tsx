"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileCheck2, Filter, Plus, Search, ShieldAlert, Trash2, UserCheck, XCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import StatCard from "../../components/StatCard";
import BulkImportPanel from "../../components/BulkImportPanel";
import { ApprovalItem, TaskItem } from "../../data/control";

const taskColumns = ["Chưa làm", "Đang làm", "Chờ duyệt", "Hoàn thành"] as const;
type ProjectOption = { id: string; code: string; name: string };
type UserOption = { id: string; email: string; name: string };
type TaskForm = { title: string; projectId: string; assigneeId: string; dueDate: string; priority: TaskItem["priority"]; status: TaskItem["status"]; progress: string };
const emptyForm: TaskForm = { title: "", projectId: "", assigneeId: "", dueDate: "", priority: "Trung bình", status: "Chưa làm", progress: "0" };

export default function TasksPage() {
  const [tab, setTab] = useState<"Công việc" | "Phê duyệt">("Công việc");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được công việc.");
      setTasks(data.tasks || []);
      setProjects(data.projects || []);
      setUsers(data.users || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được công việc.");
    }
  }

  useEffect(() => { void load(); }, []);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || `${task.title} ${task.project} ${task.assignee}`.toLocaleLowerCase("vi").includes(keyword)) && (status === "all" || task.status === status);
  }), [search, status, tasks]);

  const filteredApprovals = useMemo(() => approvals.filter((item) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || `${item.title} ${item.project} ${item.requester}`.toLocaleLowerCase("vi").includes(keyword)) && (status === "all" || item.status === status);
  }), [approvals, search, status]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected = Boolean(filteredTasks.length) && filteredTasks.every((task) => selectedSet.has(task.id));

  function updateApproval(id: string, next: "Đã duyệt" | "Từ chối") {
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, status: next } : item));
  }

  async function postTask(row: Record<string, string>) {
    const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Không lưu được công việc.");
  }

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      await postTask(form as unknown as Record<string, string>);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Đã tạo công việc và lưu vào database.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được công việc.");
    } finally { setSaving(false); }
  }

  async function importTasks(rows: Record<string, string>[]) {
    let success = 0;
    const failed: string[] = [];
    for (let index = 0; index < rows.length; index += 1) {
      try { await postTask(rows[index]); success += 1; }
      catch (err) { failed.push(`Dòng ${index + 1}: ${err instanceof Error ? err.message : "lỗi"}`); }
    }
    await load();
    if (failed.length) throw new Error(`Đã lưu ${success}/${rows.length}. ${failed.slice(0, 3).join(" · ")}`);
    setMessage(`Đã import ${success} công việc vào database.`);
    setShowForm(false);
  }

  function toggleTask(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleAllFiltered() {
    const ids = filteredTasks.map((task) => task.id);
    setSelectedIds((current) => allFilteredSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])));
  }

  async function deleteTasks(ids: string[]) {
    if (!ids.length || deleting) return;
    if (!window.confirm(`Xóa ${ids.length} công việc đã chọn?`)) return;
    setDeleting(true); setError("");
    try {
      const response = await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message || "Không xóa được công việc.");
      setMessage(`Đã xóa ${data.deleted ?? ids.length} công việc.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được công việc.");
    } finally { setDeleting(false); }
  }

  const actions = <button type="button" onClick={() => setShowForm(true)} className="licogi-btn licogi-btn-primary"><Plus size={16} /> Tạo công việc</button>;

  return <div className="space-y-5 animate-fade-up">
    <PageHeader eyebrow="Workflow Center" title="Công việc & phê duyệt" description="Theo dõi đầu việc theo dự án, lọc nhanh và xử lý hàng loạt." actions={actions} />
    {message ? <div className="rounded-[16px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
    {error ? <div className="rounded-[16px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Công việc đang mở" value={String(tasks.filter((item) => item.status !== "Hoàn thành").length)} note="đã lưu database" icon={Clock3} tone="orange" />
      <StatCard title="Chờ Ban lãnh đạo duyệt" value={String(approvals.filter((item) => item.status === "Chờ duyệt").length)} note="chờ xử lý" icon={FileCheck2} tone="violet" />
      <StatCard title="Đến hạn trong 48 giờ" value="0" note="chưa có cảnh báo" icon={ShieldAlert} tone="blue" />
      <StatCard title="Đã hoàn thành" value={String(tasks.filter((item) => item.status === "Hoàn thành").length)} note="theo dữ liệu hiện có" icon={CheckCircle2} tone="green" />
    </section>

    <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex w-fit rounded-[12px] border border-slate-200 bg-slate-50 p-1">{(["Công việc", "Phê duyệt"] as const).map((item) => <button key={item} type="button" onClick={() => { setTab(item); setStatus("all"); setSelectedIds([]); }} className={`rounded-[9px] px-3.5 py-2 text-xs font-extrabold ${tab === item ? "bg-slate-900 text-white shadow" : "text-slate-500"}`}>{item}</button>)}</div>
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 lg:ml-auto lg:max-w-md"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm nội dung, dự án, người phụ trách..." /></label>
        <label className="flex items-center gap-2 rounded-[12px] border border-slate-200 px-3 py-2.5"><Filter size={15} className="text-slate-400" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-transparent text-xs font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option>{tab === "Công việc" ? taskColumns.map((item) => <option key={item}>{item}</option>) : ["Chờ duyệt", "Đã duyệt", "Từ chối"].map((item) => <option key={item}>{item}</option>)}</select></label>
        {tab === "Công việc" ? <button type="button" onClick={toggleAllFiltered} className="licogi-btn licogi-btn-secondary">{allFilteredSelected ? "Bỏ chọn" : "Chọn tất cả"}</button> : null}
      </div>
      {tab === "Công việc" && selectedIds.length ? <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><p className="text-xs font-bold text-slate-600">Đã chọn {selectedIds.length} công việc</p><button type="button" onClick={() => void deleteTasks(selectedIds)} disabled={deleting} className="licogi-btn licogi-btn-danger"><Trash2 size={15} /> {deleting ? "Đang xóa..." : `Xóa ${selectedIds.length}`}</button></div> : null}
    </section>

    {tab === "Công việc" ? <section className="grid gap-3 xl:grid-cols-4">{taskColumns.map((column) => {
      const columnTasks = filteredTasks.filter((task) => task.status === column);
      return <article key={column} className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-3"><div className="flex items-center justify-between px-1 py-1.5"><h2 className="text-xs font-black text-slate-800">{column}</h2><span className="rounded-[9px] bg-white px-2 py-1 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-200">{columnTasks.length}</span></div><div className="licogi-scroll mt-2 max-h-[590px] space-y-2.5 overflow-y-auto pr-1">{columnTasks.map((task) => {
        const selected = selectedSet.has(task.id);
        return <div key={task.id} className={`relative rounded-[15px] border bg-white p-3.5 shadow-sm transition ${selected ? "border-orange-300 ring-2 ring-orange-100" : "border-slate-200 hover:border-slate-300"}`}><div className="flex items-start justify-between gap-2"><span className={`rounded-[9px] px-2 py-1 text-[10px] font-extrabold ${task.priority === "Cao" ? "bg-red-50 text-red-700" : task.priority === "Trung bình" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{task.priority}</span><div className="flex items-center gap-2"><input aria-label={`Chọn ${task.title}`} type="checkbox" checked={selected} onChange={() => toggleTask(task.id)} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /><button type="button" onClick={() => void deleteTasks([task.id])} className="licogi-icon-btn licogi-icon-btn-danger" title="Xóa công việc"><Trash2 size={14} /></button></div></div><h3 className="mt-2.5 text-sm font-extrabold leading-5 text-slate-900">{task.title}</h3><p className="mt-1.5 text-xs text-slate-500">{task.project}</p><div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>Tiến độ</span><span>{task.progress}%</span></div><ProgressBar value={task.progress} tone={task.progress === 100 ? "green" : "orange"} /></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px]"><span className="font-bold text-slate-600">{task.assignee}</span><span className="text-slate-400">{task.due ? `Hạn ${task.due}` : "Chưa có hạn"}</span></div></div>;
      })}</div></article>;
    })}</section> : <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm"><div className="licogi-table-scroll max-h-[680px] overflow-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="sticky top-0 z-10 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500 backdrop-blur"><tr><th className="px-4 py-3">Đề nghị</th><th className="px-4 py-3">Dự án</th><th className="px-4 py-3">Người đề nghị</th><th className="px-4 py-3">Trạng thái</th><th className="sticky right-0 bg-slate-50/95 px-4 py-3 text-right">Xử lý</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredApprovals.map((item) => <tr key={item.id}><td className="px-4 py-3 font-bold">{item.title}</td><td className="px-4 py-3">{item.project}</td><td className="px-4 py-3">{item.requester}</td><td className="px-4 py-3">{item.status}</td><td className="sticky right-0 bg-white px-4 py-3"><div className="flex justify-end gap-2">{item.status === "Chờ duyệt" ? <><button type="button" onClick={() => updateApproval(item.id, "Từ chối")} className="licogi-icon-btn licogi-icon-btn-danger"><XCircle size={15} /></button><button type="button" onClick={() => updateApproval(item.id, "Đã duyệt")} className="licogi-icon-btn border-emerald-200 bg-emerald-50 text-emerald-700"><UserCheck size={15} /></button></> : null}</div></td></tr>)}</tbody></table></div>{!filteredApprovals.length ? <p className="p-6 text-center text-sm text-slate-500">Chưa có đề nghị phê duyệt.</p> : null}</section>}

    {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={() => setShowForm(false)} aria-label="Đóng" /><form onSubmit={submitTask} className="modal-panel licogi-scroll relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-[22px] bg-white p-5 shadow-2xl sm:rounded-[20px]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">New task</p><h2 className="mt-1 text-lg font-black text-slate-900">Tạo công việc mới</h2></div><button type="button" onClick={() => setShowForm(false)} className="licogi-btn licogi-btn-secondary">Đóng</button></div>
      <BulkImportPanel className="mt-4" compact fields={[{ name: "title", label: "Tên công việc", placeholder: "Nghiệm thu móng", required: true },{ name: "projectCode", label: "Mã dự án", placeholder: "LCG-2026-001" },{ name: "assigneeEmail", label: "Email phụ trách", placeholder: "user@company.vn" },{ name: "dueDate", label: "Hạn hoàn thành", placeholder: "2026-08-15" },{ name: "priority", label: "Ưu tiên", placeholder: "Trung bình" },{ name: "status", label: "Trạng thái", placeholder: "Chưa làm" },{ name: "progress", label: "Tiến độ", placeholder: "0" }]} onImport={importTasks} />
      <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Tên công việc<input required value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" placeholder="Nhập tên công việc" /></label><label className="text-xs font-bold text-slate-600">Dự án<select value={form.projectId} onChange={(e)=>setForm({...form,projectId:e.target.value})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option value="">Không gán</option>{projects.map((p)=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Người phụ trách<select value={form.assigneeId} onChange={(e)=>setForm({...form,assigneeId:e.target.value})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option value="">Chưa phân công</option>{users.map((u)=><option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Hạn hoàn thành<input type="date" value={form.dueDate} onChange={(e)=>setForm({...form,dueDate:e.target.value})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Ưu tiên<select value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value as TaskItem["priority"]})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option>Thấp</option><option>Trung bình</option><option>Cao</option></select></label><label className="text-xs font-bold text-slate-600">Trạng thái<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value as TaskItem["status"]})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm">{taskColumns.map((item)=><option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Tiến độ<input type="number" min="0" max="100" value={form.progress} onChange={(e)=>setForm({...form,progress:e.target.value})} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label></div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="licogi-btn licogi-btn-secondary">Hủy</button><button disabled={saving} className="licogi-btn licogi-btn-primary">{saving ? "Đang lưu..." : "Lưu công việc"}</button></div></form></div> : null}
  </div>;
}
