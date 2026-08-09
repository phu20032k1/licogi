"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, Tooltip } from "react-leaflet";
import {
  Activity,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Expand,
  FileText,
  Globe2,
  Layers3,
  MapPin,
  Maximize2,
  RefreshCcw,
  Ruler,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes, statusLabels } from "../data/projects";
import { markerHtml, projectStatusVisuals, projectTypeVisuals } from "../lib/projectMapVisuals";
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

function riskLabel(value?: string) {
  if (value === "high") return "Cao";
  if (value === "medium") return "Trung bình";
  return "Thấp";
}

function InfoRow({ label, value, note }: { label: string; value?: string | number | null; note?: string }) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  return <div className="public-project-info-row"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</div>;
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
        project.customerCode || "",
        project.customerIndustry || "",
        project.investorCountry || "",
        project.type,
        project.rawType || "",
        project.code,
        project.valueRange,
        project.contractValueVnd ? String(project.contractValueVnd) : "",
        project.scale || "",
        project.constructionArea || "",
        project.floorArea || "",
        project.contractorRole || "",
        project.contractNumber || "",
        project.packageName || "",
        project.source || "",
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

  const selectedProject = selectedId ? projects.find((project) => project.id === selectedId) || null : null;
  const hasExplicitFilter = Boolean(search.trim()) || type !== "all" || status !== "all" || hiddenTypes.size > 0 || hiddenStatuses.size > 0;
  const vietnamProjects = useMemo(() => filtered.filter(isVietnamProject), [filtered]);
  const mapProjects = !hasExplicitFilter && !selectedProject && vietnamProjects.length ? vietnamProjects : filtered;

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
  }

  const mapHref = selectedProject?.mapsUrl || (selectedProject ? `https://www.google.com/maps/search/?api=1&query=${selectedProject.lat},${selectedProject.lng}` : "#");
  const related = selectedProject?.related || {};
  const relatedTotal = Object.values(related).reduce((sum, value) => sum + Number(value || 0), 0);

  return (
    <div className={`public-map-shell public-project-map-shell ${expanded ? "is-expanded" : ""}`}>
      <div className="public-map-toolbar">
        <div><h3>Danh mục dự án</h3><p>{mapProjects.length} dự án trên bản đồ · {filtered.length}/{projects.length} dự án theo bộ lọc</p></div>
        <div className="public-map-toolbar-actions">
          {hasExplicitFilter ? <button type="button" onClick={resetFilters} className="public-map-reset"><X size={14} /> Xóa lọc</button> : null}
          <button type="button" onClick={() => setExpanded((value) => !value)} className="public-icon-button" aria-label={expanded ? "Thu nhỏ bản đồ" : "Phóng lớn bản đồ"}>{expanded ? <Expand size={17} /> : <Maximize2 size={17} />}</button>
          <button type="button" onClick={() => void load(false)} className="public-icon-button" aria-label="Tải lại dự án" disabled={refreshing}><RefreshCcw size={17} className={refreshing ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <div className="public-map-controls">
        <label aria-label="Tìm dự án"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm dự án, địa phương, chủ đầu tư, hợp đồng..." /></label>
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
          <div className="public-map-zoom-hint"><CircleDot size={12} /> Lăn chuột để phóng to / thu nhỏ</div>
          <div className="public-map-overlay-legend" aria-label="Chú thích bản đồ">
            <div className="public-map-overlay-title"><Layers3 size={13} /><span>Chú thích</span></div>
            <div className="public-map-overlay-types">
              {projectTypes.filter((projectType) => typeCounts[projectType] > 0).map((projectType) => {
                const visual = projectTypeVisuals[projectType];
                const hidden = hiddenTypes.has(projectType);
                return <button key={projectType} type="button" onClick={() => toggleType(projectType)} className={hidden ? "is-muted" : ""} title={hidden ? `Hiện ${projectType}` : `Ẩn ${projectType}`}><i style={{ background: visual.color }} /><span>{projectType}</span><b>{typeCounts[projectType]}</b></button>;
              })}
            </div>
            <div className="public-map-overlay-status">
              {(Object.keys(projectStatusVisuals) as ProjectStatus[]).map((projectStatus) => {
                const visual = projectStatusVisuals[projectStatus];
                const hidden = hiddenStatuses.has(projectStatus);
                return <button key={projectStatus} type="button" onClick={() => toggleStatus(projectStatus)} className={hidden ? "is-muted" : ""}><i style={{ background: visual.color }}>{visual.symbol === "•" ? "" : visual.symbol}</i><span>{statusLabels[projectStatus]}</span></button>;
              })}
            </div>
          </div>

          <MapContainer center={[16.15, 106.2]} zoom={5.4} minZoom={3} maxZoom={18} zoomSnap={0.25} zoomDelta={0.5} wheelPxPerZoomLevel={80} scrollWheelZoom preferCanvas worldCopyJump className={expanded ? "h-[78vh] w-full" : "public-map-leaflet-size w-full"}>
            <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
            <ScaleControl position="bottomleft" imperial={false} metric />
            <MapViewportController
              points={mapProjects.map(({ lat, lng }) => ({ lat, lng }))}
              selected={selectedProject ? { lat: selectedProject.lat, lng: selectedProject.lng } : null}
              focusVietnam={!hasExplicitFilter && !selectedProject}
              maxZoom={8}
              selectedZoom={8}
              singlePointZoom={7}
            />
            {mapProjects.map((project) => {
              const selected = selectedId === project.id;
              const visual = projectTypeVisuals[project.type];
              return <Marker
                key={project.id}
                position={[project.lat, project.lng]}
                icon={L.divIcon({ html: markerHtml(project.type, project.status, selected), className: "licogi-div-icon", iconSize: selected ? [52, 62] : [44, 54], iconAnchor: selected ? [26, 60] : [22, 52], popupAnchor: [0, -46] })}
                eventHandlers={{ click: () => selectProject(project) }}
              >
                <Tooltip direction="top" offset={[0, -40]} opacity={0.98}>
                  <div className="public-map-tooltip"><span style={{ background: visual.color }} /><b>{project.name}</b><small>{project.province} · {project.type}</small></div>
                </Tooltip>
                <Popup minWidth={270} maxWidth={330}>
                  <div className="public-map-popup public-map-popup-rich">
                    <div className="public-map-popup-top"><span className="public-map-popup-code">{project.code}</span><i style={{ background: visual.color }}>{project.type}</i></div>
                    <strong>{project.name}</strong>
                    <p><MapPin size={13} /> {project.province} · {project.projectCountry || "Việt Nam"}</p>
                    <p><Building2 size={13} /> {project.investor}</p>
                    <div className="public-map-popup-value"><small>Giá trị hợp đồng</small><b>{formatContractValue(project.contractValueVnd, project.valueRange)}</b></div>
                    <div className="public-map-popup-progress"><span style={{ width: `${project.progress}%` }} /></div>
                    <div className="public-map-popup-meta"><span>{statusLabels[project.status]}</span><b>{project.progress}%</b></div>
                    <button type="button" className="public-map-popup-detail" onClick={() => selectProject(project)}>Mở hồ sơ dự án <ChevronRight size={14} /></button>
                  </div>
                </Popup>
              </Marker>;
            })}
          </MapContainer>
          {loading && projects.length === 0 ? <div className="public-map-loading">Đang tải dữ liệu dự án...</div> : null}
          {error ? <div className="public-map-error"><span>{error}</span><button type="button" onClick={() => void load(false)}>Thử lại</button></div> : null}
          {!loading && !error && mapProjects.length === 0 ? <div className="public-map-empty">Không có dự án phù hợp bộ lọc.</div> : null}
        </div>

        <aside className="public-project-sidepanel" aria-label="Hồ sơ dự án">
          {selectedProject ? <>
            <div className="public-project-sidepanel-head">
              <button type="button" onClick={() => setSelectedId(null)}><ChevronLeft size={15} /> Danh sách</button>
              <span className={`status-${selectedProject.status}`}>{statusLabels[selectedProject.status]}</span>
            </div>
            <div className="public-project-sidepanel-scroll">
              <div className="public-project-title-block">
                <span>{selectedProject.code} · {selectedProject.type}</span>
                <h4>{selectedProject.name}</h4>
                <p><MapPin size={13} /> {selectedProject.province}, {selectedProject.projectCountry || "Việt Nam"}</p>
              </div>

              <div className="public-project-key-metrics">
                <div><small>Giá trị hợp đồng</small><strong>{formatContractValue(selectedProject.contractValueVnd, selectedProject.valueRange)}</strong></div>
                <div><small>Tiến độ</small><strong>{selectedProject.progress}%</strong><span><i style={{ width: `${selectedProject.progress}%` }} /></span></div>
                <div><small>Sức khỏe dữ liệu</small><strong>{selectedProject.healthScore ?? "—"}<em>/100</em></strong><span>{selectedProject.dataCompleteness ?? 0}% dữ liệu chính đã có</span></div>
              </div>

              <section className="public-project-info-section">
                <h5><Building2 size={14} /> Chủ đầu tư & hợp đồng</h5>
                <InfoRow label="Chủ đầu tư" value={selectedProject.investor} note={[selectedProject.customerCode, selectedProject.customerIndustry, selectedProject.investorCountry].filter(Boolean).join(" · ")} />
                <InfoRow label="Số hợp đồng" value={selectedProject.contractNumber} />
                <InfoRow label="Gói thầu" value={selectedProject.packageName} />
                <InfoRow label="Vai trò" value={selectedProject.contractorRole} />
              </section>

              <section className="public-project-info-section">
                <h5><Ruler size={14} /> Quy mô thi công</h5>
                <InfoRow label="Quy mô / phạm vi" value={selectedProject.scale} />
                <InfoRow label="Diện tích xây dựng" value={selectedProject.constructionArea} />
                <InfoRow label="Tổng diện tích sàn" value={selectedProject.floorArea} />
                <InfoRow label="Khoảng giá trị" value={selectedProject.valueRange !== "Chưa cập nhật" ? selectedProject.valueRange : ""} />
              </section>

              <section className="public-project-info-section">
                <h5><CalendarDays size={14} /> Tiến độ & dữ liệu</h5>
                <InfoRow label="Thời gian" value={selectedProject.startDate || selectedProject.endDate ? `${formatDate(selectedProject.startDate)} — ${formatDate(selectedProject.endDate)}` : ""} />
                <InfoRow label="Mức rủi ro" value={riskLabel(selectedProject.risk)} />
                <InfoRow label="Nguồn dữ liệu" value={selectedProject.source} />
                <InfoRow label="Cập nhật gần nhất" value={formatDate(selectedProject.updatedAt)} />
              </section>

              {relatedTotal > 0 ? <section className="public-project-info-section">
                <h5><Activity size={14} /> Dữ liệu liên quan</h5>
                <div className="public-project-related-grid">
                  <div><FileText /><strong>{related.documents || 0}</strong><span>Hồ sơ</span></div>
                  <div><Wrench /><strong>{related.equipment || 0}</strong><span>Thiết bị</span></div>
                  <div><Check /><strong>{related.tasks || 0}</strong><span>Công việc</span></div>
                  <div><ShieldCheck /><strong>{related.warranties || 0}</strong><span>Bảo hành</span></div>
                </div>
              </section> : null}

              {selectedProject.description ? <section className="public-project-info-section"><h5><FileText size={14} /> Ghi chú dự án</h5><p className="public-project-description-text">{selectedProject.description}</p></section> : null}
            </div>
            <div className="public-project-sidepanel-actions">
              <a href={mapHref} target="_blank" rel="noreferrer"><MapPin size={14} /> Mở vị trí</a>
              <button type="button" onClick={() => { setSearch(selectedProject.code); setType("all"); setStatus("all"); }}><Search size={14} /> Lọc dự án này</button>
            </div>
          </> : <>
            <div className="public-project-sidepanel-head"><strong>Dự án đang hiển thị</strong><span>{filtered.length}</span></div>
            <div className="public-project-list-panel">
              {filtered.slice(0, 50).map((project) => {
                const visual = projectTypeVisuals[project.type];
                return <button key={project.id} type="button" onClick={() => selectProject(project)}>
                  <i style={{ background: visual.color }} />
                  <span><b>{project.name}</b><small>{project.province} · {project.type}</small></span>
                  <em>{project.status === "completed" ? <Check size={13} /> : `${project.progress}%`}</em>
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
