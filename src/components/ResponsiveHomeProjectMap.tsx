"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";

function projectPoint(lat: number, lng: number) {
  const x = 20 + ((lng - 102) / 8.8) * 220;
  const y = 20 + ((24.5 - lat) / 16.5) * 500;
  return {
    x: Math.max(18, Math.min(242, x)),
    y: Math.max(18, Math.min(522, y)),
  };
}

function MobileMapPreview() {
  const { projects } = usePublicProjects();
  const provinces = useMemo(() => new Set(projects.map((project) => project.province).filter(Boolean)), [projects]);
  const visibleProjects = useMemo(() => projects.filter((project) => Number.isFinite(project.lat) && Number.isFinite(project.lng)).slice(0, 40), [projects]);

  return <div className="phone-home-map-card">
    <div className="phone-home-map-head">
      <div><span>DỮ LIỆU TOÀN QUỐC</span><strong>{projects.length} dự án · {provinces.size} tỉnh/thành</strong></div>
      <Link href="/portfolio/projects">Xem tất cả <ArrowRight size={14}/></Link>
    </div>
    <div className="phone-home-map-canvas" aria-label={`Bản đồ ${projects.length} dự án tại ${provinces.size} tỉnh thành`}>
      <svg viewBox="0 0 260 540" role="img" aria-hidden="true">
        <path className="phone-vietnam-shape" d="M109 14c22 16 49 17 65 41 17 25 4 55 15 78 8 19 35 28 39 50 5 29-25 47-41 67-17 22-16 48-9 74 8 30 11 57-5 85-17 29-47 50-60 82-8 20-8 33-7 36-18-7-35-20-47-36-18-25-7-54 7-77 15-24 35-42 33-72-1-23-17-44-17-68 0-28 22-47 35-68 14-23 7-52-3-73-12-25-4-48 4-67 8-18 13-37 7-55-7-21-28-31-31-47-4-21 23-31 42-26Z"/>
        {visibleProjects.map((project) => {
          const point = projectPoint(project.lat, project.lng);
          return <circle key={project.id} cx={point.x} cy={point.y} r="5" className={`phone-map-point is-${project.status}`} />;
        })}
      </svg>
      <div className="phone-home-map-legend"><span><i className="is-ongoing"/>Đang thi công</span><span><i className="is-completed"/>Hoàn thành</span><span><i className="is-warranty"/>Bảo hành</span></div>
    </div>
    <Link href="/portfolio/projects" className="phone-home-map-button"><MapPin size={16}/> Mở danh mục & vị trí dự án <ArrowRight size={15}/></Link>
  </div>;
}

function DesktopMapGate() {
  const [MapComponent, setMapComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    let active = true;
    const load = () => {
      if (!media.matches || MapComponent) return;
      void import("./PublicProjectMap").then((module) => {
        if (active) setMapComponent(() => module.default);
      });
    };
    load();
    media.addEventListener?.("change", load);
    return () => {
      active = false;
      media.removeEventListener?.("change", load);
    };
  }, [MapComponent]);

  if (!MapComponent) return <div className="public-map-skeleton">Đang khởi tạo dữ liệu dự án...</div>;
  return <MapComponent />;
}

export default function ResponsiveHomeProjectMap() {
  return <>
    <div className="phone-home-map-only"><MobileMapPreview /></div>
    <div className="desktop-home-map-only"><DesktopMapGate /></div>
  </>;
}
