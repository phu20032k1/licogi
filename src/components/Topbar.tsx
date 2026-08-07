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
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="flex h-full min-w-0 items-center gap-3 px-3 sm:px-4 lg:px-5 xl:px-6">
          <button type="button" onClick={onOpenMobile} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden" aria-label="Mở menu">
            <Menu size={19} />
          </button>

          <h1 className="min-w-0 truncate text-sm font-black tracking-[-0.02em] text-slate-950 sm:text-base">{title}</h1>

          <button type="button" onClick={() => setSearchOpen(true)} className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-500 transition hover:border-orange-200 hover:bg-white xl:flex">
            <Search size={16} />
            <span className="min-w-0 flex-1 truncate text-sm">Tìm kiếm</span>
            <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
          </button>

          <button type="button" onClick={() => setSearchOpen(true)} className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 xl:hidden" aria-label="Tìm kiếm"><Search size={18} /></button>

          <button type="button" onClick={() => setNotificationsOpen(true)} className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Thông báo">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>

          <div className="min-w-0 border-l border-slate-200 pl-2"><ProfileMenu /></div>
        </div>
      </header>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
