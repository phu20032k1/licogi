"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare2, FolderKanban, Home, MapPinned, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { readSession, UserSession } from "../lib/authSession";
import { canViewModule, roleDefaultRoute } from "../lib/rbac";
import type { ModuleCode } from "../lib/rbac";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  module?: ModuleCode;
};

const preferredItems: NavItem[] = [
  { label: "Dự án", href: "/projects", icon: FolderKanban, module: "PROJECTS" },
  { label: "Bản đồ", href: "/gis", icon: MapPinned, module: "GIS_MAP" },
  { label: "Công việc", href: "/tasks", icon: CheckSquare2, module: "TASKS" },
];

export default function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
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

  const items = useMemo(() => {
    if (!session) return [] as NavItem[];
    const homeRoute = roleDefaultRoute(session);
    const home: NavItem = { label: "Trang chính", href: homeRoute, icon: Home };
    const rest = preferredItems
      .filter((item) => item.href !== homeRoute)
      .filter((item) => !item.module || canViewModule(session, item.module));
    return [home, ...rest].slice(0, 4);
  }, [session]);

  return (
    <nav className="licogi-mobile-nav" aria-label="Điều hướng nhanh trên điện thoại">
      <div className="licogi-mobile-nav-inner">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return <Link key={item.href} href={item.href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>
            <span><Icon size={20} strokeWidth={active ? 2.5 : 2.1} /></span>
            <small>{item.label}</small>
          </Link>;
        })}
        <button type="button" onClick={onOpenMenu} aria-label="Mở toàn bộ menu">
          <span><Menu size={21} strokeWidth={2.25} /></span>
          <small>Thêm</small>
        </button>
      </div>
    </nav>
  );
}
