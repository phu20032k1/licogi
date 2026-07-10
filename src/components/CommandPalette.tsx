"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileStack, FolderKanban, HardHat, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { projects } from "../data/projects";
import { documents, warrantyTickets } from "../data/operations";
import { systemUsers } from "../data/control";
import { readSession, UserSession } from "../lib/authSession";
import { canViewModule, moduleFromPath } from "../lib/rbac";

type SearchResult = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  type: "Dự án" | "Hồ sơ" | "Bảo hành" | "Người dùng";
};

const typeIcon = {
  "Dự án": FolderKanban,
  "Hồ sơ": FileStack,
  "Bảo hành": ShieldCheck,
  "Người dùng": UserRound,
};

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<UserSession | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const allResults = useMemo<SearchResult[]>(() => [
    ...projects.map((project) => ({ key: `project-${project.id}`, title: project.name, subtitle: `${project.code} · ${project.province} · ${project.investor}`, href: `/projects/${project.id}`, type: "Dự án" as const })),
    ...documents.map((document) => ({ key: `document-${document.code}`, title: document.name, subtitle: `${document.code} · ${document.project}`, href: "/documents", type: "Hồ sơ" as const })),
    ...warrantyTickets.map((ticket) => ({ key: `warranty-${ticket.code}`, title: ticket.title, subtitle: `${ticket.code} · ${ticket.project}`, href: "/warranty", type: "Bảo hành" as const })),
    ...systemUsers.map((user) => ({ key: `user-${user.id}`, title: user.name, subtitle: `${user.role} · ${user.department}`, href: "/users", type: "Người dùng" as const })),
  ].filter((item) => {
    const routeModule = moduleFromPath(item.href);
    return !routeModule || canViewModule(session, routeModule);
  }), [session]);

  const results = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi");
    if (!keyword) return allResults.slice(0, 8);
    return allResults.filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLocaleLowerCase("vi").includes(keyword)).slice(0, 12);
  }, [allResults, query]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    setQuery("");
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/55 px-4 pt-[10vh] backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng tìm kiếm" className="absolute inset-0" onClick={onClose} />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <Search size={20} className="text-orange-500" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" placeholder="Tìm trong các chức năng được cấp..." />
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto p-2">
          {results.length ? results.map((item) => {
            const Icon = typeIcon[item.type];
            return (
              <button key={item.key} type="button" onClick={() => go(item.href)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon size={19} /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-slate-900">{item.title}</span><span className="mt-1 block truncate text-xs text-slate-500">{item.subtitle}</span></span>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-orange-700">{item.type}</span>
              </button>
            );
          }) : <div className="px-6 py-14 text-center"><HardHat size={28} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-extrabold text-slate-700">Không tìm thấy kết quả</p><p className="mt-1 text-xs text-slate-400">Tìm kiếm chỉ hiển thị dữ liệu thuộc quyền của tài khoản hiện tại.</p></div>}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] text-slate-500">
          <span>Nhấn vào kết quả để mở nhanh</span>
          <span className="font-bold">ESC để đóng · Ctrl/⌘ K để mở</span>
        </footer>
      </section>
    </div>
  );
}
