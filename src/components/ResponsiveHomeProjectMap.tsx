"use client";

import { useEffect, useState, type ComponentType } from "react";
import usePublicProjects from "../hooks/usePublicProjects";
import MobileProjectOverviewMap from "./MobileProjectOverviewMap";

function MobileMapPreview() {
  const { projects, loading, error, reload } = usePublicProjects();
  return <MobileProjectOverviewMap
    projects={projects}
    loading={loading}
    error={error}
    onReload={() => { void reload(); }}
  />;
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
