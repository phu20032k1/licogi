"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Plus, Search, ShieldCheck, Siren, Wrench } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { warrantyTickets } from "../../data/operations";

function EmptyBox({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center"><p className="text-sm font-black text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

export default function WarrantyPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const filtered = useMemo(() => warrantyTickets.filter((ticket) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || [ticket.code, ticket.project, ticket.title, ticket.customer].some((value) => value.toLocaleLowerCase("vi").includes(keyword))) && (status === "all" || ticket.status === status);
  }), [search, status]);
  const open = warrantyTickets.filter((ticket) => ticket.status !== "Hoàn thành").length;
  const completed = warrantyTickets.filter((ticket) => ticket.status === "Hoàn thành").length;
  const highPriority = warrantyTickets.filter((ticket) => ticket.priority === "Cao").length;
  const slaRate = warrantyTickets.length ? Math.round((completed / warrantyTickets.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader eyebrow="Warranty Service" title="Quản lý bảo hành công trình" description="Tiếp nhận yêu cầu, phân công kỹ thuật viên, kiểm soát SLA và lưu trữ lịch sử xử lý sau bàn giao." actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Plus size={16} /> Tạo yêu cầu</button>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Yêu cầu đang mở" value={String(open)} note="chờ nhập dữ liệu" icon={Wrench} tone="orange" />
        <StatCard title="Sắp quá hạn SLA" value="0" note="chưa có cảnh báo" icon={Clock3} tone="blue" />
        <StatCard title="Ưu tiên cao" value={String(highPriority)} note="cần xử lý ngay" icon={Siren} tone="violet" />
        <StatCard title="Hoàn thành" value={String(completed)} note="theo dữ liệu hiện có" icon={CheckCircle2} tone="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm mã, dự án, nội dung yêu cầu..." /></label><select value={status} onChange={(event)=>setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả trạng thái</option><option>Đã tiếp nhận</option><option>Đang xử lý</option><option>Hoàn thành</option></select></div></div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[970px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Yêu cầu</th><th className="px-4 py-4">Công trình</th><th className="px-4 py-4">Khách hàng</th><th className="px-4 py-4">Ưu tiên</th><th className="px-4 py-4">Phụ trách</th><th className="px-4 py-4">SLA</th><th className="px-5 py-4">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((ticket)=><tr key={ticket.code} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="max-w-[260px] truncate font-extrabold text-slate-900">{ticket.title}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{ticket.code} · {ticket.created}</p></td><td className="max-w-[200px] px-4 py-4"><p className="truncate font-semibold text-slate-600">{ticket.project}</p></td><td className="max-w-[180px] px-4 py-4"><p className="truncate text-slate-600">{ticket.customer}</p></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${ticket.priority === "Cao" ? "bg-red-50 text-red-700" : ticket.priority === "Trung bình" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{ticket.priority}</span></td><td className="px-4 py-4 text-slate-600">{ticket.assignee}</td><td className="px-4 py-4"><p className="font-bold text-slate-700">{ticket.deadline}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${ticket.status === "Hoàn thành" ? "bg-emerald-50 text-emerald-700" : ticket.status === "Đang xử lý" ? "bg-orange-50 text-orange-700" : "bg-sky-50 text-sky-700"}`}>{ticket.status}</span></td></tr>)}</tbody></table></div>{filtered.length === 0 ? <div className="p-6"><EmptyBox title="Chưa có yêu cầu bảo hành" description="Nhập dữ liệu bảo hành tại Trung tâm dữ liệu hoặc tạo yêu cầu mới để bắt đầu theo dõi SLA." /></div> : null}</div>
        </div>

        <aside className="space-y-5"><article className="rounded-2xl bg-[#071426] p-6 text-white shadow-xl"><ShieldCheck size={26} className="text-orange-400" /><p className="mt-5 text-sm font-bold text-slate-300">Tỷ lệ đáp ứng SLA</p><p className="mt-1 text-4xl font-black">{slaRate}%</p><div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{width:`${slaRate}%`}} /></div><p className="mt-3 text-xs leading-5 text-slate-400">Chưa có dữ liệu SLA thật. Chỉ số này sẽ tính sau khi nhập ticket bảo hành.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Phân bổ theo nhóm</h3><div className="mt-5 space-y-4">{["Xây dựng", "MEP", "Hoàn thiện", "Khác"].map((label)=><div key={label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-bold text-slate-600">{label}</span><span className="font-black text-slate-800">0%</span></div><ProgressBar value={0} tone="slate" /></div>)}</div></article></aside>
      </section>

      {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={()=>setShowForm(false)} /><div className="relative w-full max-w-2xl rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">Warranty ticket</p><h2 className="mt-1 text-xl font-black text-slate-900">Tạo yêu cầu bảo hành</h2></div><button onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">Đóng</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Công trình<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option>Chọn sau khi đã nhập dữ liệu công trình</option></select></label><label className="text-xs font-bold text-slate-600 md:col-span-2">Tiêu đề<input className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" placeholder="Nội dung cần bảo hành" /></label><label className="text-xs font-bold text-slate-600">Mức ưu tiên<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option>Thấp</option><option>Trung bình</option><option>Cao</option></select></label><label className="text-xs font-bold text-slate-600">Hạn xử lý<input type="date" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600 md:col-span-2">Mô tả<textarea rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" placeholder="Mô tả hiện trạng và yêu cầu xử lý..." /></label></div><div className="mt-6 flex justify-end gap-3"><button onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button onClick={()=>setShowForm(false)} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white">Tạo yêu cầu</button></div></div></div> : null}
    </div>
  );
}
