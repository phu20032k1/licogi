"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import { Building2, MapPin, RefreshCcw, Search, Sparkles } from "lucide-react";
import { ProjectStatus, ProjectType, projectTypes, statusLabels } from "../data/projects";
import { getMarkerVisual, markerHtml } from "../lib/projectMapVisuals";

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
};

export default function PublicProjectMap() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/public/projects", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được bản đồ.");
      setProjects(data.projects || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được bản đồ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    const refresh = () => void load();
    window.addEventListener("licogi-data-imported", refresh);
    window.addEventListener("licogi-projects-updated", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("licogi-data-imported", refresh);
      window.removeEventListener("licogi-projects-updated", refresh);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return projects.filter((project) => {
      const haystack = [project.name, project.province, project.investor, project.type, project.code].join(" ").toLocaleLowerCase("vi");
      return (!keyword || haystack.includes(keyword)) && (type === "all" || project.type === type);
    });
  }, [projects, search, type]);

  const statusCounts = useMemo(() => ({
    ongoing: filtered.filter((item) => item.status === "ongoing").length,
    completed: filtered.filter((item) => item.status === "completed").length,
    warranty: filtered.filter((item) => item.status === "warranty").length,
  }), [filtered]);

  return (
    <div className="public-map-shell">
      <div className="public-map-toolbar">
        <div>
          <span className="public-kicker"><Sparkles size={14} /> Dữ liệu dự án đồng bộ</span>
          <h3>Bản đồ năng lực thi công</h3>
          <p>Dữ liệu nhập ở Trung tâm dữ liệu được cập nhật lên cả bản đồ công khai và bản đồ quản trị.</p>
        </div>
        <button type="button" onClick={() => void load()} className="public-icon-button" aria-label="Tải lại bản đồ"><RefreshCcw size={17} className={loading ? "animate-spin" : ""} /></button>
      </div>

      <div className="public-map-controls">
        <label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm dự án, tỉnh thành, chủ đầu tư..." /></label>
        <select value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)}>
          <option value="all">Tất cả ngành hàng</option>
          {projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="public-map-stats">
        <span><b>{filtered.length}</b> dự án</span>
        <span className="is-orange"><b>{statusCounts.ongoing}</b> đang thi công</span>
        <span className="is-green"><b>{statusCounts.completed}</b> hoàn thành</span>
        <span className="is-blue"><b>{statusCounts.warranty}</b> bảo hành</span>
      </div>

      <div className="public-map-canvas">
        <MapContainer center={[16.2, 106.0]} zoom={5} scrollWheelZoom={false} className="h-[520px] w-full md:h-[620px]">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                  <div className="public-map-popup-progress"><span style={{ width: `${project.progress}%` }} /></div>
                  <div className="public-map-popup-meta"><span>{statusLabels[project.status]}</span><b>{project.progress}%</b></div>
                </div>
              </Popup>
            </Marker>;
          })}
        </MapContainer>
        {loading && projects.length === 0 ? <div className="public-map-loading">Đang tải dữ liệu dự án...</div> : null}
        {error ? <div className="public-map-error">{error}</div> : null}
        {!loading && !error && filtered.length === 0 ? <div className="public-map-empty">Chưa có dữ liệu phù hợp. Hãy import dự án trong trang quản trị.</div> : null}
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
