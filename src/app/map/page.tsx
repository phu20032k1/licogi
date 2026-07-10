"use client";

import dynamic from "next/dynamic";
import { Layers3, LocateFixed } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

const ProjectMap = dynamic(() => import("../../components/ProjectMap"), {
  ssr: false,
  loading: () => <div className="grid h-[680px] place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">Đang tải dữ liệu bản đồ...</div>,
});

export default function MapPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader eyebrow="GIS Project Intelligence" title="Bản đồ năng lực dự án" description="Trực quan hóa danh mục dự án trên toàn quốc, lọc theo loại công trình, trạng thái và khu vực để phục vụ điều hành và bán hàng." actions={<><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm"><Layers3 size={16} /> Lớp bản đồ</button><button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><LocateFixed size={16} /> Định vị dự án</button></>} />
      <ProjectMap />
    </div>
  );
}
