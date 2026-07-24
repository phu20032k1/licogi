"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CreditCard,
  Database,
  Building2,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileStack,
  FileText,
  FolderKanban,
  Landmark,
  Map,
  Handshake,
  HardHat,
  Home,
  LayoutDashboard,
  MapPinned,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserCog,
  Wrench,
  UploadCloud as UploadCloudIcon,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { readSession } from "../lib/authSession";
import type { UserSession } from "../lib/authSession";
import { canViewModule } from "../lib/rbac";
import type { ModuleCode } from "../lib/rbac";

type MenuItem = { label: string; href: string; icon: typeof LayoutDashboard; module: ModuleCode; badge?: string };
type MenuGroup = { label: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    label: "Điều hành lõi",
    items: [
      { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, module: "DASHBOARD", badge: "Live" },
      { label: "Danh mục dự án", href: "/projects", icon: FolderKanban, module: "PROJECTS" },
      { label: "Bản đồ dự án GIS", href: "/gis", icon: MapPinned, module: "GIS_MAP" },
      { label: "Kế hoạch thi công", href: "/planning", icon: CalendarClock, module: "PLANNING", badge: "WBS" },
      { label: "Điều hành thi công", href: "/construction", icon: HardHat, module: "CONSTRUCTION" },
      { label: "Công việc & phê duyệt", href: "/tasks", icon: CheckSquare2, module: "TASKS", badge: "3" },
    ],
  },
  {
    label: "Tài chính · ERP",
    items: [
      { label: "Hợp đồng", href: "/contracts", icon: ReceiptText, module: "CONTRACTS" },
      { label: "Thanh toán", href: "/payments", icon: CreditCard, module: "PAYMENTS" },
      { label: "Công nợ", href: "/debt", icon: WalletCards, module: "DEBT" },
      { label: "Tài chính kế toán", href: "/finance", icon: Landmark, module: "FINANCE" },
      { label: "CRM", href: "/crm", icon: Handshake, module: "CRM" },
      { label: "ERP Workflow", href: "/erp", icon: ShieldCheck, module: "ERP" },
    ],
  },
  {
    label: "Dữ liệu · AI · BIM",
    items: [
      { label: "Trung tâm dữ liệu", href: "/data", icon: Database, module: "DATA_CENTER", badge: "CSV" },
      { label: "Hồ sơ & tài liệu", href: "/documents", icon: FileStack, module: "DOCUMENTS" },
      { label: "Kho file S3/MinIO", href: "/storage", icon: UploadCloudIcon, module: "STORAGE" },
      { label: "BIM", href: "/bim", icon: Map, module: "BIM" },
      { label: "AI Construction Brain", href: "/ai-brain", icon: BrainCircuit, module: "AI_BRAIN" },
      { label: "Hồ sơ năng lực", href: "/ai-profile", icon: FileText, module: "AI_PROFILE", badge: "5L" },
    ],
  },
  {
    label: "Mở rộng & hệ thống",
    items: [
      { label: "Bảo hành công trình", href: "/warranty", icon: ShieldCheck, module: "WARRANTY" },
      { label: "Cổng chủ đầu tư", href: "/portal", icon: UsersRound, module: "PORTAL" },
      { label: "Đối tác & nhà cung cấp", href: "/partners", icon: Handshake, module: "PARTNERS" },
      { label: "Báo cáo quản trị", href: "/reports", icon: BarChart3, module: "REPORTS" },
      { label: "Tài khoản & phân quyền", href: "/users", icon: UserCog, module: "USERS" },
      { label: "Nhật ký hệ thống", href: "/activity", icon: Activity, module: "ACTIVITY" },
      { label: "Admin sản phẩm", href: "/admin", icon: Wrench, module: "SETTINGS", badge: "Prod" },
      { label: "Cài đặt & API", href: "/settings", icon: Settings, module: "SETTINGS" },
    ],
  },
];
type Props = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function Sidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapsed }: Props) {
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

  const visibleGroups = useMemo(() => menuGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => canViewModule(session, item.module)),
  })).filter((group) => group.items.length), [session]);

  return (
    <>
      {mobileOpen ? <button type="button" aria-label="Đóng menu" onClick={onCloseMobile} className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" /> : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#071426] text-white shadow-2xl shadow-slate-950/20 transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${collapsed ? "w-[290px] lg:w-[88px]" : "w-[290px]"}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute -right-28 bottom-16 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative flex h-[82px] items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" onClick={onCloseMobile} className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-600 shadow-lg shadow-orange-950/20 "><Building2 size={23} strokeWidth={2.2} /></span>
            <span className={`min-w-0 transition-opacity ${collapsed ? "lg:hidden" : ""}`}><span className="block truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Industrial Construction OS</span><span className="mt-1 block truncate text-lg font-black tracking-tight">LICOGI 18.3</span></span>
          </Link>
          <button type="button" onClick={onCloseMobile} className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden"><X size={20} /></button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 py-5">
          <Link href="/" onClick={onCloseMobile} title={collapsed ? "Website công khai" : undefined} className={`mb-5 flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white ${collapsed ? "lg:justify-center" : ""}`}>
            <Home size={19} className="shrink-0 text-orange-400" />
            <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>Website công khai</span>
            <span className={`ml-auto rounded-md bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold text-orange-300 ${collapsed ? "lg:hidden" : ""}`}>Home</span>
          </Link>
          {visibleGroups.map((group) => <div key={group.label} className="mb-6">
            <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 ${collapsed ? "lg:text-center lg:text-[0px]" : ""}`}>{collapsed ? <span className="hidden lg:inline">•••</span> : group.label}</p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                return <Link key={item.href} href={item.href} onClick={onCloseMobile} title={collapsed ? item.label : undefined} className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-950/20" : "text-slate-300 hover:bg-white/[0.08] hover:text-white"} ${collapsed ? "lg:justify-center" : ""}`}>
                  <span className={`${active ? "text-white" : "text-slate-400 group-hover:text-white"}`}><Icon size={19} className="shrink-0" /></span>
                  <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                  {item.badge ? <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/15 text-white" : "bg-white/10 text-slate-300"} ${collapsed ? "lg:hidden" : ""}`}>{item.badge}</span> : null}
                </Link>;
              })}
            </nav>
          </div>)}
        </div>

        <div className="relative border-t border-white/10 p-3">
          <div className={`rounded-2xl bg-white/[0.065] p-3 ring-1 ring-white/10 ${collapsed ? "lg:flex lg:justify-center" : ""}`}><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300"><ClipboardCheck size={18} /></span><div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}><p className="truncate text-xs font-bold">Dữ liệu doanh nghiệp</p><p className="mt-0.5 truncate text-[11px] text-slate-400">Dự án · hồ sơ · bảo hành</p></div></div></div>
          <button type="button" onClick={onToggleCollapsed} className="mt-3 hidden h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-slate-400 transition hover:bg-white/[0.07] hover:text-white lg:flex">{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}<span className={collapsed ? "hidden" : ""}>Thu gọn menu</span></button>
        </div>
      </aside>
    </>
  );
}
