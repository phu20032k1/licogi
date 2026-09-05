"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  HardHat,
  MapPinned,
  ShieldAlert,
  Target,
  UsersRound,
} from "lucide-react";

import {
  tailgDirectorAlerts,
  tailgMilestones,
  tailgProject,
  tailgTeams,
  tailgWorkfronts,
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

export default function TailgProjectDashboardPage() {
  return (
    <div className="space-y-5 pb-10 animate-fade-up">
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <div className="bg-[#0a2f59] px-5 py-4 text-white sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <HardHat size={24} className="text-amber-300" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-200">IIP · Hệ điều hành dự án</p>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight sm:text-2xl">{tailgProject.name}</h1>
                <p className="mt-1 text-xs font-semibold text-slate-300">Nhà thầu: {tailgProject.contractor} · Snapshot hiện trường {tailgProject.reportDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-white/15">
                <ArrowLeft size={15} /> Danh mục dự án
              </Link>
              <Link href="/construction" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-300">
                <Building2 size={15} /> Điều hành thi công
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">
          <TopKpi label="Đội thi công" value="06" note="Phân trách nhiệm rõ theo mặt bằng" icon={<UsersRound size={17} />} />
          <TopKpi label="Xưởng 1" value="88,5%" note="Bình quân 4 phân khu" icon={<CheckCircle2 size={17} />} accent="amber" />
          <TopKpi label="Mốc gần nhất" value="07/09" note="Hoàn thành công tác móng Xưởng 1" icon={<CalendarDays size={17} />} accent="red" />
          <TopKpi label="Tiến độ tổng" value="341 ngày" note="15/07/2026 → 30/06/2027" icon={<Clock3 size={17} />} />
          <TopKpi label="Điểm cần xử lý" value="04" note="Theo dữ liệu ảnh + tiến độ hiện có" icon={<AlertTriangle size={17} />} accent="red" />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.38fr_0.82fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<MapPinned size={17} />} eyebrow="Phân khu hiện trường" title="Sơ đồ điều hành 6 đội thi công" note="Bám đúng phân công người phụ trách trong ảnh hiện trường" />

          <div className="mt-5 grid min-h-[520px] grid-cols-12 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:gap-3 sm:p-3">
            <Zone className="col-span-5 row-span-2" title="XƯỞNG 2" owner="Bùi Văn Đức" progress="15%" tone="blue" note="Mặt trận móng / ép cọc" />
            <div className="col-span-7 row-span-4 grid grid-cols-2 gap-2 rounded-2xl border-2 border-[#0a2f59] bg-white p-2 sm:gap-3 sm:p-3">
              <Zone title="1/4 XƯỞNG 1" owner="Trần Văn Toãn" progress="85%" tone="yellow" />
              <Zone title="1/4 XƯỞNG 1" owner="Nguyễn Văn Tuần" progress="85%" tone="yellow" />
              <Zone title="1/4 XƯỞNG 1" owner="Bùi Văn Đức" progress="92%" tone="green" />
              <Zone title="1/4 XƯỞNG 1" owner="Tăng Văn Toán" progress="92%" tone="green" />
            </div>

            <div className="col-span-5 row-span-2 grid grid-cols-2 gap-2 rounded-2xl border-2 border-sky-500 bg-white p-2">
              <Zone title="1/2 XƯỞNG 3" owner="Nguyễn Ánh Quang" progress="0%" tone="red" />
              <Zone title="1/2 XƯỞNG 3" owner="Nguyễn Duy Thọ" progress="0%" tone="red" />
            </div>

            <Zone className="col-span-7 row-span-2" title="NHÀ ĂN · NHÀ XE · BỂ NGẦM · BỂ XLNT" owner="Nguyễn Ánh Quang" progress="Nhà xe 83,4% đài móng" tone="green" note="Dầm móng ≈ 30% · 15/50 cột ≈ 30%" />
            <Zone className="col-span-5 row-span-2" title="HẠ TẦNG" owner="Nguyễn Duy Thọ" progress="Chưa có % xác nhận" tone="slate" note="Không tự sinh số khi chưa có dữ liệu định lượng" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
            <Legend tone="green" text="Đang bám tốt theo ảnh" />
            <Legend tone="yellow" text="Cần tăng tốc / bám mốc" />
            <Legend tone="red" text="Chưa ghi nhận sản lượng" />
            <Legend tone="slate" text="Thiếu dữ liệu xác nhận" />
          </div>
        </article>

        <aside className="space-y-5">
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={<AlertTriangle size={17} />} eyebrow="Director attention" title="Việc cần Ban điều hành xử lý" note="Chỉ hiển thị vấn đề có căn cứ từ ảnh/file" />
            <div className="mt-4 space-y-3">
              {tailgDirectorAlerts.map((alert) => (
                <div key={alert.title} className={`rounded-2xl border p-4 ${toneClass[alert.tone]}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass[alert.tone]}`} />
                    <div>
                      <p className="text-sm font-black">{alert.title}</p>
                      <p className="mt-1.5 text-xs font-semibold leading-5 opacity-80">{alert.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#0b1628] p-5 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">Mốc quyết định</p>
                <h2 className="mt-1 text-lg font-black">48 giờ chốt móng Xưởng 1</h2>
              </div>
              <Target size={22} className="text-amber-300" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">Từ snapshot 05/09 đến mốc kế hoạch 07/09 còn 2 ngày. Hai phân khu 85% cần được tách khối lượng còn lại theo ca/ngày thay vì chỉ theo % tổng.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DarkMetric label="Đức + Toán" value="92%" note="mỗi phân khu" />
              <DarkMetric label="Toãn + Tuần" value="85%" note="mỗi phân khu" />
            </div>
          </article>
        </aside>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={<HardHat size={17} />} eyebrow="Tiến độ thực địa" title="Các mặt trận có số liệu xác nhận" note="Không gộp thành % toàn dự án khi chưa có trọng số khối lượng" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tailgWorkfronts.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
                </div>
                <span className={`mt-1 h-3 w-3 rounded-full ${dotClass[item.tone]}`} />
              </div>
              <p className="mt-2 text-xs font-extrabold text-slate-700">{item.sublabel}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
              <ProgressLine value={toPercent(item.value)} tone={item.tone} />
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<UsersRound size={17} />} eyebrow="Responsibility matrix" title="6 đội thi công và ưu tiên hiện tại" note="Một người có nhiều mặt trận được tách rõ để không che mất trách nhiệm" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {tailgTeams.map((team, index) => (
              <article key={team.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.035)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0a2f59] text-xs font-black text-white">{index + 1}</span>
                    <div>
                      <p className="text-sm font-black text-slate-950">{team.leader}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-slate-400">Đội thi công {index + 1}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${toneClass[team.tone]}`}>{team.shortName}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Phụ trách</p>
                    <div className="mt-2 space-y-1.5">{team.responsibility.map((item) => <p key={item} className="text-xs font-extrabold text-slate-700">• {item}</p>)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Sản lượng xác nhận</p>
                    <div className="mt-2 space-y-1.5">{team.progressNotes.map((item) => <p key={item} className="text-xs font-extrabold text-slate-700">• {item}</p>)}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">Ưu tiên điều hành</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-amber-950/80">{team.priority}</p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={<CalendarDays size={17} />} eyebrow="Master schedule" title="Mốc tiến độ phải bám" note="Trích từ biểu tiến độ thi công TAILG" />
          <div className="mt-5 space-y-3">
            {tailgMilestones.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{item.scope}</p>
                  </div>
                  <MilestoneBadge status={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500">
                  <span>{item.start}</span><span>→</span><span>{item.finish}</span>
                </div>
                {item.note ? <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p> : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DataRule icon={<FileCheck2 size={18} />} title="Nguồn tiến độ" text="Biểu tiến độ TAILG xác định mốc và khoảng thời gian; dashboard không tự suy diễn % kế hoạch tổng khi file không cung cấp trọng số." />
        <DataRule icon={<ShieldAlert size={18} />} title="QA/QC · HSE" text="Ảnh/file hiện tại chưa đủ số liệu vi phạm, sự cố, NCR, PPE. Các KPI này phải để trạng thái chưa đồng bộ thay vì hiển thị số 0 giả." />
        <DataRule icon={<Target size={18} />} title="Cách cập nhật hàng ngày" text="Mỗi đội nhập: sản lượng ngày, lũy kế, nhân lực, máy móc, vướng mắc, ảnh hiện trường và mốc bàn giao tiếp theo. Khi có dữ liệu sẽ tự đổi cảnh báo." />
      </section>

      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs font-semibold leading-5 text-sky-900">
        <span className="font-black">Nguồn dashboard:</span> {tailgProject.sourceNote}. Các tỷ lệ 85%, 92%, 15%, 0% và 38/44 ≈ 83,4% được giữ đúng theo ảnh người dùng cung cấp; hạng mục chưa có số xác nhận được ghi rõ là thiếu dữ liệu.
      </div>
    </div>
  );
}

function TopKpi({ label, value, note, icon, accent = "blue" }: { label: string; value: string; note: string; icon: React.ReactNode; accent?: "blue" | "amber" | "red" }) {
  const iconStyle = accent === "red" ? "bg-red-50 text-red-600" : accent === "amber" ? "bg-amber-50 text-amber-600" : "bg-sky-50 text-sky-700";
  return (
    <div className="bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${iconStyle}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{note}</p>
    </div>
  );
}

function SectionTitle({ icon, eyebrow, title, note }: { icon: React.ReactNode; eyebrow: string; title: string; note: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{note}</p>
      </div>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">{icon}</span>
    </div>
  );
}

function Zone({ title, owner, progress, tone, note, className = "" }: { title: string; owner: string; progress: string; tone: TailgTone; note?: string; className?: string }) {
  return (
    <div className={`flex min-h-[112px] flex-col justify-between rounded-xl border p-3 ${toneClass[tone]} ${className}`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.08em] opacity-70">{title}</p>
        <p className="mt-1.5 text-sm font-black">{owner}</p>
      </div>
      <div className="mt-3">
        <p className="text-lg font-black">{progress}</p>
        {note ? <p className="mt-1 text-[10px] font-semibold leading-4 opacity-75">{note}</p> : null}
      </div>
    </div>
  );
}

function Legend({ tone, text }: { tone: TailgTone; text: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600"><span className={`h-2 w-2 rounded-full ${dotClass[tone]}`} />{text}</span>;
}

function DarkMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.07] p-3"><p className="text-[10px] font-bold text-slate-400">{label}</p><p className="mt-1 text-xl font-black text-white">{value}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{note}</p></div>;
}

function ProgressLine({ value, tone }: { value: number; tone: TailgTone }) {
  const bar = tone === "green" ? "bg-emerald-500" : tone === "yellow" ? "bg-amber-500" : tone === "red" ? "bg-red-500" : tone === "blue" ? "bg-sky-500" : "bg-slate-400";
  return <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function MilestoneBadge({ status }: { status: "done" | "active" | "upcoming" }) {
  const classes = status === "done" ? "bg-emerald-50 text-emerald-700" : status === "active" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  const label = status === "done" ? "Đã xong" : status === "active" ? "Đang chạy" : "Sắp tới";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${classes}`}>{label}</span>;
}

function DataRule({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">{icon}</span><h3 className="mt-3 text-sm font-black text-slate-900">{title}</h3><p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">{text}</p></article>;
}

function toPercent(value: string) {
  const parsed = Number(value.replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}
