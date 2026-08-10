"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PublicProjectMap = dynamic(() => import("./PublicProjectMap"), {
  ssr: false,
  loading: () => <div className="public-page-loading">Đang khởi tạo bản đồ dự án...</div>,
});

export default function PublicProjectsWorkspace() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("q") || "";

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
