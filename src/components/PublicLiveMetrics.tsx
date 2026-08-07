"use client";

import { useEffect, useMemo, useState } from "react";
import { CircuitBoard, MapPin, ShieldCheck } from "lucide-react";

type ProjectRow = { status: "ongoing" | "completed" | "warranty"; province: string };

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

  const metrics = useMemo(() => {
    const total = projects.length;
    const ongoing = projects.filter((project) => project.status === "ongoing").length;
    const completed = projects.filter((project) => project.status === "completed").length;
    const warranty = projects.filter((project) => project.status === "warranty").length;
    const provinces = new Set(projects.map((project) => project.province).filter(Boolean)).size;
    const percent = (value: number) => total ? Math.round((value / total) * 100) : 0;
    return { total, ongoing, completed, warranty, provinces, percent };
  }, [projects]);

  return (
    <div className="public-hero-dashboard" aria-live="polite">
      <div className="public-dashboard-head"><span><i /> Dữ liệu dự án</span><b>{loaded ? "LIVE" : "SYNC"}</b></div>
      <div className="public-dashboard-number"><strong>{loaded ? metrics.total : "—"}</strong><span>Dự án đang có<br/>trong hệ thống dữ liệu</span></div>
      <div className="public-dashboard-bars">
        <div><span>Đang thi công · {metrics.ongoing}</span><b>{metrics.percent(metrics.ongoing)}%</b><i><em style={{ width: `${metrics.percent(metrics.ongoing)}%` }} /></i></div>
        <div><span>Đã hoàn thành · {metrics.completed}</span><b>{metrics.percent(metrics.completed)}%</b><i><em style={{ width: `${metrics.percent(metrics.completed)}%` }} /></i></div>
        <div><span>Đang bảo hành · {metrics.warranty}</span><b>{metrics.percent(metrics.warranty)}%</b><i><em style={{ width: `${metrics.percent(metrics.warranty)}%` }} /></i></div>
      </div>
      <div className="public-dashboard-modules">
        <span><MapPin /> {metrics.provinces} tỉnh/thành</span><span><CircuitBoard /> Data Center</span><span><ShieldCheck /> GIS đồng bộ</span>
      </div>
    </div>
  );
}
