import { ReactNode } from "react";

export default function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="licogi-page-header glass-card relative overflow-hidden rounded-[22px] px-5 py-5 sm:px-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="relative min-w-0">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="licogi-page-header-actions relative mt-5 flex shrink-0 flex-wrap gap-2 lg:mt-0">{actions}</div> : null}
    </div>
  );
}
