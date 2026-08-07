"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-5 py-16">
      <section className="w-full max-w-xl rounded-[30px] border border-rose-100 bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-9">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle size={22} /></div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-rose-600">System fallback</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Có lỗi khi tải màn hình</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Bạn có thể thử tải lại phần này. Nếu lỗi tiếp tục xuất hiện, mã lỗi bên dưới giúp đội kỹ thuật tra log nhanh hơn.</p>
        {error.digest ? <code className="mt-4 block rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-200">Error ID: {error.digest}</code> : null}
        <button type="button" onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-orange-600"><RefreshCcw size={16} /> Thử lại</button>
      </section>
    </div>
  );
}
