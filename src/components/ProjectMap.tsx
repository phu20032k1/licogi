"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import { CheckCircle2, Filter, Layers3, MapPin, RefreshCcw, Search } from "lucide-react";
import { Project, ProjectStatus, ProjectType, projectTypes } from "../data/projects";
import { fetchProjectsFromDataCenter } from "../lib/projectData";
import { markerHtml } from "../lib/projectMapVisuals";
import ProgressBar from "./ui/ProgressBar";
import { RiskBadge, StatusBadge } from "./ui/StatusBadge";

type Props = { compact?: boolean };

export default function ProjectMap({ compact = false }: Props) {
  const [items, setItems] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchProjectsFromDataCenter());
      setMessage("");
    } catch (error) {
      setItems([]);
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu dự án.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void sync();
    const refresh = () => void sync();
    window.addEventListener("licogi-data-imported", refresh);
    window.addEventListener("licogi-projects-updated", refresh);
    return () => {
      window.removeEventListener("licogi-data-imported", refresh);
      window.removeEventListener("licogi-projects-updated", refresh);
    };
  }, [sync]);

  const validProjects = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((project) => {
      const validCoordinates = Number.isFinite(project.lat) && Number.isFinite(project.lng);
      const searchable = [project.name, project.province, project.investor, project.subType ?? "", project.investorCountry ?? "", project.code ?? ""].join(" ");
      const matchesSearch = !keyword || searchable.toLocaleLowerCase("vi").includes(keyword);
      return validCoordinates && matchesSearch && (type === "all" || project.type === type) && (status === "all" || project.status === status);
    });
  }, [items, search, status, type]);

  const selected = validProjects.find((project) => project.id === selectedId) ?? validProjects[0];
  const fdiCount = validProjects.filter((project) => project.investorCountry && project.investorCountry !== "Việt Nam").length;
  const mapHeight = compact ? "h-[430px] sm:h-[520px]" : "h-[570px] sm:h-[700px]";

  return (
    <div className={`grid gap-5 ${compact ? "2xl:grid-cols-[330px_1fr]" : "xl:grid-cols-[390px_1fr]"}`}>
      <aside className="order-2 overflow-hidden rounded-[26px] border border-slate-200 bg-white/90 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur xl:order-1">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400"><Filter size={14} /> Bộ lọc bản đồ</div>
            <button type="button" onClick={() => void sync()} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-orange-200 hover:text-orange-600" aria-label="Tải lại"><RefreshCcw size={15} className={loading ? "animate-spin" : ""}/></button>
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm dự án, địa điểm, FDI..." /></label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại</option>{projectTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select value={status} onChange={(event) => setStatus(event.target.value as "all" | ProjectStatus)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 outline-none"><option value="all">Tất cả trạng thái</option><option value="ongoing">Đang thi công</option><option value="completed">Hoàn thành</option><option value="warranty">Bảo hành</option></select>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
            <div className="rounded-xl bg-orange-50 px-2 py-2 text-orange-700">● Thi công</div>
            <div className="rounded-xl bg-emerald-50 px-2 py-2 text-emerald-700">● Hoàn thành</div>
            <div className="rounded-xl bg-sky-50 px-2 py-2 text-sky-700">● Bảo hành</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 p-4 text-center text-xs">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-lg font-black text-slate-950">{validProjects.length}</p><p className="mt-1 text-slate-500">Dự án</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-lg font-black text-slate-950">{fdiCount}</p><p className="mt-1 text-slate-500">FDI</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-lg font-black text-slate-950">{new Set(validProjects.map((project) => project.province)).size}</p><p className="mt-1 text-slate-500">Tỉnh</p></div>
        </div>

        <div className={`${compact ? "max-h-[390px]" : "max-h-[650px]"} divide-y divide-slate-100 overflow-y-auto`}>
          {validProjects.map((project) => (
            <button key={project.id} type="button" onClick={() => setSelectedId(project.id)} className={`w-full p-4 text-left transition hover:bg-slate-50 ${selected?.id === project.id ? "bg-orange-50/70" : "bg-white"}`}>
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{project.name}</p><p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500"><MapPin size={12} className="text-orange-500" /> {project.province} · {project.type}</p></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">{project.healthScore ?? 0}</span></div>
              <p className="mt-2 line-clamp-1 text-xs text-slate-500">{project.subType ?? project.description ?? "Chưa cập nhật mô tả"}</p>
              <div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>Tiến độ</span><span>{project.progress}%</span></div><ProgressBar value={project.progress} tone={project.status === "ongoing" ? "orange" : project.status === "completed" ? "green" : "blue"} height="h-1.5" /></div>
            </button>
          ))}
          {!loading && validProjects.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">{message || "Không có dự án phù hợp."}</div> : null}
        </div>
      </aside>

      <section className="order-1 min-w-0 xl:order-2">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <div className="relative">
            <MapContainer center={[16.2, 106.0]} zoom={5} scrollWheelZoom className={`${mapHeight} w-full rounded-2xl`}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {validProjects.map((project) => {
                const isSelected = selected?.id === project.id;
                return <Marker
                  key={project.id}
                  position={[project.lat, project.lng]}
                  icon={L.divIcon({
                    html: markerHtml(project.type, project.status, isSelected),
                    className: "licogi-div-icon",
                    iconSize: isSelected ? [52, 62] : [46, 56],
                    iconAnchor: isSelected ? [26, 60] : [23, 54],
                    popupAnchor: [0, -48],
                  })}
                  eventHandlers={{ click: () => setSelectedId(project.id) }}
                >
                  <Tooltip direction="top" offset={[0, -44]} opacity={0.95}>{project.name}</Tooltip>
                  <Popup>
                    <div className="min-w-72">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-600">{project.code}</p>
                      <strong className="mt-1 block text-sm text-slate-900">{project.name}</strong>
                      <p className="mt-2 text-xs text-slate-500">{project.investor} · {project.investorCountry || "Việt Nam"}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Tiến độ</span><b>{project.progress}%</b></div><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Health</span><b>{project.healthScore ?? 0}/100</b></div><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Ảnh/Video</span><b>{project.photos ?? 0}/{project.videos ?? 0}</b></div><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Hồ sơ</span><b>{project.documents ?? 0}</b></div></div>
                    </div>
                  </Popup>
                </Marker>;
              })}
            </MapContainer>
            <div className="pointer-events-none absolute left-4 top-4 z-[450] hidden rounded-2xl border border-white/60 bg-white/85 p-3 shadow-xl backdrop-blur lg:block">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700"><Layers3 size={15} className="text-orange-500" /> Bản đồ năng lực</div>
              <p className="mt-1 text-[11px] text-slate-500">Icon đồng bộ với bản đồ tại trang chủ</p>
            </div>
          </div>
        </div>

        {selected ? <div className="mt-4 grid gap-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700">{selected.code}</span><StatusBadge status={selected.status} /></div><h3 className="mt-2 text-lg font-black text-slate-950">{selected.name}</h3><p className="mt-1 text-sm text-slate-500">{selected.province} · {selected.investor}</p></div>
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700"><CheckCircle2 size={18}/><div><p className="text-[10px] font-bold uppercase tracking-[0.1em]">Đồng bộ dữ liệu</p><p className="text-xs font-extrabold">Trang chủ + Admin</p></div></div>
        </div> : null}
      </section>
    </div>
  );
}
