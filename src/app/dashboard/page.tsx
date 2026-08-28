"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  FolderKanban,
  HardHat,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Project } from "../../data/projects";
import { fetchProjectsFromDataCenter } from "../../lib/projectData";

type Tone = "green" | "yellow" | "red" | "blue";

type OperatingRow = {
  project: Project;
  target: number;
  variance: number;
  status: string;
  tone: Tone;
};

const panelClass =
  "rounded-2xl border border-[#1f3b57] bg-[#0c2236]/95 shadow-[0_18px_45px_rgba(0,0,0,0.2)]";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    const sync = () => fetchProjectsFromDataCenter().then(setProjects).catch(() => setProjects([]));
    sync();
    setToday(
      new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    );
    window.addEventListener("licogi-data-imported", sync);
    window.addEventListener("licogi-projects-updated", sync);
    return () => {
      window.removeEventListener("licogi-data-imported", sync);
      window.removeEventListener("licogi-projects-updated", sync);
    };
  }, []);

  const metrics = useMemo(() => {
    const ongoing = projects.filter((project) => project.status === "ongoing");
    const completed = projects.filter((project) => project.status === "completed");
    const warranty = projects.filter((project) => project.status === "warranty");
    const highRisk = ongoing.filter((project) => project.risk === "high");
    const delayed = ongoing.filter(
      (project) => project.progress < (project.plannedProgress ?? project.progress) - 5,
    );
    const averageProgress = ongoing.length
      ? Math.round(ongoing.reduce((sum, project) => sum + project.progress, 0) / ongoing.length)
      : 0;
    const averagePlan = ongoing.length
      ? Math.round(
          ongoing.reduce(
            (sum, project) => sum + (project.plannedProgress ?? project.progress),
            0,
          ) / ongoing.length,
        )
      : 0;
    const scored = projects.filter((project) => typeof project.healthScore === "number");
    const averageHealth = scored.length
      ? Math.round(scored.reduce((sum, project) => sum + (project.healthScore ?? 0), 0) / scored.length)
      : 0;

    return {
      ongoing,
      completed,
      warranty,
      highRisk,
      delayed,
      averageProgress,
      averagePlan,
      averageHealth,
    };
  }, [projects]);

  const operatingRows = useMemo<OperatingRow[]>(() => {
    return [...projects]
      .sort((a, b) => {
        const aOngoing = a.status === "ongoing" ? 0 : 1;
        const bOngoing = b.status === "ongoing" ? 0 : 1;
        if (aOngoing !== bOngoing) return aOngoing - bOngoing;
        const aVariance = a.progress - (a.plannedProgress ?? a.progress);
        const bVariance = b.progress - (b.plannedProgress ?? b.progress);
        return aVariance - bVariance;
      })
      .slice(0, 8)
      .map((project) => {
        const target = project.plannedProgress ?? project.progress;
        const variance = project.progress - target;
        if (project.status === "completed") {
          return { project, target, variance, status: "Hoàn thành", tone: "green" };
        }
        if (project.status === "warranty") {
          return { project, target, variance, status: "Bảo hành", tone: "blue" };
        }
        if (variance < -5) {
          return { project, target, variance, status: "Chậm", tone: "red" };
        }
        if (variance < 0) {
          return { project, target, variance, status: "Theo dõi", tone: "yellow" };
        }
        return { project, target, variance, status: "Tốt", tone: "green" };
      });
  }, [projects]);

  const alertProjects = useMemo(() => {
    return metrics.ongoing
      .filter((project) => {
        const target = project.plannedProgress ?? project.progress;
        return (
          project.risk === "high" ||
          project.progress < target - 3 ||
          (project.healthScore ?? 100) < 70
        );
      })
      .sort((a, b) => {
        const aVariance = a.progress - (a.plannedProgress ?? a.progress);
        const bVariance = b.progress - (b.plannedProgress ?? b.progress);
        return aVariance - bVariance;
      })
      .slice(0, 5);
  }, [metrics.ongoing]);

  const progressTone: Tone =
    metrics.averageProgress >= metrics.averagePlan
      ? "green"
      : metrics.averagePlan - metrics.averageProgress <= 5
        ? "yellow"
        : "red";
  const healthTone: Tone =
    metrics.averageHealth >= 80 ? "green" : metrics.averageHealth >= 65 ? "yellow" : "red";
  const riskTone: Tone = metrics.highRisk.length === 0 ? "green" : "red";

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#142d44] bg-[#061729] text-slate-100 shadow-[0_28px_80px_rgba(2,12,24,0.35)]">
      <div className="border-b border-[#173550] bg-[#081d31] px-4 py-4 sm:px-5 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-sm font-black text-orange-300 shadow-[0_0_28px_rgba(249,115,22,0.16)]">
              L18.3
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">
                LICOGI 18.3
              </p>
              <p className="mt-1 text-sm font-bold text-slate-300">Trung tâm điều hành số</p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-black uppercase tracking-[0.08em] text-white sm:text-2xl xl:text-[28px]">
              Điều hành hoạt động & tăng trưởng 2026
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Dashboard tổng hợp tiến độ dự án, rủi ro và chỉ đạo điều hành
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-sm font-black text-white">{today || "--/--/----"}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Ban điều hành LICOGI 18.3
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5 lg:p-6">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Tiến độ thi công"
            value={`${metrics.averageProgress}%`}
            subline={`Kế hoạch bình quân: ${metrics.averagePlan}%`}
            status={
              progressTone === "green" ? "TỐT" : progressTone === "yellow" ? "THEO DÕI" : "CHẬM"
            }
            tone={progressTone}
            icon={<HardHat size={18} />}
            href="/projects"
          />
          <KpiCard
            title="Project Health"
            value={`${metrics.averageHealth}/100`}
            subline={`${projects.length} dự án trong Trung tâm dữ liệu`}
            status={healthTone === "green" ? "TỐT" : healthTone === "yellow" ? "TRUNG BÌNH" : "CẦN XỬ LÝ"}
            tone={healthTone}
            icon={<ShieldCheck size={18} />}
            href="/projects"
          />
          <KpiCard
            title="Dự án đang thi công"
            value={String(metrics.ongoing.length)}
            subline={`${metrics.completed.length} hoàn thành · ${metrics.warranty.length} bảo hành`}
            status="ĐANG VẬN HÀNH"
            tone="blue"
            icon={<FolderKanban size={18} />}
            href="/projects"
          />
          <KpiCard
            title="Cảnh báo rủi ro"
            value={String(metrics.highRisk.length + metrics.delayed.length)}
            subline={`${metrics.highRisk.length} rủi ro cao · ${metrics.delayed.length} dự án chậm`}
            status={riskTone === "green" ? "ỔN ĐỊNH" : "CẢNH BÁO"}
            tone={riskTone}
            icon={<AlertTriangle size={18} />}
            href="/projects"
          />
        </section>

        <section className="grid gap-4 2xl:grid-cols-[1.65fr_0.8fr_0.95fr]">
          <article className={panelClass}>
            <PanelTitle
              icon={<HardHat size={17} />}
              title="Bảng điều hành dự án"
              aside={`${operatingRows.length}/${projects.length || 0} dự án hiển thị`}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-y border-[#1c3a55] bg-[#0a1d30] text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5">STT</th>
                    <th className="px-3 py-2.5">Dự án</th>
                    <th className="px-3 py-2.5 text-center">KH lũy kế</th>
                    <th className="px-3 py-2.5 text-center">Thực tế</th>
                    <th className="px-3 py-2.5 text-center">Trạng thái</th>
                    <th className="px-3 py-2.5 text-right">Cần tăng tốc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14314a]">
                  {operatingRows.map((row, index) => {
                    const acceleration = Math.max(0, row.target - row.project.progress);
                    return (
                      <tr key={row.project.id} className="transition hover:bg-white/[0.025]">
                        <td className="px-3 py-3 font-black text-slate-500">{index + 1}</td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/projects/${row.project.id}`}
                            className="block max-w-[330px] truncate font-extrabold text-slate-100 hover:text-orange-300"
                          >
                            {row.project.name}
                          </Link>
                          <p className="mt-1 max-w-[330px] truncate text-[10px] font-semibold text-slate-500">
                            {row.project.code || "Chưa có mã"} · {row.project.province}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-center font-black text-slate-300">{row.target}%</td>
                        <td className="px-3 py-3 text-center font-black text-white">{row.project.progress}%</td>
                        <td className="px-3 py-3 text-center">
                          <StatusPill tone={row.tone}>{row.status}</StatusPill>
                        </td>
                        <td className="px-3 py-3 text-right font-black">
                          <span className={acceleration > 0 ? "text-orange-300" : "text-slate-600"}>
                            {acceleration > 0 ? `+${acceleration}%` : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!operatingRows.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                        Chưa có dữ liệu dự án. Import dữ liệu tại Trung tâm dữ liệu để Dashboard tự động cập nhật.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className={panelClass}>
            <PanelTitle
              icon={<AlertTriangle size={17} />}
              title="Cảnh báo điều hành"
              aside={`${alertProjects.length} cảnh báo`}
            />
            <div className="space-y-2 p-3">
              {alertProjects.map((project) => {
                const target = project.plannedProgress ?? project.progress;
                const gap = Math.max(0, target - project.progress);
                const severe = project.risk === "high" || gap > 8;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group block rounded-xl border border-[#173550] bg-[#091b2d] p-3 transition hover:border-orange-400/35 hover:bg-[#0c2236]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                          severe
                            ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                            : "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)]"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-black leading-5 text-slate-100">
                          {project.name}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          {gap > 0 ? `Chậm ${gap}% so với kế hoạch` : "Điểm sức khỏe cần theo dõi"}
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-orange-300 transition group-hover:translate-x-0.5">
                        XEM
                      </span>
                    </div>
                  </Link>
                );
              })}
              {!alertProjects.length && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 size={17} />
                    <p className="text-xs font-black">Không có cảnh báo ưu tiên</p>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Hệ thống sẽ tự hiển thị dự án chậm tiến độ, rủi ro cao hoặc health score thấp.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className={panelClass}>
            <PanelTitle icon={<Database size={17} />} title="So sánh tiến độ" aside="KH / Thực tế" />
            <div className="p-3">
              <ProgressLineChart rows={operatingRows.filter((row) => row.project.status === "ongoing").slice(0, 6)} />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-5 border-t border-dashed border-slate-300" /> Kế hoạch
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-5 bg-orange-400" /> Thực tế
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_1.35fr]">
          <article className={panelClass}>
            <PanelTitle icon={<ShieldCheck size={17} />} title="Đánh giá điều hành" aside="Theo tiến độ & sức khỏe" />
            <div className="divide-y divide-[#16334c] p-3 pt-1">
              {operatingRows.slice(0, 5).map((row) => {
                const health = row.project.healthScore ?? 0;
                const score = Math.max(-3, Math.min(3, Math.round(row.variance / 4) + (health >= 80 ? 1 : health < 65 ? -1 : 0)));
                return (
                  <div key={row.project.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-100">{row.project.name}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">
                        {row.project.manager || row.project.contractorUnit || "Chưa phân công phụ trách"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black ${
                          score > 0 ? "text-emerald-300" : score < 0 ? "text-red-300" : "text-slate-400"
                        }`}
                      >
                        {score > 0 ? `+${score}` : score} điểm
                      </span>
                      <StatusPill tone={row.tone}>{row.status}</StatusPill>
                    </div>
                  </div>
                );
              })}
              {!operatingRows.length && (
                <p className="px-2 py-8 text-center text-xs font-semibold text-slate-500">
                  Chưa có dữ liệu để chấm điểm điều hành.
                </p>
              )}
            </div>
          </article>

          <article className={panelClass}>
            <PanelTitle icon={<UsersRound size={17} />} title="Chỉ đạo điều hành" aside="Gợi ý theo dữ liệu hiện tại" />
            <div className="grid gap-3 p-3 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-2">
                {alertProjects.slice(0, 4).map((project, index) => {
                  const target = project.plannedProgress ?? project.progress;
                  const gap = Math.max(0, target - project.progress);
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-start gap-3 rounded-xl border border-[#173550] bg-[#091b2d] p-3 transition hover:border-orange-400/30"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-400/10 text-[10px] font-black text-orange-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-100">
                          {gap > 0 ? `Yêu cầu cập nhật phương án bù ${gap}% tiến độ` : "Rà soát nguyên nhân cảnh báo sức khỏe dự án"}
                        </p>
                        <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">{project.name}</p>
                      </div>
                      <ArrowRight size={14} className="mt-0.5 shrink-0 text-orange-300" />
                    </Link>
                  );
                })}
                {!alertProjects.length && (
                  <div className="rounded-xl border border-[#173550] bg-[#091b2d] p-4">
                    <p className="text-xs font-black text-slate-200">Chưa phát sinh chỉ đạo ưu tiên.</p>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      Khi có dự án chậm hoặc rủi ro cao, hệ thống sẽ đề xuất nội dung cần xử lý tại đây.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#173550] bg-[#081a2b] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Tổng quan danh mục</p>
                <div className="mt-3 space-y-3">
                  <MiniSummary label="Đang thi công" value={metrics.ongoing.length} tone="blue" />
                  <MiniSummary label="Hoàn thành" value={metrics.completed.length} tone="green" />
                  <MiniSummary label="Bảo hành" value={metrics.warranty.length} tone="yellow" />
                  <MiniSummary label="Cần ưu tiên" value={alertProjects.length} tone={alertProjects.length ? "red" : "green"} />
                </div>
                <div className="mt-4 grid gap-2">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-between rounded-lg border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-[11px] font-black text-orange-200 transition hover:bg-orange-400/15"
                  >
                    Mở danh mục dự án <ArrowRight size={13} />
                  </Link>
                  <Link
                    href="/data"
                    className="inline-flex items-center justify-between rounded-lg border border-[#28465f] bg-white/[0.025] px-3 py-2 text-[11px] font-black text-slate-300 transition hover:bg-white/[0.05]"
                  >
                    Trung tâm dữ liệu <Database size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <FooterSignal
            label="Dữ liệu đồng bộ"
            value={`${projects.length} dự án`}
            note="Tự cập nhật khi import/chỉnh sửa dữ liệu"
            icon={<Database size={18} />}
          />
          <FooterSignal
            label="Tiến độ cần bù"
            value={`${metrics.delayed.length} dự án`}
            note="Ngưỡng chậm lớn hơn 5% so với kế hoạch"
            icon={<AlertTriangle size={18} />}
          />
          <FooterSignal
            label="Điều hành hiện trường"
            value={`${metrics.ongoing.length} dự án`}
            note="Theo dõi trực tiếp từ danh mục đang thi công"
            icon={<HardHat size={18} />}
          />
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subline,
  status,
  tone,
  icon,
  href,
}: {
  title: string;
  value: string;
  subline: string;
  status: string;
  tone: Tone;
  icon: ReactNode;
  href: string;
}) {
  const toneClass = {
    green: {
      value: "text-emerald-300",
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
      glow: "from-emerald-400/12",
    },
    yellow: {
      value: "text-amber-300",
      badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
      glow: "from-amber-400/12",
    },
    red: {
      value: "text-red-300",
      badge: "border-red-400/30 bg-red-400/10 text-red-200",
      glow: "from-red-400/12",
    },
    blue: {
      value: "text-sky-300",
      badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
      glow: "from-sky-400/12",
    },
  }[tone];

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-[#1f3b57] bg-[#0c2236] p-4 transition hover:-translate-y-0.5 hover:border-orange-400/30"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClass.glow} via-transparent to-transparent`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.07em] text-slate-300">{title}</p>
          <p className={`mt-1 text-3xl font-black leading-none ${toneClass.value}`}>{value}</p>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl border ${toneClass.badge}`}>{icon}</span>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-3">
        <p className="text-[10px] font-semibold leading-4 text-slate-500">{subline}</p>
        <span className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-black ${toneClass.badge}`}>{status}</span>
      </div>
    </Link>
  );
}

function PanelTitle({ icon, title, aside }: { icon: ReactNode; title: string; aside: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#1c3a55] px-3 py-2.5">
      <div className="flex items-center gap-2 text-slate-100">
        <span className="text-orange-300">{icon}</span>
        <h2 className="text-xs font-black uppercase tracking-[0.05em]">{title}</h2>
      </div>
      <span className="text-[10px] font-bold text-slate-500">{aside}</span>
    </div>
  );
}

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const classes = {
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    yellow: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
    blue: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  }[tone];
  return <span className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-black ${classes}`}>{children}</span>;
}

function ProgressLineChart({ rows }: { rows: OperatingRow[] }) {
  const width = 390;
  const height = 180;
  const left = 34;
  const right = 12;
  const top = 12;
  const bottom = 28;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const data = rows.length
    ? rows
    : [
        {
          project: {
            id: -1,
            name: "Chưa có dữ liệu",
            type: "Công nghiệp",
            status: "ongoing",
            investor: "",
            province: "",
            valueRange: "",
            progress: 0,
            lat: 0,
            lng: 0,
          } as Project,
          target: 0,
          variance: 0,
          status: "Theo dõi",
          tone: "yellow" as Tone,
        },
      ];

  const xFor = (index: number) =>
    left + (data.length === 1 ? plotWidth / 2 : (index * plotWidth) / (data.length - 1));
  const yFor = (value: number) => top + ((100 - Math.max(0, Math.min(100, value))) / 100) * plotHeight;
  const actualPoints = data.map((row, index) => `${xFor(index)},${yFor(row.project.progress)}`).join(" ");
  const targetPoints = data.map((row, index) => `${xFor(index)},${yFor(row.target)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" role="img" aria-label="Biểu đồ kế hoạch và tiến độ thực tế">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke="#1d3a55" strokeWidth="1" />
            <text x={left - 7} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b">
              {tick}%
            </text>
          </g>
        );
      })}
      <polyline
        points={targetPoints}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeDasharray="6 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={actualPoints}
        fill="none"
        stroke="#fb923c"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((row, index) => (
        <g key={row.project.id}>
          <circle cx={xFor(index)} cy={yFor(row.project.progress)} r="3.5" fill="#fb923c" />
          <text x={xFor(index)} y={height - 9} textAnchor="middle" fontSize="8" fill="#64748b">
            {row.project.code?.slice(0, 8) || `DA${index + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MiniSummary({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  const toneClass = {
    green: "bg-emerald-400",
    yellow: "bg-amber-400",
    red: "bg-red-400",
    blue: "bg-sky-400",
  }[tone];
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="flex items-center gap-2 font-semibold text-slate-400">
        <span className={`h-2 w-2 rounded-full ${toneClass}`} /> {label}
      </span>
      <span className="font-black text-slate-100">{String(value).padStart(2, "0")}</span>
    </div>
  );
}

function FooterSignal({ label, value, note, icon }: { label: string; value: string; note: string; icon: ReactNode }) {
  return (
    <article className="rounded-xl border border-[#1f3b57] bg-[#0a2033] p-3.5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-400/20 bg-orange-400/10 text-orange-300">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
          <p className="mt-0.5 text-lg font-black text-slate-100">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-500">{note}</p>
    </article>
  );
}
