"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CircleAlert,
  Factory,
  FolderKanban,
  HardHat,
  MapPinned,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { Project, ProjectType } from "../../data/projects";
import { fetchProjectsFromDataCenter } from "../../lib/projectData";

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

const panel =
  "rounded-[20px] border border-[#17314a] bg-[linear-gradient(180deg,rgba(9,28,48,0.98)_0%,rgba(7,22,39,0.96)_100%)] shadow-[0_18px_55px_rgba(0,0,0,0.28)]";

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
    const valueTotal = Math.round(
      projects.reduce((sum, item) => sum + parseValueRange(item.valueRange), 0),
    );
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
      valueTotal,
    };
  }, [projects]);

  const rows = useMemo<DashboardRow[]>(() => {
    return [...projects]
      .sort((a, b) => {
        const ag = (a.plannedProgress ?? a.progress) - a.progress;
        const bg = (b.plannedProgress ?? b.progress) - b.progress;
        return bg - ag;
      })
      .slice(0, 10)
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
                  ? "Trung bình"
                  : "Tốt";
        return { project, plan, actual, gap, delta, tone, status };
      });
  }, [projects]);

  const alerts = rows
    .filter((row) => row.project.status === "ongoing" && (row.gap > 0 || row.project.risk === "high"))
    .slice(0, 5);
  const chartRows = rows.filter((row) => row.project.status === "ongoing").slice(0, 6);
  const provinceStats = topCounts(projects.map((item) => item.province));
  const typeStats = topCounts(projects.map((item) => item.type));
  const progressTone: Tone =
    metrics.averageActual >= metrics.averagePlan
      ? "green"
      : metrics.averagePlan - metrics.averageActual <= 5
        ? "yellow"
        : "red";
  const healthTone: Tone =
    metrics.averageHealth >= 80 ? "green" : metrics.averageHealth >= 65 ? "yellow" : "red";

  return (
    <div className="space-y-4 rounded-[28px] border border-[#11253a] bg-[#051523] p-4 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-5 lg:p-6">
      <section className="rounded-[24px] border border-[#17304a] bg-[radial-gradient(circle_at_top,rgba(17,42,70,0.9),rgba(5,21,35,0.98)_58%)] px-4 py-4 sm:px-5 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-orange-300/30 bg-orange-400/10 shadow-[0_0_28px_rgba(251,146,60,0.2)]">
              <Factory size={26} className="text-orange-300" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">LICOGI 18.3</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">Trung tâm điều hành số</p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-black uppercase tracking-[0.08em] text-[#f2d28b] sm:text-2xl xl:text-[32px]">
              Điều hành tăng trưởng LICOGI 18.3 năm 2026
            </h1>
            <p className="mt-1 text-xs font-semibold tracking-[0.04em] text-slate-400">
              Dashboard chi tiết theo phong cách trung tâm điều hành, bám theo dữ liệu thật từ hệ thống dự án
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-lg font-black text-white">{today || "--/--/----"}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Ban điều hành tổng công ty</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<HardHat size={20} />} title="Tiến độ thi công" value={`${metrics.averageActual}%`} subtitle={`Kế hoạch bình quân ${metrics.averagePlan}% · Cần bù ${Math.max(0, metrics.averagePlan - metrics.averageActual)}%`} status={progressTone === "green" ? "TỐT" : progressTone === "yellow" ? "TRUNG BÌNH" : "CHẬM"} tone={progressTone} href="/projects" />
        <KpiCard icon={<TrendingUp size={20} />} title="Giá trị danh mục" value={`${metrics.valueTotal} tỷ`} subtitle={`Ước tính từ valueRange của ${projects.length} dự án`} status={projects.length ? "ĐÃ CÓ DỮ LIỆU" : "CHỜ NHẬP"} tone={projects.length ? "green" : "yellow"} href="/projects" />
        <KpiCard icon={<UsersRound size={20} />} title="Công suất điều hành" value={`${metrics.ongoing.length} DA`} subtitle={`${metrics.completed.length} hoàn thành · ${metrics.warranty.length} bảo hành`} status={metrics.ongoing.length ? "ĐANG THEO DÕI" : "CHƯA CÓ"} tone="blue" href="/projects" />
        <KpiCard icon={<ShieldCheck size={20} />} title="Project Health" value={`${metrics.averageHealth}/100`} subtitle={`${metrics.highRisk.length} rủi ro cao · ${metrics.mediumRisk.length} trung bình`} status={healthTone === "green" ? "TỐT" : healthTone === "yellow" ? "TRUNG BÌNH" : "CẦN XỬ LÝ"} tone={healthTone} href="/projects" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_0.78fr_0.9fr]">
        <article className={panel}>
          <PanelHeader icon={<Trophy size={16} />} title="Bảng điều hành các dự án" note={`${rows.length} dự án ưu tiên`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="border-y border-[#17314a] bg-[#081b2d] text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-3 py-2.5">STT</th>
                  <th className="px-3 py-2.5">Đơn vị / Dự án</th>
                  <th className="px-3 py-2.5 text-center">Đạt KH lũy kế</th>
                  <th className="px-3 py-2.5 text-center">Thực tế</th>
                  <th className="px-3 py-2.5 text-center">Trạng thái</th>
                  <th className="px-3 py-2.5 text-right">Cần tăng tốc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#143048]">
                {rows.map((row, index) => (
                  <tr key={row.project.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-3 py-3 font-black text-slate-500">{index + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${toneStyles[row.tone].dot}`} />
                        <div className="min-w-0">
                          <Link href={`/projects/${row.project.id}`} className="block truncate font-black text-slate-100 hover:text-orange-300">
                            {row.project.name}
                          </Link>
                          <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                            {row.project.code || "Chưa có mã"} · {row.project.type} · {row.project.province}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-black text-slate-300">{row.plan}%</td>
                    <td className="px-3 py-3 text-center font-black text-white">{row.actual}%</td>
                    <td className="px-3 py-3 text-center"><StatusPill tone={row.tone}>{row.status}</StatusPill></td>
                    <td className="px-3 py-3 text-right font-black"><span className={row.gap > 0 ? "text-orange-300" : "text-slate-600"}>{row.gap > 0 ? `+${row.gap}%` : "—"}</span></td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">Chưa có dữ liệu dự án. Hãy import dữ liệu vào Trung tâm dữ liệu để dashboard tự động dựng chi tiết.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<BellRing size={16} />} title="Cảnh báo điều hành" note={`${alerts.length} nội dung`} />
          <div className="space-y-2 p-3">
            {alerts.map((row) => (
              <Link key={row.project.id} href={`/projects/${row.project.id}`} className="grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-2.5 transition hover:border-orange-400/30 hover:bg-[#0b2136]">
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${toneStyles[row.tone].dot}`} />
                <div className="min-w-0">
                  <p className="text-xs font-black leading-5 text-slate-100">{row.project.name}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{row.gap > 0 ? `Chậm ${row.gap}% · Cần tăng tốc` : `Rủi ro ${row.project.risk || "thấp"}`}</p>
                </div>
                <span className="text-[10px] font-black text-[#f6ce73]">[XEM]</span>
              </Link>
            ))}
            {!alerts.length && <EmptyBox text="Chưa có dự án cần cảnh báo ưu tiên." />}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<BarChart3 size={16} />} title="Diễn biến thực hiện" note="Kế hoạch / thực hiện" />
          <div className="p-3">
            <TrendChart rows={chartRows} />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t border-dashed border-slate-300" /> Kế hoạch</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-orange-400" /> Thực hiện</span>
            </div>
            <div className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 py-2 text-center text-xs font-black text-red-300">Đang chậm: {metrics.delayed.length} dự án</div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1.15fr_0.8fr]">
        <article className={panel}>
          <PanelHeader icon={<Target size={16} />} title="Đánh giá điều hành" note="Theo tiến độ & sức khỏe" />
          <div className="space-y-2 p-3">
            {rows.slice(0, 5).map((row) => {
              const score = Math.max(-3, Math.min(3, Math.round(row.delta / 4) + ((row.project.healthScore ?? 80) >= 80 ? 1 : (row.project.healthScore ?? 80) < 65 ? -1 : 0)));
              return (
                <div key={row.project.id} className="grid gap-2 rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-100">{row.project.name}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">{row.project.manager || row.project.contractorUnit || "Chưa gán đơn vị phụ trách"}</p>
                  </div>
                  <span className={`text-xs font-black ${score > 0 ? "text-emerald-300" : score < 0 ? "text-red-300" : "text-slate-400"}`}>{score > 0 ? `+${score}` : score} điểm</span>
                  <StatusPill tone={row.tone}>{row.status}</StatusPill>
                </div>
              );
            })}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<CircleAlert size={16} />} title="Chỉ đạo điều hành" note="Gợi ý từ dữ liệu" />
          <div className="space-y-2 p-3">
            {alerts.map((row, index) => (
              <div key={row.project.id} className={`rounded-xl border border-white/5 ${toneStyles[row.tone].soft} p-3`}>
                <div className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-black text-[#f2d28b]">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black leading-5 text-slate-100">{row.gap > 0 ? `Yêu cầu bù ${row.gap}% tiến độ và cập nhật báo cáo trong ngày.` : "Rà soát sức khỏe dự án và phương án kiểm soát rủi ro."}</p>
                    <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">{row.project.name}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Phụ trách: {row.project.manager || row.project.contractorUnit || "Đơn vị điều hành"}</p>
                  </div>
                  <StatusPill tone={row.tone}>{row.gap >= 10 ? "Ưu tiên cao" : "Theo dõi"}</StatusPill>
                </div>
              </div>
            ))}
            {!alerts.length && <EmptyBox text="Chưa có chỉ đạo ưu tiên vì dữ liệu hiện tại đang ổn định." />}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<BriefcaseBusiness size={16} />} title="Dữ liệu điều hành" note="Tóm tắt" />
          <div className="grid gap-3 p-3">
            <MiniMetric label="Bao phủ kế hoạch" value={`${projects.length ? Math.round((rows.filter((row) => row.plan > 0).length / projects.length) * 100) : 0}%`} note="Dự án có plannedProgress" tone="blue" />
            <MiniMetric label="Minh chứng" value={String(metrics.totalEvidence)} note="Ảnh + video + hồ sơ" tone="green" />
            <MiniMetric label="Rủi ro thấp" value={String(metrics.safeCount)} note="Dự án ngưỡng an toàn" tone="green" />
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className={panel}>
          <PanelHeader icon={<FolderKanban size={16} />} title="Cơ cấu danh mục" note="Theo loại công trình" />
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            {typeStats.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#17314a] bg-[#091b2d] p-3">
                <p className="text-2xl font-black text-white">{item.count}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.05em] text-orange-300">{item.label}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">Dự án đang có trong danh mục hiện tại</p>
              </div>
            ))}
            {!typeStats.length && <EmptyBox text="Chưa có dữ liệu cơ cấu loại công trình." />}
          </div>
        </article>

        <article className={panel}>
          <PanelHeader icon={<MapPinned size={16} />} title="Địa bàn trọng điểm" note="Theo số lượng dự án" />
          <div className="space-y-2 p-3">
            {provinceStats.map((item, index) => (
              <div key={item.label} className="rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-100">{index + 1}. {item.label}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Địa bàn có nhiều dự án đang theo dõi</p>
                  </div>
                  <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[10px] font-black text-sky-300">{item.count} DA</span>
                </div>
              </div>
            ))}
            {!provinceStats.length && <EmptyBox text="Chưa có dữ liệu địa bàn trọng điểm." />}
          </div>
        </article>
      </section>
    </div>
  );
}

function KpiCard({ icon, title, value, subtitle, status, tone, href }: { icon: ReactNode; title: string; value: string; subtitle: string; status: string; tone: Tone; href: string }) {
  const style = toneStyles[tone];
  return (
    <Link href={href} className="group rounded-[20px] border border-[#17314a] bg-[linear-gradient(180deg,rgba(10,31,52,0.98)_0%,rgba(7,22,39,0.96)_100%)] p-4 shadow-[0_14px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-orange-400/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.07em] text-slate-300">{title}</p>
          <p className={`mt-1 text-4xl font-black leading-none ${style.text}`}>{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl border ${style.badge}`}>{icon}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-[10px] font-semibold leading-4 text-slate-500">{subtitle}</p>
        <span className={`shrink-0 rounded-md border px-2.5 py-1 text-[9px] font-black ${style.badge}`}>{status}</span>
      </div>
    </Link>
  );
}

function PanelHeader({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#163049] px-3 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[#f2d28b]">{icon}</span>
        <h2 className="text-xs font-black uppercase tracking-[0.08em] text-slate-100">{title}</h2>
      </div>
      <span className="text-[10px] font-bold text-slate-500">{note}</span>
    </div>
  );
}

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-black ${toneStyles[tone].badge}`}>{children}</span>;
}

function MiniMetric({ label, value, note, tone }: { label: string; value: string; note: string; tone: Tone }) {
  return (
    <div className={`rounded-xl border border-white/5 ${toneStyles[tone].soft} p-3`}>
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-black ${toneStyles[tone].text}`}>{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return <div className="rounded-xl border border-[#17314a] bg-[#091b2d] px-3 py-4 text-center text-xs font-semibold text-slate-500">{text}</div>;
}

function TrendChart({ rows }: { rows: DashboardRow[] }) {
  const width = 400;
  const height = 200;
  const left = 34;
  const right = 14;
  const top = 12;
  const bottom = 34;
  const items = rows.length
    ? rows
    : [{ project: { id: -1, name: "Chưa có dữ liệu", type: "Công nghiệp" as ProjectType, status: "ongoing", investor: "", province: "", valueRange: "", progress: 0, lat: 0, lng: 0 }, plan: 0, actual: 0, gap: 0, delta: 0, tone: "yellow" as Tone, status: "Trung bình" }];
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = (index: number) => left + (items.length === 1 ? plotWidth / 2 : (index * plotWidth) / (items.length - 1));
  const y = (value: number) => top + ((100 - value) / 100) * plotHeight;
  const actualPoints = items.map((item, index) => `${x(index)},${y(item.actual)}`).join(" ");
  const planPoints = items.map((item, index) => `${x(index)},${y(item.plan)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[210px] w-full" role="img" aria-label="Biểu đồ kế hoạch và thực hiện">
      {[0, 25, 50, 75, 100].map((tick) => {
        const yy = y(tick);
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={yy} y2={yy} stroke="#17314a" strokeWidth="1" />
            <text x={left - 6} y={yy + 3} textAnchor="end" fontSize="9" fill="#64748b">{tick}%</text>
          </g>
        );
      })}
      <polyline points={planPoints} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={actualPoints} fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {items.map((item, index) => (
        <g key={item.project.id}>
          <circle cx={x(index)} cy={y(item.actual)} r="3.5" fill="#fb923c" />
          <text x={x(index)} y={height - 11} textAnchor="middle" fontSize="8" fill="#64748b">{(item.project.code || `DA${index + 1}`).slice(0, 7)}</text>
        </g>
      ))}
    </svg>
  );
}

function topCounts(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

function parseValueRange(range: string) {
  if (!range) return 0;
  const lower = range.toLocaleLowerCase("vi");
  if (lower.includes("trên") || lower.includes("hơn") || lower.includes("hon")) return 500;
  const numbers = lower.match(/\d+/g)?.map((value) => Number(value)) ?? [];
  return numbers[numbers.length - 1] || 0;
}
