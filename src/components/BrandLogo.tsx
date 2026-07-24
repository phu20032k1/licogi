import Link from "next/link";

type Props = {
  href?: string;
  inverse?: boolean;
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ href = "/", inverse = false, compact = false, className = "" }: Props) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-slate-950 shadow-lg shadow-orange-950/20">
        <span className="absolute -right-2 -top-3 h-8 w-8 rotate-45 border-4 border-white/35" />
        <span className="relative text-sm font-black tracking-[-0.08em] text-white">L18</span>
      </span>
      {!compact ? <span className="min-w-0 leading-none">
        <span className={`block text-[18px] font-black tracking-[-0.03em] ${inverse ? "text-white" : "text-slate-950"}`}>LICOGI 18.3</span>
        <span className={`mt-1 block text-[9px] font-extrabold uppercase tracking-[0.16em] ${inverse ? "text-slate-300" : "text-slate-500"}`}>Industrial Construction</span>
      </span> : null}
    </span>
  );
  return href ? <Link href={href} aria-label="LICOGI 18.3 - Trang chủ">{content}</Link> : content;
}
