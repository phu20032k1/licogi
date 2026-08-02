const STORAGE_PREFIX = "licogi-client-data";

export type ClientStoredRow = Record<string, string> & {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
};

function storageKey(entity: string) {
  return `${STORAGE_PREFIX}:${entity}`;
}

function normalizeRow(row: Record<string, string>, fallbackId?: string): ClientStoredRow {
  const id = row._id || fallbackId || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    ...row,
    _id: id,
    _createdAt: row._createdAt || new Date().toISOString(),
    _updatedAt: row._updatedAt || new Date().toISOString(),
  } as ClientStoredRow;
}

export function readClientRows(entity: string): ClientStoredRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(entity));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string>[];
    return parsed.map((row) => normalizeRow(row, String(row._id || "")));
  } catch {
    return [];
  }
}

export function writeClientRows(entity: string, rows: Record<string, string>[]) {
  if (typeof window === "undefined") return [];
  const normalized = rows.map((row) => normalizeRow(row));
  window.localStorage.setItem(storageKey(entity), JSON.stringify(normalized));
  return normalized;
}

export function replaceClientRows(entity: string, rows: Record<string, string>[]) {
  return writeClientRows(entity, rows);
}

export function appendClientRows(entity: string, rows: Record<string, string>[]) {
  const existing = readClientRows(entity);
  const incoming = rows.map((row) => normalizeRow(row));
  const merged = [...incoming, ...existing];
  writeClientRows(entity, merged);
  return merged;
}

export function updateClientRows(entity: string, ids: string[], patch: Record<string, string>) {
  const current = readClientRows(entity);
  const next = current.map((row) => (ids.includes(row._id) ? { ...row, ...patch, _updatedAt: new Date().toISOString() } : row));
  writeClientRows(entity, next);
  return next;
}

export function deleteClientRows(entity: string, ids: string[]) {
  const current = readClientRows(entity).filter((row) => !ids.includes(row._id));
  writeClientRows(entity, current);
  return current;
}

const naturalKeyByEntity: Record<string, string> = {
  projects: "project_code",
  customers: "customer_code",
  employees: "employee_code",
  equipment: "equipment_code",
  documents: "document_code",
  warranty: "ticket_code",
  ai_knowledge: "knowledge_code",
};

/**
 * Gộp dữ liệu API với các bản ghi local fallback. Nếu một bản ghi local đã có
 * cùng mã với bản ghi trên server thì ưu tiên server và tự loại bản local cũ.
 * Nhờ vậy dữ liệu tạo lúc API tạm lỗi không biến mất chỉ vì refresh trang.
 */
export function mergeServerAndClientRows(entity: string, serverRows: Record<string, string>[]) {
  if (typeof window === "undefined") return serverRows.map((row) => normalizeRow(row, String(row._id || "")));
  const server = serverRows.map((row) => normalizeRow(row, String(row._id || "")));
  const local = readClientRows(entity);
  if (!local.length) return server;

  const keyField = naturalKeyByEntity[entity];
  const serverIds = new Set(server.map((row) => row._id));
  const serverKeys = new Set(keyField ? server.map((row) => String(row[keyField] || "").trim()).filter(Boolean) : []);
  const pending = local.filter((row) => {
    if (serverIds.has(row._id)) return false;
    const key = keyField ? String(row[keyField] || "").trim() : "";
    return !key || !serverKeys.has(key);
  });

  if (pending.length !== local.length) writeClientRows(entity, pending);
  return [...pending, ...server];
}
