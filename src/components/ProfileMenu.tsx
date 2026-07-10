"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutSession, readSession, UserSession } from "../lib/authSession";
import { canViewModule } from "../lib/rbac";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const initials = (session?.name ?? "User").split(" ").slice(-2).map((part) => part[0]).join("").toUpperCase() || "U";
  const showUsers = canViewModule(session, "USERS");
  const showSettings = canViewModule(session, "SETTINGS");

  return <div ref={ref} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className="flex max-w-[220px] items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-50">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-sm font-black text-white">{initials}</span>
      <span className="hidden min-w-0 text-left xl:block"><span className="block truncate text-xs font-bold text-slate-900">{session?.name ?? "Người dùng"}</span><span className="mt-0.5 block max-w-[150px] truncate text-[11px] text-slate-500">{session?.role ?? "Đã đăng nhập"}</span></span>
      <ChevronDown size={15} className="hidden shrink-0 text-slate-400 xl:block" />
    </button>
    {open ? <div className="absolute right-0 top-[calc(100%+10px)] w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div className="rounded-xl bg-slate-50 p-3"><p className="truncate text-sm font-extrabold text-slate-900">{session?.name ?? "Người dùng"}</p><p className="mt-1 truncate text-xs text-slate-500">{session?.email ?? "user@licogi183.vn"}</p><div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700"><ShieldCheck size={12} /> <span className="truncate">{session?.role ?? "Quyền hệ thống"}</span></div><p className="mt-2 text-[11px] leading-5 text-slate-500">{session?.scope ?? "Truy cập hệ thống"}</p></div>
      <nav className="mt-2 space-y-1">
        {showUsers ? <Link href="/users" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"><UserRound size={17} /> Tài khoản & phân quyền</Link> : null}
        {showSettings ? <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"><Settings size={17} /> Cài đặt hệ thống</Link> : null}
        <button type="button" onClick={() => { setOpen(false); void logoutSession(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut size={17} /> Đăng xuất</button>
      </nav>
    </div> : null}
  </div>;
}
