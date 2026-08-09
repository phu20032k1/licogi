"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, Tooltip } from "react-leaflet";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Expand,
  Globe2,
  Layers3,
  MapPin,
  Maximize2,
  RefreshCcw,
  Ruler,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes, statusLabels } from "../data/projects";
import { markerHtml, projectStatusVisuals, projectTypeVisuals } from "../lib/projectMapVisuals";
import { siteConfig } from "../lib/siteConfig";
import MapViewportController from "./map/MapViewportController";

type PublicProject = {
  id: string;
  numericId: number;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  investor: string;
  investorCountry?: string;
  projectCountry?: string;
  province: string;
  contractValueVnd?: number | null;
  valueRange: string;
  constructionArea?: string;
  floorArea?: string;
  scale?: string;
  contractorRole?: string;
  startDate?: string;
  endDate?: string;
  mapsUrl?: string;
  progress: number;
  lat: number;
  lng: number;
  description?: string;
  updatedAt?: string;
};

type PublicProjectsResponse = { ok: boolean; projects?: PublicProject[]; message?: string };
type FilterDetail = { search?: string; type?: string; status?: string; projectId?: string | null };

function isVietnamProject(project: PublicProject) {
  const country = (project.projectCountry || "Việt Nam").trim().toLocaleLowerCase("vi");
  if (country === "việt nam" || country === "vietnam" || country === "viet nam") return true;
  return project.lat >= 8 && project.lat <= 24.5 && project.lng >= 102 && project.lng <= 110.8;
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

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return new Intl.DateTimeFormat("vi-VN").format(parsed);
  return value;
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
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true); else setRefreshing(true);
    try {
      const response = await fetch("/api/public/projects", { cache: "no-store" });
      const data = (await response.json()) as PublicProjectsResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu dự án.");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
    const refresh = () => void load(false);
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void load(false); }, 60000);
    window.addEventListener("licogi-data-imported", refresh);
    window.addEventListener("licogi-projects-updated", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("licogi-data-imported", refresh);
      window.removeEventListener("licogi-projects-updated", refresh);
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
      const haystack = [
        project.name,
        project.province,
        project.projectCountry || "Việt Nam",
        project.investor,
        project.investorCountry || "",
        project.type,
        project.code,
        project.valueRange,
        project.contractValueVnd ? String(project.contractValueVnd) : "",
        project.scale || "",
        project.constructionArea || "",
        project.floorArea || "",
        project.contractorRole || "",
        project.description || "",
      ].join(" ").toLocaleLowerCase("vi");
      return (!keyword || haystack.includes(keyword))
        && (type === "all" || project.type === type)
        && !hiddenTypes.has(project.type);
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

  const typeCounts = useMemo(() => Object.fromEntries(projectTypes.map((projectType) => [
    projectType,
    projects.filter((project) => project.type === projectType).length,
  ])) as Record<ProjectType, number>, [projects]);

  const selectedProject = selectedId ? filtered.find((project) => project.id === selectedId) || projects.find((project) => project.id === selectedId) || null : null;
  const hasExplicitFilter = Boolean(search.trim()) || type !== "all" || status !== "all" || hiddenTypes.size > 0 || hiddenStatuses.size > 0;
  const vietnamProjects = useMemo(() => filtered.filter(isVietnamProject), [filtered]);
  const viewportProjects = !hasExplicitFilter && vietnamProjects.length ? vietnamProjects : filtered;

  useEffect(() => {
    if (selectedId && !filtered.some((project) => project.id === selectedId) && hasExplicitFilter) setSelectedId(null);
  }, [filtered, selectedId, hasExplicitFilter]);

  function resetFilters() {
    setSearch("");
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

  function selectProject(project: PublicProject) {
    setSelectedId(project.id);
    window.setTimeout(() => document.getElementById("du-an-chi-tiet")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  const mapHref = selectedProject?.mapsUrl || (selectedProject ? `https://www.google.com/maps/search/?api=1&query=${selectedProject.lat},${selectedProject.lng}` : "#");

  return (
    <div className={`public-map-shell public-project-map-shell ${expanded ? "is-expanded" : ""}`}>
      <div className="public-map-toolbar">
        <div><h3>Dự án</h3><p>{filtered.length} / {projects.length} dự án đang hiển thị · dữ liệu tương tác theo thời gian thực</p></div>
        <div className="public-map-toolbar-actions">
          {hasExplicitFilter ? <button type="button" onClick={resetFilters} className="public-map-reset"><X size={14} /> Xóa lọc</button> : null}
          <button type="button" onClick={() => setExpanded((value) => !value)} className="public-icon-button" aria-label={expanded ? "Thu nhỏ bản đồ" : "Phóng lớn bản đồ"}>{expanded ? <Expand size={17} /> : <Maximize2 size={17} />}</button>
          <button type="button" onClick={() => void load(false)} className="public-icon-button" aria-label="Tải lại dự án" disabled={refreshing}><RefreshCcw size={17} className={refreshing ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <div className="public-map-controls">
        <label aria-label="Tìm dự án"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, tỉnh, quốc gia, chủ đầu tư, giá trị..." /></label>
        <select aria-label="Lọc ngành hàng" value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)}><option value="all">Tất cả lĩnh vực</option>{projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select aria-label="Lọc trạng thái" value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)}><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Hoàn thành</option><option value="warranty">Bảo hành</option></select>
      </div>

      <div className="public-map-stats">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}><b>{searchAndTypeFiltered.length}</b> tất cả</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={`is-orange ${status === "ongoing" ? "is-active" : ""}`}><b>{statusCounts.ongoing}</b> thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={`is-green ${status === "completed" ? "is-active" : ""}`}><b>{statusCounts.completed}</b> hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={`is-blue ${status === "warranty" ? "is-active" : ""}`}><b>{statusCounts.warranty}</b> bảo hành</button>
      </div>

      <div className="public-map-legend-panel">
        <div className="public-map-legend-group">
          <span className="public-map-legend-title"><Layers3 size={14} /> Màu theo lĩnh vực</span>
          <div className="public-map-legend-items">
            {projectTypes.map((projectType) => {
              const visual = projectTypeVisuals[projectType];
              const hidden = hiddenTypes.has(projectType);
              return <button key={projectType} type="button" onClick={() => toggleType(projectType)} className={hidden ? "is-muted" : "is-active"} title={hidden ? `Hiện ${projectType}` : `Ẩn ${projectType}`}>
                <i style={{ background: visual.color }} />
                <span>{projectType}</span>
                <b>{typeCounts[projectType]}</b>
              </button>;
            })}
          </div>
        </div>
        <div className="public-map-legend-group public-map-status-legend">
          <span className="public-map-legend-title"><ShieldCheck size={14} /> Trạng thái</span>
          <div className="public-map-legend-items">
            {(Object.keys(projectStatusVisuals) as ProjectStatus[]).map((projectStatus) => {
              const visual = projectStatusVisuals[projectStatus];
              const hidden = hiddenStatuses.has(projectStatus);
              return <button key={projectStatus} type="button" onClick={() => toggleStatus(projectStatus)} className={hidden ? "is-muted" : "is-active"}>
                <i className="is-status" style={{ background: visual.color }}>{visual.symbol === "•" ? "" : visual.symbol}</i>
                <span>{statusLabels[projectStatus]}</span>
              </button>;
            })}
          </div>
        </div>
        <p className="public-map-legend-note">Bấm vào từng màu để ẩn/hiện nhóm. Marker giữ <b>màu ngành</b>; dự án hoàn thành có <b>dấu ✓ xanh</b>, bảo hành có badge xanh dương.</p>
      </div>

      <div className="public-map-canvas">
        <div className="public-map-zoom-hint"><CircleDot size={12} /> Dùng nút + / − trên bản đồ để phóng to, thu nhỏ</div>
        <MapContainer center={[16.25, 107.2]} zoom={5.25} minZoom={4} maxZoom={18} zoomSnap={0.5} zoomDelta={0.5} wheelPxPerZoomLevel={90} scrollWheelZoom={false} preferCanvas worldCopyJump className={expanded ? "h-[78vh] w-full" : "h-[520px] w-full md:h-[650px]"}>
          <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
          <ScaleControl position="bottomleft" imperial={false} metric />
          <MapViewportController points={viewportProjects.map(({ lat, lng }) => ({ lat, lng }))} selected={selectedProject ? { lat: selectedProject.lat, lng: selectedProject.lng } : null} maxZoom={7} selectedZoom={7.5} singlePointZoom={7} />
          {filtered.map((project) => {
            const selected = selectedId === project.id;
            const visual = projectTypeVisuals[project.type];
            return <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              icon={L.divIcon({ html: markerHtml(project.type, project.status, selected), className: "licogi-div-icon", iconSize: selected ? [54, 64] : [48, 58], iconAnchor: selected ? [27, 62] : [24, 56], popupAnchor: [0, -50] })}
              eventHandlers={{ click: () => selectProject(project) }}
            >
              <Tooltip direction="top" offset={[0, -43]} opacity={0.98}>
                <div className="public-map-tooltip"><span style={{ background: visual.color }} /> <b>{project.name}</b><small>{project.type} · {statusLabels[project.status]}</small></div>
              </Tooltip>
              <Popup minWidth={285} maxWidth={360}>
                <div className="public-map-popup public-map-popup-rich">
                  <div className="public-map-popup-top"><span className="public-map-popup-code">{project.code}</span><i style={{ background: visual.color }}>{project.type}</i></div>
                  <strong>{project.name}</strong>
                  <p><MapPin size={13} /> {project.province} · {project.projectCountry || "Việt Nam"}</p>
                  <p><Building2 size={13} /> {project.investor}</p>
                  <div className="public-map-popup-value"><small>Giá trị hợp đồng</small><b>{formatContractValue(project.contractValueVnd, project.valueRange)}</b></div>
                  {project.scale ? <p><Ruler size={13} /> {project.scale}</p> : null}
                  <div className="public-map-popup-progress"><span style={{ width: `${project.progress}%` }} /></div>
                  <div className="public-map-popup-meta"><span>{statusLabels[project.status]}</span><b>{project.progress}%</b></div>
                  <button type="button" className="public-map-popup-detail" onClick={() => selectProject(project)}>Xem đầy đủ thông tin <ChevronRight size={14} /></button>
                </div>
              </Popup>
            </Marker>;
          })}
        </MapContainer>
        {loading && projects.length === 0 ? <div className="public-map-loading">Đang tải dữ liệu dự án...</div> : null}
        {error ? <div className="public-map-error"><span>{error}</span><button type="button" onClick={() => void load(false)}>Thử lại</button></div> : null}
        {!loading && !error && filtered.length === 0 ? <div className="public-map-empty">Không có dự án phù hợp bộ lọc.</div> : null}
      </div>

      {filtered.length > 0 ? <div className="public-map-project-browser">
        <div className="public-map-project-browser-head"><div><span>Danh sách đang hiển thị</span><b>{filtered.length} dự án</b></div><small>Bấm một dự án để định vị và xem hồ sơ</small></div>
        <div className="public-map-project-browser-list">
          {filtered.map((project) => {
            const visual = projectTypeVisuals[project.type];
            return <button key={project.id} type="button" onClick={() => selectProject(project)} className={selectedId === project.id ? "is-selected" : ""}>
              <i style={{ background: visual.color }} />
              <span><b>{project.name}</b><small>{project.province} · {project.type}</small></span>
              <em>{project.status === "completed" ? <Check size={13} /> : `${project.progress}%`}</em>
              <ChevronRight size={14} />
            </button>;
          })}
        </div>
      </div> : null}

      {selectedProject ? <div id="du-an-chi-tiet" className="public-map-selected-card public-project-dossier">
        <div className="public-map-selected-head">
          <div><span>{selectedProject.code} · {selectedProject.type}</span><h4>{selectedProject.name}</h4><p>{statusLabels[selectedProject.status]} · {selectedProject.progress}%</p></div>
          <button type="button" onClick={() => setSelectedId(null)} aria-label="Đóng chi tiết"><X size={16} /></button>
        </div>

        <div className="public-project-dossier-highlight">
          <div><small>Giá trị hợp đồng</small><strong>{formatContractValue(selectedProject.contractValueVnd, selectedProject.valueRange)}</strong></div>
          <div><small>Tiến độ hiện tại</small><strong>{selectedProject.progress}%</strong><span><i style={{ width: `${selectedProject.progress}%` }} /></span></div>
          <div><small>Trạng thái</small><strong>{selectedProject.status === "completed" ? "✓ Đã hoàn thành" : statusLabels[selectedProject.status]}</strong></div>
        </div>

        <div className="public-map-selected-grid public-project-dossier-grid">
          <div><small><MapPin size={13} /> Địa điểm</small><strong>{selectedProject.province}</strong><span>{selectedProject.projectCountry || "Việt Nam"}</span></div>
          <div><small><Building2 size={13} /> Chủ đầu tư</small><strong>{selectedProject.investor}</strong><span>{selectedProject.investorCountry || "Chưa cập nhật quốc gia"}</span></div>
          <div><small><Layers3 size={13} /> Lĩnh vực</small><strong>{selectedProject.type}</strong><span>{selectedProject.contractorRole || "Vai trò nhà thầu chưa cập nhật"}</span></div>
          <div><small><Ruler size={13} /> Quy mô</small><strong>{selectedProject.scale || "Chưa cập nhật"}</strong><span>{selectedProject.constructionArea ? `Diện tích XD: ${selectedProject.constructionArea}` : ""}</span></div>
          <div><small><Ruler size={13} /> Diện tích sàn</small><strong>{selectedProject.floorArea || "Chưa cập nhật"}</strong><span>{selectedProject.valueRange && selectedProject.valueRange !== "Chưa cập nhật" ? selectedProject.valueRange : ""}</span></div>
          <div><small><CalendarDays size={13} /> Thời gian</small><strong>{formatDate(selectedProject.startDate)}</strong><span>đến {formatDate(selectedProject.endDate)}</span></div>
          <div><small><Globe2 size={13} /> Quốc gia dự án</small><strong>{selectedProject.projectCountry || "Việt Nam"}</strong><span>Tọa độ {selectedProject.lat.toFixed(4)}, {selectedProject.lng.toFixed(4)}</span></div>
          <div><small><ShieldCheck size={13} /> Cập nhật dữ liệu</small><strong>{formatDate(selectedProject.updatedAt)}</strong><span>Nguồn dữ liệu dự án LICOGI 18.3</span></div>
        </div>

        {selectedProject.description ? <div className="public-project-description"><small>Mô tả dự án</small><p>{selectedProject.description}</p></div> : null}

        <div className="public-project-dossier-actions">
          <a href={mapHref} target="_blank" rel="noreferrer"><MapPin size={15} /> Mở vị trí thực tế</a>
          <button type="button" onClick={() => { setSearch(selectedProject.name); setType("all"); setStatus("all"); }}><Search size={15} /> Chỉ xem dự án này</button>
        </div>
      </div> : null}
    </div>
  );
}
