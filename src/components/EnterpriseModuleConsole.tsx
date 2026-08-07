"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Database, Plus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import BulkImportPanel, { BulkImportField } from "./BulkImportPanel";

type CreateField = BulkImportField & {
  type?: "text" | "number" | "date" | "textarea";
  defaultValue?: string;
};

type Props = {
  title: string;
  subtitle: string;
  endpoint: string;
  primaryKey: string;
  recordsKey?: string;
  createFields?: CreateField[];
  kind?: string;
  note?: string;
};

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value.toLocaleString("vi-VN");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString("vi-VN");
  if (typeof value === "object") return JSON.stringify(value).slice(0, 90);
  return String(value);
}

function flattenRecord(row: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (["metadata", "passwordHash", "organizationId", "roleId", "departmentId", "customerId"].includes(key)) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      copy[key] = nested.name || nested.title || nested.code || nested.email || "";
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

function rowId(row: Record<string, unknown>, index: number) {
  return String(row.id ?? row.code ?? row.uuid ?? index);
}

export default function EnterpriseModuleConsole({ title, subtitle, endpoint, primaryKey, recordsKey, createFields = [], kind, note }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message || "Không tải được dữ liệu");
      setData(json);
      const key = recordsKey || primaryKey;
      setRecords(Array.isArray(json[key]) ? json[key] : []);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const columns = useMemo(() => {
    const sample = records[0] ? flattenRecord(records[0]) : {};
    return Object.keys(sample).filter((key) => key !== "id").slice(0, 9);
  }, [records]);

  const selectableIds = useMemo(
    () => records.map((row, index) => rowId(row, index)).filter(Boolean),
    [records],
  );
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = Boolean(selectableIds.length) && selectableIds.every((id) => selectedSet.has(id));

  async function postOne(row: Record<string, string>) {
    const body: Record<string, unknown> = { ...row };
    if (kind && !body.kind) body.kind = kind;
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || !json.ok) throw new Error(json.message || "Không tạo được bản ghi");
  }

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createFields.length) return;
    setCreating(true);
    setError("");
    setMessage("");
    try {
      await postOne(form);
      setMessage("Đã lưu bản ghi mới vào database.");
      setForm({});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được bản ghi");
    } finally {
      setCreating(false);
    }
  }

  async function importRecords(rows: Record<string, string>[]) {
    setError("");
    setMessage("");
    let imported = 0;
    const failed: string[] = [];
    for (let index = 0; index < rows.length; index += 1) {
      try {
        await postOne(rows[index]);
        imported += 1;
      } catch (err) {
        failed.push(`Dòng ${index + 1}: ${err instanceof Error ? err.message : "lỗi không xác định"}`);
      }
    }
    await load();
    if (failed.length) {
      setMessage(`Đã import ${imported}/${rows.length} dòng. ${failed.length} dòng lỗi chưa được lưu.`);
      throw new Error(failed.slice(0, 4).join(" · "));
    }
    setMessage(`Đã import hàng loạt ${imported} bản ghi và lưu vào database.`);
  }

  function toggleRow(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : selectableIds);
  }

  async function removeIds(ids: string[]) {
    if (!ids.length) return;
    const recordsById = new Map(records.map((row, index) => [rowId(row, index), row]));
    const apiIds = ids.map((id) => recordsById.get(id)?.id).filter(Boolean).map(String);
    if (apiIds.length !== ids.length) throw new Error("Một số bản ghi chưa có ID database nên chưa thể xóa ở màn này.");

    for (const id of apiIds) {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) throw new Error(json.message || `Không xóa được bản ghi ${id}`);
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length || deleting) return;
    if (!window.confirm(`Xóa ${selectedIds.length} bản ghi đã chọn khỏi “${title}”? Hành động này không thể hoàn tác.`)) return;
    setDeleting(true);
    setError("");
    setMessage("");
    try {
      await removeIds(selectedIds);
      setMessage(`Đã xóa ${selectedIds.length} bản ghi.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được dữ liệu.");
    } finally {
      setDeleting(false);
    }
  }

  async function deleteOne(id: string) {
    if (deleting) return;
    if (!window.confirm("Xóa bản ghi này? Hành động này không thể hoàn tác.")) return;
    setDeleting(true);
    setError("");
    try {
      await removeIds([id]);
      setMessage("Đã xóa bản ghi.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được dữ liệu.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="space-y-5">
      <section className="rounded-[22px] bg-slate-950 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-300">Enterprise Module</p>
            <h1 className="mt-1.5 text-2xl font-black">{title}</h1>
            <p className="mt-1.5 max-w-4xl text-xs leading-6 text-slate-300 sm:text-sm">{subtitle}</p>
          </div>
          <button type="button" onClick={load} className="licogi-btn licogi-btn-dark"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Tải lại</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-3.5"><Database size={18} className="text-orange-300" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Bản ghi</p><p className="text-xl font-black">{records.length}</p></div>
          <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-3.5"><UploadCloud size={18} className="text-orange-300" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">API</p><p className="truncate text-xs font-black">{endpoint}</p></div>
          <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-3.5"><Plus size={18} className="text-orange-300" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Nhập liệu</p><p className="text-xs font-black">Nhập tay hoặc import CSV</p></div>
        </div>
      </section>

      {note ? <section className="rounded-[16px] border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-900">{note}</section> : null}
      {error ? <div className="rounded-[16px] border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
      {message ? <div className="rounded-[16px] border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}

      {createFields.length ? (
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-black text-slate-950">Tạo mới</h2><p className="mt-1 text-xs text-slate-500">Nhập một bản ghi hoặc import nhiều dòng từ CSV/Excel.</p></div>
            <BulkImportPanel fields={createFields} onImport={importRecords} compact />
          </div>
          <form onSubmit={createRecord} className="mt-4 grid gap-3 md:grid-cols-3">
            {createFields.map((field) => (
              <label key={field.name} className={field.type === "textarea" ? "md:col-span-3 text-xs font-bold text-slate-700" : "text-xs font-bold text-slate-700"}>{field.label}
                {field.type === "textarea" ? (
                  <textarea value={form[field.name] ?? field.defaultValue ?? ""} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} placeholder={field.placeholder} className="input-field mt-1.5 min-h-20 w-full rounded-[12px] px-3.5 py-2.5 text-sm" />
                ) : (
                  <input value={form[field.name] ?? field.defaultValue ?? ""} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} type={field.type || "text"} placeholder={field.placeholder} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" />
                )}
              </label>
            ))}
            <div className="md:col-span-3"><button disabled={creating} className="licogi-btn licogi-btn-primary">{creating ? "Đang lưu..." : "Lưu bản ghi"}</button></div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div><h2 className="text-base font-black text-slate-950 sm:text-lg">Dữ liệu đã lưu</h2><p className="mt-0.5 text-[11px] text-slate-500">{selectedIds.length ? `Đã chọn ${selectedIds.length} / ${records.length}` : `${records.length} bản ghi`}</p></div>
          <div className="flex flex-wrap gap-2">
            {records.length ? <button type="button" onClick={toggleAll} className="licogi-btn licogi-btn-secondary">{allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</button> : null}
            {selectedIds.length ? <button type="button" onClick={() => void deleteSelected()} disabled={deleting} className="licogi-btn licogi-btn-danger"><Trash2 size={15} /> {deleting ? "Đang xóa..." : `Xóa ${selectedIds.length}`}</button> : null}
          </div>
        </div>
        {loading ? <p className="p-5 text-sm text-slate-500">Đang tải...</p> : records.length === 0 ? <p className="p-5 text-sm text-slate-500">Chưa có dữ liệu.</p> : (
          <div className="licogi-table-scroll max-h-[680px] overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50/95 text-[10px] uppercase tracking-wide text-slate-500 backdrop-blur">
                <tr>
                  <th className="w-12 px-3.5 py-3"><input aria-label="Chọn tất cả bản ghi" type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></th>
                  {columns.map((col) => <th key={col} className="whitespace-nowrap px-3.5 py-3">{col}</th>)}
                  <th className="sticky right-0 bg-slate-50/95 px-3.5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row, idx) => {
                  const flat = flattenRecord(row);
                  const id = rowId(row, idx);
                  const selected = selectedSet.has(id);
                  return <tr key={id} className={selected ? "bg-orange-50/60" : "hover:bg-slate-50/70"}>
                    <td className="px-3.5 py-3"><input aria-label={`Chọn dòng ${idx + 1}`} type="checkbox" checked={selected} onChange={() => toggleRow(id)} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></td>
                    {columns.map((col) => <td key={col} className="max-w-[240px] truncate px-3.5 py-3 font-medium text-slate-700">{formatValue(flat[col])}</td>)}
                    <td className={`sticky right-0 px-3.5 py-2.5 text-right ${selected ? "bg-orange-50" : "bg-white"}`}><button type="button" onClick={() => void deleteOne(id)} className="licogi-icon-btn licogi-icon-btn-danger" title="Xóa bản ghi" aria-label="Xóa bản ghi"><Trash2 size={14} /></button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data ? <details className="rounded-[16px] border border-slate-200 bg-white p-4 text-xs text-slate-600"><summary className="cursor-pointer font-black text-slate-900">Xem JSON trả về từ API</summary><pre className="licogi-scroll mt-4 max-h-96 overflow-auto rounded-[14px] bg-slate-950 p-4 text-slate-200">{JSON.stringify(data, null, 2)}</pre></details> : null}
    </main>
  );
}
