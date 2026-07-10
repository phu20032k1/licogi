"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, FileStack, HardHat, MapPin, Pencil, ShieldCheck, UsersRound } from "lucide-react";
import ProgressBar from "../../../components/ui/ProgressBar";
import { RiskBadge, StatusBadge } from "../../../components/ui/StatusBadge";
import { Project } from "../../../data/projects";
import { fetchProjectsFromDataCenter } from "../../../lib/projectData";

const tabs = ["Tổng quan", "Tiến độ", "Hồ sơ", "QA/QC & HSE", "Tài chính"] as const;

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Tổng quan");

  useEffect(() => {
    const id = Number(params.id);
    fetchProjectsFromDataCenter()
      .then((items) => setProject(items.find((item) => item.id === id) ?? null))
      .catch(() => setProject(null))
      .finally(() => setLoaded(true));
  }, [params.id]);

  const variance = useMemo(() => project ? project.progress - (project.plannedProgress ?? project.progress) : 0, [project]);

  if (!loaded) return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><HardHat size={34} className="mx-auto text-slate-300" /><p className="mt-4 font-black text-slate-900">Đang tải dữ liệu dự án...</p></div>;
  if (!project) return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><HardHat size={34} className="mx-auto text-slate-300" /><h1 className="mt-4 text-xl font-black text-slate-900">Không tìm thấy dự án</h1><p className="mt-2 text-sm text-slate-500">Dự án chưa có trong Trung tâm dữ liệu hoặc đã bị xóa.</p><button onClick={() => router.push("/projects")} className="mt-5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-extrabold text-white">Quay lại danh mục</button></div>;

  return <div className="space-y-6 animate-fade-up">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm hover:bg-slate-50"><ArrowLeft size={16} /> Danh mục dự án</Link>
      <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2.5 text-xs font-extrabold text-white"><Pencil size={16} /> Sửa tại danh mục</Link>
    </div>

    <section className="relative overflow-hidden rounded-[28px] bg-[#071426] p-6 text-white shadow-[0_24px_70px_rgba(7,20,38,0.22)] sm:p-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative grid gap-7 xl:grid-cols-[1fr_430px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-slate-300">{project.code}</span></div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{project.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{project.description || "Chưa có mô tả chi tiết. Có thể bổ sung trong Trung tâm dữ liệu hoặc danh mục dự án."}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-300"><span className="inline-flex items-center gap-2"><Building2 size={16} className="text-orange-300" /> {project.investor}</span><span className="inline-flex items-center gap-2"><MapPin size={16} className="text-orange-300" /> {project.province}</span><span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-orange-300" /> {project.startDate || "Chưa nhập"} → {project.endDate || "Chưa nhập"}</span><span className="inline-flex items-center gap-2"><UsersRound size={16} className="text-orange-300" /> Chỉ huy: {project.manager}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><p className="text-xs text-slate-400">Tiến độ thực tế</p><p className="mt-2 text-3xl font-black">{project.progress}%</p><div className="mt-3"><ProgressBar value={project.progress} tone="orange" /></div><p className={`mt-2 text-xs font-bold ${variance < -5 ? "text-red-300" : "text-emerald-300"}`}>{variance >= 0 ? "+" : ""}{variance}% so kế hoạch</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><p className="text-xs text-slate-400">Project Health</p><p className="mt-2 text-3xl font-black">{project.healthScore ?? 0}</p><div className="mt-3"><ProgressBar value={project.healthScore ?? 0} tone={(project.healthScore ?? 0) < 70 ? "red" : "green"} /></div><p className="mt-2 text-xs font-bold text-slate-300">Điểm tổng hợp / 100</p></div><div className="col-span-2 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center"><div><p className="text-xl font-black">{project.photos ?? 0}</p><p className="mt-1 text-[10px] text-slate-400">Ảnh hiện trường</p></div><div className="border-x border-white/10"><p className="text-xl font-black">{project.documents ?? 0}</p><p className="mt-1 text-[10px] text-slate-400">Hồ sơ số</p></div><div><p className="text-xl font-black">{project.valueRange}</p><p className="mt-1 text-[10px] text-slate-400">Quy mô hợp đồng</p></div></div></div>
      </div>
    </section>

    <div className="overflow-x-auto"><div className="flex min-w-max rounded-xl border border-slate-200 bg-white p-1 shadow-sm">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${tab === item ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}>{item}</button>)}</div></div>

    {tab === "Tổng quan" ? <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Thông tin dự án</p><h2 className="mt-1 text-lg font-black text-slate-900">Dữ liệu lõi</h2></div><CheckCircle2 size={21} className="text-orange-500" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Info label="Loại công trình" value={project.type} /><Info label="Chủ đầu tư" value={project.investor} /><Info label="Tỉnh/thành" value={project.province} /><Info label="Vai trò" value={project.role ?? "Chưa nhập"} /><Info label="Đơn vị thi công" value={project.contractorUnit ?? "Chưa nhập"} /><Info label="Quy mô" value={project.scale ?? "Chưa nhập"} /></div></article><article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><ShieldCheck size={22} className="text-sky-500" /><h3 className="mt-4 font-black text-slate-900">Ghi chú vận hành</h3><p className="mt-2 text-sm leading-6 text-slate-500">Các bảng hồ sơ, QA/QC, HSE, tài chính và bảo hành đang chờ dữ liệu thật từ các file import tương ứng. Khi nhập thêm trong Trung tâm dữ liệu, các module này sẽ có nguồn để hiển thị.</p></article></section> : null}

    {tab !== "Tổng quan" ? <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><FileStack className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 text-xl font-black text-slate-900">Chưa có dữ liệu {tab.toLowerCase()}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">Hãy nhập dữ liệu thật ở Trung tâm dữ liệu. Hệ thống không còn dùng số liệu minh họa để tránh sai lệch khi nghiệm thu.</p><Link href="/data" className="mt-5 inline-flex rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-extrabold text-white">Mở Trung tâm dữ liệu</Link></section> : null}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-2 font-black text-slate-900">{value}</p></div>;
}
