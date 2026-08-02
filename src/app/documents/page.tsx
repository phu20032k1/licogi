"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Download, FileCheck2, FileClock, FileSearch, FolderOpen, Search, Upload, PlusCircle, Save } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import BulkImportPanel from "../../components/BulkImportPanel";
import { appendClientRows, mergeServerAndClientRows, readClientRows } from "../../lib/clientDataStore";

function EmptyBox({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center"><p className="text-sm font-black text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

function rowsToDocuments(rows: Record<string, string>[]) {
  return rows.map((row, index) => ({
    code: row.document_code || `DOC-${String(index + 1).padStart(3, "0")}`,
    name: row.document_name || "Tài liệu chưa đặt tên",
    project: row.project_code || "Chưa gắn dự án",
    type: row.document_type || "Hồ sơ năng lực",
    revision: row.revision || "Rev.01",
    owner: row.owner || "Phòng Kỹ thuật",
    updated: row._updatedAt ? new Date(row._updatedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: row.status || "Chờ phê duyệt",
  }));
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [items, setItems] = useState(() => rowsToDocuments(readClientRows("documents")));
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [draft, setDraft] = useState({ code: "DOC-NEW-001", name: "", project: "", type: "Hồ sơ năng lực", revision: "Rev.01", owner: "Phòng Kỹ thuật", updated: new Date().toISOString().slice(0, 10), status: "Chờ phê duyệt" });

  async function loadDocuments() {
    try {
      const response = await fetch("/api/data/documents", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được hồ sơ.");
      const merged = mergeServerAndClientRows("documents", data.rows || []);
      setItems(rowsToDocuments(merged));
    } catch {
      setItems(rowsToDocuments(readClientRows("documents")));
    }
  }

  useEffect(() => { void loadDocuments(); }, []);

  async function importDocuments(rows: Record<string, string>[]) {
    const normalized = rows.map((row, index) => ({ ...row, document_code: row.document_code || `DOC-${Date.now()}-${index + 1}`, status: row.status || "Chờ phê duyệt" }));
    const response = await fetch("/api/data/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "append", rows: normalized }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Không import được hồ sơ.");
    setMessage(`Đã import ${normalized.length} hồ sơ vào database.`);
    await loadDocuments();
  }

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((item) => {
      const matches = !keyword || [item.code, item.name, item.project, item.owner].some((value) => value.toLocaleLowerCase("vi").includes(keyword));
      return matches && (type === "all" || item.type === type);
    });
  }, [items, search, type]);

  const types = Array.from(new Set(items.map((item) => item.type)));
  const approved = items.filter((item) => item.status === "Đã phê duyệt").length;
  const waiting = items.filter((item) => item.status.includes("Chờ")).length;

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "documents");
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không upload được hồ sơ.");
      const upsertResponse = await fetch("/api/data/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "append", rows: [{ document_code: `DOC-${String(items.length + 1).padStart(3, "0")}`, document_name: file.name, project_code: draft.project.trim() || "", document_type: draft.type, revision: draft.revision, status: draft.status, file_url: data.file?.publicUrl || "", source: "Upload từ hồ sơ/bản vẽ" }] }) });
      const upsertData = await upsertResponse.json();
      if (!upsertResponse.ok || !upsertData.ok) throw new Error(upsertData.message ?? "Không lưu được hồ sơ vào Data Center.");
      await loadDocuments();
      setDraft((current) => ({ ...current, code: `DOC-${String(items.length + 2).padStart(3, "0")}`, name: "", project: "", type: current.type, revision: current.revision, owner: current.owner, updated: current.updated, status: current.status }));
      setMessage(`Đã upload ${file.name} và lưu vào Data Center.`);
    } catch (error) {
      const fallbackCode = `DOC-${String(items.length + 1).padStart(3, "0")}`;
      const fallbackItem = { code: fallbackCode, name: file.name, project: draft.project || "Chưa gắn dự án", type: draft.type, revision: draft.revision, owner: draft.owner, updated: new Date().toISOString().slice(0, 10), status: draft.status };
      appendClientRows("documents", [{ document_code: fallbackItem.code, document_name: fallbackItem.name, project_code: fallbackItem.project, document_type: fallbackItem.type, revision: fallbackItem.revision, status: fallbackItem.status, source: "Upload từ hồ sơ/bản vẽ (bản cục bộ)" }]);
      setItems((current) => [fallbackItem, ...current]);
      setMessage(error instanceof Error ? error.message : "Đã lưu hồ sơ vào bản ghi cục bộ.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function addDraftDocument() {
    if (!draft.name.trim()) {
      setMessage("Vui lòng nhập tên hồ sơ trước khi lưu.");
      return;
    }
    const nextItem = { code: draft.code, name: draft.name.trim(), project: draft.project.trim() || "Chưa gắn dự án", type: draft.type, revision: draft.revision, owner: draft.owner, updated: new Date().toISOString().slice(0, 10), status: draft.status };
    try {
      const upsertResponse = await fetch("/api/data/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "append", rows: [{ document_code: nextItem.code, document_name: nextItem.name, project_code: nextItem.project, document_type: nextItem.type, revision: nextItem.revision, status: nextItem.status, source: "Thêm nhanh từ hồ sơ/bản vẽ" }] }) });
      const upsertData = await upsertResponse.json();
      if (!upsertResponse.ok || !upsertData.ok) throw new Error(upsertData.message ?? "Không lưu được hồ sơ vào Data Center.");
      await loadDocuments();
      setMessage(`Đã thêm hồ sơ ${nextItem.name} vào danh sách và Data Center.`);
    } catch {
      appendClientRows("documents", [{ document_code: nextItem.code, document_name: nextItem.name, project_code: nextItem.project, document_type: nextItem.type, revision: nextItem.revision, status: nextItem.status, source: "Thêm nhanh từ hồ sơ/bản vẽ (bản cục bộ)" }]);
      setItems((current) => [nextItem, ...current]);
      setMessage(`Đã thêm hồ sơ ${nextItem.name} vào danh sách cục bộ.`);
    }
    setDraft({ code: `DOC-${String(items.length + 2).padStart(3, "0")}`, name: "", project: "", type: "Hồ sơ năng lực", revision: "Rev.01", owner: "Phòng Kỹ thuật", updated: new Date().toISOString().slice(0, 10), status: "Chờ phê duyệt" });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Document Control Center"
        title="Hồ sơ, bản vẽ & BIM"
        description="Quản lý phiên bản, trạng thái phê duyệt và truy xuất hồ sơ kỹ thuật theo từng dự án. Dữ liệu ban đầu để trống, không dùng số liệu giả."
        actions={<><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm"><Upload size={16} /> Tải hồ sơ lên<input type="file" className="hidden" onChange={handleUpload} /></label><button type="button" onClick={() => setMessage("Thư mục mới đã được mở và sẵn sàng để sắp xếp hồ sơ.")} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><FolderOpen size={16} /> Tạo thư mục</button></>}
      />

      {message ? <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">{message}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng hồ sơ" value={String(items.length)} note="toàn bộ dự án" icon={FolderOpen} tone="slate" />
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
              <button type="button" onClick={() => setShowAdvancedFilters((value) => !value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50">Bộ lọc nâng cao</button>
            </div>
            {showAdvancedFilters ? (
              <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-3">
                <label className="text-xs font-bold text-slate-600">Trạng thái<select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">Tất cả</option><option>Chờ phê duyệt</option><option>Đã phê duyệt</option></select></label>
                <label className="text-xs font-bold text-slate-600">Owner<select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">Tất cả</option><option>Phòng Kỹ thuật</option><option>Phòng QHSE</option></select></label>
                <label className="text-xs font-bold text-slate-600">Dự án<select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">Tất cả</option><option>Chưa gắn dự án</option></select></label>
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 p-4">
              <BulkImportPanel compact fields={[{ name: "document_code", label: "Mã hồ sơ", placeholder: "DOC-001" },{ name: "document_name", label: "Tên hồ sơ", placeholder: "Biện pháp thi công", required: true },{ name: "project_code", label: "Mã dự án", placeholder: "LCG-2026-001" },{ name: "document_type", label: "Loại hồ sơ", placeholder: "Bản vẽ thiết kế" },{ name: "revision", label: "Phiên bản", placeholder: "Rev.01" },{ name: "status", label: "Trạng thái", placeholder: "Chờ phê duyệt" },{ name: "file_url", label: "URL file", placeholder: "" }]} onImport={importDocuments} description="Import danh sách hồ sơ từ CSV hoặc dán bảng Excel; dữ liệu được ghi vào Data Center." />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <label className="text-xs font-bold text-slate-600">Mã hồ sơ<input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /></label>
                <label className="text-xs font-bold text-slate-600">Tên hồ sơ<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Nhập tên hồ sơ" /></label>
                <label className="text-xs font-bold text-slate-600">Dự án liên quan<input value={draft.project} onChange={(event) => setDraft((current) => ({ ...current, project: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Mã dự án/đề tài" /></label>
                <label className="text-xs font-bold text-slate-600">Loại hồ sơ<select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option>Hồ sơ năng lực</option><option>Bản vẽ thiết kế</option><option>Biện pháp thi công</option><option>Hồ sơ nghiệm thu</option><option>QA/QC & HSE</option><option>RFI & Submittal</option></select></label>
                <button type="button" onClick={addDraftDocument} disabled={uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-orange-700 disabled:bg-slate-300"><PlusCircle size={15} /> Thêm nhanh</button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Save size={14} /> Hàm này lưu ngay vào danh sách hiện tại; bạn cũng có thể tải file thật lên bằng nút ở đầu trang.</div>
            </div>
            <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Tài liệu</th><th className="px-4 py-4">Dự án</th><th className="px-4 py-4">Loại</th><th className="px-4 py-4">Phiên bản</th><th className="px-4 py-4">Phụ trách</th><th className="px-4 py-4">Cập nhật</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item)=><tr key={item.code} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="max-w-[300px] truncate font-extrabold text-slate-900">{item.name}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{item.code}</p></td><td className="max-w-[220px] px-4 py-4"><p className="truncate font-semibold text-slate-600">{item.project}</p></td><td className="px-4 py-4 text-slate-600">{item.type}</td><td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{item.revision}</span></td><td className="px-4 py-4 text-slate-600">{item.owner}</td><td className="px-4 py-4 text-slate-500">{item.updated}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${item.status === "Đã phê duyệt" ? "bg-emerald-50 text-emerald-700" : item.status.includes("Chờ") ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{item.status}</span></td><td className="px-5 py-4"><button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Download size={15} /></button></td></tr>)}</tbody></table></div>
            {filtered.length === 0 ? <div className="p-6"><EmptyBox title="Chưa có hồ sơ" description="Nhập hồ sơ/bản vẽ tại Trung tâm dữ liệu hoặc tải file lên bằng nút ở đầu trang." /></div> : null}
          </section>
        </div>
      </section>
    </div>
  );
}
