"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  HardHat,
  ListChecks,
  MapPinned,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  UserCog,
  UsersRound,
} from "lucide-react";

import OrganizationCommandChart from "../../components/OrganizationCommandChart";
import type { Project } from "../../data/projects";
import {
  getRoleAccountProfile,
  roleAccountByCode,
  roleAccountProfiles,
  type RoleAccountProfile,
  type RoleDomain,
} from "../../data/roleAccounts";
import { readSession, type UserSession } from "../../lib/authSession";
import { fetchProjectsFromDataCenter } from "../../lib/projectData";
import { canViewModule } from "../../lib/rbac";

type Tone = "green" | "yellow" | "red" | "blue";

type DashboardRow = {
  project: Project;
  plan: number;
  actual: number;
  gap: number;
  delta: number;
  tone: Tone;
  status: string;
};

type WorkItem = {
  id: string;
  title: string;
  project: string;
  projectCode?: string;
  assignee: string;
  assigneeEmail?: string;
  due?: string;
  status: string;
  priority: string;
  progress: number;
};

type KpiItem = {
  title: string;
  value: string;
  subtitle: string;
  status: string;
  tone: Tone;
  icon: ReactNode;
  href: string;
};

type Metrics = {
  ongoing: Project[];
  completed: Project[];
  warranty: Project[];
  highRisk: Project[];
  mediumRisk: Project[];
  safeCount: number;
  averageActual: number;
  averagePlan: number;
  averageHealth: number;
  totalEvidence: number;
  delayed: Project[];
  behind: Project[];
  valueTotal: number;
  completionRate: number;
};

type TaskMetrics = {
  open: WorkItem[];
  done: WorkItem[];
  overdue: WorkItem[];
  dueSoon: WorkItem[];
  avgProgress: number;
};

const panel = "overflow-hidden rounded-[12px] border border-slate-300 bg-white shadow-[0_7px_18px_rgba(15,23,42,0.06)]";

const toneStyles: Record<Tone, { text: string; badge: string; dot: string; soft: string; top: string }> = {
  green: { text: "text-emerald-700", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", soft: "bg-emerald-50", top: "border-t-emerald-500" },
  yellow: { text: "text-amber-700", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500", soft: "bg-amber-50", top: "border-t-amber-500" },
  red: { text: "text-red-700", badge: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500", soft: "bg-red-50", top: "border-t-red-500" },
  blue: { text: "text-sky-700", badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500", soft: "bg-sky-50", top: "border-t-sky-600" },
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [today, setToday] = useState("");
  const [previewEmail, setPreviewEmail] = useState("");

  useEffect(() => {
    const syncAuth = () => setSession(readSession());
    const syncProjects = () => fetchProjectsFromDataCenter().then(setProjects).catch(() => setProjects([]));
    syncAuth();
    syncProjects();
    setToday(new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()));
    window.addEventListener("licogi-auth-updated", syncAuth);
    window.addEventListener("licogi-data-imported", syncProjects);
    window.addEventListener("licogi-projects-updated", syncProjects);
    return () => {
      window.removeEventListener("licogi-auth-updated", syncAuth);
      window.removeEventListener("licogi-data-imported", syncProjects);
      window.removeEventListener("licogi-projects-updated", syncProjects);
    };
  }, []);

  useEffect(() => {
    if (!session || !canViewModule(session, "TASKS")) {
      setTasks([]);
      return;
    }
    fetch("/api/tasks", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data?.ok) throw new Error(data?.message || "Không tải được công việc");
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      })
      .catch(() => setTasks([]));
  }, [session]);

  const isAdmin = session?.roleCode === "SUPER_ADMIN" || session?.roleCode === "SYSTEM_ADMIN";
  const actualProfile = getRoleAccountProfile(session?.email) ?? fallbackProfile(session);
  const roleProfile = (previewEmail ? getRoleAccountProfile(previewEmail) : undefined) ?? actualProfile;

  const metrics = useMemo<Metrics>(() => {
    const ongoing = projects.filter((item) => item.status === "ongoing");
    const completed = projects.filter((item) => item.status === "completed");
    const warranty = projects.filter((item) => item.status === "warranty");
    const highRisk = projects.filter((item) => item.risk === "high");
    const mediumRisk = projects.filter((item) => item.risk === "medium");
    const safeCount = projects.filter((item) => !item.risk || item.risk === "low").length;
    const averageActual = ongoing.length ? Math.round(ongoing.reduce((sum, item) => sum + item.progress, 0) / ongoing.length) : 0;
    const averagePlan = ongoing.length ? Math.round(ongoing.reduce((sum, item) => sum + (item.plannedProgress ?? item.progress), 0) / ongoing.length) : 0;
    const withHealth = projects.filter((item) => typeof item.healthScore === "number");
    const averageHealth = withHealth.length ? Math.round(withHealth.reduce((sum, item) => sum + (item.healthScore ?? 0), 0) / withHealth.length) : 0;
    const totalEvidence = projects.reduce((sum, item) => sum + (item.photos ?? 0) + (item.videos ?? 0) + (item.documents ?? 0), 0);
    const delayed = ongoing.filter((item) => item.progress < (item.plannedProgress ?? item.progress) - 5);
    const behind = ongoing.filter((item) => item.progress < (item.plannedProgress ?? item.progress));
    const valueTotal = Math.round(projects.reduce((sum, item) => sum + parseValueRange(item.valueRange), 0));
    const completionRate = projects.length ? Math.round((completed.length / projects.length) * 100) : 0;
    return { ongoing, completed, warranty, highRisk, mediumRisk, safeCount, averageActual, averagePlan, averageHealth, totalEvidence, delayed, behind, valueTotal, completionRate };
  }, [projects]);

  const rows = useMemo<DashboardRow[]>(() => {
    return [...projects]
      .sort((a, b) => {
        const aGap = (a.plannedProgress ?? a.progress) - a.progress;
        const bGap = (b.plannedProgress ?? b.progress) - b.progress;
        if (bGap !== aGap) return bGap - aGap;
        return (a.healthScore ?? 100) - (b.healthScore ?? 100);
      })
      .map((project) => {
        const plan = project.plannedProgress ?? project.progress;
        const actual = project.progress;
        const delta = actual - plan;
        const gap = Math.max(0, plan - actual);
        const tone: Tone = project.status === "completed" ? "green" : project.status === "warranty" ? "blue" : delta <= -8 || project.risk === "high" ? "red" : delta < 0 || project.risk === "medium" ? "yellow" : "green";
        const status = project.status === "completed" ? "Tốt" : project.status === "warranty" ? "Bảo hành" : tone === "red" ? "Chậm" : tone === "yellow" ? "Theo dõi" : "Tốt";
        return { project, plan, actual, gap, delta, tone, status };
      });
  }, [projects]);

  const visibleTasks = useMemo(() => {
    if (roleProfile?.audience !== "EMPLOYEE" || !session?.email || previewEmail) return tasks;
    const personal = tasks.filter((item) => item.assigneeEmail?.toLowerCase() === session.email.toLowerCase());
    return personal.length ? personal : tasks.filter((item) => normalize(item.assignee).includes(normalize(session.name)));
  }, [previewEmail, roleProfile?.audience, session, tasks]);

  const taskMetrics = useMemo<TaskMetrics>(() => {
    const now = Date.now();
    const open = visibleTasks.filter((item) => item.status !== "Hoàn thành");
    const done = visibleTasks.filter((item) => item.status === "Hoàn thành");
    const overdue = open.filter((item) => item.due && new Date(`${item.due}T23:59:59`).getTime() < now);
    const dueSoon = open.filter((item) => {
      if (!item.due) return false;
      const diff = new Date(`${item.due}T23:59:59`).getTime() - now;
      return diff >= 0 && diff <= 1000 * 60 * 60 * 72;
    });
    const avgProgress = visibleTasks.length ? Math.round(visibleTasks.reduce((sum, item) => sum + (Number(item.progress) || 0), 0) / visibleTasks.length) : 0;
    return { open, done, overdue, dueSoon, avgProgress };
  }, [visibleTasks]);

  const projectLimit = roleProfile?.audience === "CHAIRMAN" ? 7 : roleProfile?.audience === "EMPLOYEE" ? 5 : 10;
  const tableRows = rows.slice(0, projectLimit);
  const alerts = rows.filter((row) => row.project.status === "ongoing" && (row.gap > 0 || row.project.risk === "high" || (row.project.healthScore ?? 100) < 70)).slice(0, 5);
  const chartRows = rows.filter((row) => row.project.status === "ongoing").slice(0, 7);
  const kpis = buildKpis(roleProfile, metrics, taskMetrics);
  const actionTasks = [...taskMetrics.overdue, ...taskMetrics.dueSoon, ...taskMetrics.open]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, roleProfile?.audience === "EMPLOYEE" ? 10 : 7);

  return (
    <div className="mx-auto w-full max-w-[1900px] space-y-3 bg-[#f2f3f5] text-slate-900">
      <section className="overflow-hidden rounded-[13px] border border-slate-300 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
        <div className="grid gap-3 bg-[linear-gradient(90deg,#0a5a6a_0%,#0a5a6a_42%,#b8b8b8_42%,#b8b8b8_100%)] px-4 py-3 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100">LICOGI 18.3 · Enterprise Growth OS</p>
            <h1 className="mt-1 text-[18px] font-black uppercase tracking-[0.035em] sm:text-[22px]">{roleProfile?.position || "Dashboard điều hành"}</h1>
            <p className="mt-1 max-w-5xl text-[10px] font-semibold leading-4 text-white/80">{roleDescription(roleProfile)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="rounded border border-white/25 bg-black/10 px-3 py-1.5 text-right">
              <p className="text-[12px] font-black">{today || "--/--/----"}</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/75">{session?.name || "LICOGI 18.3"}</p>
            </div>
            <span className="rounded border border-yellow-200/40 bg-yellow-300/20 px-2.5 py-1.5 text-[9px] font-black text-yellow-50">{roleProfile?.unitLabel || "Điều hành"}</span>
          </div>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-[9px] font-bold text-slate-500">Admin xem thử đúng từng tài khoản / vị trí:</span>
            <select value={previewEmail} onChange={(event) => setPreviewEmail(event.target.value)} className="max-w-[420px] rounded border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 outline-none">
              <option value="">Tự động theo tài khoản đang đăng nhập</option>
              {roleAccountProfiles.map((item) => <option key={item.email} value={item.email}>{item.position} · {item.email}</option>)}
            </select>
          </div>
        ) : null}
      </section>

      <OrganizationCommandChart active={roleProfile} />

      <section className="rounded-[12px] border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">Chuỗi điều hành:</span>
          {(roleProfile?.focusChain || ["Mục tiêu", "KR/KPI", "Thực thi", "Đo lường", "Cảnh báo", "Quyết định", "Kết quả"]).map((item, index, array) => (
            <span key={`${item}-${index}`} className="flex items-center gap-1.5">
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-700">{item}</span>
              {index < array.length - 1 ? <ChevronRight size={11} className="text-red-500" /> : null}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => <KpiCard key={item.title} {...item} />)}
      </section>

      <section className="grid gap-2 xl:grid-cols-[1.55fr_0.72fr_0.82fr]">
        <article className={panel}>
          <PanelHeader icon={<Trophy size={14} />} title={boardTitle(roleProfile)} note={`${tableRows.length}/${projects.length} dự án`} />
          <ProjectTable rows={tableRows} />
        </article>

        <article className={panel}>
          <PanelHeader icon={<BellRing size={14} />} title="Cảnh báo điều hành" note={`${alerts.length} nội dung`} />
          <div className="space-y-1.5 p-2.5">
            {alerts.map((row) => (
              <Link key={row.project.id} href={`/projects/${row.project.id}`} className="grid grid-cols-[auto_1fr_auto] gap-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-2 transition hover:border-red-200 hover:bg-red-50/40">
                <span className={`mt-1 h-2 w-2 rounded-full ${toneStyles[row.tone].dot}`} />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[10px] font-black leading-4 text-slate-800">{row.project.name}</p>
                  <p className="mt-0.5 text-[8px] font-semibold text-slate-500">{alertReason(row, roleProfile?.domain)}</p>
                </div>
                <span className="text-[8px] font-black text-red-600">[XEM]</span>
              </Link>
            ))}
            {!alerts.length ? <EmptyBox text="Chưa có cảnh báo ưu tiên theo dữ liệu hiện tại." /> : null}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<BarChart3 size={14} />} title="Kế hoạch / thực hiện" note="Tiến độ dự án" />
          <div className="p-2.5">
            <TrendChart rows={chartRows} />
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <MiniNumber label="Đang chậm" value={metrics.delayed.length} tone={metrics.delayed.length ? "red" : "green"} />
              <MiniNumber label="Rủi ro cao" value={metrics.highRisk.length} tone={metrics.highRisk.length ? "red" : "green"} />
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-2 xl:grid-cols-[1.02fr_1.2fr_0.78fr]">
        <article className={panel}>
          <PanelHeader icon={<ListChecks size={14} />} title={workTitle(roleProfile)} note={tasks.length ? "Dữ liệu công việc" : "Theo dữ liệu dự án"} />
          {tasks.length ? <WorkList tasks={actionTasks} /> : <ProjectWorkSummary rows={rows.slice(0, 6)} roleProfile={roleProfile} />}
        </article>

        <article className={panel}>
          <PanelHeader icon={<Target size={14} />} title="Ưu tiên / chỉ đạo theo vị trí" note={roleProfile?.shortPosition || "Vai trò"} />
          <div className="grid gap-1.5 p-2.5 sm:grid-cols-2">
            {(roleProfile?.priorities || []).map((priority, index) => (
              <div key={priority} className="rounded border border-slate-200 bg-[#f8fafc] p-2.5">
                <div className="flex items-start gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#073069] text-[8px] font-black text-white">{index + 1}</span>
                  <div>
                    <p className="text-[10px] font-black leading-4 text-slate-800">{priority}</p>
                    <p className="mt-0.5 text-[8px] font-semibold leading-4 text-slate-500">{priorityDetail(roleProfile, alerts[index], taskMetrics, metrics)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<UserCog size={14} />} title="Truy cập nhanh" note={roleProfile?.unitLabel || "LICOGI"} />
          <div className="space-y-1.5 p-2.5">
            {(roleProfile?.quickLinks || []).map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-2.5 py-2 transition hover:border-sky-300 hover:bg-sky-50">
                <div>
                  <p className="text-[10px] font-black text-slate-800">{item.label}</p>
                  <p className="text-[8px] font-semibold text-slate-500">{item.note}</p>
                </div>
                <ChevronRight size={13} className="text-sky-700" />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-2 lg:grid-cols-[1fr_1fr_1fr]">
        <ScopeCard icon={<Building2 size={14} />} title="Phạm vi tổ chức" value={roleProfile?.departmentName || "Toàn công ty"} note={`${roleProfile?.levelLabel || "Điều hành"} · ${roleProfile?.roleCode || session?.roleCode || "—"}`} />
        <ScopeCard icon={<BriefcaseBusiness size={14} />} title="Tài khoản đang xem" value={previewEmail || session?.email || "—"} note={previewEmail ? "Chế độ preview của Admin" : "Tài khoản đăng nhập thực tế"} />
        <ScopeCard icon={<MapPinned size={14} />} title="Nguyên tắc dữ liệu" value="1 nguồn dữ liệu · nhiều góc nhìn" note="Mục tiêu → trách nhiệm → KPI → action → risk → decision → outcome" />
      </section>
    </div>
  );
}

function fallbackProfile(session: UserSession | null): RoleAccountProfile | undefined {
  const role = String(session?.roleCode || "").toUpperCase();
  if (role === "SUPER_ADMIN" || role === "SYSTEM_ADMIN") return roleAccountByCode.get("CHAIRMAN");
  if (role === "EXECUTIVE") return roleAccountByCode.get("GENERAL_DIRECTOR");
  if (role === "PROJECT_MANAGER") return roleAccountByCode.get("HEAD_DESIGN_PMO");
  if (role === "ENGINEER" || role === "DATA_STEWARD") return roleAccountByCode.get("STAFF_DESIGN_PMO");
  return roleAccountByCode.get("STAFF_ADMIN");
}

function buildKpis(profile: RoleAccountProfile | undefined, metrics: Metrics, tasks: TaskMetrics): KpiItem[] {
  const domain = profile?.domain || "CORPORATE";
  const progressTone: Tone = metrics.averageActual >= metrics.averagePlan ? "green" : metrics.averagePlan - metrics.averageActual <= 5 ? "yellow" : "red";
  const healthTone: Tone = metrics.averageHealth >= 80 ? "green" : metrics.averageHealth >= 65 ? "yellow" : "red";
  const delayTone: Tone = metrics.delayed.length === 0 ? "green" : metrics.delayed.length <= 2 ? "yellow" : "red";
  const taskTone: Tone = tasks.overdue.length ? "red" : tasks.dueSoon.length ? "yellow" : "green";

  if (domain === "BOARD") return [
    { title: "Giá trị danh mục", value: `${metrics.valueTotal} tỷ`, subtitle: `${metrics.ongoing.length} dự án đang triển khai`, status: "CHIẾN LƯỢC", tone: "blue", icon: <CircleDollarSign size={18} />, href: "/finance" },
    { title: "Sức khỏe danh mục", value: `${metrics.averageHealth}/100`, subtitle: `${metrics.highRisk.length} rủi ro cao · ${metrics.mediumRisk.length} trung bình`, status: healthTone === "green" ? "ỔN ĐỊNH" : "GIÁM SÁT", tone: healthTone, icon: <ShieldCheck size={18} />, href: "/projects" },
    { title: "Dự án chậm trọng điểm", value: String(metrics.delayed.length), subtitle: `Chênh kế hoạch bình quân ${Math.max(0, metrics.averagePlan - metrics.averageActual)}%`, status: delayTone === "green" ? "TỐT" : "CẢNH BÁO", tone: delayTone, icon: <AlertTriangle size={18} />, href: "/reports" },
    { title: "Tỷ lệ hoàn thành", value: `${metrics.completionRate}%`, subtitle: `${metrics.completed.length}/${Math.max(1, metrics.completed.length + metrics.ongoing.length + metrics.warranty.length)} dự án`, status: "OUTCOME", tone: metrics.completionRate >= 50 ? "green" : "yellow", icon: <Trophy size={18} />, href: "/reports" },
  ];

  if (domain === "FINANCE" || domain === "ACCOUNTING") return [
    { title: "Giá trị danh mục", value: `${metrics.valueTotal} tỷ`, subtitle: "Nguồn hiện có từ danh mục dự án", status: "DOANH THU / BACKLOG", tone: "blue", icon: <CircleDollarSign size={18} />, href: "/finance" },
    { title: "Dự án ảnh hưởng dòng tiền", value: String(metrics.behind.length), subtitle: "Proxy từ dự án chậm so với kế hoạch", status: metrics.behind.length ? "THEO DÕI" : "ỔN", tone: delayTone, icon: <TrendingUp size={18} />, href: "/debt" },
    { title: "Dự án đã hoàn thành", value: String(metrics.completed.length), subtitle: "Cơ sở rà soát nghiệm thu / thanh toán", status: "THANH QUYẾT TOÁN", tone: "green", icon: <CheckCircle2 size={18} />, href: "/payments" },
    { title: "Việc tài chính đến hạn", value: String(tasks.dueSoon.length + tasks.overdue.length), subtitle: `${tasks.overdue.length} việc quá hạn`, status: tasks.overdue.length ? "XỬ LÝ NGAY" : "THEO DÕI", tone: taskTone, icon: <Clock3 size={18} />, href: "/tasks" },
  ];

  if (domain === "BUSINESS_PRODUCTION_DESIGN") return [
    { title: "Giá trị danh mục", value: `${metrics.valueTotal} tỷ`, subtitle: "Danh mục hợp đồng/dự án đang có", status: "PIPELINE → BACKLOG", tone: "blue", icon: <BriefcaseBusiness size={18} />, href: "/crm" },
    { title: "Dự án đang triển khai", value: String(metrics.ongoing.length), subtitle: `${metrics.completed.length} dự án đã hoàn thành`, status: "CUNG ỨNG", tone: "blue", icon: <Building2 size={18} />, href: "/projects" },
    { title: "Tiến độ bình quân", value: `${metrics.averageActual}%`, subtitle: `Kế hoạch ${metrics.averagePlan}%`, status: progressTone === "red" ? "CẦN BÙ" : "ĐANG BÁM", tone: progressTone, icon: <TrendingUp size={18} />, href: "/planning" },
    { title: "Dự án cần phối hợp", value: String(metrics.behind.length), subtitle: "Có nguy cơ ảnh hưởng sản xuất/cung ứng", status: delayTone === "green" ? "ỔN" : "ĐIỀU PHỐI", tone: delayTone, icon: <UsersRound size={18} />, href: "/tasks" },
  ];

  if (domain === "CONSTRUCTION") return [
    { title: "Tiến độ thi công", value: `${metrics.averageActual}%`, subtitle: `Kế hoạch bình quân ${metrics.averagePlan}%`, status: progressTone === "red" ? "CHẬM" : "ĐANG BÁM", tone: progressTone, icon: <HardHat size={18} />, href: "/construction" },
    { title: "Dự án chậm >5%", value: String(metrics.delayed.length), subtitle: `${metrics.behind.length} dự án dưới kế hoạch`, status: delayTone === "green" ? "ỔN" : "BÙ TIẾN ĐỘ", tone: delayTone, icon: <AlertTriangle size={18} />, href: "/planning" },
    { title: "Rủi ro cao", value: String(metrics.highRisk.length), subtitle: `${metrics.safeCount} dự án mức an toàn`, status: metrics.highRisk.length ? "XỬ LÝ" : "TỐT", tone: metrics.highRisk.length ? "red" : "green", icon: <ShieldCheck size={18} />, href: "/projects" },
    { title: "Minh chứng hiện trường", value: String(metrics.totalEvidence), subtitle: "Ảnh, video và hồ sơ dự án", status: "KIỂM SOÁT", tone: "blue", icon: <FileCheck2 size={18} />, href: "/documents" },
  ];

  if (domain === "WARRANTY") return [
    { title: "Công trình bảo hành", value: String(metrics.warranty.length), subtitle: `${metrics.completed.length} công trình hoàn thành`, status: "SAU BÀN GIAO", tone: "blue", icon: <ShieldCheck size={18} />, href: "/warranty" },
    { title: "Việc đang mở", value: String(tasks.open.length), subtitle: `${tasks.overdue.length} việc quá hạn`, status: tasks.overdue.length ? "QUÁ SLA" : "ĐANG XỬ LÝ", tone: taskTone, icon: <ListChecks size={18} />, href: "/tasks" },
    { title: "Hồ sơ / minh chứng", value: String(metrics.totalEvidence), subtitle: "Nguồn cho phân tích lỗi và chất lượng", status: "QUALITY", tone: "blue", icon: <FileCheck2 size={18} />, href: "/documents" },
    { title: "Project Health", value: `${metrics.averageHealth}/100`, subtitle: `${metrics.highRisk.length} dự án rủi ro cao`, status: healthTone === "green" ? "TỐT" : "THEO DÕI", tone: healthTone, icon: <Trophy size={18} />, href: "/projects" },
  ];

  if (domain === "SAFETY" || domain === "CONTROL") return [
    { title: "Rủi ro cao", value: String(metrics.highRisk.length), subtitle: `${metrics.safeCount} dự án mức thấp/an toàn`, status: metrics.highRisk.length ? "CẢNH BÁO" : "TỐT", tone: metrics.highRisk.length ? "red" : "green", icon: <ShieldCheck size={18} />, href: "/projects" },
    { title: "Dự án chậm", value: String(metrics.delayed.length), subtitle: "Điểm có khả năng phát sinh áp lực vận hành", status: delayTone === "green" ? "ỔN" : "KIỂM TRA", tone: delayTone, icon: <AlertTriangle size={18} />, href: "/construction" },
    { title: "Minh chứng", value: String(metrics.totalEvidence), subtitle: "Ảnh, video, tài liệu cho kiểm tra", status: "EVIDENCE", tone: "blue", icon: <FileCheck2 size={18} />, href: "/documents" },
    { title: "Hành động cần theo dõi", value: String(tasks.open.length), subtitle: `${tasks.overdue.length} quá hạn`, status: tasks.overdue.length ? "KHẮC PHỤC" : "THEO DÕI", tone: taskTone, icon: <ClipboardCheck size={18} />, href: "/tasks" },
  ];

  return [
    { title: profile?.audience === "EMPLOYEE" ? "Việc của tôi" : "Công việc đang mở", value: String(tasks.open.length), subtitle: `${tasks.done.length} việc đã hoàn thành`, status: taskTone === "red" ? "CÓ QUÁ HẠN" : "ĐANG KIỂM SOÁT", tone: taskTone, icon: <ListChecks size={18} />, href: "/tasks" },
    { title: "Đến hạn 72 giờ", value: String(tasks.dueSoon.length), subtitle: `${tasks.overdue.length} việc quá hạn`, status: tasks.overdue.length ? "LÀM NGAY" : "THEO DÕI", tone: taskTone, icon: <Clock3 size={18} />, href: "/tasks" },
    { title: "Dự án cần chú ý", value: String(metrics.behind.length), subtitle: `Tiến độ bình quân ${metrics.averageActual}%`, status: delayTone === "green" ? "ỔN" : "PHỐI HỢP", tone: delayTone, icon: <Building2 size={18} />, href: "/projects" },
    { title: "Tiến độ đầu việc", value: `${tasks.avgProgress}%`, subtitle: "Bình quân đầu việc trong phạm vi hiện tại", status: tasks.avgProgress >= 70 ? "TỐT" : "BÁM SÁT", tone: tasks.avgProgress >= 70 ? "green" : "yellow", icon: <Target size={18} />, href: "/tasks" },
  ];
}

function roleDescription(profile?: RoleAccountProfile) {
  if (!profile) return "Dashboard được sinh theo phạm vi trách nhiệm và dữ liệu thực tế của tài khoản.";
  if (profile.domain === "BOARD") return "Góc nhìn chiến lược: tăng trưởng, kết quả cuối cùng, rủi ro lớn và vấn đề cần HĐQT quyết nghị; không sa vào hàng trăm KPI tác nghiệp.";
  if (profile.domain === "CORPORATE") return "Góc nhìn điều hành toàn công ty, cho phép đi từ chỉ số tổng hợp xuống khối, phòng, dự án, nguyên nhân, người chịu trách nhiệm và phương án xử lý.";
  if (profile.audience === "DEPUTY_GENERAL_DIRECTOR") return `Góc nhìn riêng cho ${profile.position}: tập trung đúng chuỗi nghiệp vụ của ${profile.departmentName}, cảnh báo và điều phối trong phạm vi phụ trách.`;
  if (profile.audience === "DEPARTMENT_HEAD") return `Department Cockpit của ${profile.departmentName}: KR/KPI, kế hoạch, tiến độ, vấn đề, người phụ trách và việc cần xử lý.`;
  if (profile.audience === "DEPUTY_DEPARTMENT_HEAD") return `Cockpit điều phối hằng ngày của ${profile.departmentName}: nhắc hạn, kiểm tra đầu ra, tổng hợp vướng mắc và hỗ trợ Trưởng đơn vị.`;
  return `Không gian tác nghiệp cá nhân của ${profile.departmentName}: việc được giao, hạn hoàn thành, minh chứng và vấn đề cần báo cấp trên.`;
}

function boardTitle(profile?: RoleAccountProfile) {
  if (!profile) return "Bảng điều hành";
  if (profile.domain === "BOARD") return "Danh mục chiến lược toàn công ty";
  if (profile.domain === "CORPORATE") return "Bảng điều hành toàn công ty";
  if (profile.audience === "DEPUTY_GENERAL_DIRECTOR") return `Danh mục thuộc ${profile.shortPosition}`;
  if (profile.audience === "EMPLOYEE") return "Dự án / hạng mục liên quan";
  return `Dự án & đầu việc · ${profile.unitLabel}`;
}

function workTitle(profile?: RoleAccountProfile) {
  if (profile?.audience === "EMPLOYEE") return "Công việc của tôi";
  if (profile?.audience === "DEPARTMENT_HEAD") return "Công việc / giao việc của đơn vị";
  if (profile?.audience === "DEPUTY_DEPARTMENT_HEAD") return "Việc cần đôn đốc hằng ngày";
  return "Tình hình thực thi";
}

function ProjectTable({ rows }: { rows: DashboardRow[] }) {
  return (
    <div className="max-h-[405px] overflow-auto">
      <table className="w-full min-w-[760px] text-left text-[9px]">
        <thead className="sticky top-0 z-10 border-b border-slate-300 bg-slate-100 text-[8px] font-black uppercase tracking-[0.05em] text-slate-500">
          <tr><th className="px-2.5 py-2">STT</th><th className="px-2.5 py-2">Đơn vị / Dự án</th><th className="px-2.5 py-2 text-center">KH</th><th className="px-2.5 py-2 text-center">Thực tế</th><th className="px-2.5 py-2 text-center">Trạng thái</th><th className="px-2.5 py-2 text-right">Chênh</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, index) => (
            <tr key={row.project.id} className="hover:bg-slate-50">
              <td className="px-2.5 py-2 font-black text-slate-400">{index + 1}</td>
              <td className="px-2.5 py-2">
                <div className="flex items-start gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${toneStyles[row.tone].dot}`} /><div className="min-w-0"><Link href={`/projects/${row.project.id}`} className="block max-w-[360px] truncate text-[10px] font-black text-slate-800 hover:text-sky-700">{row.project.name}</Link><p className="mt-0.5 max-w-[360px] truncate text-[8px] font-semibold text-slate-400">{row.project.code || "Chưa có mã"} · {row.project.type} · {row.project.province}</p></div></div>
              </td>
              <td className="px-2.5 py-2 text-center font-black text-slate-600">{row.plan}%</td>
              <td className="px-2.5 py-2 text-center font-black text-slate-900">{row.actual}%</td>
              <td className="px-2.5 py-2 text-center"><StatusPill tone={row.tone}>{row.status}</StatusPill></td>
              <td className={`px-2.5 py-2 text-right font-black ${row.delta < 0 ? "text-red-600" : row.delta > 0 ? "text-emerald-600" : "text-slate-400"}`}>{row.delta > 0 ? "+" : ""}{row.delta}%</td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan={6} className="px-4 py-10 text-center text-[10px] font-semibold text-slate-400">Chưa có dữ liệu dự án phù hợp.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function WorkList({ tasks }: { tasks: WorkItem[] }) {
  return <div className="max-h-[360px] space-y-1.5 overflow-auto p-2.5">{tasks.map((item) => { const tone = taskTone(item); return <Link key={item.id} href="/tasks" className="grid gap-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-2 hover:border-sky-300 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-[10px] font-black text-slate-800">{item.title}</p><p className="mt-0.5 truncate text-[8px] font-semibold text-slate-500">{item.project} · {item.assignee}</p></div><div className="flex items-center gap-2"><span className="text-[8px] font-bold text-slate-400">{item.due ? `Hạn ${formatDate(item.due)}` : "Chưa có hạn"}</span><StatusPill tone={tone}>{item.progress}%</StatusPill></div></Link>; })}{!tasks.length ? <EmptyBox text="Chưa có công việc ưu tiên trong phạm vi hiện tại." /> : null}</div>;
}

function ProjectWorkSummary({ rows, roleProfile }: { rows: DashboardRow[]; roleProfile?: RoleAccountProfile }) {
  return <div className="space-y-1.5 p-2.5">{rows.map((row) => <div key={row.project.id} className="rounded border border-slate-200 bg-slate-50 p-2.5"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-[10px] font-black text-slate-800">{row.project.name}</p><p className="mt-0.5 text-[8px] font-semibold text-slate-500">{roleProfile?.domain === "BOARD" ? `Health ${row.project.healthScore ?? 0}/100 · ${row.project.valueRange}` : `Thực tế ${row.actual}% / kế hoạch ${row.plan}%`}</p></div><StatusPill tone={row.tone}>{row.status}</StatusPill></div></div>)}{!rows.length ? <EmptyBox text="Chưa có dữ liệu thực thi." /> : null}</div>;
}

function KpiCard(item: KpiItem) {
  const style = toneStyles[item.tone];
  return <Link href={item.href} className={`group rounded-[10px] border border-slate-300 border-t-[4px] ${style.top} bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}><div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-black uppercase tracking-[0.055em] text-slate-500">{item.title}</p><p className={`mt-1 text-[25px] font-black leading-none ${style.text}`}>{item.value}</p></div><span className={`grid h-8 w-8 place-items-center rounded border ${style.badge}`}>{item.icon}</span></div><div className="mt-2 flex items-end justify-between gap-2"><p className="text-[8px] font-semibold leading-3.5 text-slate-400">{item.subtitle}</p><span className={`shrink-0 rounded border px-1.5 py-0.5 text-[7px] font-black ${style.badge}`}>{item.status}</span></div></Link>;
}

function PanelHeader({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return <div className="flex min-h-9 items-center justify-between gap-3 border-b border-slate-300 bg-[#f3f4f6] px-2.5 py-2"><div className="flex items-center gap-1.5"><span className="text-[#ba1821]">{icon}</span><h2 className="text-[9px] font-black uppercase tracking-[0.055em] text-slate-700">{title}</h2></div><span className="text-[8px] font-bold text-slate-400">{note}</span></div>;
}

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) { return <span className={`inline-flex rounded border px-1.5 py-0.5 text-[7px] font-black ${toneStyles[tone].badge}`}>{children}</span>; }
function MiniNumber({ label, value, tone }: { label: string; value: number; tone: Tone }) { return <div className={`rounded border border-slate-200 ${toneStyles[tone].soft} p-2 text-center`}><p className={`text-[18px] font-black ${toneStyles[tone].text}`}>{String(value).padStart(2, "0")}</p><p className="text-[7px] font-black uppercase text-slate-400">{label}</p></div>; }
function EmptyBox({ text }: { text: string }) { return <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-[9px] font-semibold text-slate-400">{text}</div>; }

function ScopeCard({ icon, title, value, note }: { icon: ReactNode; title: string; value: string; note: string }) {
  return <div className="rounded-[10px] border border-slate-300 bg-white p-2.5 shadow-sm"><div className="flex items-start gap-2"><span className="mt-0.5 text-[#0a5a6a]">{icon}</span><div className="min-w-0"><p className="text-[8px] font-black uppercase tracking-[0.06em] text-slate-400">{title}</p><p className="mt-1 truncate text-[10px] font-black text-slate-800">{value}</p><p className="mt-0.5 text-[8px] font-semibold leading-3.5 text-slate-500">{note}</p></div></div></div>;
}

function TrendChart({ rows }: { rows: DashboardRow[] }) {
  if (!rows.length) return <EmptyBox text="Chưa có dữ liệu để vẽ diễn biến." />;
  const width = 360; const height = 150; const left = 30; const right = 10; const top = 10; const bottom = 28; const plotWidth = width - left - right; const plotHeight = height - top - bottom;
  const x = (index: number) => left + (rows.length === 1 ? plotWidth / 2 : (index * plotWidth) / (rows.length - 1));
  const y = (value: number) => top + ((100 - Math.max(0, Math.min(100, value))) / 100) * plotHeight;
  const actual = rows.map((item, index) => `${x(index)},${y(item.actual)}`).join(" ");
  const plan = rows.map((item, index) => `${x(index)},${y(item.plan)}`).join(" ");
  return <svg viewBox={`0 0 ${width} ${height}`} className="h-[150px] w-full" role="img" aria-label="Biểu đồ kế hoạch và thực hiện">{[0,25,50,75,100].map((tick) => <g key={tick}><line x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeWidth="1" /><text x={left-5} y={y(tick)+3} textAnchor="end" fontSize="7" fill="#94a3b8">{tick}%</text></g>)}<polyline points={plan} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" /><polyline points={actual} fill="none" stroke="#dc2626" strokeWidth="2.5" />{rows.map((item,index) => <g key={item.project.id}><circle cx={x(index)} cy={y(item.actual)} r="2.7" fill="#dc2626" /><text x={x(index)} y={height-8} textAnchor="middle" fontSize="6.5" fill="#64748b">{(item.project.code || `DA${index+1}`).slice(0,6)}</text></g>)}</svg>;
}

function taskTone(item: WorkItem): Tone {
  if (item.status === "Hoàn thành") return "green";
  if (item.due && new Date(`${item.due}T23:59:59`).getTime() < Date.now()) return "red";
  if (normalize(item.priority).includes("cao")) return "red";
  if (item.due) { const diff = new Date(`${item.due}T23:59:59`).getTime() - Date.now(); if (diff >= 0 && diff <= 1000*60*60*72) return "yellow"; }
  return "blue";
}

function alertReason(row: DashboardRow, domain?: RoleDomain) {
  if (domain === "FINANCE" || domain === "ACCOUNTING") return row.gap ? `Chậm ${row.gap}% - cần đánh giá tác động nghiệm thu/dòng tiền` : `Health ${row.project.healthScore ?? 0}/100`;
  if (domain === "SAFETY" || domain === "CONTROL") return row.project.risk === "high" ? "Rủi ro cao cần kiểm tra và đóng hành động" : `Chênh tiến độ ${row.gap}% - theo dõi áp lực vận hành`;
  if (domain === "BUSINESS_PRODUCTION_DESIGN") return row.gap ? `Chậm ${row.gap}% - có thể ảnh hưởng thiết kế/cung ứng` : "Cần theo dõi năng lực cung ứng";
  if (domain === "WARRANTY") return `Health ${row.project.healthScore ?? 0}/100 - rà soát chất lượng và hồ sơ sau bàn giao`;
  return row.gap ? `Chậm ${row.gap}% - cần phương án bù tiến độ` : `Health ${row.project.healthScore ?? 0}/100 - cần theo dõi`;
}

function priorityDetail(profile: RoleAccountProfile | undefined, row: DashboardRow | undefined, tasks: TaskMetrics, metrics: Metrics) {
  if (profile?.audience === "EMPLOYEE") return `${tasks.open.length} việc đang mở · ${tasks.overdue.length} việc quá hạn · cập nhật minh chứng khi hoàn thành.`;
  if (profile?.audience === "DEPARTMENT_HEAD" || profile?.audience === "DEPUTY_DEPARTMENT_HEAD") return `${tasks.open.length} việc mở · ${tasks.dueSoon.length} đến hạn 72 giờ · ${metrics.behind.length} dự án dưới kế hoạch.`;
  if (row) return `${row.project.name}: thực tế ${row.actual}% / kế hoạch ${row.plan}%${row.gap ? ` · cần bù ${row.gap}%` : ""}.`;
  return `Theo dõi ${metrics.ongoing.length} dự án đang triển khai và ${metrics.highRisk.length} rủi ro cao.`;
}

function parseValueRange(range?: string | null) { if (!range) return 0; const lower = range.toLowerCase(); if (lower.includes("trên") || lower.includes("hơn") || lower.includes("hon")) return 500; const numbers = lower.match(/\d+/g)?.map(Number) ?? []; return numbers[numbers.length-1] || 0; }
function normalize(value?: string | null) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }
function formatDate(value: string) { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date); }
