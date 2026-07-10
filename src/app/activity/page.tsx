"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Download, RefreshCcw, Search, ShieldAlert } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

type LogRow = { id: string; at: string; user: string; email: string; module: string; action: string; entity: string; message: string };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/activity", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không tải được nhật ký.");
      setLogs(data.logs as LogRow[]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được nhật ký.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const modules = useMemo(() => Array.from(new Set(logs.map((item) => item.module))).sort(), [logs]);
  const filtered = useMemo(() => logs.filter((item) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || `${item.user} ${item.email} ${item.action} ${item.message} ${item.entity}`.toLocaleLowerCase("vi").includes(keyword)) && (module === "all" || item.module === module);
  }), [logs, module, search]);

  function exportCsv() {
    const rows = [["ID", "Thời gian", "Người dùng", "Email", "Module", "Action", "Entity", "Nội dung"], ...filtered.map((item) => [item.id, item.at, item.user, item.email, item.module, item.action, item.entity, item.message])];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "licogi-audit-log.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-6 animate-fade-up">
    <PageHeader eyebrow="System Audit" title="Nhật ký hệ thống thật" description="Đọc trực tiếp bảng AuditLog trong Prisma: đăng nhập, import dữ liệu, CRUD tài khoản, phân quyền và thay đổi module." actions={<div className="flex flex-wrap gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700"><RefreshCcw size={16} /> Tải lại</button><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white"><Download size={16} /> Xuất CSV</button></div>} />
    {message ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</div> : null}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card icon={Activity} label="Tổng bản ghi" value={String(logs.length)} note="100 bản ghi mới nhất" />
      <Card icon={ShieldAlert} label="Module đã ghi log" value={String(modules.length)} note="theo quyền người dùng" />
      <Card icon={Activity} label="CRUD dữ liệu" value={String(logs.filter((item) => ["CREATE", "UPDATE", "DELETE", "IMPORT", "MANAGE"].includes(item.action)).length)} note="thao tác có thay đổi" />
      <Card icon={ShieldAlert} label="Đăng nhập" value={String(logs.filter((item) => item.message.toLowerCase().includes("đăng nhập")).length)} note="theo phiên hệ thống" />
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_260px]"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm người dùng, module, nội dung..." /></label><select value={module} onChange={(event) => setModule(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả module</option>{modules.map((item) => <option key={item}>{item}</option>)}</select></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Thời gian</th><th className="px-4 py-4">Người dùng</th><th className="px-4 py-4">Module</th><th className="px-4 py-4">Action</th><th className="px-4 py-4">Đối tượng</th><th className="px-5 py-4">Nội dung</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-10 text-center font-bold text-slate-500">Đang tải nhật ký...</td></tr> : null}{!loading && filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-semibold text-slate-600">{formatDate(item.at)}</td><td className="px-4 py-4"><p className="font-black text-slate-900">{item.user}</p><p className="mt-1 text-[11px] text-slate-400">{item.email || "—"}</p></td><td className="px-4 py-4"><code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{item.module}</code></td><td className="px-4 py-4"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-orange-700">{item.action}</span></td><td className="px-4 py-4 text-slate-500">{item.entity || "—"}</td><td className="px-5 py-4 font-semibold text-slate-700">{item.message}</td></tr>)}{!loading && !filtered.length ? <tr><td colSpan={6} className="px-5 py-10 text-center font-bold text-slate-500">Không có bản ghi phù hợp.</td></tr> : null}</tbody></table></div></section>
  </div>;
}

function Card({ icon: Icon, label, value, note }: { icon: typeof Activity; label: string; value: string; note: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><Icon size={20} /></span><span className="text-2xl font-black text-slate-900">{value}</span></div><h3 className="mt-4 font-black text-slate-900">{label}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{note}</p></article>;
}
