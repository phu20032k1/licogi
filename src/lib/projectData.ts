import { Project, ProjectStatus, ProjectType } from "../data/projects";
import type { PublicProjectRecord, PublicProjectsResponse } from "./publicProject";
import { normalizeProjectStatus, normalizeProjectType, resolveProvinceCoordinates } from "./projectMapVisuals";
import { mergeServerAndClientRows, readClientRows } from "./clientDataStore";

type StoredRow = Record<string, string> & { _id?: string };

export type ProjectWithRowId = Project & { _rowId?: string };

const PROJECT_SNAPSHOT_KEY = "licogi-projects-snapshot-v1";
const PROJECT_SNAPSHOT_MAX_AGE = 1000 * 60 * 60 * 24;

type ProjectSnapshot = {
  savedAt: number;
  projects: ProjectWithRowId[];
};

export function readProjectSnapshot(): ProjectWithRowId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROJECT_SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProjectSnapshot;
    if (!parsed || !Array.isArray(parsed.projects)) return [];
    if (!Number.isFinite(parsed.savedAt) || Date.now() - parsed.savedAt > PROJECT_SNAPSHOT_MAX_AGE) return [];
    return parsed.projects;
  } catch {
    return [];
  }
}

function cacheProjectSnapshot(projects: ProjectWithRowId[]) {
  if (typeof window === "undefined" || projects.length === 0) return;
  window.setTimeout(() => {
    try {
      window.localStorage.setItem(PROJECT_SNAPSHOT_KEY, JSON.stringify({ savedAt: Date.now(), projects } satisfies ProjectSnapshot));
    } catch {
      // Storage failures must never block the server-backed project list.
    }
  }, 0);
}

export function rowToProject(row: StoredRow, index: number): ProjectWithRowId {
  const province = row.province || "Hà Nội";
  const fallback = resolveProvinceCoordinates(province);
  const type: ProjectType = normalizeProjectType(row.type);
  const status: ProjectStatus = normalizeProjectStatus(row.status);
  const progress = Number.isFinite(Number(row.progress)) ? Math.max(0, Math.min(100, Number(row.progress))) : 0;
  const parsedLat = row.lat?.trim() ? Number(row.lat) : Number.NaN;
  const parsedLng = row.lng?.trim() ? Number(row.lng) : Number.NaN;
  const lat = Number.isFinite(parsedLat) ? parsedLat : fallback.lat;
  const lng = Number.isFinite(parsedLng) ? parsedLng : fallback.lng;
  return {
    _rowId: row._id,
    id: Number(row.id) || index + 1,
    code: row.project_code || row.code || `LCG-${String(index + 1).padStart(4, "0")}`,
    name: row.project_name || row.name || "Dự án chưa đặt tên",
    type,
    status,
    investor: row.investor || "Chưa cập nhật",
    investorCountry: row.investor_country || row.country || "",
    province,
    valueRange: row.value_range || row.valueRange || "Chưa cập nhật",
    scale: row.scale || "",
    role: (row.role as Project["role"]) || "Tổng thầu",
    contractorUnit: row.contractor_unit || "",
    progress,
    plannedProgress: Number.isFinite(Number(row.planned_progress)) ? Number(row.planned_progress) : progress,
    lat,
    lng,
    description: row.description || "",
    manager: row.manager || "Chưa phân công",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    warrantyUntil: row.warranty_until || "",
    healthScore: Number.isFinite(Number(row.health_score)) ? Number(row.health_score) : Math.max(50, Math.min(100, progress || 0)),
    risk: row.risk === "high" || row.risk === "medium" || row.risk === "low" ? row.risk : "low",
    photos: Number(row.photos) || 0,
    videos: Number(row.videos) || 0,
    documents: Number(row.documents) || 0,
    customerRating: Number(row.customer_rating) || 0,
  };
}

export function projectToRow(project: ProjectWithRowId): Record<string, string> {
  const row: Record<string, string> = {
    project_code: project.code ?? "",
    project_name: project.name,
    type: project.type,
    status: project.status,
    investor: project.investor,
    province: project.province,
    value_range: project.valueRange,
    scale: project.scale ?? "",
    progress: String(project.progress),
    lat: String(project.lat),
    lng: String(project.lng),
    manager: project.manager ?? "",
    description: project.description ?? "",
    planned_progress: String(project.plannedProgress ?? project.progress),
    health_score: String(project.healthScore ?? 0),
    risk: project.risk ?? "low",
    start_date: project.startDate ?? "",
    end_date: project.endDate ?? "",
  };
  if (project._rowId) row._id = project._rowId;
  return row;
}

function normalizePublicRole(value?: string): Project["role"] {
  return value === "EPC" || value === "Tổng thầu" || value === "Nhà thầu chính" || value === "Nhà thầu phụ"
    ? value
    : "Tổng thầu";
}

function publicProjectToProject(project: PublicProjectRecord, index: number): ProjectWithRowId {
  const risk = project.risk === "high" || project.risk === "medium" || project.risk === "low" ? project.risk : "low";
  return {
    id: project.numericId || index + 1,
    code: project.code || `LCG-${String(index + 1).padStart(4, "0")}`,
    name: project.name || "Dự án chưa đặt tên",
    type: normalizeProjectType(project.type),
    status: normalizeProjectStatus(project.status),
    investor: project.investor || "Chưa cập nhật",
    investorCountry: project.investorCountry || "",
    province: project.province || "Hà Nội",
    valueRange: project.valueRange || "Chưa cập nhật",
    scale: project.scale || "",
    role: normalizePublicRole(project.contractorRole),
    progress: Math.max(0, Math.min(100, Number(project.progress) || 0)),
    plannedProgress: Math.max(0, Math.min(100, Number(project.progress) || 0)),
    lat: Number(project.lat) || 0,
    lng: Number(project.lng) || 0,
    description: project.description || "",
    manager: "Chưa phân công",
    startDate: project.startDate || "",
    endDate: project.endDate || "",
    healthScore: Math.max(0, Math.min(100, Number(project.healthScore) || 0)),
    risk,
    photos: 0,
    videos: 0,
    documents: Number(project.related?.documents) || 0,
    customerRating: 0,
  };
}

async function fetchPublicProjectFallback() {
  const response = await fetch("/api/public/projects", {
    cache: "default",
    credentials: "same-origin",
  });
  const data = await response.json() as PublicProjectsResponse;
  if (!response.ok || !data.ok) throw new Error(data.message ?? "Không tải được dữ liệu dự án công khai.");
  return (Array.isArray(data.projects) ? data.projects : []).map(publicProjectToProject);
}

export async function fetchProjectsFromDataCenter(): Promise<ProjectWithRowId[]> {
  try {
    const response = await fetch("/api/data/projects", { cache: "no-store", credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message ?? "Không tải được danh mục dự án.");
    const projects = mergeServerAndClientRows("projects", data.rows as StoredRow[]).map(rowToProject);
    cacheProjectSnapshot(projects);
    return projects;
  } catch {
    try {
      const publicProjects = await fetchPublicProjectFallback();
      if (publicProjects.length > 0) {
        cacheProjectSnapshot(publicProjects);
        return publicProjects;
      }
    } catch {
      // Fall through to the device cache only when both server sources are unavailable.
    }

    const localProjects = readClientRows("projects").map((row, index) => rowToProject(row as StoredRow, index));
    if (localProjects.length > 0) return localProjects;
    return readProjectSnapshot();
  }
}
