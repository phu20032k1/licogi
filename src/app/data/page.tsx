"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  Edit3,
  FileSpreadsheet,
  ListChecks,
  PlusCircle,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import { DataEntity, DataEntityKey, dataEntities, importChecklist } from "../../data/dataCenter";

type PreviewRow = Record<string, string>;
type StoredRow = PreviewRow & { _id: string; _createdAt: string; _updatedAt: string };
type ImportError = { row: number; message: string };
type BulkMode = "append" | "replace";

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuote = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuote && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (char === "," && !inQuote) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function hasHeader(entity: DataEntity, firstLine: string[]) {
  const required = entity.columns.filter((column) => column.required).map((column) => column.key);
  return required.every((key) => firstLine.includes(key));
}

function parseCsvText(entity: DataEntity, text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return { headers: entity.columns.map((column) => column.key), rows: [] as PreviewRow[] };
  const first = parseCsvLine(lines[0]).map((item) => item.trim());
  const headers = hasHeader(entity, first) ? first : entity.columns.map((column) => column.key);
  const dataLines = hasHeader(entity, first) ? lines.slice(1) : lines;
  const rows = dataLines.map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<PreviewRow>((obj, key, index) => {
      obj[key] = cells[index] ?? "";
      return obj;
    }, {});
  });
  return { headers, rows };
}

function validateRows(entity: DataEntity, rows: PreviewRow[]) {
  const errors: ImportError[] = [];
  const required = entity.columns.filter((column) => column.required).map((column) => column.key);
  rows.forEach((row, index) => {
    required.forEach((key) => {
      if (!String(row[key] ?? "").trim()) errors.push({ row: index + 2, message: `Thiếu cột bắt buộc: ${key}` });
    });
    if (entity.key === "projects") {
      if (row.status && !["ongoing", "completed", "warranty"].includes(row.status)) errors.push({ row: index + 2, message: "status phải là ongoing / completed / warranty" });
      if (row.progress && (Number.isNaN(Number(row.progress)) || Number(row.progress) < 0 || Number(row.progress) > 100)) errors.push({ row: index + 2, message: "progress phải từ 0 đến 100" });
    }
    if (row.contact_email && !row.contact_email.includes("@")) errors.push({ row: index + 2, message: "Email liên hệ không hợp lệ" });
  });
  return errors;
}

async function fetchRows(entity: DataEntityKey) {
  const response = await fetch(`/api/data/${entity}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.message ?? "Không đọc được dữ liệu");
  return data.rows as StoredRow[];
}

export default function DataCenterPage() {
  const [activeKey, setActiveKey] = useState<DataEntityKey>("projects");
  const [rows, setRows] = useState<StoredRow[]>([]);
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [fileName, setFileName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<BulkMode>("append");
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const activeEntity = useMemo(() => dataEntities.find((item) => item.key === activeKey) ?? dataEntities[0], [activeKey]);
  const visibleColumns = activeEntity.columns.map((column) => column.key);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const totalRecords = Object.values(rowCounts).reduce((sum, count) => sum + count, 0);
  const cleanRate = rows.length ? Math.max(0, 100 - Math.min(100, validateRows(activeEntity, rows).length)) : 0;

  async function refresh(entity: DataEntityKey = activeKey) {
    setLoading(true);
    try {
      const loaded = await fetchRows(entity);
      setRows(loaded);
      setSelectedIds([]);
      setRowCounts((current) => ({ ...current, [entity]: loaded.length }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAllCounts() {
    const pairs = await Promise.all(dataEntities.map(async (entity) => {
      try {
        const loaded = await fetchRows(entity.key);
        return [entity.key, loaded.length] as const;
      } catch {
        return [entity.key, 0] as const;
      }
    }));
    setRowCounts(Object.fromEntries(pairs));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh(activeKey);
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAllCounts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function clearPreview() {
    setPreviewRows([]);
    setHeaders([]);
    setErrors([]);
    setFileName("");
    setBulkText("");
    if (fileInput.current) fileInput.current.value = "";
  }

  function readCsv(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsvText(activeEntity, String(reader.result ?? ""));
      setHeaders(parsed.headers);
      setPreviewRows(parsed.rows);
      setErrors(validateRows(activeEntity, parsed.rows));
    };
    reader.readAsText(file, "utf-8");
  }

  function previewBulkText() {
    const parsed = parseCsvText(activeEntity, bulkText);
    setFileName("Nhập nhanh từ ô dán dữ liệu");
    setHeaders(parsed.headers);
    setPreviewRows(parsed.rows);
    setErrors(validateRows(activeEntity, parsed.rows));
  }

  async function confirmImport() {
    if (!previewRows.length || errors.length) return;
    if (bulkMode === "replace" && !window.confirm(`Thay thế toàn bộ bảng “${activeEntity.title}” bằng ${previewRows.length} dòng mới?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/data/${activeEntity.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: bulkMode, rows: previewRows }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không nhập được dữ liệu.");
      setRows(data.rows);
      setRowCounts((current) => ({ ...current, [activeEntity.key]: data.rows.length }));
      setMessage(`Đã ${bulkMode === "replace" ? "thay thế" : "thêm"} ${previewRows.length} dòng vào ${activeEntity.title.toLowerCase()}.`);
      window.dispatchEvent(new CustomEvent("licogi-data-imported", { detail: { entity: activeEntity.key, rows: previewRows.length } }));
      clearPreview();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không nhập được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAll() {
    setSelectedIds((current) => current.length === rows.length ? [] : rows.map((row) => row._id));
  }

  function toggleRow(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Xóa ${selectedIds.length} dòng đã chọn khỏi “${activeEntity.title}”?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/data/${activeEntity.key}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không xóa được dữ liệu.");
      setRows(data.rows);
      setSelectedIds([]);
      setRowCounts((current) => ({ ...current, [activeEntity.key]: data.rows.length }));
      setMessage("Đã xóa các dòng đã chọn.");
      window.dispatchEvent(new CustomEvent("licogi-data-imported", { detail: { entity: activeEntity.key } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không xóa được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAll() {
    if (!window.confirm(`Xóa toàn bộ dữ liệu trong bảng “${activeEntity.title}”?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/data/${activeEntity.key}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không xóa được dữ liệu.");
      setRows([]);
      setSelectedIds([]);
      setRowCounts((current) => ({ ...current, [activeEntity.key]: 0 }));
      setMessage("Đã xóa toàn bộ dữ liệu của bảng đang chọn.");
      window.dispatchEvent(new CustomEvent("licogi-data-imported", { detail: { entity: activeEntity.key } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không xóa được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  async function bulkEdit() {
    if (!selectedIds.length || !editField) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/data/${activeEntity.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, patch: { [editField]: editValue } }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không sửa được dữ liệu.");
      setRows(data.rows);
      setMessage(`Đã sửa trường “${editField}” cho ${selectedIds.length} dòng.`);
      window.dispatchEvent(new CustomEvent("licogi-data-imported", { detail: { entity: activeEntity.key } }));
      setEditValue("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không sửa được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  async function updateCell(row: StoredRow, key: string, value: string) {
    const nextRow = { ...row, [key]: value };
    setRows((current) => current.map((item) => item._id === row._id ? nextRow : item));
    await fetch(`/api/data/${activeEntity.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: nextRow }),
    });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Data Center"
        title="Trung tâm dữ liệu & nhập liệu"
        description="Nhập dữ liệu sạch từ CSV, thêm hàng loạt, sửa hàng loạt và xóa hàng loạt trước khi đưa lên Dashboard, GIS, hồ sơ, thi công và bảo hành. Dữ liệu ban đầu để trống, không còn dữ liệu minh họa."
        actions={
          <a href={activeEntity.templateFile} download className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200 hover:bg-orange-700">
            <Download size={16} /> Tải cấu trúc CSV
          </a>
        }
      />

      {message ? <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">{message}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng bản ghi" value={String(totalRecords)} note="từ các bảng dữ liệu" icon={Database} tone="orange" />
        <StatCard title="Nhóm dữ liệu" value={String(dataEntities.length)} note="dự án, khách hàng, hồ sơ..." icon={ClipboardList} tone="blue" />
        <StatCard title="Bảng đang chọn" value={String(rows.length)} note={activeEntity.title} icon={FileSpreadsheet} tone="green" />
        <StatCard title="Tỷ lệ hợp lệ" value={`${cleanRate}%`} note="theo cột bắt buộc" icon={CheckCircle2} tone="violet" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="professional-card rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Kho dữ liệu</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Chọn bảng</h2>
            </div>
            <Database className="text-orange-600" size={22} />
          </div>
          <div className="mt-4 space-y-2">
            {dataEntities.map((entity) => (
              <button
                type="button"
                key={entity.key}
                onClick={() => { setActiveKey(entity.key); clearPreview(); }}
                className={`w-full rounded-2xl border p-4 text-left transition ${activeEntity.key === entity.key ? "border-orange-300 bg-orange-50/80 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{entity.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{entity.owner}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-700 ring-1 ring-slate-200">{rowCounts[entity.key] ?? 0}</span>
                </div>
                <p className="mt-3 text-[11px] font-semibold text-slate-400">{entity.description}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="professional-card rounded-[24px] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">{activeEntity.owner}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{activeEntity.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{activeEntity.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => refresh()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><RefreshCcw size={15} /> Tải lại</button>
                <a href={activeEntity.templateFile} download className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><Download size={15} /> Tải CSV</a>
                <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => readCsv(event.target.files?.[0])} />
                <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800"><Upload size={15} /> Chọn file</button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">Cấu trúc cột</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-y border-slate-200 bg-white text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400"><tr><th className="px-4 py-3">Tên cột</th><th className="px-4 py-3">Bắt buộc</th><th className="px-4 py-3">Ví dụ</th><th className="px-4 py-3">Ghi chú</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {activeEntity.columns.map((column) => (
                      <tr key={column.key} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-black text-slate-900">{column.key}<p className="mt-0.5 text-[11px] font-semibold text-slate-400">{column.label}</p></td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${column.required ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{column.required ? "Có" : "Không"}</span></td>
                        <td className="px-4 py-3 text-slate-600">{column.example}</td>
                        <td className="px-4 py-3 text-slate-500">{column.note ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="professional-card rounded-[24px] p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-700"><PlusCircle size={20} /></span>
                  <div><h2 className="text-lg font-black text-slate-950">Thêm hàng loạt</h2><p className="mt-1 text-sm text-slate-500">Upload CSV hoặc dán nhiều dòng. Có thể thêm vào bảng hiện tại hoặc thay thế toàn bộ bảng.</p></div>
                </div>
                <textarea value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={7} className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50" placeholder={`Dán CSV tại đây. Có thể có header hoặc theo đúng thứ tự:\n${visibleColumns.join(",")}`} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={previewBulkText} disabled={!bulkText.trim()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white disabled:bg-slate-300"><FileSpreadsheet size={15} /> Kiểm tra dữ liệu dán</button>
                  <select value={bulkMode} onChange={(event) => setBulkMode(event.target.value as BulkMode)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700"><option value="append">Thêm vào dữ liệu hiện có</option><option value="replace">Thay thế toàn bộ bảng</option></select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black text-slate-900">Sửa / xóa hàng loạt</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">Chọn nhiều dòng bên dưới, sau đó sửa cùng một trường hoặc xóa hàng loạt.</p>
                <label className="mt-4 block text-xs font-bold text-slate-600">Trường cần sửa
                  <select value={editField} onChange={(event) => setEditField(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
                    <option value="">Chọn trường</option>
                    {activeEntity.columns.map((column) => <option key={column.key} value={column.key}>{column.key} - {column.label}</option>)}
                  </select>
                </label>
                <label className="mt-3 block text-xs font-bold text-slate-600">Giá trị mới
                  <input value={editValue} onChange={(event) => setEditValue(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" placeholder="Nhập giá trị áp dụng cho các dòng đã chọn" />
                </label>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={bulkEdit} disabled={!selectedIds.length || !editField || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2.5 text-xs font-extrabold text-white disabled:bg-slate-300"><Edit3 size={14} /> Sửa {selectedIds.length || ""}</button>
                  <button type="button" onClick={deleteSelected} disabled={!selectedIds.length || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-extrabold text-white disabled:bg-slate-300"><Trash2 size={14} /> Xóa {selectedIds.length || ""}</button>
                </div>
                <button type="button" onClick={deleteAll} disabled={!rows.length || loading} className="mt-2 w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-extrabold text-red-700 hover:bg-red-50 disabled:text-slate-300">Xóa toàn bộ bảng đang chọn</button>
              </div>
            </div>

            {fileName || previewRows.length ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-orange-600 ring-1 ring-slate-200"><FileSpreadsheet size={20} /></span><div><p className="font-black text-slate-900">{fileName}</p><p className="mt-1 text-xs text-slate-500">{previewRows.length} dòng · {headers.length} cột nhận diện</p></div></div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${errors.length ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{errors.length ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}{errors.length ? `${errors.length} lỗi` : "Sẵn sàng nhập"}</span>
                </div>

                {errors.length ? (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-black text-red-800">Cần sửa dữ liệu trước khi nhập</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {errors.slice(0, 10).map((error, index) => <div key={`${error.row}-${index}`} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-100">Dòng {error.row}: {error.message}</div>)}
                    </div>
                  </div>
                ) : null}

                {previewRows.length ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-xs">
                        <thead className="bg-slate-100 font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr>{headers.slice(0, 10).map((header) => <th key={header} className="px-3 py-3">{header}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewRows.slice(0, 8).map((row, index) => <tr key={index}>{headers.slice(0, 10).map((header) => <td key={header} className="px-3 py-3 text-slate-600">{row[header] || <span className="text-slate-300">trống</span>}</td>)}</tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={clearPreview} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-white"><XCircle size={15} /> Hủy preview</button>
                  <button type="button" onClick={confirmImport} disabled={!previewRows.length || !!errors.length || loading} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Save size={15} /> {bulkMode === "replace" ? "Thay thế dữ liệu" : "Xác nhận thêm"}</button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="professional-card rounded-[24px] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">Dữ liệu hiện có</h2>
                <p className="mt-1 text-sm text-slate-500">Có thể sửa trực tiếp từng ô, chọn nhiều dòng để sửa/xóa hàng loạt.</p>
              </div>
              <button type="button" onClick={toggleAll} disabled={!rows.length} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-700 disabled:text-slate-300">{selectedIds.length === rows.length && rows.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}</button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-xs">
                  <thead className="bg-slate-100 font-extrabold uppercase tracking-[0.08em] text-slate-500">
                    <tr><th className="w-12 px-3 py-3">Chọn</th>{visibleColumns.map((column) => <th key={column} className="px-3 py-3">{column}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row._id} className={selectedSet.has(row._id) ? "bg-orange-50/50" : "hover:bg-slate-50/70"}>
                        <td className="px-3 py-2"><input type="checkbox" checked={selectedSet.has(row._id)} onChange={() => toggleRow(row._id)} /></td>
                        {visibleColumns.map((column) => (
                          <td key={column} className="min-w-[150px] px-2 py-2">
                            <input value={row[column] ?? ""} onChange={(event) => updateCell(row, column, event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-slate-700 outline-none hover:border-slate-200 hover:bg-white focus:border-orange-300 focus:bg-white" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!rows.length ? <div className="p-12 text-center"><Database className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-black text-slate-800">Chưa có dữ liệu</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">Dữ liệu đã được để trống theo yêu cầu. Hãy nhập CSV thật hoặc dán nhiều dòng vào ô “Thêm hàng loạt”.</p></div> : null}
            </div>
          </section>
        </div>
      </section>

      <section className="professional-card rounded-[24px] p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ListChecks size={20} /></span><div><h2 className="text-lg font-black text-slate-950">Quy định nhập dữ liệu chuẩn</h2><p className="mt-1 text-sm text-slate-500">Dùng để tránh sai cột, sai trạng thái, thiếu tọa độ hoặc dữ liệu không liên kết được.</p></div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {importChecklist.map((item, index) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span><p className="mt-3 text-sm leading-6 text-slate-600">{item}</p></div>)}
        </div>
      </section>
    </div>
  );
}
