"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CloudOff,
  HardHat,
  MapPinned,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Target,
  Truck,
  UsersRound,
} from "lucide-react";

import {
  tailgDirectorAlerts,
  tailgMilestones,
  tailgProgressFields,
  tailgProject,
  tailgTeams,
  type TailgProgressKey,
  type TailgTone,
} from "../../../data/tailg";

const toneClass: Record<TailgTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  yellow: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

const dotClass: Record<TailgTone, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-sky-500",
  slate: "bg-slate-400",
};

type ApiProject = {
  id: string;
  code: string;
  name: string;
  progress: number;
};

type DailyReport = {
  id: string;
  reportDate: string;
  weather?: string | null;
  manpowerCount: number;
  equipmentCount: number;
  workDone: string;
  issues?: string | null;
  safetyNotes?: string | null;
  progress: number;
  metadata?: unknown;
  createdBy?: { name?: string | null } | null;
};

type PlanTask = {
  id: string;
  code: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  progress: number;
  status: string;
  critical: boolean;
};

type TailgApiResponse = {
  ok: boolean;
  message?: string;
  project: ApiProject | null;
  reports: DailyReport[];
  tasks: PlanTask[];
};

type LiveProgress = Record<TailgProgressKey, number | null>;

function metadataRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function baselineProgress(): LiveProgress {
  return Object.fromEntries(tailgProgressFields.map((field) => [field.key, field.baseline])) as LiveProgress;
}

function formatPercent(value: number | null, empty = "Chưa xác nhận") {
  if (value === null || !Number.isFinite(value)) return empty;
  const rounded = Math.round(value * 10) / 10;
  return `${String(rounded).replace(".", ",")}%`;
}

function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function progressTone(value: number | null, good = 90, warn = 1): TailgTone {
  if (value === null) return "slate";
  if (value >= good) return "green";
  if (value >= warn) return "yellow";
  return "red";
}

export default function TailgProjectDashboardPage() {
  const [project, setProject] = useState<ApiProject | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveError, setLiveError] = useState("");

  async function refreshLive() {
    setLoading(true);
    setLiveError("");
    try {
      const response = await fetch("/api/projects/tailg", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json() as TailgApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được nhật ký TAILG.");
      setProject(data.project);
      setReports(Array.isArray(data.reports) ? data.reports : []);
      setPlanTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : "Không tải được dữ liệu live.");
      setProject(null);
      setReports([]);
      setPlanTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshLive();
    const sync = () => void refreshLive();
    window.addEventListener("tailg-progress-updated", sync);
    return () => window.removeEventListener("tailg-progress-updated", sync);
  }, []);

  const latestReport = reports[0] ?? null;
  const latestMetadata = useMemo(() => metadataRecord(latestReport?.metadata), [latestReport]);

  const progress = useMemo<LiveProgress>(() => {
    const base = baselineProgress();
    const saved = metadataRecord(latestMetadata.teamProgress);
    tailgProgressFields.forEach((field) => {
      const value = saved[field.key];
      if (value === "" || value === null || value === undefined) return;
      const parsed = Number(value);
      if (Number.isFinite(parsed)) base[field.key] = Math.max(0, Math.min(100, parsed));
    });
    return base;
  }, [latestMetadata]);

  const x1Average = average([progress.duc_x1, progress.toan_x1, progress.toan_tran_x1, progress.tuan_x1]);
  const x3Average = average([progress.quang_x3, progress.tho_x3]);
  const latestSourceDate = latestReport ? formatDate(latestReport.reportDate) : tailgProject.reportDate;
  const liveConnected = Boolean(project && latestReport);
  const tomorrowPlan = String(latestMetadata.tomorrowPlan || "").trim();
  const coordinationNeeds = String(latestMetadata.coordinationNeeds || "").trim();
  const overallConfirmed = latestMetadata.overallProgressConfirmed === true;

  const activePlanTasks = useMemo(() => {
    if (!planTasks.length) return [];
    const now = Date.now();
    return planTasks
      .filter((task) => {
        const start = task.startDate ? new Date(task.startDate).getTime() : Number.NEGATIVE_INFINITY;
        const end = task.endDate ? new Date(task.endDate).getTime() : Number.POSITIVE_INFINITY;
        return start <= now && end >= now;
      })
      .slice(0, 8);
  }, [planTasks]);

  const alerts = useMemo(() => {
    const result = [...tailgDirectorAlerts];
    if (latestReport?.issues?.trim()) {
      result.unshift({
        title: `Vướng mắc nhật ký ${formatDate(latestReport.reportDate)}`,
        detail: latestReport.issues.trim(),
        tone: "red" as TailgTone,
      });
    }
    if (coordinationNeeds) {
      result.unshift({
        title: "Nhu cầu Ban điều hành phối hợp",
        detail: coordinationNeeds,
        tone: "yellow" as TailgTone,
      });
    }
    return result.slice(0, 6);
  }, [coordinationNeeds, latestReport]);

  const workfronts = [
    {
      id: "factory1",
      label: "Xưởng 1",
      value: x1Average,
      sublabel: "Bình quân 4 phân khu",
      detail: `Đức ${formatPercent(progress.duc_x1)} · Toán ${formatPercent(progress.toan_x1)} · Toãn ${formatPercent(progress.toan_tran_x1)} · Tuần ${formatPercent(progress.tuan_x1)}`,
      tone: progressTone(x1Average, 90, 80),
    },
    {
      id: "factory2",
      label: "Xưởng 2",
      value: progress.duc_x2,
      sublabel: "Bùi Văn Đức phụ trách",
      detail: "Mặt trận Xưởng 2 thuộc giai đoạn 2; móng Xưởng 2+3 theo master schedule kết thúc 08/11/2026.",
      tone: progressTone(progress.duc_x2, 70, 1),
    },
    {
      id: "factory3",
      label: "Xưởng 3",
      value: x3Average,
      sublabel: "Quang 1/2 · Thọ 1/2",
      detail: `Quang ${formatPercent(progress.quang_x3)} · Thọ ${formatPercent(progress.tho_x3)}. Không gộp với Xưởng 2 khi chưa có trọng số khối lượng.`,
      tone: progressTone(x3Average, 60, 1),
    },
    {
      id: "parking",
      label: "Nhà xe",
      value: progress.quang_parking_foundation,
      sublabel: "Đài móng · Nguyễn Ánh Quang",
      detail: `Dầm móng ${formatPercent(progress.quang_parking_beam)} · Cột ${formatPercent(progress.quang_parking_column)}. Snapshot gốc: 38/44 đài móng.`,
      tone: progressTone(progress.quang_parking_foundation, 80, 40),
    },
    {
      id: "infrastructure",
      label: "Hạ tầng",
      value: progress.tho_infrastructure,
      sublabel: "Nguyễn Duy Thọ phụ trách",
      detail: progress.tho_infrastructure === null ? "Chưa có % định lượng được xác nhận; dashboard giữ trạng thái thiếu dữ liệu." : "Đã có % định lượng từ nhật ký live mới nhất.",
      tone: progress.tho_infrastructure === null ? "slate" as TailgTone : progressTone(progress.tho_infrastructure, 70, 1),
    },
  ];

  return (
    <div className="space-y-5 pb-10 animate-fade-up">
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <div className="bg-[#0a2f59] px-5 py-4 text-white sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><HardHat size={24} className="text-amber-300" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-200">IIP · Hệ điều hành dự án</p>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${liveConnected ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-slate-300"}`}>{liveConnected ? "LIVE DB" : "BASELINE"}</span>
                </div>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight sm:text-2xl">{project?.name || tailgProject.name}</h1>
                <p className="mt-1 text-xs font-semibold text-slate-300">Nhà thầu: {tailgProject.contractor} · Dữ liệu hiện trường đến {latestSourceDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void refreshLive()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-white/15"><RefreshCcw size={15} /> Làm mới</button>
              <Link href="/projects/tailg/update" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300"><ClipboardCheck size={15} /> Cập nhật ngày</Link>
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-white/15"><ArrowLeft size={15} /> Danh mục</Link>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <TopKpi label="Đội thi công" value="06" note="Phân trách nhiệm theo mặt bằng" icon={<UsersRound size={17} />} />
          <TopKpi label="Xưởng 1" value={formatPercent(x1Average)} note="Bình quân 4 phân khu" icon={<CheckCircle2 size={17} />} accent="amber" />
          <TopKpi label="Nhân lực" value={latestReport ? String(latestReport.manpowerCount) : "—"} note={latestReport ? `Nhật ký ${latestSourceDate}` : "Chưa có nhật ký live"} icon={<UsersRound size={17} />} />
          <TopKpi label="Thiết bị" value={latestReport ? String(latestReport.equipmentCount) : "—"} note={latestReport ? "Thiết bị hoạt động" : "Chưa có nhật ký live"} icon={<Truck size={17} />} />
          <TopKpi label="Mốc gần nhất" value="07/09" note="Hoàn thành móng Xưởng 1" icon={<CalendarDays size={17} />} accent="red" />
          <TopKpi label="Tiến độ tổng" value={overallConfirmed && latestReport ? `${latestReport.progress}%` : "Chưa gộp"} note={overallConfirmed ? "% tổng đã được xác nhận" : "Không tự tính khi thiếu trọng số"} icon={<Clock3 size={17} />} />
        </div>
      </section>

      {loading ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">Đang đồng bộ nhật ký TAILG...</div> : null}
      {liveError ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"><CloudOff size={17} className="mr-2 inline" />Không lấy được dữ liệu live: {liveError}. Dashboard vẫn hiển thị snapshot đã xác nhận.</div> : null}
      {!project && !loading && !liveError ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Chưa tìm thấy dự án có mã/tên chứa TAILG trong cơ sở dữ liệu. Snapshot vẫn hoạt động; để nhập nhật ký live hãy tạo bản ghi <b>TAILG-VN</b> tại Trung tâm dữ liệu.</div> : null}

      <section className="grid gap-5 xl:grid-cols-[1.38fr_0.82fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<MapPinned size={17} />} eyebrow="Phân khu hiện trường" title="Sơ đồ điều hành 6 đội thi công" note="Số trên sơ đồ ưu tiên nhật ký live; nếu chưa có sẽ dùng snapshot 05/09/2026." />

          <div className="mt-5 grid min-h-[520px] grid-cols-12 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:gap-3 sm:p-3">
            <Zone className="col-span-5 row-span-2" title="XƯỞNG 2" owner="Bùi Văn Đức" progress={formatPercent(progress.duc_x2)} tone={progressTone(progress.duc_x2, 70, 1)} note="Mặt trận móng / ép cọc" />
            <div className="col-span-7 row-span-4 grid grid-cols-2 gap-2 rounded-2xl border-2 border-[#0a2f59] bg-white p-2 sm:gap-3 sm:p-3">
              <Zone title="1/4 XƯỞNG 1" owner="Trần Văn Toãn" progress={formatPercent(progress.toan_tran_x1)} tone={progressTone(progress.toan_tran_x1)} />
              <Zone title="1/4 XƯỞNG 1" owner="Nguyễn Văn Tuần" progress={formatPercent(progress.tuan_x1)} tone={progressTone(progress.tuan_x1)} />
              <Zone title="1/4 XƯỞNG 1" owner="Bùi Văn Đức" progress={formatPercent(progress.duc_x1)} tone={progressTone(progress.duc_x1)} />
              <Zone title="1/4 XƯỞNG 1" owner="Tăng Văn Toán" progress={formatPercent(progress.toan_x1)} tone={progressTone(progress.toan_x1)} />
            </div>

            <div className="col-span-5 row-span-2 grid grid-cols-2 gap-2 rounded-2xl border-2 border-sky-500 bg-white p-2">
              <Zone title="1/2 XƯỞNG 3" owner="Nguyễn Ánh Quang" progress={formatPercent(progress.quang_x3)} tone={progressTone(progress.quang_x3, 60, 1)} />
              <Zone title="1/2 XƯỞNG 3" owner="Nguyễn Duy Thọ" progress={formatPercent(progress.tho_x3)} tone={progressTone(progress.tho_x3, 60, 1)} />
            </div>

            <Zone className="col-span-7 row-span-2" title="NHÀ ĂN · NHÀ XE · BỂ NGẦM · BỂ XLNT" owner="Nguyễn Ánh Quang" progress={`Nhà xe ${formatPercent(progress.quang_parking_foundation)} đài móng`} tone={progressTone(progress.quang_parking_foundation, 80, 40)} note={`Dầm móng ${formatPercent(progress.quang_parking_beam)} · Cột ${formatPercent(progress.quang_parking_column)}`} />
            <Zone className="col-span-5 row-span-2" title="HẠ TẦNG" owner="Nguyễn Duy Thọ" progress={formatPercent(progress.tho_infrastructure)} tone={progress.tho_infrastructure === null ? "slate" : progressTone(progress.tho_infrastructure, 70, 1)} note="Chỉ hiển thị % khi đã có định lượng xác nhận" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
            <Legend tone="green" text="Đang bám tốt" />
            <Legend tone="yellow" text="Đang triển khai / cần tăng tốc" />
            <Legend tone="red" text="0% / chưa mở sản lượng" />
            <Legend tone="slate" text="Thiếu dữ liệu định lượng" />
          </div>
        </article>

        <aside className="space-y-5">
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={<AlertTriangle size={17} />} eyebrow="Director attention" title="Việc cần Ban điều hành xử lý" note="Cảnh báo ảnh/file + vướng mắc từ nhật ký live mới nhất." />
            <div className="mt-4 space-y-3">
              {alerts.map((alert, index) => (
                <div key={`${alert.title}-${index}`} className={`rounded-2xl border p-4 ${toneClass[alert.tone]}`}>
                  <div className="flex items-start gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass[alert.tone]}`} /><div><p className="text-sm font-black">{alert.title}</p><p className="mt-1.5 text-xs font-semibold leading-5 opacity-80">{alert.detail}</p></div></div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#0b1628] p-5 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">Mốc quyết định</p><h2 className="mt-1 text-lg font-black">Móng Xưởng 1 · 07/09/2026</h2></div><Target size={22} className="text-amber-300" /></div>
            <p className="mt-3 text-sm leading-6 text-slate-300">Master schedule quy định công tác móng Xưởng 1 kết thúc 07/09. Dashboard theo dõi riêng 4 phân khu để Ban điều hành thấy chính xác đội nào còn khối lượng.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DarkMetric label="Đức + Toán" value={`${formatPercent(average([progress.duc_x1, progress.toan_x1]))}`} note="bình quân 2 phân khu" />
              <DarkMetric label="Toãn + Tuần" value={`${formatPercent(average([progress.toan_tran_x1, progress.tuan_x1]))}`} note="bình quân 2 phân khu" />
            </div>
          </article>
        </aside>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={<HardHat size={17} />} eyebrow="Tiến độ thực địa" title="Các mặt trận có số liệu xác nhận" note="Không gộp thành % toàn dự án khi chưa có trọng số khối lượng chính thức." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {workfronts.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{formatPercent(item.value)}</p></div><span className={`mt-1 h-3 w-3 rounded-full ${dotClass[item.tone]}`} /></div>
              <p className="mt-2 text-xs font-extrabold text-slate-700">{item.sublabel}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
              <ProgressLine value={item.value ?? 0} tone={item.tone} />
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<UsersRound size={17} />} eyebrow="Responsibility matrix" title="6 đội thi công và ưu tiên hiện tại" note="Trách nhiệm giữ nguyên theo phân công; sản lượng lấy từ nhật ký live nếu đã nhập." />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {tailgTeams.map((team, index) => {
              const liveNotes = teamProgressNotes(team.id, progress);
              return <article key={team.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.035)]">
                <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0a2f59] text-xs font-black text-white">{index + 1}</span><div><p className="text-sm font-black text-slate-950">{team.leader}</p><p className="mt-0.5 text-[11px] font-bold text-slate-400">Đội thi công {index + 1}</p></div></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${toneClass[team.tone]}`}>{team.shortName}</span></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Phụ trách</p><div className="mt-2 space-y-1.5">{team.responsibility.map((item) => <p key={item} className="text-xs font-extrabold text-slate-700">• {item}</p>)}</div></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Sản lượng hiện tại</p><div className="mt-2 space-y-1.5">{liveNotes.map((item) => <p key={item} className="text-xs font-extrabold text-slate-700">• {item}</p>)}</div></div></div>
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3"><p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">Ưu tiên điều hành</p><p className="mt-1 text-xs font-semibold leading-5 text-amber-950/80">{team.priority}</p></div>
              </article>;
            })}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle icon={<CalendarDays size={17} />} eyebrow="Master schedule" title="Mốc tiến độ phải bám" note="Trích từ biểu tiến độ thi công TAILG." />
            <div className="mt-5 space-y-3">
              {tailgMilestones.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-slate-950">{item.label}</p><p className="mt-1 text-xs font-semibold text-slate-500">{item.scope}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.status === "active" ? "bg-amber-50 text-amber-700" : item.status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status === "active" ? "ĐANG CHẠY" : item.status === "done" ? "XONG" : "SẮP TỚI"}</span></div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-slate-600"><span>{item.start}</span><span>→</span><span>{item.finish}</span></div>
                  {item.note ? <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p> : null}
                </div>
              ))}
            </div>
          </article>

          {activePlanTasks.length ? <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={<Building2 size={17} />} eyebrow="WBS live" title="Công việc đang chạy trong hệ thống" note="Đọc trực tiếp từ PlanTask của dự án TAILG." /><div className="mt-4 space-y-2">{activePlanTasks.map((task) => <div key={task.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-slate-900">{task.code} · {task.name}</p><p className="mt-1 text-[11px] text-slate-500">{formatDate(task.startDate)} → {formatDate(task.endDate)}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${task.critical ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{task.progress}%</span></div></div>)}</div></article> : null}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<ClipboardCheck size={17} />} eyebrow="Nhật ký hiện trường" title={latestReport ? `Báo cáo mới nhất · ${latestSourceDate}` : "Chưa có báo cáo live"} note={latestReport?.createdBy?.name ? `Người cập nhật: ${latestReport.createdBy.name}` : "Nhập tại Cập nhật ngày để dashboard chuyển từ baseline sang dữ liệu thật."} />
          {latestReport ? <div className="mt-5 grid gap-3 sm:grid-cols-2"><ReportBox label="Công việc đã thực hiện" value={latestReport.workDone} /><ReportBox label="Vướng mắc" value={latestReport.issues || "Không ghi nhận trong báo cáo này."} tone={latestReport.issues ? "red" : "green"} /><ReportBox label="An toàn / QA-QC" value={latestReport.safetyNotes || "Không ghi nhận nội dung bất thường."} tone={latestReport.safetyNotes ? "yellow" : "green"} /><ReportBox label="Kế hoạch ngày mai" value={tomorrowPlan || "Chưa nhập."} /><ReportBox label="Thời tiết" value={latestReport.weather || "Chưa nhập."} /><ReportBox label="Nguồn lực" value={`${latestReport.manpowerCount} nhân lực · ${latestReport.equipmentCount} thiết bị hoạt động`} /></div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><ClipboardCheck className="mx-auto text-slate-300" size={30} /><p className="mt-3 text-sm font-black text-slate-800">Chưa có DailyReport cho TAILG</p><Link href="/projects/tailg/update" className="mt-4 inline-flex rounded-xl bg-[#0a2f59] px-4 py-2.5 text-xs font-black text-white">Nhập báo cáo đầu tiên</Link></div>}
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<ShieldAlert size={17} />} eyebrow="Control rules" title="Nguyên tắc điều hành dữ liệu" note="Để dashboard không đẹp nhưng sai." />
          <div className="mt-5 space-y-3">
            <Rule icon={<CheckCircle2 size={17} />} title="Số thật ưu tiên số minh họa" text="Nhật ký live ghi đè snapshot theo đúng từng mặt trận, không sửa mất baseline nguồn." tone="green" />
            <Rule icon={<ShieldCheck size={17} />} title="Không tự gộp % toàn dự án" text="Chỉ hiển thị tiến độ tổng khi người cập nhật xác nhận có trọng số/tỷ lệ chính thức." tone="blue" />
            <Rule icon={<AlertTriangle size={17} />} title="Thiếu dữ liệu phải hiện thiếu" text="Hạ tầng và các hạng mục chưa có định lượng giữ trạng thái Chưa xác nhận thay vì tự đặt 0%." tone="yellow" />
          </div>
        </article>
      </section>
    </div>
  );
}

function teamProgressNotes(teamId: string, progress: LiveProgress) {
  if (teamId === "duc") return [`Xưởng 1: ${formatPercent(progress.duc_x1)}`, `Xưởng 2: ${formatPercent(progress.duc_x2)}`];
  if (teamId === "toan") return [`Xưởng 1: ${formatPercent(progress.toan_x1)}`];
  if (teamId === "toan-tran") return [`Xưởng 1: ${formatPercent(progress.toan_tran_x1)}`];
  if (teamId === "tuan") return [`Xưởng 1: ${formatPercent(progress.tuan_x1)}`];
  if (teamId === "quang") return [`Xưởng 3: ${formatPercent(progress.quang_x3)}`, `Đài móng nhà xe: ${formatPercent(progress.quang_parking_foundation)}`, `Dầm móng nhà xe: ${formatPercent(progress.quang_parking_beam)}`, `Cột nhà xe: ${formatPercent(progress.quang_parking_column)}`];
  return [`Xưởng 3: ${formatPercent(progress.tho_x3)}`, `Hạ tầng: ${formatPercent(progress.tho_infrastructure)}`];
}

function TopKpi({ label, value, note, icon, accent = "blue" }: { label: string; value: string; note: string; icon: ReactNode; accent?: "blue" | "amber" | "red" }) {
  const color = accent === "red" ? "text-red-600" : accent === "amber" ? "text-amber-600" : "text-sky-700";
  return <div className="bg-white p-4"><div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.09em] ${color}`}>{icon}{label}</div><p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{note}</p></div>;
}

function SectionTitle({ icon, eyebrow, title, note }: { icon: ReactNode; eyebrow: string; title: string; note: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">{icon}</span><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p><h2 className="mt-1 text-lg font-black text-slate-950">{title}</h2><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{note}</p></div></div>;
}

function Zone({ className = "", title, owner, progress, tone, note }: { className?: string; title: string; owner: string; progress: string; tone: TailgTone; note?: string }) {
  return <div className={`${className} flex min-h-[112px] flex-col justify-between rounded-xl border p-3 ${toneClass[tone]}`}><div><p className="text-[10px] font-black uppercase tracking-[0.08em] opacity-70">{title}</p><p className="mt-1 text-sm font-black">{owner}</p></div><div><p className="mt-3 text-xl font-black">{progress}</p>{note ? <p className="mt-1 text-[10px] font-semibold leading-4 opacity-75">{note}</p> : null}</div></div>;
}

function Legend({ tone, text }: { tone: TailgTone; text: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${dotClass[tone]}`} />{text}</span>;
}

function ProgressLine({ value, tone }: { value: number; tone: TailgTone }) {
  const fill = tone === "green" ? "bg-emerald-500" : tone === "yellow" ? "bg-amber-500" : tone === "red" ? "bg-red-500" : tone === "blue" ? "bg-sky-500" : "bg-slate-400";
  return <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function DarkMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-xl bg-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] text-slate-400">{note}</p></div>;
}

function ReportBox({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "red" | "yellow" | "green" }) {
  const styles = tone === "red" ? "border-red-100 bg-red-50/70" : tone === "yellow" ? "border-amber-100 bg-amber-50/70" : tone === "green" ? "border-emerald-100 bg-emerald-50/70" : "border-slate-200 bg-slate-50";
  return <div className={`rounded-2xl border p-4 ${styles}`}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-5 text-slate-700">{value}</p></div>;
}

function Rule({ icon, title, text, tone }: { icon: ReactNode; title: string; text: string; tone: "green" | "blue" | "yellow" }) {
  const styles = tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "yellow" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700";
  return <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${styles}`}>{icon}</span><div><p className="text-sm font-black text-slate-900">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{text}</p></div></div>;
}
