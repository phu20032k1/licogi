"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCheck, FileStack, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { notifications } from "../data/control";
import { readSession, UserSession } from "../lib/authSession";
import { canViewModule, moduleFromPath } from "../lib/rbac";

const iconMap = {
  risk: ShieldAlert,
  approval: CheckCheck,
  document: FileStack,
  warranty: ShieldCheck,
};

export default function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [session, setSession] = useState<UserSession | null>(null);
  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    window.addEventListener("licogi-auth-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("licogi-auth-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const visibleNotifications = useMemo(() => notifications.filter((item) => {
    const routeModule = moduleFromPath(item.href);
    return !routeModule || canViewModule(session, routeModule);
  }), [session]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <button type="button" aria-label="Đóng thông báo" onClick={onClose} className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]" />
      <aside className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white shadow-[-20px_0_70px_rgba(15,23,42,0.18)]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600"><BellRing size={20} /></span><div><h2 className="text-base font-black text-slate-900">Trung tâm thông báo</h2><p className="mt-0.5 text-xs text-slate-500">{visibleNotifications.filter((item) => item.unread).length} mục chưa đọc</p></div></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={19} /></button>
        </header>
        <div className="space-y-2 p-4">
          {visibleNotifications.map((item) => {
            const Icon = iconMap[item.type];
            return <Link key={item.id} href={item.href} onClick={onClose} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${item.unread ? "border-orange-100 bg-orange-50/45" : "border-slate-200 bg-white"}`}><div className="flex gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.type === "risk" ? "bg-red-50 text-red-600" : item.type === "approval" ? "bg-violet-50 text-violet-600" : item.type === "warranty" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-600"}`}><Icon size={18} /></span><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><p className="font-extrabold leading-5 text-slate-900">{item.title}</p>{item.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" /> : null}</div><p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p><p className="mt-2 text-[11px] font-bold text-slate-400">{item.time}</p></div></div></Link>;
          })}
        </div>
        <div className="mx-4 mb-6 rounded-2xl bg-[#071426] p-5 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-300">Tóm tắt điều hành</p><p className="mt-2 text-sm leading-6 text-slate-300">Thông báo được lọc theo vai trò, chỉ hiển thị những việc thuộc quyền xử lý của tài khoản hiện tại.</p>{canViewModule(session, "TASKS") ? <Link href="/tasks" onClick={onClose} className="mt-4 inline-flex rounded-xl bg-orange-500 px-3.5 py-2.5 text-xs font-extrabold">Mở trung tâm xử lý</Link> : null}</div>
      </aside>
    </div>
  );
}
