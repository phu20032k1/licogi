"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, Tooltip } from "react-leaflet";
import { Building2, Globe2, MapPin, RefreshCcw, Search, X } from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes, statusLabels } from "../data/projects";
import { markerHtml } from "../lib/projectMapVisuals";
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
  valueRange: string;
  scale?: string;
  progress: number;
  lat: number;
  lng: number;
  description?: string;
};

type PublicProjectsResponse = { ok: boolean; projects?: PublicProject[]; message?: string };
type FilterDetail = { search?: string; type?: string; status?: string; projectId?: string | null };

function isVietnamProject(project: PublicProject) {
  const country = (project.projectCountry || "Việt Nam").trim().toLocaleLowerCase("vi");
  if (country === "việt nam" || country === "vietnam" || country === "viet nam") return true;
  return project.lat >= 8 && project.lat <= 24.5 && project.lng >= 102 && project.lng <= 110.8;
}

export default function PublicProjectMap() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        project.scale || "",
        project.description || "",
      ].join(" ").toLocaleLowerCase("vi");
      return (!keyword || haystack.includes(keyword)) && (type === "all" || project.type === type);
    });
  }, [projects, search, type]);

  const filtered = useMemo(() => searchAndTypeFiltered.filter((project) => status === "all" || project.status === status), [searchAndTypeFiltered, status]);
  const statusCounts = useMemo(() => ({
    ongoing: searchAndTypeFiltered.filter((item) => item.status === "ongoing").length,
    completed: searchAndTypeFiltered.filter((item) => item.status === "completed").length,
    warranty: searchAndTypeFiltered.filter((item) => item.status === "warranty").length,
  }), [searchAndTypeFiltered]);
  const selectedProject = selectedId ? filtered.find((project) => project.id === selectedId) || null : null;
  const hasExplicitFilter = Boolean(search.trim()) || type !== "all" || status !== "all";
  const vietnamProjects = useMemo(() => filtered.filter(isVietnamProject), [filtered]);
  const viewportProjects = !hasExplicitFilter && vietnamProjects.length ? vietnamProjects : filtered;

  useEffect(() => {
    if (selectedId && !filtered.some((project) => project.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  function resetFilters() {
    setSearch("");
    setType("all");
    setStatus("all");
    setSelectedId(null);
  }

  return (
    <div className="public-map-shell public-project-map-shell">
      <div className="public-map-toolbar">
        <div><h3>Dự án</h3><p>{filtered.length} / {projects.length} dự án đang hiển thị · mặc định tập trung Việt Nam</p></div>
        <div className="public-map-toolbar-actions">
          {hasExplicitFilter ? <button type="button" onClick={resetFilters} className="public-map-reset"><X size={14} /> Xóa lọc</button> : null}
          <button type="button" onClick={() => void load(false)} className="public-icon-button" aria-label="Tải lại dự án" disabled={refreshing}><RefreshCcw size={17} className={refreshing ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <div className="public-map-controls">
        <label aria-label="Tìm dự án"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm dự án, tỉnh, quốc gia, chủ đầu tư..." /></label>
        <select aria-label="Lọc ngành hàng" value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)}><option value="all">Tất cả lĩnh vực</option>{projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select aria-label="Lọc trạng thái" value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)}><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Hoàn thành</option><option value="warranty">Bảo hành</option></select>
      </div>

      <div className="public-map-stats">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}><b>{searchAndTypeFiltered.length}</b> tất cả</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={`is-orange ${status === "ongoing" ? "is-active" : ""}`}><b>{statusCounts.ongoing}</b> thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={`is-green ${status === "completed" ? "is-active" : ""}`}><b>{statusCounts.completed}</b> hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={`is-blue ${status === "warranty" ? "is-active" : ""}`}><b>{statusCounts.warranty}</b> bảo hành</button>
      </div>

      <div className="public-map-canvas">
        <MapContainer center={[16.25, 107.2]} zoom={5.25} minZoom={4} maxZoom={18} zoomSnap={0.5} zoomDelta={0.5} wheelPxPerZoomLevel={90} scrollWheelZoom={false} preferCanvas worldCopyJump className="h-[520px] w-full md:h-[650px]">
          <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
          <ScaleControl position="bottomleft" imperial={false} metric />
          <MapViewportController points={viewportProjects.map(({ lat, lng }) => ({ lat, lng }))} selected={selectedProject ? { lat: selectedProject.lat, lng: selectedProject.lng } : null} maxZoom={7} selectedZoom={7} singlePointZoom={6.5} />
          {filtered.map((project) => {
            const selected = selectedId === project.id;
            return <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              icon={L.divIcon({ html: markerHtml(project.type, project.status, selected), className: "licogi-div-icon", iconSize: selected ? [48, 56] : [42, 50], iconAnchor: selected ? [24, 54] : [21, 48], popupAnchor: [0, -43] })}
              eventHandlers={{ click: () => setSelectedId(project.id) }}
            >
              <Tooltip direction="top" offset={[0, -40]} opacity={0.96}>{project.name}</Tooltip>
              <Popup>
                <div className="public-map-popup">
                  <span className="public-map-popup-code">{project.code}</span>
                  <strong>{project.name}</strong>
                  <p><MapPin size={13} /> {project.province} · {project.projectCountry || "Việt Nam"}</p>
                  <p><Building2 size={13} /> {project.investor}</p>
                  {project.investorCountry ? <p><Globe2 size={13} /> Chủ đầu tư: {project.investorCountry}</p> : null}
                  {project.scale ? <p><b>Quy mô:</b> {project.scale}</p> : null}
                  {project.valueRange && project.valueRange !== "Chưa cập nhật" ? <p><b>Giá trị:</b> {project.valueRange}</p> : null}
                  <div className="public-map-popup-progress"><span style={{ width: `${project.progress}%` }} /></div>
                  <div className="public-map-popup-meta"><span>{statusLabels[project.status]}</span><b>{project.progress}%</b></div>
                  <a className="public-text-link mt-3 inline-flex" href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`} target="_blank" rel="noreferrer">Mở vị trí thực tế</a>
                </div>
              </Popup>
            </Marker>;
          })}
        </MapContainer>
        {loading && projects.length === 0 ? <div className="public-map-loading">Đang tải dữ liệu dự án...</div> : null}
        {error ? <div className="public-map-error"><span>{error}</span><button type="button" onClick={() => void load(false)}>Thử lại</button></div> : null}
        {!loading && !error && filtered.length === 0 ? <div className="public-map-empty">Không có dự án phù hợp bộ lọc.</div> : null}
      </div>

      {selectedProject ? <div className="public-map-selected-card">
        <div className="public-map-selected-head"><div><span>{selectedProject.code}</span><h4>{selectedProject.name}</h4></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Đóng chi tiết"><X size={16} /></button></div>
        <div className="public-map-selected-grid">
          <div><small>Địa điểm</small><strong>{selectedProject.province}</strong><span>{selectedProject.projectCountry || "Việt Nam"}</span></div>
          <div><small>Chủ đầu tư</small><strong>{selectedProject.investor}</strong><span>{selectedProject.investorCountry || "Chưa cập nhật quốc gia"}</span></div>
          <div><small>Lĩnh vực</small><strong>{selectedProject.type}</strong><span>{statusLabels[selectedProject.status]}</span></div>
          <div><small>Quy mô / giá trị</small><strong>{selectedProject.scale || "Chưa cập nhật"}</strong><span>{selectedProject.valueRange}</span></div>
          <div><small>Tiến độ</small><strong>{selectedProject.progress}%</strong><span>theo dữ liệu hiện tại</span></div>
        </div>
        {selectedProject.description ? <p>{selectedProject.description}</p> : null}
      </div> : null}
    </div>
  );
}
