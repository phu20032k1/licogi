"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicProjectRecord, PublicProjectsResponse } from "../lib/publicProject";

export default function usePublicProjects() {
  const [projects, setProjects] = useState<PublicProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/public/projects", { cache: "no-store" });
      const data = await response.json() as PublicProjectsResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu dự án.");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setError("");
    } catch (err) {
      setProjects([]);
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { projects, loading, error, reload: load };
}
