export default function ProgressBar({ value, tone = "orange", height = "h-2" }: { value: number; tone?: "orange" | "green" | "blue" | "red" | "slate"; height?: string }) {
  const toneClass = {
    orange: "from-orange-400 to-orange-600",
    green: "from-emerald-400 to-emerald-600",
    blue: "from-sky-400 to-blue-600",
    red: "from-red-400 to-red-600",
    slate: "from-slate-500 to-slate-800",
  }[tone];
  return (
    <div className={`${height} overflow-hidden rounded-full bg-slate-100`}>
      <div className={`h-full rounded-full bg-gradient-to-r ${toneClass} transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
