import { ReactNode } from "react";

export default function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="glass-card relative overflow-hidden rounded-[22px] px-4 py-4 sm:px-5 lg:flex lg:items-end lg:justify-between lg:gap-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="relative min-w-0">
        {eyebrow ? <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-orange-600">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-xl font-black tracking-tight text-gradient-industrial sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-4xl text-xs leading-5 sm:text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="relative mt-4 flex shrink-0 flex-wrap gap-2 lg:mt-0">{actions}</div> : null}
    </div>
  );
}
