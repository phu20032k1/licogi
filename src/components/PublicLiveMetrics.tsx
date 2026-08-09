"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Globe2, MapPin, PanelsTopLeft } from "lucide-react";

type ProjectRow = {
  status: "ongoing" | "completed" | "warranty";
  province: string;
  projectCountry?: string;
};

export default function PublicLiveMetrics() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/projects", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setProjects(Array.isArray(data.projects) ? data.projects : []))
      .catch(() => setProjects([]))
      .finally(() => setLoaded(true));
    return () => controller.abort();
  }, []);

  const metrics = useMemo(() => ({
    total: projects.length,
    provinces: new Set(projects.map((project) => project.province).filter(Boolean)).size,
    countries: new Set(projects.map((project) => project.projectCountry || "Việt Nam").filter(Boolean)).size,
    completed: projects.filter((project) => project.status === "completed").length,
  }), [projects]);

  return (
    <div className="public-live-metrics" aria-live="polite">
      <div><PanelsTopLeft /><strong>{loaded ? metrics.total : "—"}</strong><span>Dự án</span></div>
      <div><MapPin /><strong>{loaded ? metrics.provinces : "—"}</strong><span>Tỉnh / thành</span></div>
      <div><Globe2 /><strong>{loaded ? metrics.countries : "—"}</strong><span>Quốc gia dự án</span></div>
      <div><CheckCircle2 /><strong>{loaded ? metrics.completed : "—"}</strong><span>Đã hoàn thành</span></div>
    </div>
  );
}
