"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Building2, Handshake, Plus, Search, ShieldCheck, Star, UsersRound } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { partners } from "../../data/operations";

function EmptyBox({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center"><p className="text-sm font-black text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

export default function PartnersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return partners.filter((partner) => (!keyword || [partner.code, partner.name, partner.category, partner.region].some((value) => value.toLocaleLowerCase("vi").includes(keyword))) && (category === "all" || partner.category === category));
  }, [search, category]);
  const categories = Array.from(new Set(partners.map((item) => item.category)));
  const strategic = partners.filter((item) => item.status === "Chiến lược").length;
  const reviewing = partners.filter((item) => item.status.includes("Đánh giá")).length;
  const averageRating = partners.length ? (partners.reduce((sum, item) => sum + item.rating, 0) / partners.length).toFixed(1) : "0";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader eyebrow="Partner Marketplace" title="Hệ sinh thái đối tác" description="Quản lý hồ sơ năng lực, đánh giá hiệu suất, an toàn và lịch sử hợp tác của nhà thầu phụ, nhà cung cấp." actions={<button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Plus size={16} /> Thêm đối tác</button>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Đối tác hoạt động" value={String(partners.length)} note="theo dữ liệu hiện có" icon={Handshake} tone="orange" />
        <StatCard title="Đối tác chiến lược" value={String(strategic)} note="ưu tiên phân bổ" icon={BadgeCheck} tone="green" />
        <StatCard title="Đang đánh giá" value={String(reviewing)} note="hồ sơ mới" icon={UsersRound} tone="blue" />
        <StatCard title="Điểm trung bình" value={`${averageRating}/5`} note="chất lượng hợp tác" icon={Star} tone="violet" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event)=>setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm tên, mã, lĩnh vực, khu vực..." /></label><select value={category} onChange={(event)=>setCategory(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả lĩnh vực</option>{categories.map((item)=><option key={item}>{item}</option>)}</select><button className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50">Lọc nâng cao</button></div>
      </section>

      {filtered.length ? <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((partner) => (
          <article key={partner.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700"><Building2 size={22} /></span><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-orange-600">{partner.code}</p><h3 className="mt-1 truncate text-sm font-black text-slate-900">{partner.name}</h3><p className="mt-1 text-xs text-slate-500">{partner.category} · {partner.region}</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${partner.status === "Chiến lược" ? "bg-orange-50 text-orange-700" : partner.status === "Đạt chuẩn" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{partner.status}</span></div>
            <div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-slate-50 p-3 text-center"><div className="flex items-center justify-center gap-1 text-amber-500"><Star size={14} fill="currentColor" /><span className="text-lg font-black text-slate-900">{partner.rating}</span></div><p className="mt-1 text-[10px] font-bold text-slate-400">ĐÁNH GIÁ</p></div><div className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-lg font-black text-slate-900">{partner.projects}</p><p className="mt-1 text-[10px] font-bold text-slate-400">DỰ ÁN</p></div><div className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-lg font-black text-slate-900">{partner.safety}</p><p className="mt-1 text-[10px] font-bold text-slate-400">HSE SCORE</p></div></div>
            <div className="mt-5"><div className="mb-2 flex justify-between text-xs"><span className="flex items-center gap-1.5 font-bold text-slate-600"><ShieldCheck size={14} className="text-emerald-500" /> Mức độ đáp ứng</span><span className="font-black text-slate-800">{Math.round((partner.rating / 5) * 100)}%</span></div><ProgressBar value={(partner.rating / 5) * 100} tone="green" /></div>
            <button className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-extrabold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">Xem hồ sơ năng lực</button>
          </article>
        ))}
      </section> : <EmptyBox title="Chưa có dữ liệu đối tác" description="Nhập danh sách nhà thầu phụ, nhà cung cấp và hồ sơ năng lực để kích hoạt marketplace đối tác." />}
    </div>
  );
}
