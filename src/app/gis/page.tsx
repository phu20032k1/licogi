"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Database, Layers3, LocateFixed } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

const ProjectMap = dynamic(() => import("../../components/ProjectMap"), {
  ssr: false,
  loading: () => <div className="grid h-[680px] place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">Đang tải dữ liệu bản đồ...</div>,
});

export default function GisPage() {
  return <div className="space-y-6 animate-fade-up">
    <PageHeader
      eyebrow="GIS Project Intelligence"
      title="Bản đồ dự án GIS"
      description="Biểu tượng dự án được tạo tự động theo ngành hàng và trạng thái. Dữ liệu import tại Trung tâm dữ liệu được sử dụng đồng thời tại trang chủ và khu vực quản trị."
      actions={<><Link href="/data" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm"><Database size={16}/> Import dữ liệu</Link><button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><LocateFixed size={16}/> Định vị dự án</button></>}
    />
    <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800"><Layers3 size={16} className="mr-2 inline"/>Marker ngành hàng: CN, DD, HT, GT, ĐN. Màu cam = đang thi công, xanh lá = hoàn thành, xanh dương = bảo hành.</div>
    <ProjectMap />
  </div>;
}
