import { ProjectStatus, ProjectType, provinceCoordinates } from "../data/projects";

export type MarkerVisual = {
  color: string;
  softColor: string;
  label: string;
  typeLabel: string;
};

const TYPE_KEYWORDS: Array<{ type: ProjectType; keywords: string[] }> = [
  { type: "Công nghiệp", keywords: ["công nghiệp", "industrial", "nhà máy", "factory", "kho", "warehouse", "kcn"] },
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
  const color = status === "completed" ? "#059669" : status === "warranty" ? "#0284c7" : "#ea580c";
  const softColor = status === "completed" ? "#d1fae5" : status === "warranty" ? "#e0f2fe" : "#ffedd5";
  const labels: Record<ProjectType, string> = {
    "Công nghiệp": "CN",
    "Dân dụng": "DD",
    "Hạ tầng": "HT",
    "Giao thông": "GT",
    "Điện năng": "ĐN",
  };
  return { color, softColor, label: labels[type], typeLabel: type };
}

export function markerHtml(type: ProjectType, status: ProjectStatus, selected = false) {
  const visual = getMarkerVisual(type, status);
  const scale = selected ? 1.15 : 1;
  return `<div class="licogi-map-marker${selected ? " is-selected" : ""}" style="--marker-color:${visual.color};--marker-soft:${visual.softColor};transform:translate(-50%,-100%) scale(${scale})"><span>${visual.label}</span><i></i></div>`;
}
