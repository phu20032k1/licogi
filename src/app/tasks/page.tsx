"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileCheck2, Filter, Plus, Search, ShieldAlert, UserCheck, XCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import StatCard from "../../components/StatCard";
import { approvals as defaultApprovals, ApprovalItem, tasks as defaultTasks, TaskItem } from "../../data/control";

const taskColumns = ["Chưa làm", "Đang làm", "Chờ duyệt", "Hoàn thành"] as const;

export default function TasksPage() {
  const [tab, setTab] = useState<"Công việc" | "Phê duyệt">("Công việc");
  const [tasks] = useState<TaskItem[]>(defaultTasks);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(defaultApprovals);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || `${task.title} ${task.project} ${task.assignee}`.toLocaleLowerCase("vi").includes(keyword)) && (status === "all" || task.status === status);
  }), [search, status, tasks]);

  const filteredApprovals = useMemo(() => approvals.filter((item) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || `${item.title} ${item.project} ${item.requester}`.toLocaleLowerCase("vi").includes(keyword)) && (status === "all" || item.status === status);
  }), [approvals, search, status]);

  function updateApproval(id: string, next: "Đã duyệt" | "Từ chối") {
    setApprovals((items) => items.map((item) => item.id === id ? { ...item, status: next } : item));
  }

  const actions = <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Plus size={16} /> Tạo công việc</button>;

  return <div className="space-y-6 animate-fade-up">
    <PageHeader eyebrow="Workflow Center" title="Công việc & phê duyệt" description="Tập trung các đầu việc, đề nghị phê duyệt và mốc cần xử lý của toàn bộ danh mục dự án." actions={actions} />

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Công việc đang mở" value={String(tasks.filter((item) => item.status !== "Hoàn thành").length)} note="theo dữ liệu hiện có" icon={Clock3} tone="orange" />
      <StatCard title="Chờ Ban lãnh đạo duyệt" value={String(approvals.filter((item) => item.status === "Chờ duyệt").length)} note="chờ xử lý" icon={FileCheck2} tone="violet" />
      <StatCard title="Đến hạn trong 48 giờ" value="0" note="chưa có cảnh báo" icon={ShieldAlert} tone="blue" />
      <StatCard title="Hoàn thành tuần này" value="0" note="theo dữ liệu hiện có" icon={CheckCircle2} tone="green" />
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["Công việc", "Phê duyệt"] as const).map((item) => <button key={item} type="button" onClick={() => { setTab(item); setStatus("all"); }} className={`rounded-lg px-4 py-2.5 text-xs font-extrabold ${tab === item ? "bg-slate-900 text-white shadow" : "text-slate-500"}`}>{item}</button>)}
        </div>
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 lg:ml-auto lg:max-w-md"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm nội dung, dự án, người phụ trách..." /></label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5"><Filter size={16} className="text-slate-400" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-transparent text-sm font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option>{tab === "Công việc" ? taskColumns.map((item) => <option key={item}>{item}</option>) : ["Chờ duyệt", "Đã duyệt", "Từ chối"].map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
    </section>

    {tab === "Công việc" ? <section className="grid gap-4 xl:grid-cols-4">
      {taskColumns.map((column) => {
        const columnTasks = filteredTasks.filter((task) => task.status === column);
        return <article key={column} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between px-1 py-2"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${column === "Hoàn thành" ? "bg-emerald-500" : column === "Chờ duyệt" ? "bg-violet-500" : column === "Đang làm" ? "bg-orange-500" : "bg-slate-400"}`} /><h2 className="text-sm font-black text-slate-800">{column}</h2></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-200">{columnTasks.length}</span></div>
          <div className="mt-2 space-y-3">{columnTasks.map((task) => <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${task.priority === "Cao" ? "bg-red-50 text-red-700" : task.priority === "Trung bình" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{task.priority}</span><span className="text-[10px] font-bold text-slate-400">{task.id}</span></div><h3 className="mt-3 text-sm font-extrabold leading-5 text-slate-900">{task.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{task.project}</p><div className="mt-4"><div className="mb-1.5 flex justify-between text-[10px] font-bold text-slate-500"><span>Tiến độ</span><span>{task.progress}%</span></div><ProgressBar value={task.progress} tone={task.progress === 100 ? "green" : "orange"} /></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]"><span className="font-bold text-slate-600">{task.assignee}</span><span className="text-slate-400">Hạn {task.due}</span></div></div>)}</div>
        </article>;
      })}
    </section> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Đề nghị</th><th className="px-4 py-4">Dự án</th><th className="px-4 py-4">Người đề nghị</th><th className="px-4 py-4">Ưu tiên</th><th className="px-4 py-4">Hạn duyệt</th><th className="px-4 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Xử lý</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredApprovals.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="max-w-[280px] font-extrabold text-slate-900">{item.title}</p><p className="mt-1 text-[11px] font-bold text-slate-400">{item.id} · {item.department}{item.amount ? ` · ${item.amount}` : ""}</p></td><td className="max-w-[210px] px-4 py-4 font-semibold text-slate-600">{item.project}</td><td className="px-4 py-4"><p className="font-bold text-slate-700">{item.requester}</p><p className="mt-1 text-[11px] text-slate-400">{item.submittedAt}</p></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.priority === "Khẩn" ? "bg-red-50 text-red-700" : item.priority === "Cao" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{item.priority}</span></td><td className="px-4 py-4 font-bold text-slate-700">{item.deadline}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.status === "Đã duyệt" ? "bg-emerald-50 text-emerald-700" : item.status === "Từ chối" ? "bg-red-50 text-red-700" : "bg-violet-50 text-violet-700"}`}>{item.status}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{item.status === "Chờ duyệt" ? <><button type="button" onClick={() => updateApproval(item.id, "Từ chối")} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50" title="Từ chối"><XCircle size={16} /></button><button type="button" onClick={() => updateApproval(item.id, "Đã duyệt")} className="rounded-xl bg-emerald-500 p-2 text-white hover:bg-emerald-600" title="Phê duyệt"><UserCheck size={16} /></button></> : <span className="text-xs font-bold text-slate-400">Đã xử lý</span>}</div></td></tr>)}</tbody></table></div></section>}

    {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={() => setShowForm(false)} /><form onSubmit={(event) => { event.preventDefault(); setShowForm(false); }} className="relative w-full max-w-2xl rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">New task</p><h2 className="mt-1 text-xl font-black text-slate-900">Tạo công việc mới</h2></div><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">Đóng</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Tên công việc<input required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" placeholder="Nhập tên công việc" /></label><label className="text-xs font-bold text-slate-600">Dự án<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option>Chọn sau khi đã nhập dữ liệu dự án</option></select></label><label className="text-xs font-bold text-slate-600">Người phụ trách<input className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" placeholder="Tên người phụ trách" /></label><label className="text-xs font-bold text-slate-600">Hạn hoàn thành<input type="date" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Mức ưu tiên<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option>Cao</option><option>Trung bình</option><option>Thấp</option></select></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white">Tạo công việc</button></div></form></div> : null}
  </div>;
}
