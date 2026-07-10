"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarCheck2, CheckCircle2, FileCheck2, Image as ImageIcon, MessageSquarePlus, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { Project } from "../../data/projects";
import { fetchProjectsFromDataCenter } from "../../lib/projectData";

function EmptyBox({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center"><p className="text-sm font-black text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

export default function PortalPage() {
  const [sent, setSent] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjectsFromDataCenter().then(setProjects).catch(() => setProjects([]));
  }, []);

  const currentProject = projects.find((project) => project.status === "ongoing") ?? projects[0];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader eyebrow="Customer Portal" title="Cổng thông tin Chủ đầu tư" description="Giao diện minh bạch để chủ đầu tư theo dõi tiến độ, hồ sơ, hình ảnh hiện trường và gửi yêu cầu hỗ trợ." actions={<button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm"><BellRing size={16} /> Cài đặt thông báo</button>} />

      {currentProject ? (
        <section className="relative overflow-hidden rounded-[28px] bg-[#071426] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative grid gap-7 xl:grid-cols-[1fr_420px] xl:items-end">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-300">Dự án đang theo dõi · {currentProject.code}</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">{currentProject.name}</h2><p className="mt-2 text-sm text-slate-300">{currentProject.investor} · {currentProject.province}</p><div className="mt-6 max-w-2xl"><div className="mb-2 flex justify-between text-sm font-bold"><span>Tiến độ tổng thể</span><span>{currentProject.progress}%</span></div><div className="h-3 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{width:`${currentProject.progress}%`}} /></div><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400"><span>Kế hoạch: {currentProject.plannedProgress}%</span><span>Ngày hoàn thành dự kiến: {currentProject.endDate ?? "Chưa nhập"}</span><span>Project Health: {currentProject.healthScore ?? 0}/100</span></div></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><ImageIcon size={20} className="text-orange-300" /><p className="mt-4 text-2xl font-black">{currentProject.photos ?? 0}</p><p className="mt-1 text-xs text-slate-400">Ảnh hiện trường</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><FileCheck2 size={20} className="text-sky-300" /><p className="mt-4 text-2xl font-black">{currentProject.documents ?? 0}</p><p className="mt-1 text-xs text-slate-400">Hồ sơ dự án</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><CalendarCheck2 size={20} className="text-emerald-300" /><p className="mt-4 text-2xl font-black">0</p><p className="mt-1 text-xs text-slate-400">Mốc hoàn thành</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><ShieldCheck size={20} className="text-violet-300" /><p className="mt-4 text-2xl font-black">--</p><p className="mt-1 text-xs text-slate-400">Xếp hạng HSE</p></div></div>
          </div>
        </section>
      ) : <EmptyBox title="Chưa có dự án cho cổng chủ đầu tư" description="Nhập dữ liệu dự án ở Trung tâm dữ liệu. Sau đó cổng chủ đầu tư sẽ hiển thị tiến độ, hồ sơ, ảnh hiện trường và yêu cầu hỗ trợ theo từng dự án." />}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Project timeline</p><h2 className="mt-1 text-lg font-black text-slate-900">Các mốc quan trọng</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600">0 mốc</span></div><div className="mt-6"><EmptyBox title="Chưa nhập timeline" description="Các mốc khởi công, nghiệm thu, bàn giao sẽ hiển thị tại đây khi có dữ liệu thật." /></div></article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><MessageSquarePlus size={20}/></span><div><h2 className="font-black text-slate-900">Gửi yêu cầu hỗ trợ</h2><p className="mt-1 text-xs text-slate-500">Ban điều hành sẽ phản hồi theo SLA đã cấu hình</p></div></div>{sent?<div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={28}/><p className="mt-3 font-extrabold text-emerald-800">Yêu cầu đã được ghi nhận</p><p className="mt-1 text-xs text-emerald-700">Mã yêu cầu sẽ tự sinh khi nối dữ liệu ticket.</p><button onClick={()=>setSent(false)} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Tạo yêu cầu khác</button></div>:<form className="mt-6 space-y-4" onSubmit={(event)=>{event.preventDefault();setSent(true)}}><label className="block text-xs font-bold text-slate-600">Loại yêu cầu<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-orange-400"><option>Tiến độ & kế hoạch</option><option>Hồ sơ nghiệm thu</option><option>Chất lượng thi công</option><option>Khác</option></select></label><label className="block text-xs font-bold text-slate-600">Tiêu đề<input required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-orange-400" placeholder="Nhập tiêu đề yêu cầu" /></label><label className="block text-xs font-bold text-slate-600">Nội dung<textarea required rows={5} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-orange-400" placeholder="Mô tả chi tiết nội dung cần hỗ trợ..." /></label><button type="submit" className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 hover:bg-orange-600">Gửi yêu cầu</button></form>}</article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-black text-slate-900">Hình ảnh hiện trường mới nhất</h2><p className="mt-1 text-xs text-slate-500">Chờ dữ liệu ảnh/video thật</p></div><button className="text-xs font-extrabold text-orange-600">Xem thư viện</button></div><div className="mt-5"><EmptyBox title="Chưa có ảnh hiện trường" description="Sau khi nối Storage và upload ảnh/video, thư viện hiện trường sẽ hiển thị tại đây." /></div></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-black text-slate-900">Hồ sơ mới cập nhật</h2><p className="mt-1 text-xs text-slate-500">Tài liệu đã được kiểm duyệt</p></div><button className="text-xs font-extrabold text-orange-600">Xem tất cả</button></div><div className="mt-5"><EmptyBox title="Chưa có hồ sơ" description="Hồ sơ nghiệm thu, bản vẽ hoàn công và tài liệu kỹ thuật sẽ xuất hiện sau khi nhập dữ liệu." /></div></article>
      </section>
    </div>
  );
}
