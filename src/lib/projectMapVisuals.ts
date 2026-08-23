import { ProjectStatus, ProjectType, legacyProvinceCoordinates, normalizeProvinceName, normalizeProvinceNames, provinceCoordinates } from "../data/projects";

export type MarkerVisual = {
  color: string;
  softColor: string;
  label: string;
  typeLabel: string;
  statusColor: string;
  statusSymbol: string;
};

export const projectTypeVisuals: Record<ProjectType, { color: string; softColor: string; label: string }> = {
  "Công nghiệp": { color: "#e36a2e", softColor: "#fff1e8", label: "CN" },
  "Nông nghiệp": { color: "#2f8f69", softColor: "#e7f5ef", label: "NN" },
  "Dân dụng": { color: "#7968c4", softColor: "#f0edff", label: "DD" },
  "Hạ tầng": { color: "#3678b8", softColor: "#e9f3fb", label: "HT" },
  "Giao thông": { color: "#2a8b9f", softColor: "#e8f7fa", label: "GT" },
  "Điện năng": { color: "#b78a28", softColor: "#fbf5df", label: "ĐN" },
};

export const projectStatusVisuals: Record<ProjectStatus, { color: string; symbol: string }> = {
  completed: { color: "#23835b", symbol: "✓" },
  ongoing: { color: "#e36a2e", symbol: "•" },
  warranty: { color: "#3b78a8", symbol: "B" },
};

const TYPE_KEYWORDS: Array<{ type: ProjectType; keywords: string[] }> = [
  { type: "Công nghiệp", keywords: ["công nghiệp", "industrial", "nhà máy", "factory", "kho", "warehouse", "kcn"] },
  { type: "Nông nghiệp", keywords: ["nông nghiệp", "agriculture", "agri", "nông trại", "farm", "chăn nuôi", "trang trại", "nhà kính", "greenhouse"] },
  { type: "Dân dụng", keywords: ["dân dụng", "civil", "chung cư", "residential", "khách sạn", "hotel", "đô thị", "trung tâm thương mại"] },
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

function cleanProvincePrefix(value: string) {
  return value.trim().replace(/^(tỉnh|thành phố|tp\.?|city)\s+/i, "").trim();
}

function averageCoordinates(points: Array<{ lat: number; lng: number }>) {
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length,
  };
}

export function resolveProvinceCoordinates(province?: string | null) {
  const fallback = provinceCoordinates["Hà Nội"];
  const raw = String(province || "").trim();
  if (!raw) return fallback;

  const cleaned = cleanProvincePrefix(raw);
  const directLegacy = legacyProvinceCoordinates[raw] || legacyProvinceCoordinates[cleaned];
  if (directLegacy) return directLegacy;

  const rawParts = raw.split(/\s*(?:\/|\||;)\s*/).map(cleanProvincePrefix).filter(Boolean);
  const legacyPoints = rawParts.map((part) => legacyProvinceCoordinates[part]).filter(Boolean);
  if (legacyPoints.length) return averageCoordinates(legacyPoints);

  const canonicalParts = normalizeProvinceNames(raw);
  const canonicalPoints = canonicalParts.map((name) => provinceCoordinates[name]).filter(Boolean);
  if (canonicalPoints.length) return averageCoordinates(canonicalPoints);

  const canonical = normalizeProvinceName(raw);
  if (provinceCoordinates[canonical]) return provinceCoordinates[canonical];

  const normalized = canonical.toLocaleLowerCase("vi");
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

export function investorCountryFlag(value?: string | null) {
  const raw = String(value || "").toLocaleLowerCase("vi");
  if (raw.includes("nhật") || raw.includes("japan")) return "🇯🇵";
  if (raw.includes("hàn") || raw.includes("korea")) return "🇰🇷";
  if (raw.includes("trung quốc") || raw.includes("china")) return "🇨🇳";
  if (raw.includes("đài loan") || raw.includes("taiwan")) return "🇹🇼";
  if (raw.includes("việt") || raw.includes("vietnam")) return "🇻🇳";
  return "🌐";
}

export function markerHtml(type: ProjectType, status: ProjectStatus, selected = false, investorCountry?: string | null) {
  const visual = getMarkerVisual(type, status);
  const scale = selected ? 1.14 : 1;
  const flag = investorCountryFlag(investorCountry);
  return `<div class="licogi-map-marker licogi-waterdrop-marker status-${status}${selected ? " is-selected" : ""}" style="--marker-color:${visual.color};--marker-soft:${visual.softColor};--status-color:${visual.statusColor};transform:translate(-50%,-100%) scale(${scale})" title="${visual.typeLabel}"><span class="licogi-waterdrop-body"><b>${visual.label}</b></span><em class="licogi-marker-status" aria-hidden="true">${visual.statusSymbol}</em><span class="licogi-marker-country" aria-hidden="true">${flag}</span></div>`;
}
