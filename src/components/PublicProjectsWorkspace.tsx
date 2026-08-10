"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import PublicProjectMap from "./PublicProjectMap";

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
