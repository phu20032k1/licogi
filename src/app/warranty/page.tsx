"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Plus, Search, ShieldCheck, Siren, Wrench } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import BulkImportPanel from "../../components/BulkImportPanel";

type StoredRow = Record<string, string> & { _id: string; _createdAt: string; _updatedAt: string };
type ProjectRow = StoredRow & { project_code?: string; project_name?: string; investor?: string };
type WarrantyTicket = { id: string; code: string; projectCode: string; project: string; title: string; customer: string; priority: string; assignee: string; created: string; deadline: string; status: string };
type FormState = { projectCode: string; title: string; priority: string; deadline: string; description: string };
const emptyForm: FormState = { projectCode: "", title: "", priority: "Trung bình", deadline: "", description: "" };

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

export default function WarrantyPage() {
  const [tickets, setTickets] = useState<WarrantyTicket[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [warrantyResponse, projectResponse] = await Promise.all([
        fetch("/api/data/warranty", { cache: "no-store" }),
        fetch("/api/data/projects", { cache: "no-store" }),
      ]);
      const [warrantyData, projectData] = await Promise.all([warrantyResponse.json(), projectResponse.json()]);
      if (!warrantyResponse.ok || !warrantyData.ok) throw new Error(warrantyData.message || "Không tải được bảo hành.");
      const projectRows = projectResponse.ok && projectData.ok ? (projectData.rows as ProjectRow[]) : [];
      setProjects(projectRows);
      const projectMap = new Map(projectRows.map((row) => [row.project_code || "", row]));
      setTickets((warrantyData.rows as StoredRow[]).map((row) => {
        const project = projectMap.get(row.project_code || "");
        return {
          id: row._id,
          code: row.ticket_code || row._id.slice(-8),
          projectCode: row.project_code || "",
          project: project?.project_name || row.project_code || "Chưa gán công trình",
          title: row.title || "Yêu cầu bảo hành",
          customer: project?.investor || "—",
          priority: row.priority || "Trung bình",
          assignee: "Theo phân quyền",
          created: formatDate(row._createdAt),
          deadline: formatDate(row.deadline),
          status: row.status || "Đã tiếp nhận",
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu bảo hành.");
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => tickets.filter((ticket) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || [ticket.code, ticket.project, ticket.title, ticket.customer].some((value) => value.toLocaleLowerCase("vi").includes(keyword))) && (status === "all" || ticket.status === status);
  }), [search, status, tickets]);
  const open = tickets.filter((ticket) => ticket.status !== "Hoàn thành").length;
  const completed = tickets.filter((ticket) => ticket.status === "Hoàn thành").length;
  const highPriority = tickets.filter((ticket) => ticket.priority === "Cao").length;
  const slaRate = tickets.length ? Math.round((completed / tickets.length) * 100) : 0;

  async function importRows(rows: Record<string, string>[]) {
    const normalized = rows.map((row, index) => ({
      ...row,
      ticket_code: row.ticket_code || `BH-${Date.now()}-${String(index + 1).padStart(3, "0")}`,
      status: row.status || "Đã tiếp nhận",
    }));
    const response = await fetch("/api/data/warranty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "append", rows: normalized }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Không import được yêu cầu bảo hành.");
    setMessage(`Đã import ${normalized.length} yêu cầu bảo hành vào database.`);
    window.dispatchEvent(new CustomEvent("licogi-data-imported", { detail: { entity: "warranty", rows: normalized.length } }));
    await load();
    setShowForm(false);
  }

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) { setError("Vui lòng nhập tiêu đề yêu cầu."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      await importRows([{
        ticket_code: `BH-${Date.now()}`,
        project_code: form.projectCode,
        title: form.title,
        priority: form.priority,
        deadline: form.deadline,
        status: "Đã tiếp nhận",
        description: form.description,
      }]);
      setForm(emptyForm);
      setMessage("Đã tạo yêu cầu bảo hành và lưu vào database. Refresh trang dữ liệu vẫn còn.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được yêu cầu bảo hành.");
    } finally { setSaving(false); }
  }

  return <div className="space-y-5 animate-fade-up">
    <PageHeader eyebrow="Warranty Service" title="Quản lý bảo hành công trình" description="Yêu cầu bảo hành được lưu vào Prisma/PostgreSQL; hỗ trợ tạo từng yêu cầu hoặc import CSV hàng loạt." actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-orange-200"><Plus size={16} /> Tạo yêu cầu</button>} />
    {message ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
    {error ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Yêu cầu đang mở" value={String(open)} note="đã lưu database" icon={Wrench} tone="orange" />
      <StatCard title="Sắp quá hạn SLA" value="0" note="chưa có cảnh báo" icon={Clock3} tone="blue" />
      <StatCard title="Ưu tiên cao" value={String(highPriority)} note="cần xử lý ngay" icon={Siren} tone="violet" />
      <StatCard title="Hoàn thành" value={String(completed)} note="theo dữ liệu hiện có" icon={CheckCircle2} tone="green" />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1fr_290px]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_200px]"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm mã, dự án, nội dung yêu cầu..." /></label><select value={status} onChange={(event)=>setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600"><option value="all">Tất cả trạng thái</option><option>Đã tiếp nhận</option><option>Đang xử lý</option><option>Hoàn thành</option></select></div></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3">Yêu cầu</th><th className="px-4 py-3">Công trình</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Ưu tiên</th><th className="px-4 py-3">SLA</th><th className="px-4 py-3">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((ticket)=><tr key={ticket.id} className="hover:bg-slate-50/70"><td className="px-4 py-3"><p className="max-w-[260px] truncate font-extrabold text-slate-900">{ticket.title}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{ticket.code} · {ticket.created}</p></td><td className="max-w-[200px] px-4 py-3"><p className="truncate font-semibold text-slate-600">{ticket.project}</p></td><td className="max-w-[180px] px-4 py-3"><p className="truncate text-slate-600">{ticket.customer}</p></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${ticket.priority === "Cao" ? "bg-red-50 text-red-700" : ticket.priority === "Trung bình" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{ticket.priority}</span></td><td className="px-4 py-3 font-bold text-slate-700">{ticket.deadline}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${ticket.status === "Hoàn thành" ? "bg-emerald-50 text-emerald-700" : ticket.status === "Đang xử lý" ? "bg-orange-50 text-orange-700" : "bg-sky-50 text-sky-700"}`}>{ticket.status}</span></td></tr>)}</tbody></table></div>{filtered.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Chưa có yêu cầu bảo hành.</p> : null}</div>
      </div>
      <aside className="space-y-4"><article className="rounded-2xl bg-[#071426] p-5 text-white shadow-lg"><ShieldCheck size={23} className="text-orange-400" /><p className="mt-4 text-xs font-bold text-slate-300">Tỷ lệ hoàn thành</p><p className="mt-1 text-3xl font-black">{slaRate}%</p><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{width:`${slaRate}%`}} /></div></article><article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="text-sm font-black text-slate-900">SLA theo nhóm</h3><div className="mt-4 space-y-3">{["Xây dựng", "MEP", "Hoàn thiện", "Khác"].map((label)=><div key={label}><div className="mb-1 flex justify-between text-[10px]"><span className="font-bold text-slate-600">{label}</span><span className="font-black text-slate-800">0%</span></div><ProgressBar value={0} tone="slate" /></div>)}</div></article></aside>
    </section>

    {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={()=>setShowForm(false)} /><form onSubmit={createTicket} className="modal-panel relative w-full max-w-3xl rounded-t-[24px] bg-white p-5 shadow-2xl sm:rounded-[24px]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">Warranty ticket</p><h2 className="mt-1 text-lg font-black text-slate-900">Tạo yêu cầu bảo hành</h2></div><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Đóng</button></div>
      <BulkImportPanel className="mt-4" compact fields={[{ name: "ticket_code", label: "Mã yêu cầu", placeholder: "BH-001" },{ name: "project_code", label: "Mã dự án", placeholder: "LCG-2026-001" },{ name: "title", label: "Tiêu đề", placeholder: "Thấm mái khu A", required: true },{ name: "priority", label: "Ưu tiên", placeholder: "Trung bình" },{ name: "deadline", label: "Hạn xử lý", placeholder: "2026-08-15" },{ name: "status", label: "Trạng thái", placeholder: "Đã tiếp nhận" },{ name: "description", label: "Mô tả", placeholder: "Mô tả hiện trạng" }]} onImport={importRows} />
      <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Công trình<select value={form.projectCode} onChange={(e)=>setForm({...form,projectCode:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"><option value="">Không gán dự án</option>{projects.map((project)=><option key={project._id} value={project.project_code || ""}>{project.project_code} · {project.project_name}</option>)}</select></label><label className="text-xs font-bold text-slate-600 md:col-span-2">Tiêu đề<input required value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" placeholder="Nội dung cần bảo hành" /></label><label className="text-xs font-bold text-slate-600">Mức ưu tiên<select value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"><option>Thấp</option><option>Trung bình</option><option>Cao</option></select></label><label className="text-xs font-bold text-slate-600">Hạn xử lý<input type="date" value={form.deadline} onChange={(e)=>setForm({...form,deadline:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600 md:col-span-2">Mô tả<textarea rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" placeholder="Mô tả hiện trạng và yêu cầu xử lý..." /></label></div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Hủy</button><button disabled={saving} className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white disabled:bg-slate-300">{saving ? "Đang lưu..." : "Tạo yêu cầu"}</button></div></form></div> : null}
  </div>;
}
