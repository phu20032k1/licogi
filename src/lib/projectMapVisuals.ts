import { ProjectStatus, ProjectType, provinceCoordinates } from "../data/projects";

export type MarkerVisual = {
  color: string;
  softColor: string;
  label: string;
  typeLabel: string;
  statusColor: string;
  statusSymbol: string;
};

export const projectTypeVisuals: Record<ProjectType, { color: string; softColor: string; label: string }> = {
  "Công nghiệp": { color: "#ea580c", softColor: "#ffedd5", label: "CN" },
  "Nông nghiệp": { color: "#16a34a", softColor: "#dcfce7", label: "NN" },
  "Dân dụng": { color: "#7c3aed", softColor: "#ede9fe", label: "DD" },
  "Hạ tầng": { color: "#2563eb", softColor: "#dbeafe", label: "HT" },
  "Giao thông": { color: "#0891b2", softColor: "#cffafe", label: "GT" },
  "Điện năng": { color: "#ca8a04", softColor: "#fef9c3", label: "ĐN" },
};

export const projectStatusVisuals: Record<ProjectStatus, { color: string; symbol: string }> = {
  completed: { color: "#059669", symbol: "✓" },
  ongoing: { color: "#f97316", symbol: "•" },
  warranty: { color: "#0284c7", symbol: "B" },
};

const TYPE_KEYWORDS: Array<{ type: ProjectType; keywords: string[] }> = [
  { type: "Công nghiệp", keywords: ["công nghiệp", "industrial", "nhà máy", "factory", "kho", "warehouse", "kcn"] },
  { type: "Nông nghiệp", keywords: ["nông nghiệp", "agriculture", "agri", "nông trại", "farm", "chăn nuôi", "trang trại", "nhà kính", "greenhouse"] },
  { type: "Dân dụng", keywords: ["dân dụng", "civil", "chung cư", "residential", "khách sạn", "hotel", "đô thị"] },
  { type: "Hạ tầng", keywords: ["hạ tầng", "infrastructure", "cấp thoát", "water", "khu công nghiệp", "logistics"] },
  { type: "Giao thông", keywords: ["giao thông", "transport", "đường", "road", "cầu", "bridge", "cao tốc"] },
  { type: "Điện năng", keywords: ["điện", "power", "energy", "trạm biến áp", "substation", "năng lượng"] },
];

export function normalizeProjectType(value?: string | null): ProjectType {
  const raw = String(value || "").trim().toLocaleLowerCase("vi");
  const exact = TYPE_KEYWORDS.find((item) => item.type.toLocaleLowerCase("vi") === raw);
  if (exact) return exact.type;
  return TYPE_KEYWORDS.find((item) => item.keywords.some((keyword) => raw.includes(keyword)))?.type ?? "Công nghiệp";
}

export function normalizeProjectStatus(value?: string | null): ProjectStatus {
  const raw = String(value || "").trim().toLocaleLowerCase("vi");
  if (raw.includes("complete") || raw.includes("hoàn thành") || raw === "completed") return "completed";
  if (raw.includes("warranty") || raw.includes("bảo hành") || raw === "warranty") return "warranty";
  return "ongoing";
}

export function resolveProvinceCoordinates(province?: string | null) {
  const fallback = provinceCoordinates["Hà Nội"];
  const raw = String(province || "").trim();
  if (!raw) return fallback;
  if (provinceCoordinates[raw]) return provinceCoordinates[raw];

  const normalized = raw.toLocaleLowerCase("vi").replace(/^(tỉnh|thành phố|tp\.?|city)\s+/i, "").trim();
  const match = Object.entries(provinceCoordinates).find(([name]) => {
    const candidate = name.toLocaleLowerCase("vi").replace(/^tp\.\s*/, "");
    return normalized.includes(candidate) || candidate.includes(normalized);
  });
  return match?.[1] ?? fallback;
}

export function getMarkerVisual(type: ProjectType, status: ProjectStatus): MarkerVisual {
  const typeVisual = projectTypeVisuals[type];
  const statusVisual = projectStatusVisuals[status];
  return {
    color: typeVisual.color,
    softColor: typeVisual.softColor,
    label: typeVisual.label,
    typeLabel: type,
    statusColor: statusVisual.color,
    statusSymbol: statusVisual.symbol,
  };
}

export function markerHtml(type: ProjectType, status: ProjectStatus, selected = false) {
  const visual = getMarkerVisual(type, status);
  const scale = selected ? 1.16 : 1;
  return `<div class="licogi-map-marker licogi-waterdrop-marker status-${status}${selected ? " is-selected" : ""}" style="--marker-color:${visual.color};--marker-soft:${visual.softColor};--status-color:${visual.statusColor};transform:translate(-50%,-100%) scale(${scale})" title="${visual.typeLabel}"><span class="licogi-waterdrop-body"><b>${visual.label}</b></span><em class="licogi-marker-status" aria-hidden="true">${visual.statusSymbol}</em></div>`;
}
