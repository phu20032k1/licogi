"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { FileCheck2, FileClock, FileSearch, FolderOpen, PlusCircle, Search, Trash2, Upload } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import BulkImportPanel from "../../components/BulkImportPanel";

type DocumentItem = { id: string; code: string; name: string; project: string; type: string; revision: string; owner: string; updated: string; status: string };
type StoredRow = Record<string, string> & { _id: string; _createdAt?: string; _updatedAt?: string };

function rowsToDocuments(rows: StoredRow[]): DocumentItem[] {
  return rows.map((row, index) => ({
    id: row._id,
    code: row.document_code || `DOC-${String(index + 1).padStart(3, "0")}`,
    name: row.document_name || "Tài liệu chưa đặt tên",
    project: row.project_code || "Chưa gắn dự án",
    type: row.document_type || "Hồ sơ năng lực",
    revision: row.revision || "Rev.01",
    owner: row.owner || row.source || "Phòng Kỹ thuật",
    updated: row._updatedAt ? new Date(row._updatedAt).toISOString().slice(0, 10) : "",
    status: row.status || "Chờ phê duyệt",
  }));
}

export default function DocumentsPage() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({ name: "", project: "", type: "Hồ sơ năng lực", revision: "Rev.01", status: "Chờ phê duyệt" });

  async function loadDocuments() {
    setError("");
    try {
      const response = await fetch("/api/data/documents", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được hồ sơ.");
      setItems(rowsToDocuments((data.rows || []) as StoredRow[]));
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được hồ sơ.");
    }
  }

  useEffect(() => { void loadDocuments(); }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((item) => (!keyword || [item.code, item.name, item.project, item.owner].some((value) => value.toLocaleLowerCase("vi").includes(keyword))) && (type === "all" || item.type === type));
  }, [items, search, type]);
  const types = Array.from(new Set(items.map((item) => item.type)));
  const approved = items.filter((item) => item.status === "Đã phê duyệt").length;
  const waiting = items.filter((item) => item.status.includes("Chờ")).length;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected = Boolean(filtered.length) && filtered.every((item) => selectedSet.has(item.id));

  async function importDocuments(rows: Record<string, string>[]) {
    const normalized = rows.map((row, index) => ({ ...row, document_code: row.document_code || `DOC-${Date.now()}-${index + 1}`, status: row.status || "Chờ phê duyệt" }));
    const response = await fetch("/api/data/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "append", rows: normalized }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Không import được hồ sơ.");
    setMessage(`Đã import ${normalized.length} hồ sơ.`);
    await loadDocuments();
  }

  async function addDraftDocument() {
    if (!draft.name.trim()) { setError("Vui lòng nhập tên hồ sơ."); return; }
    setError("");
    const response = await fetch("/api/data/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "append", rows: [{ document_code: `DOC-${Date.now()}`, document_name: draft.name.trim(), project_code: draft.project.trim(), document_type: draft.type, revision: draft.revision, status: draft.status, source: "Thêm nhanh" }] }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) { setError(data.message || "Không lưu được hồ sơ."); return; }
    setDraft({ name: "", project: "", type: "Hồ sơ năng lực", revision: "Rev.01", status: "Chờ phê duyệt" });
    setShowCreate(false);
    setMessage("Đã thêm hồ sơ.");
    await loadDocuments();
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "documents");
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không upload được hồ sơ.");
      await importDocuments([{ document_code: `DOC-${Date.now()}`, document_name: file.name, document_type: "Hồ sơ", revision: "Rev.01", status: "Chờ phê duyệt", file_url: data.file?.publicUrl || "", source: "Upload" }]);
      setMessage(`Đã upload ${file.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không upload được hồ sơ.");
    } finally { setUploading(false); event.target.value = ""; }
  }

  function toggleItem(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleAllFiltered() {
    const ids = filtered.map((item) => item.id);
    setSelectedIds((current) => allFilteredSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])));
  }

  async function deleteDocuments(ids: string[]) {
    if (!ids.length || deleting) return;
    if (!window.confirm(`Xóa ${ids.length} hồ sơ đã chọn?`)) return;
    setDeleting(true); setError("");
    try {
      const response = await fetch("/api/data/documents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message || "Không xóa được hồ sơ.");
      setMessage(`Đã xóa ${ids.length} hồ sơ.`);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được hồ sơ.");
    } finally { setDeleting(false); }
  }

  return <div className="space-y-5 animate-fade-up">
    <PageHeader eyebrow="Document Control" title="Hồ sơ, bản vẽ & BIM" description="Quản lý phiên bản, trạng thái và dữ liệu hồ sơ theo dự án." actions={<div className="flex flex-wrap gap-2"><label className="licogi-btn licogi-btn-secondary cursor-pointer"><Upload size={16} /> {uploading ? "Đang tải..." : "Tải hồ sơ"}<input type="file" className="hidden" onChange={handleUpload} /></label><button type="button" onClick={() => setShowCreate(true)} className="licogi-btn licogi-btn-primary"><PlusCircle size={16} /> Thêm hồ sơ</button></div>} />
    {message ? <div className="rounded-[16px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
    {error ? <div className="rounded-[16px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Tổng hồ sơ" value={String(items.length)} note="toàn bộ dự án" icon={FolderOpen} tone="slate" /><StatCard title="Đã phê duyệt" value={String(approved)} note="theo dữ liệu hiện có" icon={FileCheck2} tone="green" /><StatCard title="Chờ xử lý" value={String(waiting)} note="cần ký/phản hồi" icon={FileClock} tone="orange" /><StatCard title="Phiên bản mới" value="0" note="trong 7 ngày" icon={FileSearch} tone="blue" /></section>

    <section className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]"><label className="flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm mã hồ sơ, tên tài liệu, dự án..." /></label><select value={type} onChange={(event) => setType(event.target.value)} className="rounded-[12px] border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả loại hồ sơ</option>{types.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={toggleAllFiltered} className="licogi-btn licogi-btn-secondary">{allFilteredSelected ? "Bỏ chọn" : "Chọn tất cả"}</button></div>
      {selectedIds.length ? <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><p className="text-xs font-bold text-slate-600">Đã chọn {selectedIds.length} hồ sơ</p><button type="button" onClick={() => void deleteDocuments(selectedIds)} disabled={deleting} className="licogi-btn licogi-btn-danger"><Trash2 size={15} /> {deleting ? "Đang xóa..." : `Xóa ${selectedIds.length}`}</button></div> : null}
    </section>

    <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <div className="licogi-table-scroll max-h-[700px] overflow-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="sticky top-0 z-10 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500 backdrop-blur"><tr><th className="w-12 px-4 py-3"><input aria-label="Chọn tất cả hồ sơ đang hiển thị" type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></th><th className="px-4 py-3">Hồ sơ</th><th className="px-4 py-3">Dự án</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Phiên bản</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Trạng thái</th><th className="sticky right-0 bg-slate-50/95 px-4 py-3 text-right">Xóa</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => {
        const selected = selectedSet.has(item.id);
        return <tr key={item.id} className={selected ? "bg-orange-50/60" : "hover:bg-slate-50/70"}><td className="px-4 py-3"><input aria-label={`Chọn ${item.name}`} type="checkbox" checked={selected} onChange={() => toggleItem(item.id)} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></td><td className="px-4 py-3"><p className="max-w-[300px] truncate font-extrabold text-slate-900">{item.name}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{item.code}{item.updated ? ` · ${item.updated}` : ""}</p></td><td className="max-w-[190px] px-4 py-3 font-semibold text-slate-600">{item.project}</td><td className="px-4 py-3 text-slate-600">{item.type}</td><td className="px-4 py-3 font-bold text-slate-700">{item.revision}</td><td className="px-4 py-3 text-slate-600">{item.owner}</td><td className="px-4 py-3"><span className={`rounded-[9px] px-2 py-1 text-[10px] font-extrabold ${item.status === "Đã phê duyệt" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span></td><td className={`sticky right-0 px-4 py-3 text-right ${selected ? "bg-orange-50" : "bg-white"}`}><button type="button" onClick={() => void deleteDocuments([item.id])} className="licogi-icon-btn licogi-icon-btn-danger"><Trash2 size={14} /></button></td></tr>;
      })}</tbody></table></div>{!filtered.length ? <p className="p-8 text-center text-sm text-slate-500">Chưa có hồ sơ phù hợp.</p> : null}</section>

    {showCreate ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={() => setShowCreate(false)} aria-label="Đóng" /><div className="modal-panel licogi-scroll relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-[22px] bg-white p-5 shadow-2xl sm:rounded-[20px]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">Document</p><h2 className="mt-1 text-lg font-black text-slate-900">Thêm hồ sơ</h2></div><button type="button" onClick={() => setShowCreate(false)} className="licogi-btn licogi-btn-secondary">Đóng</button></div><BulkImportPanel className="mt-4" compact fields={[{ name: "document_code", label: "Mã hồ sơ", placeholder: "DOC-001" },{ name: "document_name", label: "Tên hồ sơ", placeholder: "Biện pháp thi công", required: true },{ name: "project_code", label: "Mã dự án", placeholder: "LCG-001" },{ name: "document_type", label: "Loại hồ sơ", placeholder: "Bản vẽ" },{ name: "revision", label: "Phiên bản", placeholder: "Rev.01" },{ name: "status", label: "Trạng thái", placeholder: "Chờ phê duyệt" }]} onImport={importDocuments} />
      <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Tên hồ sơ<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Mã dự án<input value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Loại hồ sơ<input value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Phiên bản<input value={draft.revision} onChange={(e) => setDraft({ ...draft, revision: e.target.value })} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Trạng thái<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option>Chờ phê duyệt</option><option>Đã phê duyệt</option></select></label></div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="licogi-btn licogi-btn-secondary">Hủy</button><button type="button" onClick={() => void addDraftDocument()} className="licogi-btn licogi-btn-primary">Lưu hồ sơ</button></div></div></div> : null}
  </div>;
}
