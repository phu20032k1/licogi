"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PublicProjectMap = dynamic(() => import("./PublicProjectMap"), {
  ssr: false,
  loading: () => <div className="public-map-bootstrap" aria-live="polite"><span className="public-map-bootstrap-spinner" /><div><strong>Đang mở bản đồ dự án</strong><small>Dữ liệu công trình đang được tải song song để hiển thị nhanh hơn trên điện thoại.</small></div></div>,
});

export default function PublicProjectsWorkspace() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("q") || "";

  useEffect(() => {
    // Start the compact data request immediately instead of waiting for the Leaflet
    // bundle to finish parsing on slower iPhones/Android devices.
    void fetch("/api/public/projects/map", {
      cache: "default",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
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
  }, [search, status, type]);

  return <PublicProjectMap />;
}
