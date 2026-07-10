"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Building2, Database, FileStack, HardHat, RefreshCcw, ShieldCheck, UsersRound } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

type Overview = {
  summary: { users: number; activeUsers: number; projects: number; customers: number; employees: number; employeeGroups: number; equipment: number; equipmentGroups: number; documents: number; warranty: number };
  roles: { id: string; code: string; name: string; dataScope: string; users: number; permissions: number }[];
  ownerships: { module: string; dataScope: string; ownerDepartment: string; ownerUser: string; description: string }[];
  latestLogs: { id: string; at: string; user: string; module: string; action: string; message: string }[];
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không tải được trang admin.");
      setOverview(data as Overview);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được trang admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const s = overview?.summary;

  return <div className="space-y-6 animate-fade-up">
    <PageHeader eyebrow="Quản trị hệ thống" title="Trung tâm quản trị nội bộ" description="Theo dõi tài khoản, vai trò, phạm vi dữ liệu, chủ sở hữu module và nhật ký vận hành. Giao diện này chỉ dành cho quản trị viên được cấp quyền." actions={<button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700"><RefreshCcw size={16} /> Tải lại</button>} />
    {message ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</div> : null}
    {loading && !overview ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">Đang đọc Prisma database...</div> : null}

    {s ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={UsersRound} label="Tài khoản" value={`${s.activeUsers}/${s.users}`} note="hoạt động / tổng tài khoản" />
      <Metric icon={HardHat} label="Dự án thật" value={String(s.projects)} note={`${s.customers} chủ đầu tư`} />
      <Metric icon={Building2} label="Nhân lực" value={String(s.employees)} note={`${s.employeeGroups} nhóm năng lực`} />
      <Metric icon={Database} label="Thiết bị" value={String(s.equipment)} note={`${s.equipmentGroups} nhóm thiết bị`} />
    </section> : null}

    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">Ma trận phân quyền</p><h2 className="mt-1 text-xl font-black text-slate-950">Vai trò, scope và số quyền</h2></div><Link href="/users" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">Quản lý</Link></div>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Phạm vi dữ liệu</th><th className="px-4 py-3">Users</th><th className="px-4 py-3">Số quyền</th></tr></thead><tbody className="divide-y divide-slate-100">{overview?.roles.map((role) => <tr key={role.id}><td className="px-4 py-3 font-black text-slate-900">{role.name}</td><td className="px-4 py-3"><code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black">{role.code}</code></td><td className="px-4 py-3 text-slate-600">{role.dataScope}</td><td className="px-4 py-3 font-bold text-slate-700">{role.users}</td><td className="px-4 py-3 font-bold text-orange-700">{role.permissions}</td></tr>)}</tbody></table></div>
      </article>
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">Bảng kiểm vận hành</p><h2 className="mt-1 text-xl font-black text-slate-950">Trạng thái cấu hình hệ thống</h2></div><ShieldCheck className="text-orange-600" /></div>
        <div className="mt-5 space-y-3">
          {[
            ["PostgreSQL", "Cơ sở dữ liệu vận hành ổn định, có lịch sao lưu định kỳ"],
            ["Auth", "Chính sách đăng nhập, khóa tài khoản và lịch sử phiên hoạt động"],
            ["Storage", "Kho lưu trữ hồ sơ, bản vẽ và ảnh công trường đã được cấu hình"],
            ["Domain", "Tên miền, chứng chỉ HTTPS và cấu hình truy cập bên ngoài"],
            ["Audit", "Nhật ký thao tác được giữ để truy vết trách nhiệm và kiểm toán"],
          ].map(([title, desc]) => <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="font-black text-slate-900">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p></div>)}
        </div>
      </article>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><FileStack className="text-orange-600" /><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">Module Ownership</p><h2 className="text-xl font-black text-slate-950">Ai sở hữu dữ liệu/chức năng</h2></div></div>
        <div className="mt-5 space-y-3">{overview?.ownerships.map((item) => <div key={item.module} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-slate-900">{item.module}</p><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-orange-700">{item.dataScope}</span></div><p className="mt-1 text-sm font-bold text-slate-600">{item.ownerDepartment || item.ownerUser || "Chưa gán owner"}</p><p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p></div>)}</div>
      </article>
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><Activity className="text-orange-600" /><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">Audit gần nhất</p><h2 className="text-xl font-black text-slate-950">Dấu vết vận hành</h2></div></div>
        <div className="mt-5 space-y-3">{overview?.latestLogs.map((log) => <div key={log.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-slate-900">{log.user}</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-700">{log.module}.{log.action}</span></div><p className="mt-1 text-xs text-slate-400">{formatDate(log.at)}</p><p className="mt-2 text-sm leading-6 text-slate-600">{log.message}</p></div>)}</div>
      </article>
    </section>
  </div>;
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof UsersRound; label: string; value: string; note: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><Icon size={20} /></span><span className="text-2xl font-black text-slate-900">{value}</span></div><h3 className="mt-4 font-black text-slate-900">{label}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{note}</p></article>;
}
