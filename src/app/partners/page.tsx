"use client";

import { FormEvent, useMemo, useState } from "react";
import { BadgeCheck, Building2, Handshake, Plus, Search, ShieldCheck, Star, UsersRound } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import BulkImportPanel from "../../components/BulkImportPanel";
import { appendClientRows, readClientRows } from "../../lib/clientDataStore";

type Partner = { code: string; name: string; category: string; region: string; rating: number; projects: number; safety: number; status: string };
const emptyForm = { name: "", category: "Nhà cung cấp", region: "Toàn quốc", rating: "5", projects: "0", safety: "100", status: "Đạt chuẩn" };

function rowToPartner(row: Record<string, string>, index: number): Partner {
  return {
    code: row.partner_code || `DT-${String(index + 1).padStart(3, "0")}`,
    name: row.partner_name || "Đối tác chưa đặt tên",
    category: row.category || "Nhà cung cấp",
    region: row.region || "Toàn quốc",
    rating: Number(row.rating) || 0,
    projects: Number(row.projects) || 0,
    safety: Number(row.safety) || 0,
    status: row.status || "Đạt chuẩn",
  };
}

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>(() => readClientRows("partners").map(rowToPartner));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((partner) => (!keyword || [partner.code, partner.name, partner.category, partner.region].some((value) => value.toLocaleLowerCase("vi").includes(keyword))) && (category === "all" || partner.category === category));
  }, [items, search, category]);
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const strategic = items.filter((item) => item.status === "Chiến lược").length;
  const reviewing = items.filter((item) => item.status.includes("Đánh giá")).length;
  const averageRating = items.length ? (items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1) : "0";

  function refreshLocal() { setItems(readClientRows("partners").map(rowToPartner)); }

  async function importPartners(rows: Record<string, string>[]) {
    const normalized = rows.map((row, index) => ({ ...row, partner_code: row.partner_code || `DT-${Date.now()}-${index + 1}` }));
    appendClientRows("partners", normalized);
    refreshLocal();
    setMessage(`Đã import ${normalized.length} đối tác. Dữ liệu được giữ sau khi refresh trên trình duyệt này.`);
    setShowForm(false);
  }

  function createPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    appendClientRows("partners", [{ partner_code: `DT-${Date.now()}`, partner_name: form.name, category: form.category, region: form.region, rating: form.rating, projects: form.projects, safety: form.safety, status: form.status }]);
    refreshLocal();
    setForm(emptyForm);
    setShowForm(false);
    setMessage("Đã tạo đối tác. Refresh trang dữ liệu vẫn còn trên trình duyệt này.");
  }

  return <div className="space-y-5 animate-fade-up">
    <PageHeader eyebrow="Partner Marketplace" title="Hệ sinh thái đối tác" description="Quản lý hồ sơ năng lực, đánh giá hiệu suất, an toàn và lịch sử hợp tác của nhà thầu phụ, nhà cung cấp." actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-orange-200"><Plus size={16} /> Thêm đối tác</button>} />
    {message ? <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">{message}</div> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Đối tác hoạt động" value={String(items.length)} note="dữ liệu đã nhập" icon={Handshake} tone="orange" />
      <StatCard title="Đối tác chiến lược" value={String(strategic)} note="ưu tiên phân bổ" icon={BadgeCheck} tone="green" />
      <StatCard title="Đang đánh giá" value={String(reviewing)} note="hồ sơ mới" icon={UsersRound} tone="blue" />
      <StatCard title="Điểm trung bình" value={`${averageRating}/5`} note="chất lượng hợp tác" icon={Star} tone="violet" />
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_200px]"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event)=>setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm tên, mã, lĩnh vực, khu vực..." /></label><select value={category} onChange={(event)=>setCategory(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600"><option value="all">Tất cả lĩnh vực</option>{categories.map((item)=><option key={item}>{item}</option>)}</select></div></section>

    {filtered.length ? <section className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">{filtered.map((partner) => <article key={partner.code} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Building2 size={19} /></span><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-orange-600">{partner.code}</p><h3 className="mt-1 truncate text-sm font-black text-slate-900">{partner.name}</h3><p className="mt-1 text-[11px] text-slate-500">{partner.category} · {partner.region}</p></div></div><span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700">{partner.status}</span></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl bg-slate-50 p-2.5 text-center"><p className="text-base font-black">{partner.rating}</p><p className="text-[9px] text-slate-400">ĐÁNH GIÁ</p></div><div className="rounded-xl bg-slate-50 p-2.5 text-center"><p className="text-base font-black">{partner.projects}</p><p className="text-[9px] text-slate-400">DỰ ÁN</p></div><div className="rounded-xl bg-slate-50 p-2.5 text-center"><p className="text-base font-black">{partner.safety}</p><p className="text-[9px] text-slate-400">HSE</p></div></div><div className="mt-4"><div className="mb-1 flex justify-between text-[10px]"><span className="flex items-center gap-1 font-bold text-slate-600"><ShieldCheck size={13} /> Mức đáp ứng</span><span className="font-black">{Math.round((partner.rating / 5) * 100)}%</span></div><ProgressBar value={(partner.rating / 5) * 100} tone="green" /></div></article>)}</section> : <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Chưa có dữ liệu đối tác.</p>}

    {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={()=>setShowForm(false)} /><form onSubmit={createPartner} className="modal-panel relative w-full max-w-3xl rounded-t-[24px] bg-white p-5 shadow-2xl sm:rounded-[24px]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">Partner</p><h2 className="mt-1 text-lg font-black text-slate-900">Thêm đối tác</h2></div><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Đóng</button></div><BulkImportPanel className="mt-4" compact fields={[{ name: "partner_code", label: "Mã đối tác", placeholder: "DT-001" },{ name: "partner_name", label: "Tên đối tác", placeholder: "Công ty ABC", required: true },{ name: "category", label: "Lĩnh vực", placeholder: "Nhà cung cấp" },{ name: "region", label: "Khu vực", placeholder: "Miền Bắc" },{ name: "rating", label: "Điểm đánh giá", placeholder: "5" },{ name: "projects", label: "Số dự án", placeholder: "0" },{ name: "safety", label: "HSE score", placeholder: "100" },{ name: "status", label: "Trạng thái", placeholder: "Đạt chuẩn" }]} onImport={importPartners} />
      <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Tên đối tác<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Lĩnh vực<input value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Khu vực<input value={form.region} onChange={(e)=>setForm({...form,region:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Đánh giá<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e)=>setForm({...form,rating:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Trạng thái<input value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" /></label></div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold">Hủy</button><button className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white">Lưu đối tác</button></div></form></div> : null}
  </div>;
}
