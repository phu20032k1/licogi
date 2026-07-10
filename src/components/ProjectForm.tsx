"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, Save, X } from "lucide-react";
import {
  Project,
  ProjectRisk,
  ProjectStatus,
  ProjectType,
  projectTypes,
  provinceCoordinates,
  valueRanges,
} from "../data/projects";

type Props = {
  initialProject?: Project | null;
  onSave: (project: Project) => void;
  onCancel: () => void;
};

type FormState = {
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  investor: string;
  province: string;
  valueRange: string;
  progress: number;
  plannedProgress: number;
  description: string;
  manager: string;
  startDate: string;
  endDate: string;
  healthScore: number;
  risk: ProjectRisk;
};

const emptyForm: FormState = {
  code: "",
  name: "",
  type: "Công nghiệp",
  status: "ongoing",
  investor: "",
  province: "Hà Nội",
  valueRange: "100-200 tỷ",
  progress: 0,
  plannedProgress: 0,
  description: "",
  manager: "",
  startDate: "",
  endDate: "",
  healthScore: 0,
  risk: "low",
};

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

function createInitialForm(initialProject?: Project | null): FormState {
  if (!initialProject) {
    return { ...emptyForm, code: `LCG-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}` };
  }
  return {
    code: initialProject.code ?? `LCG-${initialProject.id}`,
    name: initialProject.name,
    type: initialProject.type,
    status: initialProject.status,
    investor: initialProject.investor,
    province: initialProject.province,
    valueRange: initialProject.valueRange,
    progress: initialProject.progress,
    plannedProgress: initialProject.plannedProgress ?? initialProject.progress,
    description: initialProject.description ?? "",
    manager: initialProject.manager ?? "",
    startDate: initialProject.startDate ?? "",
    endDate: initialProject.endDate ?? "",
    healthScore: initialProject.healthScore ?? 0,
    risk: initialProject.risk ?? "low",
  };
}

export default function ProjectForm({ initialProject, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => createInitialForm(initialProject));
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.investor.trim()) {
      setError("Vui lòng nhập tên dự án và chủ đầu tư.");
      return;
    }
    const coordinates = provinceCoordinates[form.province] ?? provinceCoordinates["Hà Nội"];
    const completedProgress = form.status === "ongoing" ? Math.max(0, Math.min(100, form.progress)) : 100;
    onSave({
      id: initialProject?.id ?? Date.now(),
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      investor: form.investor.trim(),
      province: form.province,
      valueRange: form.valueRange,
      progress: completedProgress,
      plannedProgress: form.status === "ongoing" ? Math.max(0, Math.min(100, form.plannedProgress)) : 100,
      lat: coordinates.lat,
      lng: coordinates.lng,
      description: form.description.trim(),
      manager: form.manager.trim() || "Chưa phân công",
      startDate: form.startDate,
      endDate: form.endDate,
      healthScore: Math.max(0, Math.min(100, form.healthScore)),
      risk: form.risk,
      photos: initialProject?.photos ?? 0,
      documents: initialProject?.documents ?? 0,
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label="Đóng" onClick={onCancel} className="absolute inset-0" />
      <form onSubmit={handleSubmit} className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-600">Dữ liệu dự án</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{initialProject ? "Cập nhật dự án" : "Thêm dự án mới"}</h2>
          </div>
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><X size={19} /></button>
        </div>

        <div className="space-y-7 px-5 py-6 sm:px-7">
          <section>
            <h3 className="text-sm font-black text-slate-900">Thông tin chung</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-bold text-slate-600">Mã dự án<input className={inputClass} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label>
              <label className="text-xs font-bold text-slate-600 md:col-span-2">Tên dự án *<input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nhập tên dự án" /></label>
              <label className="text-xs font-bold text-slate-600 md:col-span-2">Chủ đầu tư *<input className={inputClass} value={form.investor} onChange={(event) => setForm({ ...form, investor: event.target.value })} placeholder="Tên chủ đầu tư" /></label>
              <label className="text-xs font-bold text-slate-600">Chỉ huy trưởng<input className={inputClass} value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} placeholder="Người phụ trách" /></label>
              <label className="text-xs font-bold text-slate-600">Loại công trình<select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ProjectType })}>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Tỉnh/thành phố<select className={inputClass} value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })}>{Object.keys(provinceCoordinates).map((province) => <option key={province}>{province}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Khoảng giá trị<select className={inputClass} value={form.valueRange} onChange={(event) => setForm({ ...form, valueRange: event.target.value })}>{valueRanges.map((range) => <option key={range}>{range}</option>)}</select></label>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900"><CalendarDays size={17} className="text-orange-500" /> Kế hoạch & tiến độ</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-bold text-slate-600">Ngày bắt đầu<input type="date" className={inputClass} value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
              <label className="text-xs font-bold text-slate-600">Ngày kết thúc<input type="date" className={inputClass} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label>
              <label className="text-xs font-bold text-slate-600">Trạng thái<select className={inputClass} value={form.status} onChange={(event) => { const status = event.target.value as ProjectStatus; setForm({ ...form, status, progress: status === "ongoing" ? form.progress : 100, plannedProgress: status === "ongoing" ? form.plannedProgress : 100 }); }}><option value="ongoing">Đang thi công</option><option value="completed">Đã hoàn thành</option><option value="warranty">Đang bảo hành</option></select></label>
              <label className="text-xs font-bold text-slate-600">Mức rủi ro<select className={inputClass} value={form.risk} onChange={(event) => setForm({ ...form, risk: event.target.value as ProjectRisk })}><option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option></select></label>
              <label className="text-xs font-bold text-slate-600">Tiến độ thực tế (%)<input type="number" min={0} max={100} disabled={form.status !== "ongoing"} className={`${inputClass} disabled:bg-slate-100`} value={form.progress} onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })} /></label>
              <label className="text-xs font-bold text-slate-600">Tiến độ kế hoạch (%)<input type="number" min={0} max={100} disabled={form.status !== "ongoing"} className={`${inputClass} disabled:bg-slate-100`} value={form.plannedProgress} onChange={(event) => setForm({ ...form, plannedProgress: Number(event.target.value) })} /></label>
              <label className="text-xs font-bold text-slate-600">Project Health (0-100)<input type="number" min={0} max={100} className={inputClass} value={form.healthScore} onChange={(event) => setForm({ ...form, healthScore: Number(event.target.value) })} /></label>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <label className="text-xs font-bold text-slate-600">Mô tả và phạm vi công việc<textarea rows={4} className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Mô tả quy mô, phạm vi thi công và ghi chú quan trọng..." /></label>
          </section>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"><Save size={17} /> {initialProject ? "Lưu thay đổi" : "Thêm dự án"}</button>
        </div>
      </form>
    </div>
  );
}
