"use client";

import { useEffect, useState, type ComponentType } from "react";
import MobilePublicProjects from "./MobilePublicProjects";

type DesktopProps = {
  status: string;
  type: string;
  search: string;
};

type Props = {
  initialStatus?: string;
  initialType?: string;
  initialSearch?: string;
};

function DesktopProjectDirectory({ status, type, search }: DesktopProps) {
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

  useEffect(() => {
    if (!MapComponent) return;
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("licogi-public-project-filter", {
        detail: {
          status: status === "completed" || status === "ongoing" || status === "warranty" ? status : "all",
          type,
          search,
          projectId: null,
        },
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [MapComponent, search, status, type]);

  if (!MapComponent) {
    return <div className="public-map-bootstrap" aria-live="polite"><span className="public-map-bootstrap-spinner" /><div><strong>Đang mở bản đồ dự án</strong><small>Chuẩn bị bản đồ tương tác trên máy tính.</small></div></div>;
  }

  return <MapComponent />;
}

export default function PublicProjectsWorkspace({ initialStatus = "all", initialType = "all", initialSearch = "" }: Props) {
  return <>
    <div className="phone-project-directory-only">
      <MobilePublicProjects initialStatus={initialStatus} initialType={initialType} initialSearch={initialSearch} />
    </div>
    <div className="desktop-project-directory-only">
      <DesktopProjectDirectory status={initialStatus} type={initialType} search={initialSearch} />
    </div>
  </>;
}
