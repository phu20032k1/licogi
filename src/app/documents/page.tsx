"use client";

import { useMemo, useState } from "react";
import { Download, FileCheck2, FileClock, FileSearch, FolderOpen, Search, Upload } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { documents } from "../../data/operations";

function EmptyBox({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center"><p className="text-sm font-black text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return documents.filter((item) => {
      const matches = !keyword || [item.code, item.name, item.project, item.owner].some((value) => value.toLocaleLowerCase("vi").includes(keyword));
      return matches && (type === "all" || item.type === type);
    });
  }, [search, type]);

  const types = Array.from(new Set(documents.map((item) => item.type)));
  const approved = documents.filter((item) => item.status === "Đã phê duyệt").length;
  const waiting = documents.filter((item) => item.status.includes("Chờ")).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Document Control Center"
        title="Hồ sơ, bản vẽ & BIM"
        description="Quản lý phiên bản, trạng thái phê duyệt và truy xuất hồ sơ kỹ thuật theo từng dự án. Dữ liệu ban đầu để trống, không dùng số liệu giả."
        actions={<><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm"><FolderOpen size={16} /> Tạo thư mục</button><button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Upload size={16} /> Tải hồ sơ lên</button></>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng hồ sơ" value={String(documents.length)} note="toàn bộ dự án" icon={FolderOpen} tone="slate" />
        <StatCard title="Đã phê duyệt" value={String(approved)} note="theo dữ liệu hiện có" icon={FileCheck2} tone="green" />
        <StatCard title="Chờ xử lý" value={String(waiting)} note="cần ký/phản hồi" icon={FileClock} tone="orange" />
        <StatCard title="Phiên bản mới" value="0" note="trong 7 ngày" icon={FileSearch} tone="blue" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="px-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Cấu trúc thư mục</p>
          <div className="mt-4 space-y-1.5 text-sm">
            {["Tất cả hồ sơ", "Bản vẽ thiết kế", "Biện pháp thi công", "Hồ sơ nghiệm thu", "QA/QC & HSE", "RFI & Submittal"].map((label, index) => (
              <button key={label} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-bold transition ${index === 0 ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className="flex items-center gap-2"><FolderOpen size={16} /> {label}</span><span className="text-[11px] text-slate-400">0</span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[#071426] p-4 text-white"><p className="text-xs font-bold text-slate-400">Dung lượng lưu trữ</p><p className="mt-2 text-xl font-black">0 GB</p><ProgressBar value={0} tone="orange" /><p className="mt-2 text-[11px] text-slate-400">Chờ nối Storage thật</p></div>
        </aside>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm mã hồ sơ, tên tài liệu, dự án..." /></label>
              <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại hồ sơ</option>{types.map((item) => <option key={item}>{item}</option>)}</select>
              <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50">Bộ lọc nâng cao</button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Tài liệu</th><th className="px-4 py-4">Dự án</th><th className="px-4 py-4">Loại</th><th className="px-4 py-4">Phiên bản</th><th className="px-4 py-4">Phụ trách</th><th className="px-4 py-4">Cập nhật</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item)=><tr key={item.code} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="max-w-[300px] truncate font-extrabold text-slate-900">{item.name}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{item.code}</p></td><td className="max-w-[220px] px-4 py-4"><p className="truncate font-semibold text-slate-600">{item.project}</p></td><td className="px-4 py-4 text-slate-600">{item.type}</td><td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">Rev.{item.revision}</span></td><td className="px-4 py-4 text-slate-600">{item.owner}</td><td className="px-4 py-4 text-slate-500">{item.updated}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${item.status === "Đã phê duyệt" ? "bg-emerald-50 text-emerald-700" : item.status.includes("Chờ") ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{item.status}</span></td><td className="px-5 py-4"><button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Download size={15} /></button></td></tr>)}</tbody></table></div>
            {filtered.length === 0 ? <div className="p-6"><EmptyBox title="Chưa có hồ sơ" description="Nhập hồ sơ/bản vẽ tại Trung tâm dữ liệu hoặc tải file lên sau khi nối Storage thật." /></div> : null}
          </section>
        </div>
      </section>
    </div>
  );
}
