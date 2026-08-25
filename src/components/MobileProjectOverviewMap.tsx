"use client";

import Link from "next/link";
import { ArrowRight, MapPin, RefreshCcw } from "lucide-react";
import type { PublicProjectRecord } from "../lib/publicProject";

type Props = {
  projects: PublicProjectRecord[];
  loading?: boolean;
  error?: string;
  onReload?: () => void;
  compact?: boolean;
};

function isMappable(project: PublicProjectRecord) {
  return Number.isFinite(project.lat)
    && Number.isFinite(project.lng)
    && project.lat >= 8
    && project.lat <= 24.5
    && project.lng >= 102
    && project.lng <= 110.8;
}

function projectPoint(lat: number, lng: number) {
  const x = 20 + ((lng - 102) / 8.8) * 220;
  const y = 20 + ((24.5 - lat) / 16.5) * 500;
  return {
    x: Math.max(18, Math.min(242, x)),
    y: Math.max(18, Math.min(522, y)),
  };
}

function statusClass(project: PublicProjectRecord) {
  if (project.status === "completed") return "is-completed";
  if (project.status === "warranty") return "is-warranty";
  return "is-ongoing";
}

export default function MobileProjectOverviewMap({ projects, loading = false, error = "", onReload, compact = false }: Props) {
  const mappableProjects = projects.filter(isMappable).slice(0, 80);
  const provinces = new Set(projects.map((project) => project.province).filter(Boolean));
  const ongoing = projects.filter((project) => project.status === "ongoing").length;
  const completed = projects.filter((project) => project.status === "completed").length;

  return <section className={`phone-data-map ${compact ? "is-compact" : ""}`} aria-label="Bản đồ dữ liệu công trình LICOGI 18.3">
    <div className="phone-data-map-head">
      <div>
        <span>BẢN ĐỒ DỮ LIỆU</span>
        <strong>{projects.length > 0 ? `${projects.length} dự án · ${provinces.size} tỉnh/thành` : loading ? "Đang đồng bộ dữ liệu..." : "Chưa có dữ liệu"}</strong>
      </div>
      <Link href="/portfolio/projects">Danh mục <ArrowRight size={14}/></Link>
    </div>

    <div className="phone-data-map-canvas">
      <svg viewBox="0 0 260 540" role="img" aria-label={`${mappableProjects.length} vị trí dự án có tọa độ`}>
        <path className="phone-data-vietnam-shape" d="M109 14c22 16 49 17 65 41 17 25 4 55 15 78 8 19 35 28 39 50 5 29-25 47-41 67-17 22-16 48-9 74 8 30 11 57-5 85-17 29-47 50-60 82-8 20-8 33-7 36-18-7-35-20-47-36-18-25-7-54 7-77 15-24 35-42 33-72-1-23-17-44-17-68 0-28 22-47 35-68 14-23 7-52-3-73-12-25-4-48 4-67 8-18 13-37 7-55-7-21-28-31-31-47-4-21 23-31 42-26Z"/>
        {mappableProjects.map((project) => {
          const point = projectPoint(project.lat, project.lng);
          return <a key={project.id} href={`/portfolio/projects/${encodeURIComponent(project.id)}`} aria-label={`${project.name}, ${project.province}`}>
            <circle cx={point.x} cy={point.y} r="8" className={`phone-data-map-pulse ${statusClass(project)}`} />
            <circle cx={point.x} cy={point.y} r="4.7" className={`phone-data-map-point ${statusClass(project)}`} />
          </a>;
        })}
      </svg>

      {projects.length === 0 && !loading ? <div className="phone-data-map-state">
        <MapPin size={22}/>
        <strong>Chưa lấy được dữ liệu bản đồ</strong>
        {error ? <span>{error}</span> : null}
        {onReload ? <button type="button" onClick={onReload}><RefreshCcw size={15}/> Tải lại dữ liệu</button> : null}
      </div> : null}

      <div className="phone-data-map-legend" aria-label="Chú thích trạng thái">
        <span><i className="is-ongoing"/>Thi công <b>{ongoing}</b></span>
        <span><i className="is-completed"/>Hoàn thành <b>{completed}</b></span>
        <span><i className="is-warranty"/>Bảo hành</span>
      </div>
    </div>

    <Link href="/portfolio/projects" className="phone-data-map-action"><MapPin size={16}/> Mở bản đồ & danh mục công trình <ArrowRight size={15}/></Link>
  </section>;
}
