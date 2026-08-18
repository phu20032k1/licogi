"use client";

import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CommandPalette from "./CommandPalette";
import NotificationPanel from "./NotificationPanel";
import ProfileMenu from "./ProfileMenu";

const titles: Record<string, string> = {
  "/dashboard": "Trung tâm điều hành",
  "/projects": "Dự án",
  "/map": "Bản đồ GIS",
  "/construction": "Thi công",
  "/documents": "Hồ sơ & bản vẽ",
  "/warranty": "Bảo hành",
  "/portal": "Cổng khách hàng",
  "/partners": "Đối tác",
  "/reports": "Báo cáo",
  "/ai-profile": "Hồ sơ năng lực",
  "/tasks": "Công việc",
  "/users": "Tài khoản",
  "/activity": "Nhật ký",
  "/data": "Trung tâm dữ liệu",
  "/settings": "Cài đặt",
  "/admin": "Quản trị hệ thống",
  "/contracts": "Hợp đồng",
  "/payments": "Thanh toán",
  "/debt": "Công nợ",
  "/planning": "Kế hoạch",
  "/bim": "BIM",
  "/ai-brain": "AI Construction Brain",
  "/gis": "Bản đồ GIS",
  "/finance": "Tài chính",
  "/crm": "CRM",
  "/erp": "ERP",
  "/storage": "Kho file",
};

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/projects/") && pathname !== "/projects") return "Chi tiết dự án";
  return titles[pathname] ?? "LICOGI 18.3";
}

export default function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const title = resolveTitle(pathname);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 shadow-[0_6px_22px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex h-full min-w-0 items-center gap-2.5 px-3 sm:gap-3 sm:px-4 lg:px-5 xl:px-6">
          <button type="button" onClick={onOpenMobile} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200/70 transition active:scale-95 lg:hidden" aria-label="Mở menu">
            <Menu size={20} strokeWidth={2.4} />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-600 sm:block lg:hidden">LICOGI 18.3</p>
            <h1 className="min-w-0 truncate text-[15px] font-black tracking-[-0.02em] text-slate-950 sm:text-base">{title}</h1>
          </div>

          <button type="button" onClick={() => setSearchOpen(true)} className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-500 transition hover:border-orange-200 hover:bg-white xl:flex">
            <Search size={16} />
            <span className="min-w-0 flex-1 truncate text-sm">Tìm kiếm</span>
            <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
          </button>

          <button type="button" onClick={() => setSearchOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition active:scale-95 xl:hidden" aria-label="Tìm kiếm"><Search size={18} strokeWidth={2.2} /></button>

          <button type="button" onClick={() => setNotificationsOpen(true)} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95" aria-label="Thông báo">
            <Bell size={18} strokeWidth={2.2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>

          <div className="min-w-0 border-l border-slate-200 pl-1.5 sm:pl-2"><ProfileMenu /></div>
        </div>
      </header>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
