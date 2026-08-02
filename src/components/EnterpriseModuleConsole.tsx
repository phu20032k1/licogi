"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { RefreshCw, Plus, Database, UploadCloud } from "lucide-react";
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

export default function EnterpriseModuleConsole({ title, subtitle, endpoint, primaryKey, recordsKey, createFields = [], kind, note }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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
    return Object.keys(sample).slice(0, 9);
  }, [records]);

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

  return (
    <main className="space-y-5">
      <section className="rounded-[24px] bg-slate-950 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-300">Enterprise Module</p>
            <h1 className="mt-1.5 text-2xl font-black">{title}</h1>
            <p className="mt-1.5 max-w-4xl text-xs leading-6 text-slate-300 sm:text-sm">{subtitle}</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/15"><RefreshCw size={15} /> Tải lại</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5"><Database size={18} className="text-orange-300" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Bản ghi</p><p className="text-xl font-black">{records.length}</p></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5"><UploadCloud size={18} className="text-orange-300" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">API</p><p className="truncate text-xs font-black">{endpoint}</p></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5"><Plus size={18} className="text-orange-300" /><p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Nhập liệu</p><p className="text-xs font-black">Nhập tay hoặc import CSV</p></div>
        </div>
      </section>

      {note ? <section className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-900">{note}</section> : null}
      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}

      {createFields.length ? (
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-black text-slate-950">Tạo mới</h2><p className="mt-1 text-xs text-slate-500">Có thể nhập một bản ghi hoặc import nhiều dòng từ CSV/Excel.</p></div>
            <BulkImportPanel fields={createFields} onImport={importRecords} compact />
          </div>
          <form onSubmit={createRecord} className="mt-4 grid gap-3 md:grid-cols-3">
            {createFields.map((field) => (
              <label key={field.name} className={field.type === "textarea" ? "md:col-span-3 text-xs font-bold text-slate-700" : "text-xs font-bold text-slate-700"}>{field.label}
                {field.type === "textarea" ? (
                  <textarea value={form[field.name] ?? field.defaultValue ?? ""} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} placeholder={field.placeholder} className="input-field mt-1.5 min-h-20 w-full rounded-xl px-3.5 py-2.5 text-sm" />
                ) : (
                  <input value={form[field.name] ?? field.defaultValue ?? ""} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} type={field.type || "text"} placeholder={field.placeholder} className="input-field mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm" />
                )}
              </label>
            ))}
            <div className="md:col-span-3"><button disabled={creating} className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-orange-100 hover:bg-orange-700 disabled:bg-slate-300">{creating ? "Đang lưu..." : "Lưu bản ghi"}</button></div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-black text-slate-950">Dữ liệu đã lưu</h2></div>
        {loading ? <p className="p-5 text-sm text-slate-500">Đang tải...</p> : records.length === 0 ? <p className="p-5 text-sm text-slate-500">Chưa có dữ liệu.</p> : (
          <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{columns.map((col) => <th key={col} className="whitespace-nowrap px-3.5 py-3">{col}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{records.map((row, idx) => { const flat=flattenRecord(row); return <tr key={String(row.id || idx)} className="hover:bg-slate-50/70">{columns.map((col) => <td key={col} className="max-w-[240px] truncate px-3.5 py-3 font-medium text-slate-700">{formatValue(flat[col])}</td>)}</tr>; })}</tbody></table></div>
        )}
      </section>

      {data ? <details className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600"><summary className="cursor-pointer font-black text-slate-900">Xem JSON trả về từ API</summary><pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-slate-200">{JSON.stringify(data, null, 2)}</pre></details> : null}
    </main>
  );
}
