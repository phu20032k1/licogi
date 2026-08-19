"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MobilePublicProjects from "./MobilePublicProjects";

const PublicProjectMap = dynamic(() => import("./PublicProjectMap"), {
  ssr: false,
  loading: () => <div className="public-map-bootstrap" aria-live="polite"><span className="public-map-bootstrap-spinner" /><div><strong>Đang mở bản đồ dự án</strong><small>Dữ liệu công trình đang được tải song song.</small></div></div>,
});

export default function PublicProjectsWorkspace() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("q") || "";
  const [phoneMode, setPhoneMode] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhoneMode(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (phoneMode !== false) return;
    // Desktop/tablet map keeps the richer Leaflet experience. Phone mode avoids
    // downloading/parsing that bundle entirely and uses MobilePublicProjects.
    void fetch("/api/public/projects/map", {
      cache: "default",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    }).catch(() => undefined);
  }, [phoneMode]);

  useEffect(() => {
    if (phoneMode !== false) return;
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
  }, [phoneMode, search, status, type]);

  if (phoneMode === null) {
    return <div className="phone-projects-entry-skeleton"><span/><span/><span/></div>;
  }

  if (phoneMode) {
    return <MobilePublicProjects initialStatus={status} initialType={type} initialSearch={search} />;
  }

  return <PublicProjectMap />;
}
