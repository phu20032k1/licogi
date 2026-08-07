"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, Tooltip } from "react-leaflet";
import { MapPin, RefreshCcw, Search } from "lucide-react";
import { Project, ProjectStatus, ProjectType, projectTypes } from "../data/projects";
import { fetchProjectsFromDataCenter } from "../lib/projectData";
import { markerHtml } from "../lib/projectMapVisuals";
import { siteConfig } from "../lib/siteConfig";
import ProgressBar from "./ui/ProgressBar";
import { RiskBadge, StatusBadge } from "./ui/StatusBadge";
import MapViewportController from "./map/MapViewportController";

type Props = { compact?: boolean };

export default function ProjectMap({ compact = false }: Props) {
  const [items, setItems] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const sync = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const next = await fetchProjectsFromDataCenter();
      setItems(next);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu dự án.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void sync(true);
    const refresh = () => void sync(false);
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void sync(false); }, 60000);
    window.addEventListener("licogi-data-imported", refresh);
    window.addEventListener("licogi-projects-updated", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("licogi-data-imported", refresh);
      window.removeEventListener("licogi-projects-updated", refresh);
    };
  }, [sync]);

  const validProjects = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((project) => {
      const validCoordinates = Number.isFinite(project.lat) && Number.isFinite(project.lng) && project.lat >= -90 && project.lat <= 90 && project.lng >= -180 && project.lng <= 180;
      const searchable = [project.name, project.province, project.investor, project.subType ?? "", project.investorCountry ?? "", project.code ?? ""].join(" ");
      const matchesSearch = !keyword || searchable.toLocaleLowerCase("vi").includes(keyword);
      return validCoordinates && matchesSearch && (type === "all" || project.type === type) && (status === "all" || project.status === status);
    });
  }, [items, search, status, type]);

  useEffect(() => {
    if (selectedId !== null && !validProjects.some((project) => project.id === selectedId)) setSelectedId(null);
  }, [selectedId, validProjects]);

  const selected = (selectedId !== null ? validProjects.find((project) => project.id === selectedId) : null) ?? validProjects[0];
  const viewportSelected = selectedId !== null ? validProjects.find((project) => project.id === selectedId) : null;
  const fdiCount = validProjects.filter((project) => project.investorCountry && project.investorCountry !== "Việt Nam").length;
  const mapHeight = compact ? "h-[410px] sm:h-[500px]" : "h-[540px] sm:h-[660px]";

  return (
    <div className={`grid gap-5 ${compact ? "2xl:grid-cols-[310px_1fr]" : "xl:grid-cols-[360px_1fr]"}`}>
      <aside className="order-2 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm xl:order-1">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm dự án hoặc địa điểm" /></label>
            <button type="button" onClick={() => void sync(false)} className="licogi-icon-btn" aria-label="Tải lại"><RefreshCcw size={16} className={loading ? "animate-spin" : ""}/></button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select aria-label="Lọc loại dự án" value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)} className="min-w-0 rounded-[12px] border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại</option>{projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select aria-label="Lọc trạng thái dự án" value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)} className="min-w-0 rounded-[12px] border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Hoàn thành</option><option value="warranty">Bảo hành</option></select>
          </div>
          {message ? <div className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">{message}</div> : null}
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 p-3 text-center text-xs">
          <div className="rounded-[12px] bg-slate-50 p-2.5"><p className="text-lg font-black text-slate-950">{validProjects.length}</p><p className="text-[10px] text-slate-500">Dự án</p></div>
          <div className="rounded-[12px] bg-slate-50 p-2.5"><p className="text-lg font-black text-slate-950">{fdiCount}</p><p className="text-[10px] text-slate-500">FDI</p></div>
          <div className="rounded-[12px] bg-slate-50 p-2.5"><p className="text-lg font-black text-slate-950">{new Set(validProjects.map((project) => project.province)).size}</p><p className="text-[10px] text-slate-500">Tỉnh</p></div>
        </div>

        <div className={`licogi-scroll ${compact ? "max-h-[370px]" : "max-h-[610px]"} divide-y divide-slate-100 overflow-y-auto`}>
          {validProjects.map((project) => (
            <button key={project.id} type="button" onClick={() => setSelectedId(project.id)} className={`w-full p-4 text-left transition hover:bg-slate-50 ${selected?.id === project.id ? "bg-orange-50/70" : "bg-white"}`}>
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{project.name}</p><p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500"><MapPin size={12} className="text-orange-500" /> {project.province} · {project.type}</p></div><StatusBadge status={project.status} /></div>
              <div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>Tiến độ</span><span>{project.progress}%</span></div><ProgressBar value={project.progress} tone={project.status === "ongoing" ? "orange" : project.status === "completed" ? "green" : "blue"} height="h-1.5" /></div>
            </button>
          ))}
          {loading && !items.length ? <div className="p-10 text-center text-sm font-bold text-slate-500">Đang tải...</div> : null}
          {!loading && validProjects.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">{message || "Không có dự án phù hợp."}</div> : null}
        </div>
      </aside>

      <section className="order-1 min-w-0 xl:order-2">
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 shadow-sm">
          <MapContainer center={[16.2, 106]} zoom={5} minZoom={4} maxZoom={18} zoomSnap={0.5} zoomDelta={0.5} wheelPxPerZoomLevel={90} scrollWheelZoom preferCanvas worldCopyJump className={`${mapHeight} w-full rounded-[14px]`}>
            <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
            <ScaleControl position="bottomleft" imperial={false} metric />
            <MapViewportController points={validProjects.map(({ lat, lng }) => ({ lat, lng }))} selected={viewportSelected ? { lat: viewportSelected.lat, lng: viewportSelected.lng } : null} maxZoom={7.5} selectedZoom={7} singlePointZoom={6.5} />
            {validProjects.map((project) => {
              const isSelected = selected?.id === project.id;
              return <Marker
                key={project.id}
                position={[project.lat, project.lng]}
                icon={L.divIcon({ html: markerHtml(project.type, project.status, isSelected), className: "licogi-div-icon", iconSize: isSelected ? [48, 56] : [42, 50], iconAnchor: isSelected ? [24, 54] : [21, 48], popupAnchor: [0, -43] })}
                eventHandlers={{ click: () => setSelectedId(project.id) }}
              >
                <Tooltip direction="top" offset={[0, -40]} opacity={0.95}>{project.name}</Tooltip>
                <Popup>
                  <div className="min-w-64">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-600">{project.code}</p>
                    <strong className="mt-1 block text-sm text-slate-900">{project.name}</strong>
                    <p className="mt-2 text-xs text-slate-500">{project.province} · {project.investor}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div>
                    <div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>Tiến độ</span><span>{project.progress}%</span></div><ProgressBar value={project.progress} tone="orange" height="h-1.5" /></div>
                    <a className="mt-3 inline-flex text-xs font-extrabold text-orange-600" href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`} target="_blank" rel="noreferrer">Xem vị trí</a>
                  </div>
                </Popup>
              </Marker>;
            })}
          </MapContainer>
        </div>

        {selected ? <div className="mt-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center gap-2"><span className="rounded-[8px] bg-orange-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700">{selected.code}</span><StatusBadge status={selected.status} /></div><h3 className="mt-2 text-base font-black text-slate-950">{selected.name}</h3><p className="mt-1 text-sm text-slate-500">{selected.province} · {selected.investor}</p></div> : null}
      </section>
    </div>
  );
}
