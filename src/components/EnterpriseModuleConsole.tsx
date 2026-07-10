"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Plus, Database, UploadCloud } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  endpoint: string;
  primaryKey: string;
  recordsKey?: string;
  createFields?: { name: string; label: string; type?: "text" | "number" | "date" | "textarea"; placeholder?: string; defaultValue?: string }[];
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
    return Object.keys(sample).slice(0, 8);
  }, [records]);

  async function createRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createFields.length) return;
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, unknown> = { ...form };
      if (kind) body.kind = kind;
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message || "Không tạo được bản ghi");
      setMessage("Đã tạo bản ghi mới và ghi audit log.");
      setForm({});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được bản ghi");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] bg-slate-950 p-7 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-300">Enterprise Module</p>
            <h1 className="mt-2 text-3xl font-black">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{subtitle}</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"><RefreshCw size={16} /> Tải lại</button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Database size={20} className="text-orange-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Bản ghi</p><p className="text-2xl font-black">{records.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><UploadCloud size={20} className="text-orange-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-400">API</p><p className="text-sm font-black">{endpoint}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Plus size={20} className="text-orange-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-400">RBAC</p><p className="text-sm font-black">VIEW / CREATE / UPDATE / DELETE</p></div>
        </div>
      </section>

      {note ? <section className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm leading-7 text-orange-900">{note}</section> : null}
      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}

      {createFields.length ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Tạo nhanh</h2>
          <form onSubmit={createRecord} className="mt-5 grid gap-4 md:grid-cols-3">
            {createFields.map((field) => (
              <label key={field.name} className={field.type === "textarea" ? "md:col-span-3 text-sm font-bold text-slate-700" : "text-sm font-bold text-slate-700"}>{field.label}
                {field.type === "textarea" ? (
                  <textarea value={form[field.name] ?? field.defaultValue ?? ""} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} placeholder={field.placeholder} className="input-field mt-1.5 min-h-24 w-full rounded-xl px-4 py-3 text-sm" />
                ) : (
                  <input value={form[field.name] ?? field.defaultValue ?? ""} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} type={field.type || "text"} placeholder={field.placeholder} className="input-field mt-1.5 w-full rounded-xl px-4 py-3 text-sm" />
                )}
              </label>
            ))}
            <div className="md:col-span-3"><button disabled={creating} className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-100 hover:bg-orange-700 disabled:bg-slate-300">{creating ? "Đang tạo..." : "Tạo bản ghi"}</button></div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-black text-slate-950">Dữ liệu từ Prisma</h2></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Đang tải...</p> : records.length === 0 ? <p className="p-6 text-sm text-slate-500">Chưa có dữ liệu.</p> : (
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((col) => <th key={col} className="px-4 py-3">{col}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{records.map((row, idx) => { const flat=flattenRecord(row); return <tr key={String(row.id || idx)} className="hover:bg-slate-50/70">{columns.map((col) => <td key={col} className="max-w-[260px] truncate px-4 py-3 font-medium text-slate-700">{formatValue(flat[col])}</td>)}</tr>; })}</tbody></table></div>
        )}
      </section>

      {data ? <details className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600"><summary className="cursor-pointer font-black text-slate-900">Xem JSON trả về từ API</summary><pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-slate-200">{JSON.stringify(data, null, 2)}</pre></details> : null}
    </main>
  );
}
