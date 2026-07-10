"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Database,
  FileText,
  FolderKanban,
  HardHat,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { RiskBadge, StatusBadge } from "../../components/ui/StatusBadge";
import { Project } from "../../data/projects";
import { constructionTasks } from "../../data/operations";
import { dataLakeGroups, operatingModules, strategicPillars } from "../../data/enterprise";
import { fetchProjectsFromDataCenter } from "../../lib/projectData";

const monthlyRevenue = [
  { month: "T1", value: 0, plan: 0 },
  { month: "T2", value: 0, plan: 0 },
  { month: "T3", value: 0, plan: 0 },
  { month: "T4", value: 0, plan: 0 },
  { month: "T5", value: 0, plan: 0 },
  { month: "T6", value: 0, plan: 0 },
  { month: "T7", value: 0, plan: 0 },
  { month: "T8", value: 0, plan: 0 },
  { month: "T9", value: 0, plan: 0 },
  { month: "T10", value: 0, plan: 0 },
  { month: "T11", value: 0, plan: 0 },
  { month: "T12", value: 0, plan: 0 },
];


export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const sync = () => fetchProjectsFromDataCenter().then(setProjects).catch(() => setProjects([]));
    sync();
    window.addEventListener("licogi-data-imported", sync);
    window.addEventListener("licogi-projects-updated", sync);
    return () => {
      window.removeEventListener("licogi-data-imported", sync);
      window.removeEventListener("licogi-projects-updated", sync);
    };
  }, []);

  const metrics = useMemo(() => {
    const ongoing = projects.filter((project) => project.status === "ongoing");
    const warranty = projects.filter((project) => project.status === "warranty");
    const completed = projects.filter((project) => project.status === "completed");
    const highRisk = ongoing.filter((project) => project.risk === "high");
    const averageProgress = ongoing.length
      ? Math.round(ongoing.reduce((sum, project) => sum + project.progress, 0) / ongoing.length)
      : 0;
    const averagePlan = ongoing.length
      ? Math.round(ongoing.reduce((sum, project) => sum + (project.plannedProgress ?? project.progress), 0) / ongoing.length)
      : 0;
    const averageHealth = projects.length
      ? Math.round(projects.reduce((sum, project) => sum + (project.healthScore ?? 0), 0) / projects.length)
      : 0;
    const fdiCount = projects.filter((project) => project.investorCountry && project.investorCountry !== "Việt Nam").length;
    return { ongoing, warranty, completed, highRisk, averageProgress, averagePlan, averageHealth, fdiCount };
  }, [projects]);

  const maxRevenue = Math.max(1, ...monthlyRevenue.map((item) => item.value));
  const alerts = projects
    .filter((project) => project.status === "ongoing")
    .sort((a, b) => (a.healthScore ?? 100) - (b.healthScore ?? 100))
    .slice(0, 4);

  return (
    <div className="space-y-7 animate-fade-up">
      <section className="dark-glass relative overflow-hidden rounded-[34px] px-6 py-7 text-white sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-60 w-60 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute right-6 top-6 hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 backdrop-blur lg:block">Trung tâm điều hành</div>

        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-orange-300">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_22px_rgba(251,146,60,0.9)] pulse-ring" />
              Licogi 18.3 Industrial Construction Operating System
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl xl:text-6xl">
              Hệ điều hành quản trị tổng thầu EPC quy mô nghìn tỷ
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Hệ thống vận hành theo mô hình Outside + Inside + Market Bridge: chuẩn hóa dữ liệu dự án, điều hành thi công, quản lý bảo hành và hệ sinh thái đối tác trong một nền tảng thống nhất. Dữ liệu ban đầu để trống, chờ nhập liệu thật từ Trung tâm dữ liệu.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-600">
                <FolderKanban size={18} /> Quản lý dữ liệu dự án
              </Link>
              <Link href="/map" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                <MapPinned size={18} /> Mở bản đồ năng lực GIS
              </Link>
              <Link href="/ai-profile" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                <FileText size={18} /> Tạo hồ sơ năng lực
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HeroMetric label="Project Health" value={`${metrics.averageHealth}/100`} caption="Bình quân toàn danh mục" tone="green" progress={metrics.averageHealth} />
            <HeroMetric label="Tiến độ thực tế" value={`${metrics.averageProgress}%`} caption={`Kế hoạch ${metrics.averagePlan}%`} tone="orange" progress={metrics.averageProgress} />
            <HeroMetric label="Khách FDI" value={`${metrics.fdiCount} nhóm`} caption="theo dữ liệu đã nhập" tone="blue" progress={metrics.fdiCount ? 76 : 0} />
            <HeroMetric label="Module lõi" value="10/10" caption="Đã có giao diện điều hướng" tone="violet" progress={100} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Doanh thu lũy kế" value="0 tỷ" note="chờ nhập dữ liệu thật" icon={CircleDollarSign} tone="orange" />
        <StatCard title="Hợp đồng tồn đọng" value="0 tỷ" note="chờ nhập dữ liệu hợp đồng" icon={Banknote} tone="blue" />
        <StatCard title="Dự án đang thi công" value={String(metrics.ongoing.length)} note={`${projects.length} dự án trong Data Center`} icon={HardHat} tone="green" />
        <StatCard title="Cảnh báo rủi ro cao" value={String(metrics.highRisk.length)} trendDirection={metrics.highRisk.length ? "down" : "up"} note="cần Ban điều hành xử lý" icon={AlertTriangle} tone="violet" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <article className="enterprise-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Kết quả kinh doanh</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Doanh thu theo tháng / kế hoạch</h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">Đơn vị: tỷ đồng</div>
          </div>
          <div className="mt-8 flex h-64 items-end gap-2 sm:gap-3">
            {monthlyRevenue.map((item, index) => (
              <div key={item.month} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative flex h-52 w-full items-end justify-center overflow-hidden rounded-t-xl bg-slate-50">
                  <div className="absolute inset-x-1 border-t border-dashed border-slate-300" style={{ bottom: `${Math.min(98, (item.plan / maxRevenue) * 100)}%` }} />
                  <div
                    className={`w-full max-w-9 rounded-t-lg bg-gradient-to-t ${index === monthlyRevenue.length - 1 ? "from-orange-600 to-orange-400" : "from-slate-800 to-slate-600"} transition-all group-hover:opacity-80`}
                    style={{ height: `${Math.max(12, (item.value / maxRevenue) * 100)}%` }}
                  />
                  <span className="pointer-events-none absolute -top-7 hidden rounded-md bg-slate-950 px-2 py-1 text-[10px] font-bold text-white group-hover:block">{item.value}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 sm:text-xs">{item.month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="enterprise-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Nguồn lực</p><h2 className="mt-1 text-lg font-black text-slate-950">Công suất hiện tại</h2></div>
            <UsersRound size={21} className="text-orange-500" />
          </div>
          <div className="mt-6 space-y-5">
            {[
              { label: "Nhân lực công trường", value: 0, caption: "Chưa nhập", tone: "orange" as const },
              { label: "Thiết bị thi công", value: 0, caption: "Chưa nhập", tone: "blue" as const },
              { label: "Năng lực chào thầu", value: 0, caption: "Chưa nhập", tone: "green" as const },
              { label: "Hồ sơ nghiệm thu", value: 0, caption: "Chưa nhập", tone: "slate" as const },
            ].map((resource) => (
              <div key={resource.label}>
                <div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold text-slate-700">{resource.label}</span><span className="font-semibold text-slate-500">{resource.caption}</span></div>
                <ProgressBar value={resource.value} tone={resource.tone} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="dark-glass rounded-[28px] p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-300">Quy trình vận hành dữ liệu</p>
              <h2 className="mt-1 text-xl font-black">Trạng thái hệ thống</h2>
            </div>
            <CheckCircle2 className="text-orange-300" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              { label: "Dữ liệu", value: projects.length ? `${projects.length} dự án đã nhập` : "Chưa có dữ liệu dự án", note: "Vào Trung tâm dữ liệu để import CSV thật trước khi trình bày Dashboard/GIS." },
              { label: "Tài khoản", value: "Đăng nhập bằng email/mật khẩu ENV", note: "Mật khẩu nằm trong .env.local; OTP và phân quyền nâng cao sẽ nối sau." },
              { label: "AI", value: "Để sau", note: "Giao diện hiện không phụ thuộc AI/RAG; chỉ giữ cấu hình API ở phần cài đặt." },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-white">{item.value}</p>
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-orange-700">{item.label}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{item.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="enterprise-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Kho dữ liệu dự án</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Kho dữ liệu nghiệp vụ</h2>
            </div>
            <Database size={24} className="text-orange-500" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dataLakeGroups.map((group) => (
              <div key={group.name} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:bg-white hover:shadow-md">
                <p className="text-2xl font-black text-slate-950">{group.count}</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.1em] text-orange-600">{group.name}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{group.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="enterprise-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">10 module lõi</p><h2 className="mt-1 text-lg font-black text-slate-950">Kiến trúc vận hành theo đề án</h2></div>
            <FileText size={22} className="text-orange-500" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {operatingModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.id} href={module.href} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-orange-500 group-hover:text-white"><Icon size={18} /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{module.shortTitle}</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-400">Module {module.id} · {module.layer}</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{module.value}</p>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="enterprise-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Dự án cần chú ý</p><h2 className="mt-1 text-lg font-black text-slate-950">Cảnh báo điều hành thi công</h2></div><ShieldCheck size={22} className="text-orange-500" /></div>
          <div className="mt-5 space-y-3">
            {alerts.map((project) => {
              const variance = project.progress - (project.plannedProgress ?? project.progress);
              return <Link href={`/projects/${project.id}`} key={project.id} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/30">
                <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.code} · {project.province} · {project.manager}</p></div><div className="flex gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div></div>
                <div className="mt-3"><div className="mb-1.5 flex justify-between text-xs"><span className="font-bold text-slate-600">Tiến độ</span><span className={variance < -5 ? "font-extrabold text-red-600" : "font-extrabold text-emerald-600"}>{project.progress}% ({variance >= 0 ? "+" : ""}{variance}%)</span></div><ProgressBar value={project.progress} tone={variance < -5 ? "red" : "orange"} /></div>
              </Link>;
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {strategicPillars.map((pillar) => {
          const Icon = pillar.icon;
          return <article key={pillar.title} className="enterprise-card p-5"><Icon size={22} className="text-orange-500" /><p className="mt-4 text-lg font-black text-slate-950">{pillar.title}</p><p className="mt-1 text-sm text-slate-600">{pillar.subtitle}</p><p className="mt-4 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">{pillar.metric}</p></article>;
        })}
      </section>

      <section className="enterprise-card p-5 sm:p-6">
        <div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Thi công hôm nay</p><h2 className="mt-1 text-lg font-black text-slate-950">Gói việc đang chạy ngoài công trường</h2></div><CheckCircle2 size={22} className="text-orange-500" /></div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-3 py-3">Gói việc</th><th className="px-3 py-3">Dự án</th><th className="px-3 py-3">Đội phụ trách</th><th className="px-3 py-3">Kế hoạch</th><th className="px-3 py-3">Thực tế</th><th className="px-3 py-3">Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {constructionTasks.slice(0, 5).map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80"><td className="px-3 py-4 font-extrabold text-slate-900">{task.package}</td><td className="px-3 py-4 text-slate-600">{task.project}</td><td className="px-3 py-4 text-slate-600">{task.owner}</td><td className="px-3 py-4 font-bold text-slate-700">{task.planned}%</td><td className="px-3 py-4 font-bold text-slate-700">{task.actual}%</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${task.status === "late" ? "bg-red-50 text-red-700" : task.status === "warning" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{task.status === "late" ? "Chậm" : task.status === "warning" ? "Cần theo dõi" : "Ổn định"}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HeroMetric({ label, value, caption, progress, tone }: { label: string; value: string; caption: string; progress: number; tone: "orange" | "green" | "blue" | "violet" }) {
  const toneClass = {
    orange: "text-orange-300",
    green: "text-emerald-300",
    blue: "text-sky-300",
    violet: "text-violet-300",
  }[tone];
  const progressTone: "orange" | "green" | "blue" = tone === "violet" ? "blue" : tone;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-black">{value}</p>
        <span className={`text-xs font-bold ${toneClass}`}>{caption}</span>
      </div>
      <div className="mt-4"><ProgressBar value={progress} tone={progressTone} height="h-1.5" /></div>
    </div>
  );
}
