"use client";

import { useEffect, useState, type ComponentType } from "react";
import { MapPin } from "lucide-react";
import type { PublicProjectRecord } from "../lib/publicProject";

type MapProps = { project: PublicProjectRecord };

function validPosition(project: PublicProjectRecord) {
  return Number.isFinite(project.lat) && Number.isFinite(project.lng)
    && project.lat >= 8 && project.lat <= 24.5
    && project.lng >= 102 && project.lng <= 110.8;
}

function point(project: PublicProjectRecord) {
  return {
    x: Math.max(18, Math.min(242, 20 + ((project.lng - 102) / 8.8) * 220)),
    y: Math.max(18, Math.min(522, 20 + ((24.5 - project.lat) / 16.5) * 500)),
  };
}

function MobileLocationMap({ project }: MapProps) {
  const hasPosition = validPosition(project);
  const position = hasPosition ? point(project) : null;

  return <div className="phone-single-project-map" role="img" aria-label={`Vị trí dự án ${project.name}`}>
    <div className="phone-single-project-map-canvas">
      <svg viewBox="0 0 260 540" aria-hidden="true">
        <path className="phone-single-vietnam-shape" d="M109 14c22 16 49 17 65 41 17 25 4 55 15 78 8 19 35 28 39 50 5 29-25 47-41 67-17 22-16 48-9 74 8 30 11 57-5 85-17 29-47 50-60 82-8 20-8 33-7 36-18-7-35-20-47-36-18-25-7-54 7-77 15-24 35-42 33-72-1-23-17-44-17-68 0-28 22-47 35-68 14-23 7-52-3-73-12-25-4-48 4-67 8-18 13-37 7-55-7-21-28-31-31-47-4-21 23-31 42-26Z"/>
        {position ? <>
          <circle cx={position.x} cy={position.y} r="12" className="phone-single-map-pulse"/>
          <circle cx={position.x} cy={position.y} r="6" className="phone-single-map-point"/>
        </> : null}
      </svg>
      {!hasPosition ? <div className="phone-single-map-empty"><MapPin size={22}/><strong>Vị trí đang được cập nhật</strong></div> : null}
    </div>
    <div className="phone-single-map-caption"><MapPin size={15}/><div><strong>{project.province}</strong><span>{hasPosition ? `${project.lat.toFixed(5)}, ${project.lng.toFixed(5)}` : "Chưa có tọa độ xác nhận"}</span></div></div>
  </div>;
}

function DesktopLocationMap({ project }: MapProps) {
  const [MapComponent, setMapComponent] = useState<ComponentType<MapProps> | null>(null);

  useEffect(() => {
    let active = true;
    void import("./PublicSingleProjectMap").then((module) => {
      if (active) setMapComponent(() => module.default);
    });
    return () => { active = false; };
  }, []);

  if (!MapComponent) return <div className="public-project-detail-map-shell public-project-detail-map-placeholder"><MapPin size={22}/><span>Bản đồ vị trí dự án</span></div>;
  return <MapComponent project={project}/>;
}

export default function ResponsiveSingleProjectMap({ project }: MapProps) {
  return <>
    <div className="phone-single-project-map-only"><MobileLocationMap project={project}/></div>
    <div className="desktop-single-project-map-only"><DesktopLocationMap project={project}/></div>
  </>;
}
