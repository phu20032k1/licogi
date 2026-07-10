"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import { CheckCircle2, Filter, Layers3, MapPin, Search } from "lucide-react";
import { Project, ProjectStatus, ProjectType, projectTypes } from "../data/projects";
import { fetchProjectsFromDataCenter } from "../lib/projectData";
import ProgressBar from "./ui/ProgressBar";
import { RiskBadge, StatusBadge } from "./ui/StatusBadge";

const statusColors: Record<ProjectStatus, string> = {
  ongoing: "#f97316",
  completed: "#10b981",
  warranty: "#0ea5e9",
};

const statusRadius: Record<ProjectStatus, number> = {
  ongoing: 12,
  completed: 9,
  warranty: 10,
};

export default function ProjectMap() {
  const [items, setItems] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => fetchProjectsFromDataCenter().then(setItems).catch(() => setItems([]));
    sync();
    window.addEventListener("licogi-data-imported", sync);
    window.addEventListener("licogi-projects-updated", sync);
    return () => {
      window.removeEventListener("licogi-data-imported", sync);
      window.removeEventListener("licogi-projects-updated", sync);
    };
  }, []);

  const validProjects = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return items.filter((project) => {
      const validCoordinates = Number.isFinite(project.lat) && Number.isFinite(project.lng);
      const searchable = [project.name, project.province, project.investor, project.subType ?? "", project.investorCountry ?? ""].join(" ");
      const matchesSearch = !keyword || searchable.toLocaleLowerCase("vi").includes(keyword);
      return validCoordinates && matchesSearch && (type === "all" || project.type === type) && (status === "all" || project.status === status);
    });
  }, [items, search, status, type]);

  const selected = validProjects.find((project) => project.id === selectedId) ?? validProjects[0];
  const fdiCount = validProjects.filter((project) => project.investorCountry && project.investorCountry !== "Việt Nam").length;

  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      <aside className="order-2 overflow-hidden rounded-[26px] border border-slate-200 bg-white/90 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur xl:order-1">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400"><Filter size={14} /> Bộ lọc bản đồ</div>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-orange-700">{validProjects.length} dự án</span>
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm dự án, địa điểm, FDI..." /></label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={type} onChange={(event) => setType(event.target.value as "all" | ProjectType)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 outline-none"><option value="all">Tất cả loại</option>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select>
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

        <div className="max-h-[650px] divide-y divide-slate-100 overflow-y-auto">
          {validProjects.map((project) => (
            <button key={project.id} type="button" onClick={() => setSelectedId(project.id)} className={`w-full p-4 text-left transition hover:bg-slate-50 ${selected?.id === project.id ? "bg-orange-50/70" : "bg-white"}`}>
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{project.name}</p><p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500"><MapPin size={12} className="text-orange-500" /> {project.province} · {project.type}</p></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">{project.healthScore ?? 0}</span></div>
              <p className="mt-2 line-clamp-1 text-xs text-slate-500">{project.subType ?? project.description}</p>
              <div className="mt-3"><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>Tiến độ</span><span>{project.progress}%</span></div><ProgressBar value={project.progress} tone={project.status === "ongoing" ? "orange" : project.status === "completed" ? "green" : "blue"} height="h-1.5" /></div>
            </button>
          ))}
          {validProjects.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">Không có dự án phù hợp.</div> : null}
        </div>
      </aside>

      <section className="order-1 min-w-0 xl:order-2">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <div className="relative">
            <MapContainer center={[16.2, 106.0]} zoom={5} scrollWheelZoom className="h-[570px] w-full rounded-2xl sm:h-[700px]">
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {validProjects.map((project) => (
                <CircleMarker
                  key={project.id}
                  center={[project.lat, project.lng]}
                  radius={selected?.id === project.id ? statusRadius[project.status] + 5 : statusRadius[project.status]}
                  eventHandlers={{ click: () => setSelectedId(project.id) }}
                  pathOptions={{ color: "#ffffff", fillColor: statusColors[project.status], fillOpacity: 0.94, weight: selected?.id === project.id ? 5 : 3 }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>{project.name}</Tooltip>
                  <Popup>
                    <div className="min-w-72">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-600">{project.code}</p>
                      <strong className="mt-1 block text-sm text-slate-900">{project.name}</strong>
                      <p className="mt-2 text-xs text-slate-500">{project.investor} · {project.investorCountry ?? "Việt Nam"}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5"><StatusBadge status={project.status} /><RiskBadge risk={project.risk ?? "low"} /></div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Tiến độ</span><b>{project.progress}%</b></div><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Health</span><b>{project.healthScore ?? 0}/100</b></div><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Ảnh/Video</span><b>{project.photos ?? 0}/{project.videos ?? 0}</b></div><div className="rounded-lg bg-slate-50 p-2"><span className="block text-slate-400">Hồ sơ</span><b>{project.documents ?? 0}</b></div></div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            <div className="pointer-events-none absolute left-4 top-4 z-[450] hidden rounded-2xl border border-white/60 bg-white/85 p-3 shadow-xl backdrop-blur lg:block">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700"><Layers3 size={15} className="text-orange-500" /> Bản đồ năng lực</div>
              <p className="mt-1 text-[11px] text-slate-500">Marker hiển thị dự án đã nhập trong Trung tâm dữ liệu</p>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 rounded-[26px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur xl:grid-cols-[1fr_340px]">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-black text-slate-900">{selected.name}</p><StatusBadge status={selected.status} /><RiskBadge risk={selected.risk ?? "low"} /></div><p className="mt-1 text-xs text-slate-500">{selected.code} · {selected.investor} · {selected.province}</p><p className="mt-3 text-sm leading-6 text-slate-600">{selected.description}</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{(selected.evidence ?? [{ label: "Quy mô", value: selected.scale ?? "Đang cập nhật" }, { label: "Vai trò", value: selected.role ?? "Tổng thầu" }, { label: "Rating", value: selected.customerRating ? `${selected.customerRating}/5` : "Chưa nhập" }]).slice(0,3).map((item)=><div key={item.label} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{item.label}</p><p className="mt-1 text-xs font-black text-slate-800">{item.value}</p></div>)}</div></div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white"><div className="flex items-center gap-2 text-xs font-bold text-orange-300"><CheckCircle2 size={14} /> Tóm tắt năng lực</div><p className="mt-3 text-sm leading-6 text-slate-300">Dự án phù hợp để đưa vào hồ sơ năng lực nhóm <b className="text-white">{selected.type}</b>; có {selected.photos ?? 0} ảnh, {selected.videos ?? 0} video và {selected.documents ?? 0} hồ sơ làm bằng chứng.</p><div className="mt-4 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500 font-black">{selected.healthScore ?? 0}</span><div><p className="text-xs text-slate-400">Project Health</p><p className="text-sm font-extrabold">{selected.risk === "high" ? "Cần can thiệp" : "Có thể trình khách"}</p></div></div></div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
