"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { readSession, refreshServerSession } from "../lib/authSession";
import { canViewModule, moduleFromPath, roleDefaultRoute } from "../lib/rbac";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isChangePasswordPage = pathname === "/change-password";

  useEffect(() => {
    const sync = () => {
      if (isPublicPage) {
        setChecked(true);
        setLoggedIn(false);
        return;
      }

      const session = readSession();
      setLoggedIn(Boolean(session));
      setChecked(true);

      if (!session && !isAuthPage) {
        void refreshServerSession().then((serverSession) => {
          setLoggedIn(Boolean(serverSession));
          if (!serverSession) router.replace("/login");
        });
        return;
      }

      if (session && isAuthPage) {
        router.replace(roleDefaultRoute(session));
        return;
      }

      if (session && !isAuthPage && !isChangePasswordPage) {
        const routeModule = moduleFromPath(pathname);
        if (routeModule && !canViewModule(session, routeModule)) router.replace(roleDefaultRoute(session));
      }
    };

    sync();
    window.addEventListener("licogi-auth-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("licogi-auth-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [isPublicPage, isAuthPage, isChangePasswordPage, pathname, router]);

  if (isPublicPage || isAuthPage || isChangePasswordPage) return <>{children}</>;

  if (!checked || !loggedIn) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-orange-600" />
          <p className="mt-4 text-sm font-black text-slate-800">Đang tải phiên làm việc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell relative min-h-screen max-w-full overflow-x-hidden text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-[-1]">
        <div className="absolute left-[12%] top-24 h-64 w-64 rounded-full bg-stone-300/20 blur-3xl" />
        <div className="absolute right-[8%] top-10 h-72 w-72 rounded-full bg-orange-200/16 blur-3xl" />
      </div>
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <div className={`min-h-screen max-w-full min-w-0 transition-[padding] duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="max-w-full px-3 pb-10 pt-4 sm:px-4 lg:px-5 xl:px-6">
          <div className="mx-auto max-w-[1820px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
