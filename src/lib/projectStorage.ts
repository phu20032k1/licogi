import { Project } from "../data/projects";

const STORAGE_KEY = "licogi-projects-local";

function normalizeProject(project: Project, index: number): Project {
  return {
    ...project,
    id: Number(project.id) || Date.now() + index,
    code: project.code || `LCG-${String(project.id || index + 1).padStart(3, "0")}`,
    plannedProgress: project.plannedProgress ?? project.progress,
    manager: project.manager || "Chưa phân công",
    healthScore: project.healthScore ?? Math.max(60, Math.min(98, project.progress || 75)),
    risk: project.risk || "low",
    photos: project.photos ?? 0,
    documents: project.documents ?? 0,
  };
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Project[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProject);
  } catch {
    return [];
  }
}

export function saveProjects(items: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("licogi-projects-updated"));
}

export function resetProjects() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("licogi-projects-updated"));
}
