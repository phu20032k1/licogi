import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

export type StatCardProps = {
  title: string;
  value: string;
  note?: string;
  trend?: string;
  trendDirection?: "up" | "down";
  icon?: LucideIcon;
  tone?: "orange" | "blue" | "green" | "violet" | "slate";
};

const toneStyles = {
  orange: "bg-orange-50 text-orange-600 ring-orange-100 group-hover:bg-orange-500 group-hover:text-white",
  blue: "bg-sky-50 text-sky-600 ring-sky-100 group-hover:bg-sky-500 group-hover:text-white",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:bg-emerald-500 group-hover:text-white",
  violet: "bg-violet-50 text-violet-600 ring-violet-100 group-hover:bg-violet-500 group-hover:text-white",
  slate: "bg-slate-100 text-slate-700 ring-slate-200 group-hover:bg-slate-900 group-hover:text-white",
};

export default function StatCard({ title, value, note, trend, trendDirection = "up", icon: Icon, tone = "orange" }: StatCardProps) {
  return (
    <article className="enterprise-card group p-5">
      <div className="absolute -right-12 -top-14 h-32 w-32 rounded-full bg-orange-200/20 blur-2xl transition group-hover:bg-orange-300/30" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{value}</p>
        </div>
        {Icon ? <span className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 transition ${toneStyles[tone]}`}><Icon size={22} /></span> : null}
      </div>
      <div className="relative mt-3 flex min-h-5 items-center gap-2 text-xs">
        {trend ? (
          <span className={`inline-flex items-center gap-1 font-extrabold ${trendDirection === "up" ? "text-emerald-600" : "text-red-600"}`}>
            {trendDirection === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{trend}
          </span>
        ) : null}
        {note ? <span className="text-slate-500">{note}</span> : null}
      </div>
    </article>
  );
}
