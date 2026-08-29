"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Factory,
  FileCheck2,
  FolderKanban,
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
import type { Project, ProjectType } from "../../data/projects";
import { readSession, type UserSession } from "../../lib/authSession";
import {
  dashboardAudienceOptions,
  dashboardProfiles,
  resolveDashboardAudience,
  type DashboardAudience,
} from "../../lib/dashboardProfile";
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

const panel =
  "rounded-[18px] border border-[#17314a] bg-[linear-gradient(180deg,rgba(9,28,48,0.98)_0%,rgba(7,22,39,0.98)_100%)] shadow-[0_16px_46px_rgba(0,0,0,0.26)]";

const toneStyles: Record<Tone, { text: string; badge: string; dot: string; soft: string }> = {
  green: {
    text: "text-emerald-300",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    dot: "bg-emerald-400",
    soft: "bg-emerald-400/10",
  },
  yellow: {
    text: "text-amber-300",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    dot: "bg-amber-400",
    soft: "bg-amber-400/10",
  },
  red: {
    text: "text-red-300",
    badge: "border-red-400/30 bg-red-400/10 text-red-200",
    dot: "bg-red-400",
    soft: "bg-red-400/10",
  },
  blue: {
    text: "text-sky-300",
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    dot: "bg-sky-400",
    soft: "bg-sky-400/10",
  },
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [today, setToday] = useState("");
  const [previewAudience, setPreviewAudience] = useState<DashboardAudience | "">("");

  useEffect(() => {
    const syncAuth = () => setSession(readSession());
    const syncProjects = () => fetchProjectsFromDataCenter().then(setProjects).catch(() => setProjects([]));
    syncAuth();
    syncProjects();
    setToday(
      new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    );
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

  const resolvedAudience = resolveDashboardAudience(session);
  const audience = previewAudience || resolvedAudience;
  const profile = dashboardProfiles[audience];
  const isAdmin = session?.roleCode === "SUPER_ADMIN" || session?.roleCode === "SYSTEM_ADMIN";

  const metrics = useMemo(() => {
    const ongoing = projects.filter((item) => item.status === "ongoing");
    const completed = projects.filter((item) => item.status === "completed");
    const warranty = projects.filter((item) => item.status === "warranty");
    const highRisk = projects.filter((item) => item.risk === "high");
    const mediumRisk = projects.filter((item) => item.risk === "medium");
    const safeCount = projects.filter((item) => !item.risk || item.risk === "low").length;
    const averageActual = ongoing.length
      ? Math.round(ongoing.reduce((sum, item) => sum + item.progress, 0) / ongoing.length)
      : 0;
    const averagePlan = ongoing.length
      ? Math.round(
          ongoing.reduce((sum, item) => sum + (item.plannedProgress ?? item.progress), 0) /
            ongoing.length,
        )
      : 0;
    const healthProjects = projects.filter((item) => typeof item.healthScore === "number");
    const averageHealth = healthProjects.length
      ? Math.round(
          healthProjects.reduce((sum, item) => sum + (item.healthScore ?? 0), 0) /
            healthProjects.length,
        )
      : 0;
    const totalEvidence = projects.reduce(
      (sum, item) => sum + (item.photos ?? 0) + (item.videos ?? 0) + (item.documents ?? 0),
      0,
    );
    const delayed = ongoing.filter(
      (item) => item.progress < (item.plannedProgress ?? item.progress) - 5,
    );
    const behind = ongoing.filter(
      (item) => item.progress < (item.plannedProgress ?? item.progress),
    );
    const valueTotal = Math.round(
      projects.reduce((sum, item) => sum + parseValueRange(item.valueRange), 0),
    );
    const completionRate = projects.length ? Math.round((completed.length / projects.length) * 100) : 0;
    return {
      ongoing,
      completed,
      warranty,
      highRisk,
      mediumRisk,
      safeCount,
      averageActual,
      averagePlan,
      averageHealth,
      totalEvidence,
      delayed,
      behind,
      valueTotal,
      completionRate,
    };
  }, [projects]);

  const rows = useMemo<DashboardRow[]>(() => {
    return [...projects]
      .sort((a, b) => {
        const ag = (a.plannedProgress ?? a.progress) - a.progress;
        const bg = (b.plannedProgress ?? b.progress) - b.progress;
        if (bg !== ag) return bg - ag;
        return (a.healthScore ?? 100) - (b.healthScore ?? 100);
      })
      .map((project) => {
        const plan = project.plannedProgress ?? project.progress;
        const actual = project.progress;
        const delta = actual - plan;
        const gap = Math.max(0, plan - actual);
        const tone: Tone =
          project.status === "completed"
            ? "green"
            : project.status === "warranty"
              ? "blue"
              : delta <= -8 || project.risk === "high"
                ? "red"
                : delta < 0 || project.risk === "medium"
                  ? "yellow"
                  : "green";
        const status =
          project.status === "completed"
            ? "Tốt"
            : project.status === "warranty"
              ? "Bảo hành"
              : tone === "red"
                ? "Chậm"
                : tone === "yellow"
                  ? "Theo dõi"
                  : "Tốt";
        return { project, plan, actual, gap, delta, tone, status };
      });
  }, [projects]);

  const visibleTasks = useMemo(() => {
    if (audience !== "EMPLOYEE" || !session?.email) return tasks;
    const email = session.email.toLocaleLowerCase("vi");
    const personal = tasks.filter((item) => item.assigneeEmail?.toLocaleLowerCase("vi") === email);
    return personal.length ? personal : tasks.filter((item) => normalize(item.assignee).includes(normalize(session.name)));
  }, [audience, session, tasks]);

  const taskMetrics = useMemo(() => {
    const now = new Date();
    const open = visibleTasks.filter((item) => item.status !== "Hoàn thành");
    const done = visibleTasks.filter((item) => item.status === "Hoàn thành");
    const overdue = open.filter((item) => item.due && new Date(`${item.due}T23:59:59`).getTime() < now.getTime());
    const dueSoon = open.filter((item) => {
      if (!item.due) return false;
      const diff = new Date(`${item.due}T23:59:59`).getTime() - now.getTime();
      return diff >= 0 && diff <= 1000 * 60 * 60 * 72;
    });
    const avgProgress = visibleTasks.length
      ? Math.round(visibleTasks.reduce((sum, item) => sum + (Number(item.progress) || 0), 0) / visibleTasks.length)
      : 0;
    return { open, done, overdue, dueSoon, avgProgress };
  }, [visibleTasks]);

  const tableRows = rows.slice(0, profile.maxProjectRows);
  const alerts = rows
    .filter((row) => row.project.status === "ongoing" && (row.gap > 0 || row.project.risk === "high" || (row.project.healthScore ?? 100) < 70))
    .slice(0, audience === "EMPLOYEE" ? 3 : 5);
  const chartRows = rows.filter((row) => row.project.status === "ongoing").slice(0, 6);
  const typeStats = topCounts(projects.map((item) => item.type));
  const provinceStats = topCounts(projects.map((item) => item.province));
  const kpis = buildKpis(audience, metrics, taskMetrics);
  const actionTasks = [...taskMetrics.overdue, ...taskMetrics.dueSoon, ...taskMetrics.open]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, profile.maxTaskRows);

  return (
    <div className="space-y-3 rounded-[24px] border border-[#10263b] bg-[#051523] p-3 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-4 lg:p-5">
      <section className="rounded-[20px] border border-[#17304a] bg-[radial-gradient(circle_at_top,rgba(17,42,70,0.9),rgba(5,21,35,0.98)_60%)] px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-13 w-13 place-items-center rounded-full border border-orange-300/30 bg-orange-400/10 p-3 shadow-[0_0_26px_rgba(251,146,60,0.2)]">
              <Factory size={25} className="text-orange-300" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">LICOGI 18.3</p>
              <p className="mt-1 text-xs font-bold text-slate-300">{profile.eyebrow}</p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-black uppercase tracking-[0.055em] text-[#f2d28b] sm:text-2xl xl:text-[30px]">{profile.title}</h1>
            <p className="mx-auto mt-1 max-w-4xl text-[11px] font-semibold leading-5 text-slate-400">{profile.description}</p>
          </div>

          <div className="space-y-2 text-left lg:text-right">
            <div>
              <p className="text-base font-black text-white">{today || "--/--/----"}</p>
              <p className="text-[10px] font-bold text-slate-500">{session?.name || "Người dùng LICOGI 18.3"}</p>
            </div>
            <span className="inline-flex rounded-md border border-[#f2d28b]/20 bg-[#f2d28b]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#f2d28b]">{profile.label}</span>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-white/5 pt-3">
            <span className="text-[10px] font-bold text-slate-500">Admin xem thử dashboard theo vị trí:</span>
            <select
              value={previewAudience}
              onChange={(event) => setPreviewAudience(event.target.value as DashboardAudience | "")}
              className="rounded-lg border border-[#24415b] bg-[#081b2d] px-2.5 py-1.5 text-[10px] font-bold text-slate-200 outline-none"
            >
              <option value="">Tự động theo tài khoản</option>
              {dashboardAudienceOptions.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => <KpiCard key={item.title} {...item} />)}
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.5fr_0.78fr_0.92fr]">
        <article className={panel}>
          <PanelHeader icon={<Trophy size={16} />} title={profile.boardTitle} note={`${tableRows.length}/${projects.length} dự án`} />
          <ProjectTable rows={tableRows} audience={audience} />
        </article>

        <article className={panel}>
          <PanelHeader icon={<BellRing size={16} />} title={profile.alertTitle} note={`${alerts.length} cảnh báo`} />
          <div className="space-y-2 p-3">
            {alerts.map((row) => (
              <Link key={row.project.id} href={`/projects/${row.project.id}`} className="grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-2.5 transition hover:border-orange-400/30 hover:bg-[#0b2136]">
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${toneStyles[row.tone].dot}`} />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[11px] font-black leading-5 text-slate-100">{row.project.name}</p>
                  <p className="text-[9px] font-semibold text-slate-500">{alertReason(row, audience)}</p>
                </div>
                <span className="text-[9px] font-black text-[#f6ce73]">[XEM]</span>
              </Link>
            ))}
            {!alerts.length && <EmptyBox text="Chưa có cảnh báo ưu tiên theo phạm vi dashboard này." />}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<BarChart3 size={16} />} title="Diễn biến kế hoạch / thực hiện" note="Dữ liệu dự án" />
          <div className="p-3">
            <TrendChart rows={chartRows} />
            <div className="mt-1 flex items-center justify-center gap-4 text-[9px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t border-dashed border-slate-300" /> Kế hoạch</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-orange-400" /> Thực hiện</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniNumber label="Đang chậm" value={metrics.delayed.length} tone={metrics.delayed.length ? "red" : "green"} />
              <MiniNumber label="Rủi ro cao" value={metrics.highRisk.length} tone={metrics.highRisk.length ? "red" : "green"} />
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.1fr_1.15fr_0.75fr]">
        <article className={panel}>
          <PanelHeader icon={<ListChecks size={16} />} title={profile.workTitle} note={tasks.length ? "Dữ liệu công việc" : "Theo dữ liệu hiện có"} />
          {tasks.length ? (
            <WorkList tasks={actionTasks} audience={audience} />
          ) : (
            <ProjectWorkSummary audience={audience} rows={rows.slice(0, 5)} metrics={metrics} />
          )}
        </article>

        <article className={panel}>
          <PanelHeader icon={<Target size={16} />} title={profile.directiveTitle} note="Ưu tiên theo vai trò" />
          <div className="grid gap-2 p-3 lg:grid-cols-2">
            {profile.priorities.map((priority, index) => {
              const row = alerts[index % Math.max(alerts.length, 1)];
              const tone: Tone = row?.tone || (index === 0 ? "blue" : "yellow");
              return (
                <div key={priority} className={`rounded-xl border border-white/5 ${toneStyles[tone].soft} p-3`}>
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-black text-[#f2d28b]">{index + 1}</span>
                    <div>
                      <p className="text-[11px] font-black leading-5 text-slate-100">{priority}</p>
                      <p className="mt-1 text-[9px] font-semibold leading-4 text-slate-500">{directiveDetail(audience, row, taskMetrics, index)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<UserCog size={16} />} title="Truy cập nhanh" note={profile.shortLabel} />
          <div className="space-y-2 p-3">
            {profile.quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between gap-3 rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-2.5 transition hover:border-orange-400/30 hover:bg-[#0c2236]">
                <div>
                  <p className="text-[11px] font-black text-slate-100">{item.label}</p>
                  <p className="mt-0.5 text-[9px] font-semibold text-slate-500">{item.note}</p>
                </div>
                <ChevronRight size={14} className="text-orange-300" />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className={panel}>
          <PanelHeader icon={<FolderKanban size={16} />} title="Cơ cấu danh mục" note="Theo loại công trình" />
          <div className="grid gap-2 p-3 sm:grid-cols-4">
            {typeStats.map((item) => <StatTile key={item.label} label={item.label} value={item.count} />)}
            {!typeStats.length && <EmptyBox text="Chưa có dữ liệu cơ cấu dự án." />}
          </div>
        </article>
        <article className={panel}>
          <PanelHeader icon={<MapPinned size={16} />} title="Địa bàn trọng điểm" note="Theo số lượng dự án" />
          <div className="grid gap-2 p-3 sm:grid-cols-4">
            {provinceStats.map((item) => <StatTile key={item.label} label={item.label} value={item.count} />)}
            {!provinceStats.length && <EmptyBox text="Chưa có dữ liệu địa bàn." />}
          </div>
        </article>
      </section>
    </div>
  );
}

function buildKpis(
  audience: DashboardAudience,
  metrics: ReturnType<typeof dashboardMetricShape>,
  taskMetrics: ReturnType<typeof taskMetricShape>,
): KpiItem[] {
  const progressTone: Tone = metrics.averageActual >= metrics.averagePlan ? "green" : metrics.averagePlan - metrics.averageActual <= 5 ? "yellow" : "red";
  const healthTone: Tone = metrics.averageHealth >= 80 ? "green" : metrics.averageHealth >= 65 ? "yellow" : "red";
  const delayTone: Tone = metrics.delayed.length === 0 ? "green" : metrics.delayed.length <= 2 ? "yellow" : "red";
  const taskToneValue: Tone = taskMetrics.overdue.length ? "red" : taskMetrics.dueSoon.length ? "yellow" : "green";

  if (audience === "CHAIRMAN") {
    return [
      { title: "Giá trị danh mục", value: `${metrics.valueTotal} tỷ`, subtitle: `${metrics.ongoing.length} dự án đang triển khai`, status: "TOÀN CÔNG TY", tone: "blue", icon: <CircleDollarSign size={20} />, href: "/finance" },
      { title: "Sức khỏe danh mục", value: `${metrics.averageHealth}/100`, subtitle: `${metrics.highRisk.length} rủi ro cao · ${metrics.mediumRisk.length} trung bình`, status: healthTone === "green" ? "ỔN ĐỊNH" : "CẦN GIÁM SÁT", tone: healthTone, icon: <ShieldCheck size={20} />, href: "/projects" },
      { title: "Dự án chậm trọng điểm", value: String(metrics.delayed.length), subtitle: `Chênh kế hoạch bình quân ${Math.max(0, metrics.averagePlan - metrics.averageActual)}%`, status: delayTone === "green" ? "TỐT" : "CẢNH BÁO", tone: delayTone, icon: <AlertTriangle size={20} />, href: "/reports" },
      { title: "Tỷ lệ hoàn thành", value: `${metrics.completionRate}%`, subtitle: `${metrics.completed.length}/${metrics.completed.length + metrics.ongoing.length + metrics.warranty.length} dự án`, status: "KẾT QUẢ", tone: metrics.completionRate >= 50 ? "green" : "yellow", icon: <Trophy size={20} />, href: "/reports" },
    ];
  }

  if (audience === "GENERAL_DIRECTOR") {
    return [
      { title: "Tiến độ toàn công ty", value: `${metrics.averageActual}%`, subtitle: `Kế hoạch ${metrics.averagePlan}% · Cần bù ${Math.max(0, metrics.averagePlan - metrics.averageActual)}%`, status: progressTone === "green" ? "TỐT" : progressTone === "yellow" ? "THEO DÕI" : "CHẬM", tone: progressTone, icon: <TrendingUp size={20} />, href: "/projects" },
      { title: "Đang thi công", value: `${metrics.ongoing.length} DA`, subtitle: `${metrics.completed.length} hoàn thành · ${metrics.warranty.length} bảo hành`, status: "ĐANG ĐIỀU HÀNH", tone: "blue", icon: <HardHat size={20} />, href: "/construction" },
      { title: "Điểm nghẽn cần xử lý", value: String(metrics.behind.length), subtitle: `${metrics.delayed.length} dự án chậm >5%`, status: delayTone === "green" ? "ỔN ĐỊNH" : "ƯU TIÊN", tone: delayTone, icon: <BellRing size={20} />, href: "/tasks" },
      { title: "Project Health", value: `${metrics.averageHealth}/100`, subtitle: `${metrics.highRisk.length} dự án rủi ro cao`, status: healthTone === "green" ? "TỐT" : "CẦN XỬ LÝ", tone: healthTone, icon: <ShieldCheck size={20} />, href: "/projects" },
    ];
  }

  if (audience === "DEPUTY_GENERAL_DIRECTOR") {
    return [
      { title: "Tiến độ khối phụ trách", value: `${metrics.averageActual}%`, subtitle: `Kế hoạch hiện tại ${metrics.averagePlan}%`, status: progressTone === "red" ? "CẦN BÙ" : "THEO KẾ HOẠCH", tone: progressTone, icon: <TrendingUp size={20} />, href: "/planning" },
      { title: "Dự án cần điều phối", value: String(metrics.behind.length), subtitle: `${metrics.highRisk.length} rủi ro cao · ${metrics.delayed.length} chậm`, status: delayTone === "green" ? "ỔN" : "ĐIỀU PHỐI", tone: delayTone, icon: <UsersRound size={20} />, href: "/construction" },
      { title: "Hồ sơ & minh chứng", value: String(metrics.totalEvidence), subtitle: "Ảnh, video, hồ sơ trên dữ liệu dự án", status: "KIỂM SOÁT", tone: "blue", icon: <FileCheck2 size={20} />, href: "/documents" },
      { title: "Sức khỏe dự án", value: `${metrics.averageHealth}/100`, subtitle: `${metrics.safeCount} dự án ngưỡng an toàn`, status: healthTone === "green" ? "TỐT" : "THEO DÕI", tone: healthTone, icon: <ShieldCheck size={20} />, href: "/projects" },
    ];
  }

  if (audience === "DEPARTMENT_HEAD") {
    return [
      { title: "Công việc đang mở", value: String(taskMetrics.open.length), subtitle: `${taskMetrics.done.length} đã hoàn thành`, status: taskToneValue === "red" ? "CÓ QUÁ HẠN" : "ĐANG KIỂM SOÁT", tone: taskToneValue, icon: <ListChecks size={20} />, href: "/tasks" },
      { title: "Đến hạn 72 giờ", value: String(taskMetrics.dueSoon.length), subtitle: `${taskMetrics.overdue.length} việc quá hạn`, status: taskMetrics.overdue.length ? "CẦN XỬ LÝ" : "THEO DÕI", tone: taskToneValue, icon: <Clock3 size={20} />, href: "/tasks" },
      { title: "Dự án cần theo dõi", value: String(metrics.behind.length), subtitle: `Tiến độ bình quân ${metrics.averageActual}%`, status: delayTone === "green" ? "ỔN" : "NHẮC VIỆC", tone: delayTone, icon: <Building2 size={20} />, href: "/projects" },
      { title: "Hiệu suất công việc", value: `${taskMetrics.avgProgress}%`, subtitle: "Tiến độ bình quân đầu việc", status: taskMetrics.avgProgress >= 70 ? "TỐT" : "CẦN ĐÔN ĐỐC", tone: taskMetrics.avgProgress >= 70 ? "green" : "yellow", icon: <ClipboardCheck size={20} />, href: "/tasks" },
    ];
  }

  if (audience === "DEPUTY_DEPARTMENT_HEAD") {
    return [
      { title: "Việc cần đôn đốc", value: String(taskMetrics.open.length), subtitle: `${taskMetrics.overdue.length} quá hạn`, status: taskToneValue === "green" ? "ỔN" : "ĐÔN ĐỐC", tone: taskToneValue, icon: <ListChecks size={20} />, href: "/tasks" },
      { title: "Đến hạn 72 giờ", value: String(taskMetrics.dueSoon.length), subtitle: "Chuẩn bị nhắc việc và kiểm tra đầu ra", status: "THEO DÕI NGÀY", tone: taskMetrics.dueSoon.length ? "yellow" : "green", icon: <Clock3 size={20} />, href: "/tasks" },
      { title: "Dự án có chênh tiến độ", value: String(metrics.behind.length), subtitle: `${metrics.delayed.length} dự án chậm >5%`, status: delayTone === "green" ? "ỔN" : "PHỐI HỢP", tone: delayTone, icon: <HardHat size={20} />, href: "/construction" },
      { title: "Tiến độ đầu việc", value: `${taskMetrics.avgProgress}%`, subtitle: `${taskMetrics.done.length} việc hoàn thành`, status: taskMetrics.avgProgress >= 70 ? "TỐT" : "CẦN BÁM SÁT", tone: taskMetrics.avgProgress >= 70 ? "green" : "yellow", icon: <Target size={20} />, href: "/tasks" },
    ];
  }

  return [
    { title: "Việc của tôi đang mở", value: String(taskMetrics.open.length), subtitle: `${taskMetrics.done.length} việc đã hoàn thành`, status: taskToneValue === "red" ? "CÓ QUÁ HẠN" : "ĐANG THỰC HIỆN", tone: taskToneValue, icon: <ListChecks size={20} />, href: "/tasks" },
    { title: "Đến hạn 72 giờ", value: String(taskMetrics.dueSoon.length), subtitle: `${taskMetrics.overdue.length} việc quá hạn`, status: taskMetrics.overdue.length ? "LÀM NGAY" : "THEO KẾ HOẠCH", tone: taskToneValue, icon: <Clock3 size={20} />, href: "/tasks" },
    { title: "Tiến độ công việc", value: `${taskMetrics.avgProgress}%`, subtitle: "Bình quân các đầu việc được giao", status: taskMetrics.avgProgress >= 70 ? "TỐT" : "CẦN TĂNG TỐC", tone: taskMetrics.avgProgress >= 70 ? "green" : "yellow", icon: <ClipboardCheck size={20} />, href: "/tasks" },
    { title: "Dự án đang hoạt động", value: String(metrics.ongoing.length), subtitle: `${metrics.behind.length} dự án cần chú ý`, status: "PHẠM VI CÔNG VIỆC", tone: "blue", icon: <HardHat size={20} />, href: "/construction" },
  ];
}

function dashboardMetricShape() {
  return {
    ongoing: [] as Project[], completed: [] as Project[], warranty: [] as Project[], highRisk: [] as Project[], mediumRisk: [] as Project[], safeCount: 0,
    averageActual: 0, averagePlan: 0, averageHealth: 0, totalEvidence: 0, delayed: [] as Project[], behind: [] as Project[], valueTotal: 0, completionRate: 0,
  };
}

function taskMetricShape() {
  return { open: [] as WorkItem[], done: [] as WorkItem[], overdue: [] as WorkItem[], dueSoon: [] as WorkItem[], avgProgress: 0 };
}

function ProjectTable({ rows, audience }: { rows: DashboardRow[]; audience: DashboardAudience }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-[11px]">
        <thead className="border-y border-[#17314a] bg-[#081b2d] text-[9px] font-black uppercase tracking-[0.07em] text-slate-400">
          <tr>
            <th className="px-3 py-2.5">STT</th>
            <th className="px-3 py-2.5">{audience === "EMPLOYEE" ? "Dự án / hạng mục" : "Đơn vị / Dự án"}</th>
            <th className="px-3 py-2.5 text-center">KH lũy kế</th>
            <th className="px-3 py-2.5 text-center">Thực tế</th>
            <th className="px-3 py-2.5 text-center">Trạng thái</th>
            <th className="px-3 py-2.5 text-right">Chênh lệch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#143048]">
          {rows.map((row, index) => (
            <tr key={row.project.id} className="transition hover:bg-white/[0.03]">
              <td className="px-3 py-3 font-black text-slate-500">{index + 1}</td>
              <td className="px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneStyles[row.tone].dot}`} />
                  <div className="min-w-0">
                    <Link href={`/projects/${row.project.id}`} className="block max-w-[350px] truncate font-black text-slate-100 hover:text-orange-300">{row.project.name}</Link>
                    <p className="mt-1 max-w-[350px] truncate text-[9px] font-semibold text-slate-500">{row.project.code || "Chưa có mã"} · {row.project.type} · {row.project.province}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-center font-black text-slate-300">{row.plan}%</td>
              <td className="px-3 py-3 text-center font-black text-white">{row.actual}%</td>
              <td className="px-3 py-3 text-center"><StatusPill tone={row.tone}>{row.status}</StatusPill></td>
              <td className="px-3 py-3 text-right font-black"><span className={row.delta < 0 ? "text-red-300" : row.delta > 0 ? "text-emerald-300" : "text-slate-500"}>{row.delta > 0 ? "+" : ""}{row.delta}%</span></td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan={6} className="px-4 py-10 text-center text-xs font-semibold text-slate-500">Chưa có dữ liệu dự án phù hợp.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function WorkList({ tasks, audience }: { tasks: WorkItem[]; audience: DashboardAudience }) {
  return (
    <div className="space-y-2 p-3">
      {tasks.map((item) => {
        const tone = taskTone(item);
        return (
          <Link key={item.id} href="/tasks" className="grid gap-2 rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-2.5 transition hover:border-orange-400/25 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${toneStyles[tone].dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-black text-slate-100">{item.title}</p>
                  <p className="mt-1 truncate text-[9px] font-semibold text-slate-500">{item.project} · {audience === "EMPLOYEE" ? item.status : item.assignee}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-[9px] font-bold text-slate-500">{item.due ? `Hạn ${formatDate(item.due)}` : "Chưa có hạn"}</span>
              <StatusPill tone={tone}>{item.progress}%</StatusPill>
            </div>
          </Link>
        );
      })}
      {!tasks.length ? <EmptyBox text="Chưa có công việc cần ưu tiên trong phạm vi hiện tại." /> : null}
    </div>
  );
}

function ProjectWorkSummary({ audience, rows, metrics }: { audience: DashboardAudience; rows: DashboardRow[]; metrics: ReturnType<typeof dashboardMetricShape> }) {
  return (
    <div className="space-y-2 p-3">
      {rows.map((row) => (
        <div key={row.project.id} className="rounded-xl border border-[#17314a] bg-[#091b2d] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black text-slate-100">{row.project.name}</p>
              <p className="mt-1 text-[9px] font-semibold text-slate-500">{audience === "CHAIRMAN" ? `Health ${row.project.healthScore ?? 0}/100 · ${row.project.valueRange}` : `Tiến độ ${row.actual}% / KH ${row.plan}%`}</p>
            </div>
            <StatusPill tone={row.tone}>{row.status}</StatusPill>
          </div>
        </div>
      ))}
      {!rows.length ? <EmptyBox text={`Chưa có dữ liệu. Hiện có ${metrics.ongoing.length} dự án đang hoạt động.`} /> : null}
    </div>
  );
}

function KpiCard(item: KpiItem) {
  const style = toneStyles[item.tone];
  return (
    <Link href={item.href} className="group rounded-[18px] border border-[#17314a] bg-[linear-gradient(180deg,rgba(10,31,52,0.98)_0%,rgba(7,22,39,0.96)_100%)] p-3.5 shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-orange-400/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.065em] text-slate-300">{item.title}</p>
          <p className={`mt-1 text-3xl font-black leading-none ${style.text}`}>{item.value}</p>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl border ${style.badge}`}>{item.icon}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[9px] font-semibold leading-4 text-slate-500">{item.subtitle}</p>
        <span className={`shrink-0 rounded-md border px-2 py-1 text-[8px] font-black ${style.badge}`}>{item.status}</span>
      </div>
    </Link>
  );
}

function PanelHeader({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[#163049] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[#f2d28b]">{icon}</span>
        <h2 className="text-[11px] font-black uppercase tracking-[0.07em] text-slate-100">{title}</h2>
      </div>
      <span className="text-[9px] font-bold text-slate-500">{note}</span>
    </div>
  );
}

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex rounded-md border px-2 py-1 text-[8px] font-black ${toneStyles[tone].badge}`}>{children}</span>;
}

function MiniNumber({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return (
    <div className={`rounded-lg border border-white/5 ${toneStyles[tone].soft} p-2.5 text-center`}>
      <p className={`text-xl font-black ${toneStyles[tone].text}`}>{String(value).padStart(2, "0")}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#17314a] bg-[#091b2d] p-3">
      <p className="text-xl font-black text-white">{String(value).padStart(2, "0")}</p>
      <p className="mt-1 truncate text-[9px] font-black uppercase tracking-[0.05em] text-orange-300">{label}</p>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return <div className="rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-4 text-center text-[10px] font-semibold text-slate-500">{text}</div>;
}

function TrendChart({ rows }: { rows: DashboardRow[] }) {
  const width = 400;
  const height = 190;
  const left = 34;
  const right = 14;
  const top = 12;
  const bottom = 32;
  const items = rows.length
    ? rows
    : [{ project: { id: -1, name: "Chưa có dữ liệu", type: "Công nghiệp" as ProjectType, status: "ongoing", investor: "", province: "", valueRange: "", progress: 0, lat: 0, lng: 0 }, plan: 0, actual: 0, gap: 0, delta: 0, tone: "yellow" as Tone, status: "Theo dõi" }];
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = (index: number) => left + (items.length === 1 ? plotWidth / 2 : (index * plotWidth) / (items.length - 1));
  const y = (value: number) => top + ((100 - Math.max(0, Math.min(100, value))) / 100) * plotHeight;
  const actualPoints = items.map((item, index) => `${x(index)},${y(item.actual)}`).join(" ");
  const planPoints = items.map((item, index) => `${x(index)},${y(item.plan)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full" role="img" aria-label="Biểu đồ kế hoạch và thực hiện">
      {[0, 25, 50, 75, 100].map((tick) => {
        const yy = y(tick);
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={yy} y2={yy} stroke="#17314a" strokeWidth="1" />
            <text x={left - 6} y={yy + 3} textAnchor="end" fontSize="8" fill="#64748b">{tick}%</text>
          </g>
        );
      })}
      <polyline points={planPoints} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={actualPoints} fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {items.map((item, index) => (
        <g key={item.project.id}>
          <circle cx={x(index)} cy={y(item.actual)} r="3.5" fill="#fb923c" />
          <text x={x(index)} y={height - 10} textAnchor="middle" fontSize="7" fill="#64748b">{(item.project.code || `DA${index + 1}`).slice(0, 7)}</text>
        </g>
      ))}
    </svg>
  );
}

function taskTone(item: WorkItem): Tone {
  if (item.status === "Hoàn thành") return "green";
  if (item.due && new Date(`${item.due}T23:59:59`).getTime() < Date.now()) return "red";
  if (normalize(item.priority).includes("cao")) return "red";
  if (item.due) {
    const diff = new Date(`${item.due}T23:59:59`).getTime() - Date.now();
    if (diff >= 0 && diff <= 1000 * 60 * 60 * 72) return "yellow";
  }
  return "blue";
}

function alertReason(row: DashboardRow, audience: DashboardAudience) {
  if (audience === "CHAIRMAN") return row.project.risk === "high" ? "Rủi ro cao cần giám sát cấp công ty" : `Chênh kế hoạch ${row.gap}% · Health ${row.project.healthScore ?? 0}/100`;
  if (audience === "EMPLOYEE") return row.gap ? `Hạng mục/dự án đang chậm ${row.gap}% so với kế hoạch` : "Dự án có cảnh báo cần cập nhật";
  return row.gap ? `Chậm ${row.gap}% · Cần phương án bù tiến độ` : `Health ${row.project.healthScore ?? 0}/100 · Cần theo dõi`;
}

function directiveDetail(
  audience: DashboardAudience,
  row: DashboardRow | undefined,
  taskMetrics: ReturnType<typeof taskMetricShape>,
  index: number,
) {
  if (audience === "EMPLOYEE") {
    return index === 0
      ? `${taskMetrics.open.length} việc đang mở; ưu tiên ${taskMetrics.overdue.length} việc quá hạn.`
      : row
        ? `${row.project.name}: thực tế ${row.actual}% / kế hoạch ${row.plan}%.`
        : "Cập nhật tình trạng công việc và báo sớm nếu có vướng mắc.";
  }
  if (audience === "DEPARTMENT_HEAD" || audience === "DEPUTY_DEPARTMENT_HEAD") {
    return index === 0
      ? `${taskMetrics.open.length} việc đang mở · ${taskMetrics.dueSoon.length} việc đến hạn trong 72 giờ.`
      : row
        ? `${row.project.name}: cần theo dõi chênh ${row.gap}% và người chịu trách nhiệm.`
        : "Rà soát phân công, hạn hoàn thành và chất lượng đầu ra.";
  }
  return row
    ? `${row.project.name}: ${row.gap > 0 ? `cần bù ${row.gap}% tiến độ` : `Health ${row.project.healthScore ?? 0}/100`}.`
    : "Theo dõi chỉ số tổng hợp và cập nhật khi dữ liệu thay đổi.";
}

function topCounts(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return Array.from(map.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 4);
}

function parseValueRange(range: string) {
  if (!range) return 0;
  const lower = range.toLocaleLowerCase("vi");
  if (lower.includes("trên") || lower.includes("hơn") || lower.includes("hon")) return 500;
  const numbers = lower.match(/\d+/g)?.map((value) => Number(value)) ?? [];
  return numbers[numbers.length - 1] || 0;
}

function normalize(value?: string | null) {
  return String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}
