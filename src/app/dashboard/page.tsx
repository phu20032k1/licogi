"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
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
import styles from "./Dashboard.module.css";

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

const toneClasses: Record<Tone, string> = {
  green: styles.toneGreen,
  yellow: styles.toneYellow,
  red: styles.toneRed,
  blue: styles.toneBlue,
};

const roleThemes: Partial<Record<RoleDomain, { accent: string; rgb: string }>> = {
  BOARD: { accent: "#f1cc78", rgb: "241, 204, 120" },
  CONTROL: { accent: "#e8b75c", rgb: "232, 183, 92" },
  CORPORATE: { accent: "#f3c969", rgb: "243, 201, 105" },
  FINANCE: { accent: "#4fce9a", rgb: "79, 206, 154" },
  ACCOUNTING: { accent: "#4fce9a", rgb: "79, 206, 154" },
  BUSINESS_PRODUCTION_DESIGN: { accent: "#4aa8e8", rgb: "74, 168, 232" },
  PROJECT_DESIGN: { accent: "#50b9de", rgb: "80, 185, 222" },
  CONSTRUCTION: { accent: "#f0a44c", rgb: "240, 164, 76" },
  WARRANTY: { accent: "#9f8cf2", rgb: "159, 140, 242" },
  SAFETY: { accent: "#ef6f67", rgb: "239, 111, 103" },
  ADMIN: { accent: "#65b9e8", rgb: "101, 185, 232" },
  TECH_ECON: { accent: "#e5bd61", rgb: "229, 189, 97" },
  STEEL: { accent: "#9eaec0", rgb: "158, 174, 192" },
  ELECTROMECHANICAL: { accent: "#e8cc56", rgb: "232, 204, 86" },
  EQUIPMENT: { accent: "#db9356", rgb: "219, 147, 86" },
  HANOI_OFFICE: { accent: "#7bb7e5", rgb: "123, 183, 229" },
  CONCRETE: { accent: "#90a8bc", rgb: "144, 168, 188" },
};

const operationalLabels: Partial<Record<RoleDomain, { progress: string; attention: string; evidence: string; work: string }>> = {
  ADMIN: { progress: "Tiến độ công việc phòng", attention: "Hồ sơ cần đôn đốc", evidence: "Hồ sơ / tài liệu", work: "Việc hành chính đang mở" },
  PROJECT_DESIGN: { progress: "Tiến độ thiết kế & QLDA", attention: "Dự án cần phối hợp", evidence: "Hồ sơ thiết kế", work: "Đầu việc thiết kế đang mở" },
  TECH_ECON: { progress: "Tiến độ hồ sơ KTKT", attention: "Dự án cần kiểm soát", evidence: "Minh chứng khối lượng", work: "Hồ sơ dự toán đến hạn" },
  STEEL: { progress: "Tiến độ kết cấu thép", attention: "Dự án cần cung ứng", evidence: "Hồ sơ sản xuất", work: "Lệnh sản xuất đang mở" },
  ELECTROMECHANICAL: { progress: "Tiến độ cơ điện", attention: "Hạng mục cần phối hợp", evidence: "Hồ sơ cơ điện", work: "Việc cơ điện đang mở" },
  EQUIPMENT: { progress: "Mức đáp ứng thiết bị", attention: "Dự án cần điều phối", evidence: "Nhật ký thiết bị", work: "Lệnh thiết bị đang mở" },
  HANOI_OFFICE: { progress: "Tiến độ phối hợp VP Hà Nội", attention: "Dự án cần hỗ trợ", evidence: "Hồ sơ điều phối", work: "Việc văn phòng đang mở" },
  CONCRETE: { progress: "Tiến độ cung ứng BTTP", attention: "Dự án cần cấp bê tông", evidence: "Phiếu / hồ sơ cấp phối", work: "Lệnh cấp bê tông đang mở" },
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
  const theme = roleThemes[roleProfile?.domain || "CORPORATE"] || roleThemes.CORPORATE!;
  const dashboardStyle = {
    "--role-accent": theme.accent,
    "--role-accent-rgb": theme.rgb,
  } as CSSProperties;

  return (
    <div className={styles.dashboard} style={dashboardStyle}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.brand} aria-hidden="true">
            <Image src="/brand/licogi183-logo.svg" alt="" width={44} height={44} priority />
          </div>
          <div className="min-w-0">
            <p className={styles.eyebrow}>LICOGI 18.3 · Enterprise Growth OS</p>
            <h1 className={styles.title}>{roleProfile?.position || "Dashboard điều hành"}</h1>
            <p className={styles.description}>{roleDescription(roleProfile)}</p>
          </div>
        </div>
        <div className={styles.headerMeta}>
          <time className={styles.date}>{today || "--/--/----"}</time>
          <span className={styles.identity}>{session?.name || "LICOGI 18.3"}</span>
          <span className={styles.roleBadge}>{roleProfile?.unitLabel || "Điều hành"}</span>
        </div>
      </header>

      {isAdmin ? (
        <div className={styles.adminBar}>
          <span className={styles.adminLabel}>Kiểm tra giao diện theo từng tài khoản / vị trí</span>
          <select
            value={previewEmail}
            onChange={(event) => setPreviewEmail(event.target.value)}
            className={styles.adminSelect}
            aria-label="Xem dashboard theo vị trí"
          >
            <option value="">Tự động theo tài khoản đang đăng nhập</option>
            {roleAccountProfiles.map((item) => (
              <option key={item.email} value={item.email}>{item.position} · {item.email}</option>
            ))}
          </select>
        </div>
      ) : null}

      <section className={styles.focusRail} aria-label="Chuỗi điều hành theo vai trò">
        <span className={styles.focusLabel}>Chuỗi điều hành</span>
        {(roleProfile?.focusChain || ["Mục tiêu", "KR/KPI", "Thực thi", "Đo lường", "Cảnh báo", "Quyết định", "Kết quả"]).map((item, index, array) => (
          <span key={`${item}-${index}`} className="contents">
            <span className={styles.focusItem}>{item}</span>
            {index < array.length - 1 ? <ChevronRight size={13} className={styles.railArrow} aria-hidden="true" /> : null}
          </span>
        ))}
      </section>

      <section className={styles.kpiGrid} aria-label="Chỉ số điều hành trọng yếu">
        {kpis.map((item) => <KpiCard key={item.title} {...item} />)}
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <PanelHeader icon={<Trophy size={15} />} title={boardTitle(roleProfile)} note={`${tableRows.length}/${projects.length} dự án`} />
          <ProjectTable rows={tableRows} />
        </article>

        <article className={styles.panel}>
          <PanelHeader icon={<BellRing size={15} />} title="Cảnh báo điều hành" note={`${alerts.length} nội dung`} />
          <div className={styles.stack}>
            {alerts.map((row) => (
              <Link key={row.project.id} href={`/projects/${row.project.id}`} className={styles.alertRow}>
                <span className={`${styles.dot} ${toneClasses[row.tone]}`} />
                <div className="min-w-0">
                  <p className={styles.rowTitle}>{row.project.name}</p>
                  <p className={styles.rowMeta}>{alertReason(row, roleProfile?.domain)}</p>
                </div>
                <span className={styles.viewLink}>[XEM]</span>
              </Link>
            ))}
            {!alerts.length ? <EmptyBox text="Chưa có cảnh báo ưu tiên theo dữ liệu hiện tại." /> : null}
          </div>
        </article>

        <article className={styles.panel}>
          <PanelHeader icon={<BarChart3 size={15} />} title="Diễn biến thực hiện" note="Kế hoạch / thực tế" />
          <div className={styles.chartBody}>
            <TrendChart rows={chartRows} />
            <div className={styles.miniGrid}>
              <MiniNumber label="Đang chậm" value={metrics.delayed.length} tone={metrics.delayed.length ? "red" : "green"} />
              <MiniNumber label="Rủi ro cao" value={metrics.highRisk.length} tone={metrics.highRisk.length ? "red" : "green"} />
            </div>
          </div>
        </article>
      </section>

      <section className={styles.actionGrid}>
        <article className={styles.panel}>
          <PanelHeader icon={<ListChecks size={15} />} title={workTitle(roleProfile)} note={tasks.length ? "Dữ liệu công việc" : "Theo dữ liệu dự án"} />
          {tasks.length ? <WorkList tasks={actionTasks} /> : <ProjectWorkSummary rows={rows.slice(0, 6)} roleProfile={roleProfile} />}
        </article>

        <article className={styles.panel}>
          <PanelHeader icon={<Target size={15} />} title="Chỉ đạo / ưu tiên theo vị trí" note={roleProfile?.shortPosition || "Vai trò"} />
          <div className={styles.priorityGrid}>
            {(roleProfile?.priorities || []).map((priority, index) => (
              <div key={priority} className={styles.priorityCard}>
                <span className={styles.priorityIndex}>{index + 1}</span>
                <div>
                  <p className={styles.rowTitle}>{priority}</p>
                  <p className={styles.rowMeta}>{priorityDetail(roleProfile, alerts[index], taskMetrics, metrics)}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <PanelHeader icon={<UserCog size={15} />} title="Truy cập nhanh" note={roleProfile?.unitLabel || "LICOGI"} />
          <div className={styles.stack}>
            {(roleProfile?.quickLinks || []).map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={styles.quickLink}>
                <div>
                  <p className={styles.rowTitle}>{item.label}</p>
                  <p className={styles.rowMeta}>{item.note}</p>
                </div>
                <ChevronRight size={14} className={styles.quickIcon} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.scopeGrid}>
        <ScopeCard icon={<Building2 size={15} />} title="Phạm vi tổ chức" value={roleProfile?.departmentName || "Toàn công ty"} note={`${roleProfile?.levelLabel || "Điều hành"} · ${roleProfile?.roleCode || session?.roleCode || "—"}`} />
        <ScopeCard icon={<BriefcaseBusiness size={15} />} title="Tài khoản đang xem" value={previewEmail || session?.email || "—"} note={previewEmail ? "Chế độ kiểm tra của Admin" : "Tài khoản đăng nhập thực tế"} />
        <ScopeCard icon={<MapPinned size={15} />} title="Nguyên tắc dữ liệu" value="Một nguồn dữ liệu · nhiều góc nhìn" note="Mục tiêu → trách nhiệm → KPI → action → risk → decision → outcome" />
      </section>

      <details className={styles.organizationDetails}>
        <summary className={styles.organizationSummary}>
          <span>Cơ cấu tổ chức và chuỗi trách nhiệm LICOGI 18.3</span>
          <span>Mở sơ đồ chi tiết</span>
        </summary>
        <div className={styles.organizationBody}>
          <OrganizationCommandChart active={roleProfile} />
        </div>
      </details>
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

  if (domain === "CORPORATE") return [
    { title: "Tiến độ toàn công ty", value: `${metrics.averageActual}%`, subtitle: `Kế hoạch bình quân ${metrics.averagePlan}%`, status: progressTone === "red" ? "CẦN BÙ" : "ĐANG BÁM", tone: progressTone, icon: <TrendingUp size={18} />, href: "/planning" },
    { title: "Dự án đang vận hành", value: String(metrics.ongoing.length), subtitle: `${metrics.completed.length} hoàn thành · ${metrics.warranty.length} bảo hành`, status: "TOÀN CÔNG TY", tone: "blue", icon: <Building2 size={18} />, href: "/projects" },
    { title: "Project Health", value: `${metrics.averageHealth}/100`, subtitle: `${metrics.highRisk.length} rủi ro cao · ${metrics.safeCount} an toàn`, status: healthTone === "green" ? "TỐT" : "CAN THIỆP", tone: healthTone, icon: <ShieldCheck size={18} />, href: "/projects" },
    { title: "Chỉ đạo đến hạn", value: String(tasks.dueSoon.length + tasks.overdue.length), subtitle: `${tasks.overdue.length} việc quá hạn cần xử lý`, status: tasks.overdue.length ? "XỬ LÝ NGAY" : "ĐANG KIỂM SOÁT", tone: taskTone, icon: <ClipboardCheck size={18} />, href: "/tasks" },
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

  const labels = operationalLabels[domain];

  if (labels) return [
    { title: profile?.audience === "EMPLOYEE" ? "Tiến độ việc của tôi" : labels.progress, value: `${tasks.avgProgress}%`, subtitle: `${tasks.done.length} việc hoàn thành trong phạm vi`, status: tasks.avgProgress >= 70 ? "TỐT" : "BÁM SÁT", tone: tasks.avgProgress >= 70 ? "green" : "yellow", icon: <Target size={18} />, href: "/tasks" },
    { title: labels.attention, value: String(metrics.behind.length), subtitle: `Tiến độ dự án bình quân ${metrics.averageActual}%`, status: delayTone === "green" ? "ỔN" : "PHỐI HỢP", tone: delayTone, icon: <Building2 size={18} />, href: "/projects" },
    { title: labels.evidence, value: String(metrics.totalEvidence), subtitle: "Dữ liệu ảnh, video và tài liệu hiện có", status: "MINH CHỨNG", tone: "blue", icon: <FileCheck2 size={18} />, href: "/documents" },
    { title: profile?.audience === "EMPLOYEE" ? "Việc của tôi đến hạn" : labels.work, value: String(tasks.open.length), subtitle: `${tasks.dueSoon.length} đến hạn 72 giờ · ${tasks.overdue.length} quá hạn`, status: tasks.overdue.length ? "LÀM NGAY" : "ĐANG KIỂM SOÁT", tone: taskTone, icon: <Clock3 size={18} />, href: "/tasks" },
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
    <div className={styles.tableWrap}>
      <table className={styles.projectTable}>
        <thead>
          <tr><th>STT</th><th>Đơn vị / Dự án</th><th className={styles.center}>Kế hoạch</th><th className={styles.center}>Thực tế</th><th className={styles.center}>Trạng thái</th><th className={styles.right}>Chênh</th></tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.project.id}>
              <td className={styles.rowIndex}>{index + 1}</td>
              <td>
                <div className={styles.projectCell}>
                  <span className={`${styles.dot} ${toneClasses[row.tone]}`} />
                  <div className="min-w-0">
                    <Link href={`/projects/${row.project.id}`} className={styles.projectName}>{row.project.name}</Link>
                    <p className={styles.projectMeta}>{row.project.code || "Chưa có mã"} · {row.project.type} · {row.project.province}</p>
                  </div>
                </div>
              </td>
              <td className={`${styles.center} ${styles.numberStrong}`}>{row.plan}%</td>
              <td className={`${styles.center} ${styles.numberStrong}`}>{row.actual}%</td>
              <td className={styles.center}><StatusPill tone={row.tone}>{row.status}</StatusPill></td>
              <td className={`${styles.right} ${toneClasses[row.delta < 0 ? "red" : row.delta > 0 ? "green" : "blue"]}`}>{row.delta > 0 ? "+" : ""}{row.delta}%</td>
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan={6}><EmptyBox text="Chưa có dữ liệu dự án phù hợp." /></td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function WorkList({ tasks }: { tasks: WorkItem[] }) {
  return <div className={styles.stack}>{tasks.map((item) => { const tone = taskTone(item); return <Link key={item.id} href="/tasks" className={styles.workRow}><div className="min-w-0"><p className={styles.rowTitle}>{item.title}</p><p className={styles.rowMeta}>{item.project} · {item.assignee}</p></div><div className={styles.workRight}><span className={styles.due}>{item.due ? `Hạn ${formatDate(item.due)}` : "Chưa có hạn"}</span><StatusPill tone={tone}>{item.progress}%</StatusPill></div></Link>; })}{!tasks.length ? <EmptyBox text="Chưa có công việc ưu tiên trong phạm vi hiện tại." /> : null}</div>;
}

function ProjectWorkSummary({ rows, roleProfile }: { rows: DashboardRow[]; roleProfile?: RoleAccountProfile }) {
  return <div className={styles.stack}>{rows.map((row) => <div key={row.project.id} className={styles.projectRow}><div className={styles.projectRowInner}><div className="min-w-0"><p className={styles.rowTitle}>{row.project.name}</p><p className={styles.rowMeta}>{roleProfile?.domain === "BOARD" ? `Health ${row.project.healthScore ?? 0}/100 · ${row.project.valueRange}` : `Thực tế ${row.actual}% / kế hoạch ${row.plan}%`}</p></div><StatusPill tone={row.tone}>{row.status}</StatusPill></div></div>)}{!rows.length ? <EmptyBox text="Chưa có dữ liệu thực thi." /> : null}</div>;
}

function KpiCard(item: KpiItem) {
  const tone = toneClasses[item.tone];
  return <Link href={item.href} className={`${styles.kpiCard} ${tone}`}><div className={styles.kpiTop}><div><p className={styles.kpiTitle}>{item.title}</p><p className={`${styles.kpiValue} ${tone}`}>{item.value}</p></div><span className={`${styles.kpiIcon} ${tone}`}>{item.icon}</span></div><div className={styles.kpiBottom}><p className={styles.kpiSubtitle}>{item.subtitle}</p><span className={`${styles.statusPill} ${tone}`}>{item.status}</span></div></Link>;
}

function PanelHeader({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return <div className={styles.panelHeader}><div className={styles.panelHeading}><span className={styles.panelIcon}>{icon}</span><h2 className={styles.panelTitle}>{title}</h2></div><span className={styles.panelNote}>{note}</span></div>;
}

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) { return <span className={`${styles.statusPill} ${toneClasses[tone]}`}>{children}</span>; }
function MiniNumber({ label, value, tone }: { label: string; value: number; tone: Tone }) { return <div className={`${styles.miniNumber} ${toneClasses[tone]}`}><p className={styles.miniValue}>{String(value).padStart(2, "0")}</p><p className={styles.miniLabel}>{label}</p></div>; }
function EmptyBox({ text }: { text: string }) { return <div className={styles.empty}>{text}</div>; }

function ScopeCard({ icon, title, value, note }: { icon: ReactNode; title: string; value: string; note: string }) {
  return <div className={styles.scopeCard}><span className={styles.scopeIcon}>{icon}</span><div className="min-w-0"><p className={styles.scopeTitle}>{title}</p><p className={styles.scopeValue}>{value}</p><p className={styles.scopeNote}>{note}</p></div></div>;
}

function TrendChart({ rows }: { rows: DashboardRow[] }) {
  if (!rows.length) return <EmptyBox text="Chưa có dữ liệu để vẽ diễn biến." />;
  const width = 360; const height = 150; const left = 30; const right = 10; const top = 10; const bottom = 28; const plotWidth = width - left - right; const plotHeight = height - top - bottom;
  const x = (index: number) => left + (rows.length === 1 ? plotWidth / 2 : (index * plotWidth) / (rows.length - 1));
  const y = (value: number) => top + ((100 - Math.max(0, Math.min(100, value))) / 100) * plotHeight;
  const actual = rows.map((item, index) => `${x(index)},${y(item.actual)}`).join(" ");
  const plan = rows.map((item, index) => `${x(index)},${y(item.plan)}`).join(" ");
  return <div className={styles.chartWrap}><svg viewBox={`0 0 ${width} ${height}`} className={styles.chart} role="img" aria-label="Biểu đồ kế hoạch và thực hiện">{[0,25,50,75,100].map((tick) => <g key={tick}><line x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} stroke="#1b3a54" strokeWidth="1" /><text x={left-5} y={y(tick)+3} textAnchor="end" fontSize="8" fill="#7890a4">{tick}%</text></g>)}<polyline points={plan} fill="none" stroke="#c5d3de" strokeWidth="1.7" strokeDasharray="5 4" /><polyline points={actual} fill="none" stroke="#42a5f5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />{rows.map((item,index) => <g key={item.project.id}><circle cx={x(index)} cy={y(item.actual)} r="3" fill="#42a5f5" /><text x={x(index)} y={height-8} textAnchor="middle" fontSize="7" fill="#7890a4">{(item.project.code || `DA${index+1}`).slice(0,6)}</text></g>)}</svg><div className={styles.chartLegend}><span className={styles.legendItem}><span className={styles.legendDash} />Kế hoạch</span><span className={styles.legendItem}><span className={styles.legendLine} />Thực tế</span></div></div>;
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
