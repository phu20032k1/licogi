"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";

export type BulkImportField = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

type Props = {
  fields: BulkImportField[];
  onImport: (rows: Record<string, string>[]) => Promise<void>;
  buttonLabel?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
};

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function delimiterFor(line: string) {
  const candidates = [",", "\t", ";"];
  let best = ",";
  let bestCount = -1;
  for (const delimiter of candidates) {
    const count = line.split(delimiter).length - 1;
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

function parseLine(line: string, delimiter: string) {
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
    if (char === delimiter && !inQuote) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseText(text: string, fields: BulkImportField[]) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const delimiter = delimiterFor(lines[0]);
  const first = parseLine(lines[0], delimiter);
  const fieldByHeader = new Map<string, string>();
  for (const field of fields) {
    fieldByHeader.set(normalizeHeader(field.name), field.name);
    fieldByHeader.set(normalizeHeader(field.label), field.name);
  }

  const mappedHeaders = first.map((cell) => fieldByHeader.get(normalizeHeader(cell)) || "");
  const hasHeader = mappedHeaders.some(Boolean);
  const headers = hasHeader ? mappedHeaders : fields.map((field) => field.name);
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      const cells = parseLine(line, delimiter);
      const row: Record<string, string> = {};
      headers.forEach((key, index) => {
        if (key) row[key] = cells[index] ?? "";
      });
      return row;
    })
    .filter((row) => Object.values(row).some((value) => value.trim()));
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function BulkImportPanel({
  fields,
  onImport,
  buttonLabel = "Import hàng loạt",
  title = "Import hàng loạt",
  description = "Chọn CSV/TXT hoặc dán dữ liệu từ Excel. Dòng đầu có thể dùng tên cột kỹ thuật hoặc tên cột tiếng Việt.",
  compact = false,
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rows = useMemo(() => parseText(text, fields), [fields, text]);

  async function readFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      setText(await file.text());
      setOpen(true);
    } catch {
      setError("Không đọc được file. Hãy dùng CSV/TXT UTF-8.");
    }
  }

  function downloadTemplate() {
    const header = fields.map((field) => csvCell(field.name)).join(",");
    const sample = fields.map((field) => csvCell(field.placeholder || "")).join(",");
    const blob = new Blob(["\uFEFF", header, "\n", sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau-import-hang-loat.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function submit() {
    if (!rows.length) {
      setError("Chưa có dòng dữ liệu hợp lệ để import.");
      return;
    }
    const requiredFields = fields.filter((field) => field.required);
    if (requiredFields.length) {
      const invalidIndex = rows.findIndex((row) => requiredFields.some((field) => !String(row[field.name] || "").trim()));
      if (invalidIndex >= 0) {
        setError(`Dòng ${invalidIndex + 1} thiếu trường bắt buộc: ${requiredFields.map((field) => field.label).join(", ")}.`);
        return;
      }
    }
    setBusy(true);
    setError("");
    try {
      await onImport(rows);
      setText("");
      setOpen(false);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-xs font-extrabold text-orange-700 transition hover:bg-orange-100">
          <Upload size={16} /> {buttonLabel}
        </button>
        <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50">
          <Download size={15} /> Tải file mẫu
        </button>
      </div>

      {open ? (
        <div className={`mt-3 rounded-2xl border border-orange-200 bg-orange-50/60 ${compact ? "p-4" : "p-5"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-orange-700"><FileSpreadsheet size={18} /><h3 className="text-sm font-black">{title}</h3></div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">{description}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Đóng import"><X size={16} /></button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[220px_1fr]">
            <div>
              <input ref={inputRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={(event) => void readFile(event.target.files?.[0])} />
              <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-orange-300 bg-white px-4 text-center text-xs font-bold text-slate-600 hover:border-orange-500 hover:bg-orange-50">
                <Upload size={22} className="mb-2 text-orange-500" />
                Chọn CSV / TXT
                <span className="mt-1 font-normal text-slate-400">hoặc dán trực tiếp từ Excel</span>
              </button>
            </div>
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={compact ? 5 : 7} className="input-field w-full rounded-xl px-3.5 py-3 font-mono text-xs leading-5" placeholder={fields.map((field) => field.name).join(",")} />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-600">Đã nhận <span className="text-orange-700">{rows.length}</span> dòng · Cột: {fields.map((field) => field.label).join(" · ")}</p>
            <button type="button" onClick={() => void submit()} disabled={busy || !rows.length} className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">{busy ? "Đang import..." : `Import ${rows.length || ""} dòng`}</button>
          </div>
          {error ? <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
