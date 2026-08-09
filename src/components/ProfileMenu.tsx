"use client";

import Link from "next/link";
import { ChevronDown, ExternalLink, LayoutDashboard, LogOut, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutSession, readSession, UserSession } from "../lib/authSession";
import { canViewModule, roleDefaultRoute } from "../lib/rbac";

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

  const initials = (session?.name ?? "User").split(" ").filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase() || "U";
  const showUsers = canViewModule(session, "USERS");
  const showSettings = canViewModule(session, "SETTINGS");
  const homeRoute = roleDefaultRoute(session);

  async function signOut() {
    setOpen(false);
    await logoutSession();
    window.location.replace("/login");
  }

  return <div ref={ref} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className="group flex max-w-[230px] items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100" aria-expanded={open}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
        {initials}
        <i className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      </span>
      <span className="hidden min-w-0 text-left xl:block">
        <span className="block max-w-[130px] truncate text-xs font-extrabold text-slate-900">{session?.name ?? "Người dùng"}</span>
        <span className="mt-0.5 block max-w-[130px] truncate text-[10px] font-semibold text-slate-400">{session?.role ?? "Đã đăng nhập"}</span>
      </span>
      <ChevronDown size={14} className={`hidden shrink-0 text-slate-400 transition xl:block ${open ? "rotate-180" : ""}`} />
    </button>

    {open ? <div className="absolute right-0 top-[calc(100%+10px)] w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">{initials}</span>
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-950">{session?.name ?? "Người dùng"}</p><p className="mt-0.5 truncate text-xs text-slate-500">{session?.email}</p></div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 px-2 text-[10px] font-bold text-emerald-700"><ShieldCheck size={12} /> {session?.role ?? "Tài khoản hệ thống"}</div>
      </div>

      <nav className="border-t border-slate-100 p-2">
        <Link href={homeRoute} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"><LayoutDashboard size={17} /> Trang chính</Link>
        {showUsers ? <Link href="/users" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"><UsersRound size={17} /> Tài khoản</Link> : null}
        {showSettings ? <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"><Settings size={17} /> Cài đặt</Link> : null}
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"><ExternalLink size={17} /> Website công khai</Link>
      </nav>

      <div className="border-t border-slate-100 p-2">
        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"><LogOut size={17} /> Đăng xuất</button>
      </div>
    </div> : null}
  </div>;
}
