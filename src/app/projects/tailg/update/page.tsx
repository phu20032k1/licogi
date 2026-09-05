"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CloudUpload,
  HardHat,
  RefreshCcw,
  Save,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";

import { tailgProgressFields, type TailgProgressKey } from "../../../../data/tailg";

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

type TailgApiResponse = {
  ok: boolean;
  message?: string;
  project: ApiProject | null;
  reports: DailyReport[];
};

type ProgressState = Record<TailgProgressKey, string>;

function initialProgress(): ProgressState {
  return Object.fromEntries(
    tailgProgressFields.map((field) => [field.key, field.baseline === null ? "" : String(field.baseline)]),
  ) as ProgressState;
}

function metadataRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function toLocalDateInput(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
}

export default function TailgDailyUpdatePage() {
  const [project, setProject] = useState<ApiProject | null>(null);
  const [latestReport, setLatestReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [reportDate, setReportDate] = useState(() => toLocalDateInput());
  const [weather, setWeather] = useState("");
  const [manpowerCount, setManpowerCount] = useState("");
  const [equipmentCount, setEquipmentCount] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [issues, setIssues] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [coordinationNeeds, setCoordinationNeeds] = useState("");
  const [overallProgress, setOverallProgress] = useState("");
  const [teamProgress, setTeamProgress] = useState<ProgressState>(() => initialProgress());

  async function loadLatest() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/projects/tailg", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json() as TailgApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu TAILG.");
      setProject(data.project);
      const latest = data.reports?.[0] ?? null;
      setLatestReport(latest);
      if (latest) {
        const metadata = metadataRecord(latest.metadata);
        const savedProgress = metadataRecord(metadata.teamProgress);
        setTeamProgress((current) => {
          const next = { ...current };
          tailgProgressFields.forEach((field) => {
            const saved = savedProgress[field.key];
            if (saved !== null && saved !== undefined && saved !== "") next[field.key] = String(saved);
          });
          return next;
        });
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không tải được dữ liệu TAILG.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLatest();
  }, []);

  const groupedFields = useMemo(() => {
    const groups = new Map<string, typeof tailgProgressFields>();
    tailgProgressFields.forEach((field) => {
      const list = groups.get(field.owner) ?? [];
      list.push(field);
      groups.set(field.owner, list);
    });
    return Array.from(groups.entries());
  }, []);

  function setProgressValue(key: TailgProgressKey, value: string) {
    if (value !== "") {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return;
    }
    setTeamProgress((current) => ({ ...current, [key]: value }));
  }

  async function saveReport() {
    if (!project) {
      setError("Chưa có dự án TAILG trong Trung tâm dữ liệu.");
      return;
    }
    if (!workDone.trim()) {
      setError("Cần nhập nội dung công việc đã thực hiện trong ngày.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const cleanedTeamProgress = Object.fromEntries(
        Object.entries(teamProgress).filter(([, value]) => value !== "").map(([key, value]) => [key, Number(value)]),
      );
      const response = await fetch("/api/projects/tailg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          reportDate,
          weather,
          manpowerCount,
          equipmentCount,
          workDone,
          issues,
          safetyNotes,
          tomorrowPlan,
          coordinationNeeds,
          overallProgressConfirmed: overallProgress !== "",
          progress: overallProgress === "" ? 0 : Number(overallProgress),
          teamProgress: cleanedTeamProgress,
          sourceNote: "Nhật ký cập nhật trực tiếp từ TAILG Command Center",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Không lưu được nhật ký.");
      setMessage("Đã lưu nhật ký TAILG và cập nhật nguồn dữ liệu cho dashboard.");
      setWorkDone("");
      setIssues("");
      setSafetyNotes("");
      setTomorrowPlan("");
      setCoordinationNeeds("");
      setOverallProgress("");
      await loadLatest();
      window.dispatchEvent(new CustomEvent("tailg-progress-updated"));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được nhật ký TAILG.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-10 animate-fade-up">
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <div className="bg-[#0a2f59] px-5 py-5 text-white sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><ClipboardCheck size={24} className="text-amber-300" /></span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-200">TAILG · Daily control</p>
                <h1 className="mt-1 text-2xl font-black">Cập nhật nhật ký & tiến độ 6 đội</h1>
                <p className="mt-1 text-xs font-semibold text-slate-300">Dữ liệu lưu vào DailyReport và dashboard đọc lại trực tiếp qua API.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/projects/tailg" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-white/15"><ArrowLeft size={15} /> Dashboard</Link>
              <button type="button" onClick={() => void loadLatest()} className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-slate-900"><RefreshCcw size={15} /> Tải lại</button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard icon={<HardHat size={17} />} label="Dự án liên kết" value={project ? project.code : "CHƯA CÓ"} note={project?.name || "Cần tạo dự án có mã/tên chứa TAILG"} tone={project ? "green" : "red"} />
          <StatusCard icon={<CalendarDays size={17} />} label="Ngày báo cáo" value={reportDate} note="Có thể sửa khi nhập bù nhật ký" tone="blue" />
          <StatusCard icon={<CloudUpload size={17} />} label="Báo cáo gần nhất" value={latestReport ? new Date(latestReport.reportDate).toLocaleDateString("vi-VN") : "Chưa có"} note={latestReport?.createdBy?.name || "Chưa có người cập nhật"} tone="blue" />
          <StatusCard icon={<UsersRound size={17} />} label="Mặt trận theo dõi" value={String(tailgProgressFields.length)} note="6 đội · Xưởng 1/2/3 · nhà xe · hạ tầng" tone="amber" />
        </div>
      </section>

      {loading ? <Notice text="Đang tải dữ liệu TAILG..." /> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><CheckCircle2 size={17} className="mr-2 inline" />{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800"><AlertCircle size={17} className="mr-2 inline" />{error}</div> : null}

      {!project && !loading ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-amber-700" size={21} />
            <div>
              <h2 className="font-black text-amber-950">Cần tạo bản ghi dự án TAILG trước</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900/80">API chỉ ghi nhật ký vào dự án thật trong cơ sở dữ liệu. Hãy mở Trung tâm dữ liệu, tạo dự án có <b>project_code = TAILG-VN</b> hoặc tên chứa <b>TAILG</b>. Không tự tạo dự án ngầm để tránh làm bẩn dữ liệu doanh nghiệp.</p>
              <Link href="/data?entity=projects" className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black text-white">Mở Trung tâm dữ liệu</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<UsersRound size={17} />} title="Sản lượng theo từng đội / mặt trận" note="Giá trị đang điền sẵn từ snapshot hoặc báo cáo gần nhất; sửa bằng số thực tế đã xác nhận." />
          <div className="mt-5 space-y-4">
            {groupedFields.map(([owner, fields], index) => (
              <div key={owner} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0a2f59] text-xs font-black text-white">{index + 1}</span>
                  <div><p className="text-sm font-black text-slate-950">{owner}</p><p className="text-[11px] font-bold text-slate-400">Đội thi công {index + 1}</p></div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {fields.map((field) => (
                    <label key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="block text-xs font-extrabold text-slate-700">{field.label}</span>
                      <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{field.area}</span>
                      <div className="mt-2 flex items-center gap-2">
                        <input type="number" min="0" max="100" step="0.1" value={teamProgress[field.key]} onChange={(event) => setProgressValue(field.key, event.target.value)} placeholder="Chưa xác nhận" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-sky-500" />
                        <span className="text-sm font-black text-slate-500">%</span>
                      </div>
                      {field.note ? <span className="mt-2 block text-[11px] leading-4 text-slate-500">{field.note}</span> : null}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle icon={<Wrench size={17} />} title="Nhật ký hiện trường" note="Phần bắt buộc để tạo DailyReport." />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Ngày báo cáo"><input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className="input" /></Field>
              <Field label="Thời tiết"><input value={weather} onChange={(event) => setWeather(event.target.value)} placeholder="Nắng / mưa / gián đoạn..." className="input" /></Field>
              <Field label="Nhân lực hiện trường"><input type="number" min="0" value={manpowerCount} onChange={(event) => setManpowerCount(event.target.value)} placeholder="0" className="input" /></Field>
              <Field label="Thiết bị hoạt động"><input type="number" min="0" value={equipmentCount} onChange={(event) => setEquipmentCount(event.target.value)} placeholder="0" className="input" /></Field>
              <Field label="Tiến độ tổng dự án nếu đã xác nhận" wide><input type="number" min="0" max="100" step="0.1" value={overallProgress} onChange={(event) => setOverallProgress(event.target.value)} placeholder="Để trống nếu chưa có trọng số tổng" className="input" /></Field>
              <Field label="Công việc đã thực hiện *" wide><textarea value={workDone} onChange={(event) => setWorkDone(event.target.value)} rows={4} placeholder="Khối lượng đã làm, khu vực, ca thi công, nghiệm thu..." className="input resize-y" /></Field>
              <Field label="Vướng mắc / chậm / cần xử lý" wide><textarea value={issues} onChange={(event) => setIssues(event.target.value)} rows={3} placeholder="Mặt bằng, vật tư, máy, hồ sơ, nhân lực..." className="input resize-y" /></Field>
              <Field label="An toàn / QA-QC" wide><textarea value={safetyNotes} onChange={(event) => setSafetyNotes(event.target.value)} rows={3} placeholder="Vi phạm, near-miss, kiểm tra, nghiệm thu chất lượng..." className="input resize-y" /></Field>
              <Field label="Kế hoạch ngày mai" wide><textarea value={tomorrowPlan} onChange={(event) => setTomorrowPlan(event.target.value)} rows={3} placeholder="Mặt trận, sản lượng mục tiêu, ca tăng cường..." className="input resize-y" /></Field>
              <Field label="Nhu cầu Ban điều hành phối hợp" wide><textarea value={coordinationNeeds} onChange={(event) => setCoordinationNeeds(event.target.value)} rows={3} placeholder="Quyết định, điều phối, phê duyệt, vật tư, máy móc..." className="input resize-y" /></Field>
            </div>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#0b1628] p-5 text-white shadow-sm">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-emerald-300" size={20} /><div><h3 className="font-black">Nguyên tắc dữ liệu</h3><p className="mt-2 text-xs leading-5 text-slate-300">Không nhập % khi chưa có số đo hoặc xác nhận. Hạ tầng đội Thọ được phép để trống. Tiến độ tổng dự án cũng để trống nếu chưa có trọng số tổng hợp chính thức.</p></div></div>
            <button type="button" disabled={saving || !project} onClick={() => void saveReport()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17} /> {saving ? "Đang lưu..." : "Lưu nhật ký & cập nhật dashboard"}</button>
          </article>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">{icon}</span><div><h2 className="text-lg font-black text-slate-950">{title}</h2><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{note}</p></div></div>;
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1.5 block text-xs font-extrabold text-slate-600">{label}</span>{children}</label>;
}

function StatusCard({ icon, label, value, note, tone }: { icon: React.ReactNode; label: string; value: string; note: string; tone: "green" | "red" | "blue" | "amber" }) {
  const toneClass = tone === "green" ? "text-emerald-600" : tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : "text-sky-600";
  return <div className="bg-white p-4"><div className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] ${toneClass}`}>{icon}{label}</div><p className="mt-2 text-xl font-black text-slate-950">{value}</p><p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-500">{note}</p></div>;
}

function Notice({ text }: { text: string }) {
  return <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">{text}</div>;
}
