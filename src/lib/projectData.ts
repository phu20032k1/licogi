import { Project, ProjectStatus, ProjectType, provinceCoordinates } from "../data/projects";

type StoredRow = Record<string, string> & { _id?: string };

const fallbackType: ProjectType = "Công nghiệp";
const validTypes: ProjectType[] = ["Công nghiệp", "Dân dụng", "Hạ tầng", "Giao thông", "Điện năng"];
const validStatuses: ProjectStatus[] = ["ongoing", "completed", "warranty"];

export type ProjectWithRowId = Project & { _rowId?: string };

export function rowToProject(row: StoredRow, index: number): ProjectWithRowId {
  const province = row.province || "Hà Nội";
  const fallback = provinceCoordinates[province] ?? provinceCoordinates["Hà Nội"];
  const type = validTypes.includes(row.type as ProjectType) ? row.type as ProjectType : fallbackType;
  const status = validStatuses.includes(row.status as ProjectStatus) ? row.status as ProjectStatus : "ongoing";
  const progress = Number.isFinite(Number(row.progress)) ? Math.max(0, Math.min(100, Number(row.progress))) : 0;
  const lat = Number.isFinite(Number(row.lat)) ? Number(row.lat) : fallback.lat;
  const lng = Number.isFinite(Number(row.lng)) ? Number(row.lng) : fallback.lng;
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

export async function fetchProjectsFromDataCenter(): Promise<ProjectWithRowId[]> {
  const response = await fetch("/api/data/projects", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.message ?? "Không tải được danh mục dự án.");
  return (data.rows as StoredRow[]).map(rowToProject);
}
