import Link from "next/link";
import { ArrowLeft, Home, MapPinned } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-5xl items-center justify-center px-5 py-16">
      <section className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-orange-600"><MapPinned size={25} /></span>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-orange-600">404 · Không tìm thấy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Trang bạn mở không tồn tại</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Đường dẫn có thể đã thay đổi hoặc module chưa được triển khai trong phiên bản hiện tại.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white"><Home size={16} /> Trang chủ</Link>
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700"><ArrowLeft size={16} /> Về hệ thống</Link>
        </div>
      </section>
    </div>
  );
}
