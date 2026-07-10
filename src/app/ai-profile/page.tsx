"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, Languages, Printer, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { Project, projectTypes, statusLabels } from "../../data/projects";
import { fetchProjectsFromDataCenter } from "../../lib/projectData";

const languages = ["Tiếng Việt", "English", "中文", "日本語", "한국어"];
const valueOptions = ["Tất cả", "100-200 tỷ", "200-300 tỷ", "300-500 tỷ", "Trên 500 tỷ"];

export default function ProfileBuilderPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [language, setLanguage] = useState("Tiếng Việt");
  const [type, setType] = useState("Công nghiệp");
  const [valueRange, setValueRange] = useState("Tất cả");
  const [includeOngoing, setIncludeOngoing] = useState(true);
  const [includeWarranty, setIncludeWarranty] = useState(true);

  useEffect(() => {
    const sync = () => fetchProjectsFromDataCenter().then(setProjects).catch(() => setProjects([]));
    sync();
    window.addEventListener("licogi-data-imported", sync);
    window.addEventListener("licogi-projects-updated", sync);
    return () => {
      window.removeEventListener("licogi-data-imported", sync);
      window.removeEventListener("licogi-projects-updated", sync);
    };
  }, []);

  const selected = useMemo(() => projects
    .filter((project) => (type === "Tất cả" || project.type === type))
    .filter((project) => (valueRange === "Tất cả" || project.valueRange === valueRange))
    .filter((project) => includeOngoing || project.status !== "ongoing")
    .filter((project) => includeWarranty || project.status !== "warranty")
    .sort((a, b) => (b.healthScore ?? 0) - (a.healthScore ?? 0))
    .slice(0, 6), [includeOngoing, includeWarranty, projects, type, valueRange]);

  const profileTitle = language === "English" ? "Industrial Construction Capability Profile" : language === "日本語" ? "産業建設能力プロファイル" : language === "한국어" ? "산업 건설 역량 프로필" : language === "中文" ? "工业建设能力档案" : "Hồ sơ năng lực tổng thầu công nghiệp";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader eyebrow="Capability Profile" title="Hồ sơ năng lực số đa ngôn ngữ" description="Tạo bản hồ sơ gọn, đúng tiêu chí, dùng dữ liệu dự án đã chuẩn hóa. Giao diện tập trung vào quy trình chào thầu chuyên nghiệp, không hiển thị như chatbot." actions={<button onClick={() => window.print()} className="print-hide inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Printer size={16}/> In / Lưu PDF</button>} />

      <section className="print-hide grid gap-6 xl:grid-cols-[1fr_380px]">
        <article className="professional-card rounded-[24px] p-6">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-700"><FileText size={22}/></span><div><h2 className="text-lg font-black text-slate-900">Cấu hình hồ sơ</h2><p className="mt-1 text-sm text-slate-500">Lọc đúng dự án để xuất hồ sơ 15-25 trang thay vì PDF 200 trang.</p></div></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-600">Loại công trình<select value={type} onChange={(event)=>setType(event.target.value)} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"><option>Tất cả</option>{projectTypes.map((item)=><option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-600">Khoảng giá trị<select value={valueRange} onChange={(event)=>setValueRange(event.target.value)} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm">{valueOptions.map((item)=><option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-600">Ngôn ngữ<select value={language} onChange={(event)=>setLanguage(event.target.value)} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm">{languages.map((item)=><option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-600">Mẫu hồ sơ<select className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"><option>FDI Factory / EPC</option><option>Khu công nghiệp / Hạ tầng</option><option>Hồ sơ bảo hành sau bàn giao</option></select></label>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[{label:"Dự án đang thi công",checked:includeOngoing,onClick:()=>setIncludeOngoing(!includeOngoing)},{label:"Dữ liệu bảo hành",checked:includeWarranty,onClick:()=>setIncludeWarranty(!includeWarranty)},{label:"Ảnh/video bằng chứng",checked:true,onClick:()=>undefined}].map((item)=><button key={item.label} type="button" onClick={item.onClick} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-bold ${item.checked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}><CheckCircle2 size={17} />{item.label}</button>)}
          </div>
        </article>

        <aside className="professional-card rounded-[24px] p-6">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white"><ShieldCheck size={24}/></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Quy trình kiểm duyệt</p><h3 className="mt-1 font-black text-slate-950">Hồ sơ trước khi gửi khách</h3></div></div>
          <div className="mt-6 space-y-3">
            {[{icon:FileText,text:"Chọn dự án phù hợp theo loại hình và quy mô"},{icon:Languages,text:"Chuẩn bị nội dung 5 ngôn ngữ"},{icon:Download,text:"Xuất PDF nội bộ hoặc bản gửi khách"},{icon:ShieldCheck,text:"Kiểm duyệt trước khi phát hành"}].map(({icon:Icon,text})=><div key={text} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700"><Icon size={17} className="text-orange-600" />{text}</div>)}
          </div>
          <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-900">Khi nối API thật: dữ liệu lấy từ PostgreSQL + Storage, dịch qua Translation API và xuất PDF qua dịch vụ tạo file. Giai đoạn hiện tại tập trung chuẩn giao diện và dữ liệu.</div>
        </aside>
      </section>

      <article className="print-sheet professional-card rounded-[28px] p-6 sm:p-8 lg:p-10">
        <header className="border-b border-slate-200 pb-6"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">LICOGI 18.3 Industrial Construction Operating System</p><h1 className="mt-3 text-3xl font-black text-slate-950">{profileTitle}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Hồ sơ được dựng từ danh mục dự án, bằng chứng thi công, dữ liệu bảo hành và các chỉ số quản trị đã chuẩn hóa trong hệ thống.</p></header>
        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[{label:"Dự án phù hợp",value:selected.length},{label:"Ngôn ngữ",value:language},{label:"Loại công trình",value:type},{label:"Khoảng giá trị",value:valueRange}].map((item)=><div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">{item.label}</p><p className="mt-2 text-lg font-black text-slate-950">{item.value}</p></div>)}
        </section>
        <section className="mt-8"><h3 className="text-xl font-black text-slate-950">Dự án phù hợp theo tiêu chí</h3><p className="mt-2 text-sm leading-6 text-slate-600">Hệ thống chọn các dự án có loại hình, quy mô và bằng chứng thi công phù hợp nhất để đưa vào hồ sơ năng lực.</p><div className="mt-5 grid gap-4 md:grid-cols-2">{selected.map((project)=><article key={project.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-orange-600">{project.code}</p><h4 className="mt-1 font-black text-slate-900">{project.name}</h4><p className="mt-1 text-xs text-slate-500">{project.province} · {project.subType ?? project.type}</p></div><span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-extrabold text-white">{statusLabels[project.status]}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Giá trị</p><p className="mt-1 font-black text-slate-800">{project.valueRange}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Health</p><p className="mt-1 font-black text-slate-800">{project.healthScore ?? 0}/100</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Media</p><p className="mt-1 font-black text-slate-800">{project.photos}/{project.videos}</p></div></div></article>)}</div></section>
        <section className="mt-8 rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Tóm tắt điều hành</p><p className="mt-3 text-sm leading-7 text-slate-300">Licogi 18.3 có năng lực phù hợp với nhóm <b className="text-white">{type}</b>, đặc biệt ở các dự án FDI, hạ tầng khu công nghiệp và công trình có yêu cầu minh bạch tiến độ. Hồ sơ này nên đính kèm bản đồ GIS, ảnh/video hiện trường và dữ liệu bảo hành để tăng mức độ tin cậy.</p></section>
      </article>
    </div>
  );
}
