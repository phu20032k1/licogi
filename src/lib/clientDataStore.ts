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
