"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, ScaleControl, SVGOverlay, TileLayer, Tooltip } from "react-leaflet";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Expand,
  Globe2,
  Layers3,
  MapPin,
  Maximize2,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { normalizeProvinceNames, ProjectStatus, ProjectType, projectTypes, statusLabels } from "../data/projects";
import { vietnamPostMergerProvinces } from "../data/vietnamPostMergerMap";
import { investorCountryFlag, markerHtml, projectStatusVisuals, projectTypeVisuals } from "../lib/projectMapVisuals";
import { siteConfig } from "../lib/siteConfig";
import MapViewportController from "./map/MapViewportController";

type RelatedCounts = {
  documents?: number;
  equipment?: number;
  tasks?: number;
  contracts?: number;
  warranties?: number;
  dailyReports?: number;
  bimModels?: number;
};

type PublicProject = {
  id: string;
  numericId: number;
  code: string;
  name: string;
  type: ProjectType;
  rawType?: string;
  status: ProjectStatus;
  investor: string;
  customerCode?: string;
  customerIndustry?: string;
  investorCountry?: string;
  projectCountry?: string;
  province: string;
  legacyProvince?: string;
  contractValueVnd?: number | null;
  valueRange: string;
  constructionArea?: string;
  floorArea?: string;
  scale?: string;
  contractorRole?: string;
  contractNumber?: string;
  packageName?: string;
  startDate?: string;
  endDate?: string;
  mapsUrl?: string;
  progress: number;
  risk?: string;
  healthScore?: number;
  source?: string;
  lat: number;
  lng: number;
  description?: string;
  dataCompleteness?: number;
  related?: RelatedCounts;
  createdAt?: string;
  updatedAt?: string;
};

type PublicProjectsResponse = { ok: boolean; projects?: PublicProject[]; message?: string };
type FilterDetail = { search?: string; type?: string; status?: string; projectId?: string | null };
type LoadMode = "initial" | "refresh" | "silent";
type CachedMapProjects = { savedAt: number; projects: PublicProject[] };
type ProvinceSummary = {
  name: string;
  projects: PublicProject[];
  ongoing: number;
  completed: number;
  totalValue: number;
  averageProgress: number;
  dominantType: ProjectType;
  types: Partial<Record<ProjectType, number>>;
  score: number;
};

const MAP_CACHE_KEY = "licogi-public-map-projects-v3";
const MAP_CACHE_MAX_AGE = 1000 * 60 * 60 * 6;
const MAP_REQUEST_TIMEOUT = 8000;
const MOBILE_MARKER_LIMIT = 220;
const VIETNAM_SVG_BOUNDS: [[number, number], [number, number]] = [[8.15, 102.0], [23.7, 109.85]];

function readCachedMapProjects() {
  if (typeof window === "undefined") return [] as PublicProject[];
  try {
    const raw = window.localStorage.getItem(MAP_CACHE_KEY);
    if (!raw) return [];
    const cached = JSON.parse(raw) as CachedMapProjects;
    if (!cached || !Array.isArray(cached.projects)) return [];
    if (!Number.isFinite(cached.savedAt) || Date.now() - cached.savedAt > MAP_CACHE_MAX_AGE) return [];
    return cached.projects;
  } catch {
    return [];
  }
}

function cacheMapProjects(projects: PublicProject[]) {
  if (typeof window === "undefined" || projects.length === 0) return;
  window.setTimeout(() => {
    try {
      window.localStorage.setItem(MAP_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), projects } satisfies CachedMapProjects));
    } catch {
      // Local cache is an optional acceleration layer only.
    }
  }, 0);
}

function isVietnamProject(project: PublicProject) {
  const country = (project.projectCountry || "Việt Nam").trim().toLocaleLowerCase("vi");
  if (country === "việt nam" || country === "vietnam" || country === "viet nam") return true;
  return isMappable(project);
}

function isMappable(project: Pick<PublicProject, "lat" | "lng">) {
  return Number.isFinite(project.lat) && Number.isFinite(project.lng)
    && project.lat >= 8 && project.lat <= 24.5 && project.lng >= 102 && project.lng <= 110.8;
}

function formatContractValue(value?: number | null, fallback?: string) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    if (value >= 1_000_000_000) {
      const billions = value / 1_000_000_000;
      return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: billions >= 100 ? 0 : 1 }).format(billions)} tỷ đồng`;
    }
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  }
  return fallback && fallback !== "Chưa cập nhật" ? fallback : "Chưa cập nhật";
}

function shortValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const billions = value / 1_000_000_000;
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: billions >= 100 ? 0 : 1 }).format(billions)} tỷ`;
}

function buildProvinceSummaries(projects: PublicProject[]) {
  const buckets = new Map<string, PublicProject[]>();
  for (const project of projects) {
    for (const province of normalizeProvinceNames(project.province)) {
      if (!vietnamPostMergerProvinces.some((item) => item.name === province)) continue;
      const bucket = buckets.get(province) || [];
      if (!bucket.some((item) => item.id === project.id)) bucket.push(project);
      buckets.set(province, bucket);
    }
  }

  const summaries = new Map<string, ProvinceSummary>();
  for (const [name, provinceProjects] of buckets) {
    const types: Partial<Record<ProjectType, number>> = {};
    provinceProjects.forEach((project) => { types[project.type] = (types[project.type] || 0) + 1; });
    const dominantType = (Object.entries(types).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Công nghiệp") as ProjectType;
    const ongoingProjects = provinceProjects.filter((item) => item.status === "ongoing");
    const totalValue = provinceProjects.reduce((sum, item) => sum + Number(item.contractValueVnd || 0), 0);
    const industrialCount = Number(types["Công nghiệp"] || 0);
    summaries.set(name, {
      name,
      projects: provinceProjects,
      ongoing: ongoingProjects.length,
      completed: provinceProjects.filter((item) => item.status === "completed").length,
      totalValue,
      averageProgress: ongoingProjects.length ? Math.round(ongoingProjects.reduce((sum, item) => sum + item.progress, 0) / ongoingProjects.length) : 100,
      dominantType,
      types,
      score: provinceProjects.length * 2 + industrialCount * 2.5 + Math.min(5, totalValue / 250_000_000_000),
    });
  }
  return summaries;
}

function provinceFill(score: number, maxScore: number) {
  if (!score || !maxScore) return "rgba(148,163,184,.12)";
  const ratio = score / maxScore;
  if (ratio >= .67) return "rgba(239,90,50,.68)";
  if (ratio >= .36) return "rgba(251,146,60,.58)";
  return "rgba(248,201,91,.55)";
}

function projectRank(a: PublicProject, b: PublicProject) {
  const rank: Record<ProjectStatus, number> = { ongoing: 0, warranty: 1, completed: 2 };
  const byStatus = rank[a.status] - rank[b.status];
  if (byStatus) return byStatus;
  if (a.status === "ongoing" && b.status === "ongoing") return b.progress - a.progress;
  return Number(b.contractValueVnd || 0) - Number(a.contractValueVnd || 0);
}

export default function PublicProjectMap() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [hiddenTypes, setHiddenTypes] = useState<Set<ProjectType>>(() => new Set());
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<ProjectStatus>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [mobileMap, setMobileMap] = useState(false);

  const load = useCallback(async (mode: LoadMode = "initial") => {
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), MAP_REQUEST_TIMEOUT);
    try {
      const response = await fetch("/api/public/projects/map", {
        cache: "default",
        credentials: "same-origin",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const data = (await response.json()) as PublicProjectsResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu dự án.");
      const nextProjects = Array.isArray(data.projects) ? data.projects : [];
      setProjects(nextProjects);
      cacheMapProjects(nextProjects);
      setError("");
    } catch (err) {
      const cachedProjects = readCachedMapProjects();
      if (cachedProjects.length > 0) {
        setProjects((current) => current.length > 0 ? current : cachedProjects);
        setError("");
      } else {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
      }
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const syncMobile = () => {
      setMobileMap(media.matches);
      if (media.matches) setLegendOpen(false);
    };
    syncMobile();
    media.addEventListener?.("change", syncMobile);

    const cachedProjects = readCachedMapProjects();
    if (cachedProjects.length > 0) {
      setProjects(cachedProjects);
      setLoading(false);
      void load("silent");
    } else {
      void load("initial");
    }

    const refresh = () => void load("silent");
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) void load("silent");
    }, 300000);
    window.addEventListener("licogi-data-imported", refresh);
    window.addEventListener("licogi-projects-updated", refresh);
    window.addEventListener("online", refresh);
    return () => {
      window.clearInterval(interval);
      media.removeEventListener?.("change", syncMobile);
      window.removeEventListener("licogi-data-imported", refresh);
      window.removeEventListener("licogi-projects-updated", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [load]);

  useEffect(() => {
    const applyFilter = (event: Event) => {
      const detail = (event as CustomEvent<FilterDetail>).detail || {};
      setSearch(detail.search || "");
      setType(detail.type && projectTypes.includes(detail.type as ProjectType) ? detail.type as ProjectType : "all");
      setStatus(detail.status === "ongoing" || detail.status === "completed" || detail.status === "warranty" ? detail.status : "all");
      setHiddenTypes(new Set());
      setHiddenStatuses(new Set());
      setSelectedId(detail.projectId || null);
    };
    window.addEventListener("licogi-public-project-filter", applyFilter);
    return () => window.removeEventListener("licogi-public-project-filter", applyFilter);
  }, []);

  const searchAndTypeFiltered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return projects.filter((project) => {
      const haystack = [project.name, project.province, project.legacyProvince || "", project.projectCountry || "Việt Nam", project.investor, project.customerCode || "", project.customerIndustry || "", project.investorCountry || "", project.type, project.rawType || "", project.code, project.valueRange, project.scale || "", project.contractNumber || "", project.packageName || ""].join(" ").toLocaleLowerCase("vi");
      return (!keyword || haystack.includes(keyword)) && (type === "all" || project.type === type) && !hiddenTypes.has(project.type);
    });
  }, [projects, search, type, hiddenTypes]);

  const filtered = useMemo(
    () => searchAndTypeFiltered.filter((project) => (status === "all" || project.status === status) && !hiddenStatuses.has(project.status)),
    [searchAndTypeFiltered, status, hiddenStatuses],
  );

  const statusCounts = useMemo(() => ({
    ongoing: searchAndTypeFiltered.filter((item) => item.status === "ongoing").length,
    completed: searchAndTypeFiltered.filter((item) => item.status === "completed").length,
    warranty: searchAndTypeFiltered.filter((item) => item.status === "warranty").length,
  }), [searchAndTypeFiltered]);

  const typeCounts = useMemo(() => Object.fromEntries(projectTypes.map((projectType) => [projectType, projects.filter((project) => project.type === projectType).length])) as Record<ProjectType, number>, [projects]);
  const selectedProject = selectedId ? projects.find((project) => project.id === selectedId) || null : null;
  const hasExplicitFilter = Boolean(search.trim()) || type !== "all" || status !== "all" || hiddenTypes.size > 0 || hiddenStatuses.size > 0;
  const vietnamProjects = useMemo(() => filtered.filter(isVietnamProject), [filtered]);
  const mapProjects = useMemo(() => (hasExplicitFilter || selectedProject ? filtered : vietnamProjects).filter(isMappable), [filtered, hasExplicitFilter, selectedProject, vietnamProjects]);
  const renderedMapProjects = useMemo(() => {
    if (!mobileMap || hasExplicitFilter || selectedProject || mapProjects.length <= MOBILE_MARKER_LIMIT) return mapProjects;
    return mapProjects.slice(0, MOBILE_MARKER_LIMIT);
  }, [hasExplicitFilter, mapProjects, mobileMap, selectedProject]);
  const rankedProjects = useMemo(() => [...filtered].sort(projectRank), [filtered]);
  const provinceSummaries = useMemo(() => buildProvinceSummaries(filtered), [filtered]);
  const maxProvinceScore = useMemo(() => Math.max(0, ...Array.from(provinceSummaries.values()).map((item) => item.score)), [provinceSummaries]);
  const provinceRanking = useMemo(() => [...provinceSummaries.values()].sort((a, b) => b.score - a.score), [provinceSummaries]);
  const hoveredSummary = hoveredProvince ? provinceSummaries.get(hoveredProvince) || null : null;

  useEffect(() => {
    if (selectedId && hasExplicitFilter && !filtered.some((project) => project.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId, hasExplicitFilter]);

  function resetFilters() {
    setSearch("");
    setType("all");
    setStatus("all");
    setHiddenTypes(new Set());
    setHiddenStatuses(new Set());
    setSelectedId(null);
  }

  function selectProvince(province: string) {
    setSearch(province);
    setType("all");
    setStatus("all");
    setHiddenTypes(new Set());
    setHiddenStatuses(new Set());
    setSelectedId(null);
  }

  function toggleType(projectType: ProjectType) {
    setType("all");
    setHiddenTypes((current) => {
      const next = new Set(current);
      if (next.has(projectType)) next.delete(projectType); else next.add(projectType);
      return next;
    });
  }

  function toggleStatus(projectStatus: ProjectStatus) {
    setStatus("all");
    setHiddenStatuses((current) => {
      const next = new Set(current);
      if (next.has(projectStatus)) next.delete(projectStatus); else next.add(projectStatus);
      return next;
    });
  }

  const selectedMappable = selectedProject && isMappable(selectedProject) ? selectedProject : null;
  const mapHref = selectedProject?.mapsUrl || (selectedMappable ? `https://www.google.com/maps/search/?api=1&query=${selectedMappable.lat},${selectedMappable.lng}` : "#");

  return (
    <div className={`public-map-shell public-project-map-shell public-project-map-2026 ${expanded ? "is-expanded" : ""}`}>
      <div className="public-map-toolbar">
        <div><h3>Bản đồ & danh mục công trình</h3><p>{mapProjects.length} vị trí hợp lệ · {filtered.length}/{projects.length} dự án theo bộ lọc</p></div>
        <div className="public-map-toolbar-actions">
          {hasExplicitFilter ? <button type="button" onClick={resetFilters} className="public-map-reset"><X size={14} /> Xóa lọc</button> : null}
          <button type="button" onClick={() => setExpanded((value) => !value)} className="public-icon-button" aria-label={expanded ? "Thu nhỏ bản đồ" : "Phóng lớn bản đồ"}>{expanded ? <Expand size={17} /> : <Maximize2 size={17} />}</button>
          <button type="button" onClick={() => void load("refresh")} className="public-icon-button" aria-label="Tải lại dữ liệu" disabled={refreshing}><RefreshCcw size={17} className={refreshing ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <div className="public-map-controls">
        <label aria-label="Tìm dự án"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm công trình, tỉnh mới/cũ, chủ đầu tư..." /></label>
        <select aria-label="Lọc lĩnh vực" value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)}><option value="all">Tất cả lĩnh vực</option>{projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select aria-label="Lọc trạng thái" value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)}><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Hoàn thành</option><option value="warranty">Bảo hành</option></select>
      </div>

      <div className="public-map-stats">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}><b>{searchAndTypeFiltered.length}</b> tất cả</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={`is-orange ${status === "ongoing" ? "is-active" : ""}`}><b>{statusCounts.ongoing}</b> thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={`is-green ${status === "completed" ? "is-active" : ""}`}><b>{statusCounts.completed}</b> hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={`is-blue ${status === "warranty" ? "is-active" : ""}`}><b>{statusCounts.warranty}</b> bảo hành</button>
      </div>

      <div className="public-map-workspace">
        <div className="public-map-canvas">
          <div className="public-map-zoom-hint"><CircleDot size={12} /> Kéo / cuộn để zoom</div>
          <button type="button" className={`public-map-legend-toggle ${legendOpen ? "is-open" : ""}`} onClick={() => setLegendOpen((value) => !value)}><Layers3 size={13} /> Chú thích</button>

          {legendOpen ? <div className="public-map-overlay-legend public-map-overlay-legend-2026" aria-label="Chú thích bản đồ">
            <div className="public-map-overlay-title"><Layers3 size={13} /><span>Màu dữ liệu LICOGI</span><button type="button" onClick={() => setLegendOpen(false)} aria-label="Đóng chú thích"><X size={12} /></button></div>
            <div className="public-vn-development-legend"><span><i className="is-strong"/>Hoạt động mạnh</span><span><i className="is-growing"/>Đang phát triển</span><span><i className="is-active"/>Có dự án</span></div>
            <div className="public-map-overlay-types">
              {projectTypes.filter((projectType) => typeCounts[projectType] > 0).map((projectType) => {
                const visual = projectTypeVisuals[projectType];
                const hidden = hiddenTypes.has(projectType);
                return <button key={projectType} type="button" onClick={() => toggleType(projectType)} className={hidden ? "is-muted" : ""}><i style={{ background: visual.color }} /><span>{projectType}</span><b>{typeCounts[projectType]}</b></button>;
              })}
            </div>
            <div className="public-map-overlay-status">
              {(Object.keys(projectStatusVisuals) as ProjectStatus[]).map((projectStatus) => {
                const visual = projectStatusVisuals[projectStatus];
                const hidden = hiddenStatuses.has(projectStatus);
                return <button key={projectStatus} type="button" onClick={() => toggleStatus(projectStatus)} className={hidden ? "is-muted" : ""}><i style={{ background: visual.color }}>{visual.symbol === "•" ? "" : visual.symbol}</i><span>{statusLabels[projectStatus]}</span></button>;
              })}
            </div>
          </div> : null}

          {hoveredSummary ? <div className="public-vn-hover-card">
            <div><strong>{hoveredSummary.name}</strong><b>{hoveredSummary.projects.length} dự án</b></div>
            <p>{hoveredSummary.ongoing} đang thi công{hoveredSummary.ongoing ? ` · TB ${hoveredSummary.averageProgress}%` : ""}</p>
            <p>{Object.entries(hoveredSummary.types).filter(([, count]) => Number(count) > 0).map(([name, count]) => `${name} ${count}`).join(" · ")}</p>
            <span>Tổng giá trị: <b>{shortValue(hoveredSummary.totalValue)}</b> · bấm tỉnh để lọc</span>
          </div> : null}

          <MapContainer center={[16.15, 106.4]} zoom={5.15} minZoom={3} maxZoom={18} zoomSnap={.25} zoomDelta={.5} wheelPxPerZoomLevel={80} scrollWheelZoom preferCanvas className={expanded ? "h-[78vh] w-full" : "public-map-leaflet-size w-full"}>
            <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
            <SVGOverlay
              bounds={VIETNAM_SVG_BOUNDS}
              attributes={{ viewBox: "35 0 375 735", preserveAspectRatio: "none", className: "public-vietnam-province-overlay" }}
              interactive
            >
              {vietnamPostMergerProvinces.map((province) => {
                const summary = provinceSummaries.get(province.name);
                return <path
                  key={province.name}
                  d={province.d}
                  fill={provinceFill(summary?.score || 0, maxProvinceScore)}
                  className={`public-vn-province-shape ${summary ? "has-data" : ""}`}
                  onMouseEnter={() => setHoveredProvince(province.name)}
                  onMouseLeave={() => setHoveredProvince((current) => current === province.name ? null : current)}
                  onClick={() => summary && selectProvince(province.name)}
                ><title>{province.name}{summary ? ` · ${summary.projects.length} dự án · ${shortValue(summary.totalValue)}` : " · chưa có dự án trong dữ liệu"}</title></path>;
              })}
            </SVGOverlay>
            <ScaleControl position="bottomleft" imperial={false} metric />
            <MapViewportController
              points={renderedMapProjects.map(({ lat, lng }) => ({ lat, lng }))}
              selected={selectedMappable ? { lat: selectedMappable.lat, lng: selectedMappable.lng } : null}
              focusVietnam={!hasExplicitFilter && !selectedMappable}
              maxZoom={9}
              selectedZoom={9}
              singlePointZoom={8}
            />
            {renderedMapProjects.map((project) => {
              const selected = selectedId === project.id;
              const visual = projectTypeVisuals[project.type];
              return <Marker
                key={project.id}
                position={[project.lat, project.lng]}
                icon={L.divIcon({ html: markerHtml(project.type, project.status, selected, project.investorCountry), className: "licogi-div-icon", iconSize: selected ? [52, 64] : [44, 56], iconAnchor: selected ? [26, 62] : [22, 54], popupAnchor: [0, -46] })}
                eventHandlers={{ click: () => setSelectedId(project.id) }}
              >
                <Tooltip direction="top" offset={[0, -40]} opacity={.98}>
                  <div className="public-map-tooltip public-map-tooltip-rich">
                    <span style={{ background: visual.color }} />
                    <b>{project.name}</b>
                    <small>{investorCountryFlag(project.investorCountry)} {project.province} · {project.type}</small>
                    <em>{formatContractValue(project.contractValueVnd, project.valueRange)} · {project.status === "completed" ? "Hoàn thành" : `Tiến độ ${project.progress}%`}</em>
                  </div>
                </Tooltip>
                <Popup minWidth={280} maxWidth={340}>
                  <div className="public-map-popup public-map-popup-rich">
                    <div className="public-map-popup-top"><span className="public-map-popup-code">{project.code}</span><i style={{ background: visual.color }}>{project.type}</i></div>
                    <strong>{project.name}</strong>
                    <p><MapPin size={13} /> {project.province} · {project.projectCountry || "Việt Nam"}</p>
                    <p><Building2 size={13} /> {investorCountryFlag(project.investorCountry)} {project.investor}</p>
                    <div className="public-map-popup-value"><small>Giá trị hợp đồng</small><b>{formatContractValue(project.contractValueVnd, project.valueRange)}</b></div>
                    <div className="public-map-popup-progress"><span style={{ width: `${project.progress}%` }} /></div>
                    <div className="public-map-popup-meta"><span>{statusLabels[project.status]}</span><b>{project.progress}%</b></div>
                    <button type="button" className="public-map-popup-detail" onClick={() => setSelectedId(project.id)}>Xem sơ lược <ChevronRight size={14} /></button>
                  </div>
                </Popup>
              </Marker>;
            })}
          </MapContainer>
          {loading && projects.length === 0 ? <div className="public-map-loading">Đang tải dữ liệu dự án...</div> : null}
          {error ? <div className="public-map-error"><span>{error}</span><button type="button" onClick={() => void load("refresh")}>Thử lại</button></div> : null}
          {!loading && !error && mapProjects.length === 0 ? <div className="public-map-empty">Không có vị trí hợp lệ cho bộ lọc này. Danh sách bên phải vẫn hiển thị dữ liệu dự án.</div> : null}
        </div>

        <aside className="public-project-sidepanel public-project-sidepanel-2026" aria-label="Hồ sơ dự án">
          {selectedProject ? <>
            <div className="public-project-sidepanel-head">
              <button type="button" onClick={() => setSelectedId(null)}><ChevronLeft size={15} /> Danh sách</button>
              <span className={`status-${selectedProject.status}`}>{statusLabels[selectedProject.status]}</span>
            </div>
            <div className="public-project-preview">
              <div className="public-project-preview-title">
                <span style={{ background: projectTypeVisuals[selectedProject.type].color }}>{selectedProject.type}</span>
                <small>{selectedProject.code}</small>
                <h4>{selectedProject.name}</h4>
                <p><MapPin size={13}/>{selectedProject.province}{selectedProject.legacyProvince ? ` · dữ liệu cũ: ${selectedProject.legacyProvince}` : ""}</p>
              </div>
              <div className="public-project-preview-grid">
                <div><small>Giá trị hợp đồng</small><strong>{formatContractValue(selectedProject.contractValueVnd, selectedProject.valueRange)}</strong></div>
                <div><small>Tiến độ</small><strong>{selectedProject.progress}%</strong><span><i style={{ width: `${selectedProject.progress}%`, background: projectTypeVisuals[selectedProject.type].color }} /></span></div>
                <div><small>Chủ đầu tư</small><strong>{investorCountryFlag(selectedProject.investorCountry)} {selectedProject.investor}</strong></div>
                <div><small>Quốc gia</small><strong>{selectedProject.projectCountry || "Việt Nam"}</strong></div>
              </div>
              {selectedProject.scale ? <div className="public-project-preview-note"><small>Quy mô / phạm vi</small><p>{selectedProject.scale}</p></div> : null}
              <div className="public-project-preview-actions">
                <Link href={`/portfolio/projects/${encodeURIComponent(selectedProject.id)}`} className="is-primary">Xem chi tiết đầy đủ <ChevronRight size={14}/></Link>
                {mapHref !== "#" ? <a href={mapHref} target="_blank" rel="noreferrer"><MapPin size={14}/> Mở vị trí</a> : null}
              </div>
            </div>
          </> : <>
            <div className="public-project-sidepanel-head"><strong>Địa phương & công trình</strong><span>{filtered.length}</span></div>
            <div className="public-province-ranking">
              <div className="public-province-ranking-head"><span>Tỉnh/thành có dự án</span><small>theo dữ liệu đang lọc</small></div>
              {provinceRanking.slice(0, 6).map((province, index) => <button key={province.name} type="button" onClick={() => selectProvince(province.name)}>
                <em>{index + 1}</em><span><b>{province.name}</b><small>{province.projects.length} dự án · {shortValue(province.totalValue)}</small></span><strong>{province.ongoing ? `${province.averageProgress}%` : <Check size={13}/>}</strong>
              </button>)}
            </div>
            <div className="public-project-list-panel public-project-ranked-list">
              {rankedProjects.slice(0, 80).map((project, index) => {
                const visual = projectTypeVisuals[project.type];
                return <button key={project.id} type="button" onClick={() => setSelectedId(project.id)}>
                  <em className="public-project-rank">{index + 1}</em>
                  <i style={{ background: visual.color }} />
                  <span><b>{project.name}</b><small>{investorCountryFlag(project.investorCountry)} {project.province} · {project.type} · {formatContractValue(project.contractValueVnd, project.valueRange)}</small><label><u style={{ width: `${project.progress}%`, background: visual.color }}/></label></span>
                  <strong className={`status-${project.status}`}>{project.status === "completed" ? <Check size={13}/> : `${project.progress}%`}</strong>
                  <ChevronRight size={14} />
                </button>;
              })}
              {!filtered.length ? <p>Không có dự án phù hợp.</p> : null}
            </div>
          </>}
        </aside>
      </div>
    </div>
  );
}
