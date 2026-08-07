"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import { Building2, MapPin, RefreshCcw, Search, Sparkles } from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes, statusLabels } from "../data/projects";
import { getMarkerVisual, markerHtml } from "../lib/projectMapVisuals";
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
  province: string;
  valueRange: string;
  scale?: string;
  progress: number;
  lat: number;
  lng: number;
  description?: string;
  updatedAt?: string;
};

type PublicProjectsResponse = {
  ok: boolean;
  total?: number;
  projects?: PublicProject[];
  generatedAt?: string;
  message?: string;
};

export default function PublicProjectMap() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");

  const load = useCallback(async (showInitialLoading = false) => {
    showInitialLoading ? setLoading(true) : setRefreshing(true);
    try {
      const response = await fetch("/api/public/projects", { cache: "no-store" });
      const data = (await response.json()) as PublicProjectsResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được bản đồ.");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setGeneratedAt(data.generatedAt || new Date().toISOString());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được bản đồ.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
    const refresh = () => void load(false);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(false);
    }, 60000);
    window.addEventListener("licogi-data-imported", refresh);
    window.addEventListener("licogi-projects-updated", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("licogi-data-imported", refresh);
      window.removeEventListener("licogi-projects-updated", refresh);
    };
  }, [load]);

  const searchAndTypeFiltered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return projects.filter((project) => {
      const haystack = [project.name, project.province, project.investor, project.type, project.code]
        .join(" ")
        .toLocaleLowerCase("vi");
      return (!keyword || haystack.includes(keyword)) && (type === "all" || project.type === type);
    });
  }, [projects, search, type]);

  const filtered = useMemo(
    () => searchAndTypeFiltered.filter((project) => status === "all" || project.status === status),
    [searchAndTypeFiltered, status],
  );

  const statusCounts = useMemo(
    () => ({
      ongoing: searchAndTypeFiltered.filter((item) => item.status === "ongoing").length,
      completed: searchAndTypeFiltered.filter((item) => item.status === "completed").length,
      warranty: searchAndTypeFiltered.filter((item) => item.status === "warranty").length,
    }),
    [searchAndTypeFiltered],
  );

  const selectedProject = selectedId ? filtered.find((project) => project.id === selectedId) : null;
  const updatedLabel = generatedAt
    ? new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(generatedAt))
    : "";

  useEffect(() => {
    if (selectedId && !filtered.some((project) => project.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  return (
    <div className="public-map-shell">
      <div className="public-map-toolbar">
        <div>
          <span className="public-kicker"><Sparkles size={14} /> Dữ liệu dự án đồng bộ</span>
          <h3>Bản đồ năng lực thi công</h3>
          <p>Dữ liệu từ Trung tâm dữ liệu được dùng chung cho website công khai và hệ thống quản trị.</p>
          {updatedLabel ? <p className="mt-2 text-xs font-semibold text-slate-400">Cập nhật gần nhất: {updatedLabel}</p> : null}
        </div>
        <button type="button" onClick={() => void load(false)} className="public-icon-button" aria-label="Tải lại bản đồ" disabled={refreshing}>
          <RefreshCcw size={17} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="public-map-controls">
        <label aria-label="Tìm dự án"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm dự án, tỉnh thành, chủ đầu tư..." /></label>
        <select aria-label="Lọc ngành hàng" value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)}>
          <option value="all">Tất cả ngành hàng</option>
          {projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Lọc trạng thái" value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="ongoing">Đang thi công</option>
          <option value="completed">Hoàn thành</option>
          <option value="warranty">Bảo hành</option>
        </select>
      </div>

      <div className="public-map-stats">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}><b>{searchAndTypeFiltered.length}</b> dự án</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={`is-orange ${status === "ongoing" ? "is-active" : ""}`}><b>{statusCounts.ongoing}</b> đang thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={`is-green ${status === "completed" ? "is-active" : ""}`}><b>{statusCounts.completed}</b> hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={`is-blue ${status === "warranty" ? "is-active" : ""}`}><b>{statusCounts.warranty}</b> bảo hành</button>
      </div>

      <div className="public-map-canvas">
        <MapContainer center={[16.2, 106.0]} zoom={5} scrollWheelZoom={false} className="h-[520px] w-full md:h-[620px]">
          <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
          <MapViewportController
            points={filtered.map(({ lat, lng }) => ({ lat, lng }))}
            selected={selectedProject ? { lat: selectedProject.lat, lng: selectedProject.lng } : null}
          />
          {filtered.map((project) => {
            const selected = selectedId === project.id;
            return <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              icon={L.divIcon({
                html: markerHtml(project.type, project.status, selected),
                className: "licogi-div-icon",
                iconSize: selected ? [52, 62] : [46, 56],
                iconAnchor: selected ? [26, 60] : [23, 54],
                popupAnchor: [0, -48],
              })}
              eventHandlers={{ click: () => setSelectedId(project.id) }}
            >
              <Tooltip direction="top" offset={[0, -45]} opacity={0.96}>{project.name}</Tooltip>
              <Popup>
                <div className="public-map-popup">
                  <span className="public-map-popup-code">{project.code}</span>
                  <strong>{project.name}</strong>
                  <p><MapPin size={13} /> {project.province} · {project.type}</p>
                  <p><Building2 size={13} /> {project.investor}</p>
                  {project.valueRange ? <p>Giá trị: {project.valueRange}</p> : null}
                  <div className="public-map-popup-progress"><span style={{ width: `${project.progress}%` }} /></div>
                  <div className="public-map-popup-meta"><span>{statusLabels[project.status]}</span><b>{project.progress}%</b></div>
                  <a className="public-text-link mt-3 inline-flex" href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`} target="_blank" rel="noreferrer">Mở vị trí bản đồ</a>
                </div>
              </Popup>
            </Marker>;
          })}
        </MapContainer>
        {loading && projects.length === 0 ? <div className="public-map-loading">Đang tải dữ liệu dự án...</div> : null}
        {error ? <div className="public-map-error"><span>{error}</span><button type="button" onClick={() => void load(false)}>Thử lại</button></div> : null}
        {!loading && !error && filtered.length === 0 ? <div className="public-map-empty">Không có dự án phù hợp với bộ lọc hiện tại.</div> : null}
      </div>

      <div className="public-map-legend">
        {projectTypes.map((item) => {
          const visual = getMarkerVisual(item, "ongoing");
          return <span key={item}><i style={{ background: visual.color }}>{visual.label}</i>{item}</span>;
        })}
      </div>
    </div>
  );
}
