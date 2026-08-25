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
    <style jsx>{`
      .phone-single-project-map-only { display: none; }
      .desktop-single-project-map-only { display: block; }

      @media (max-width: 767px) {
        .phone-single-project-map-only { display: block; }
        .desktop-single-project-map-only { display: none; }
        :global(.phone-single-project-map) {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
        }
        :global(.phone-single-project-map-canvas) {
          position: relative;
          display: grid;
          min-height: 305px;
          place-items: center;
          overflow: hidden;
          background: radial-gradient(circle at 50% 45%, rgba(249,115,22,.10), transparent 35%), linear-gradient(180deg,#f8fafc,#edf2f6);
        }
        :global(.phone-single-project-map-canvas)::before {
          position: absolute;
          inset: 0;
          content: "";
          opacity: .22;
          background-image: linear-gradient(#dce4ec 1px, transparent 1px), linear-gradient(90deg,#dce4ec 1px, transparent 1px);
          background-size: 30px 30px;
        }
        :global(.phone-single-project-map-canvas svg) {
          position: relative;
          z-index: 1;
          width: min(62vw, 220px);
          height: 270px;
          overflow: visible;
          filter: drop-shadow(0 13px 23px rgba(15,23,42,.12));
        }
        :global(.phone-single-vietnam-shape) {
          fill: rgba(255,255,255,.96);
          stroke: #8495a7;
          stroke-width: 2.1;
        }
        :global(.phone-single-map-pulse) { fill: #ea580c; opacity: .18; }
        :global(.phone-single-map-point) { fill: #ea580c; stroke: #fff; stroke-width: 2.4; }
        :global(.phone-single-map-caption) {
          display: flex;
          min-height: 58px;
          align-items: center;
          gap: 9px;
          padding: 10px 13px;
          border-top: 1px solid #e8edf2;
          color: #c2410c;
        }
        :global(.phone-single-map-caption div) { min-width: 0; }
        :global(.phone-single-map-caption strong),
        :global(.phone-single-map-caption span) { display: block; }
        :global(.phone-single-map-caption strong) { color: #0f172a; font-size: 13px; }
        :global(.phone-single-map-caption span) { margin-top: 2px; color: #64748b; font-size: 10px; }
        :global(.phone-single-map-empty) {
          position: absolute;
          z-index: 2;
          display: grid;
          place-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 12px;
        }
      }
    `}</style>
  </>;
}
