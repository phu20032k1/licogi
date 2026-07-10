"use client";

import { Bell, Building2, CalendarDays, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CommandPalette from "./CommandPalette";
import NotificationPanel from "./NotificationPanel";
import ProfileMenu from "./ProfileMenu";

const titles: Record<string, string> = {
  "/dashboard": "Trung tâm điều hành",
  "/projects": "Quản lý dự án",
  "/map": "Bản đồ dự án GIS",
  "/construction": "Điều hành thi công",
  "/documents": "Hồ sơ & bản vẽ",
  "/warranty": "Bảo hành công trình",
  "/portal": "Cổng chủ đầu tư",
  "/partners": "Đối tác & nhà cung cấp",
  "/reports": "Báo cáo quản trị",
  "/ai-profile": "Hồ sơ năng lực",
  "/tasks": "Công việc & phê duyệt",
  "/users": "Tài khoản & phân quyền",
  "/activity": "Nhật ký hệ thống",
  "/data": "Trung tâm dữ liệu",
  "/settings": "Cài đặt & API dịch vụ",
  "/admin": "Quản trị hệ thống",
  "/contracts": "Hợp đồng",
  "/payments": "Thanh toán",
  "/debt": "Công nợ",
  "/planning": "Kế hoạch thi công",
  "/bim": "BIM",
  "/ai-brain": "AI Construction Brain",
  "/gis": "Bản đồ GIS",
  "/finance": "Tài chính kế toán",
  "/crm": "CRM",
  "/erp": "ERP Workflow",
  "/storage": "Kho file",
};

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/projects/") && pathname !== "/projects") return "Trung tâm điều hành dự án";
  return titles[pathname] ?? "LICOGI 18.3 OS";
}

export default function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const title = resolveTitle(pathname);
  const dateLabel = useMemo(() => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()), []);

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
      <header className="sticky top-0 z-30 h-[82px] border-b border-white/70 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
        <div className="flex h-full min-w-0 items-center gap-3 px-3 sm:px-5 lg:px-6 xl:px-8">
          <button type="button" onClick={onOpenMobile} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{title}</p>
            <p className="mt-0.5 hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"><Building2 size={13} className="text-orange-600" />Kiến tạo hạ tầng · Dẫn dắt phát triển</p>
          </div>

          <button type="button" onClick={() => setSearchOpen(true)} className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2.5 text-left text-slate-500 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40 xl:flex">
            <Search size={17} />
            <span className="min-w-0 flex-1 truncate text-sm">Tìm dự án, hồ sơ, đối tác, bảo hành...</span>
            <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
          </button>

          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm md:flex">
            <CalendarDays size={16} className="text-orange-500" />
            {dateLabel}
          </div>

          <button type="button" onClick={() => setNotificationsOpen(true)} className="relative rounded-2xl border border-slate-200 bg-white/85 p-2.5 text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>

          <div className="min-w-0 border-l border-slate-200 pl-2 sm:pl-3"><ProfileMenu /></div>
        </div>
      </header>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
