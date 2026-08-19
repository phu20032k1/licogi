"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import MobilePublicProjects from "./MobilePublicProjects";

type DesktopProps = {
  status: string;
  type: string;
  search: string;
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

export default function PublicProjectsWorkspace() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("q") || "";

  return <>
    <div className="phone-project-directory-only">
      <MobilePublicProjects initialStatus={status} initialType={type} initialSearch={search} />
    </div>
    <div className="desktop-project-directory-only">
      <DesktopProjectDirectory status={status} type={type} search={search} />
    </div>
  </>;
}
