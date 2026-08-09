"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  Layers3,
  MapPin,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";

type ProjectStatus = "ongoing" | "completed" | "warranty";

type ProjectRow = {
  status: ProjectStatus;
  province: string;
  projectCountry?: string;
  type?: string;
};

function dispatchProjectFilter(status: "all" | ProjectStatus = "all") {
  window.dispatchEvent(new CustomEvent("licogi-public-project-filter", {
    detail: { search: "", type: "all", status, projectId: null },
  }));
  document.getElementById("du-an")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCapabilityOverview() {
  document.getElementById("quy-mo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
    ongoing: projects.filter((project) => project.status === "ongoing").length,
    completed: projects.filter((project) => project.status === "completed").length,
    warranty: projects.filter((project) => project.status === "warranty").length,
    provinces: new Set(projects.map((project) => project.province).filter(Boolean)).size,
    countries: new Set(projects.map((project) => project.projectCountry || "Việt Nam").filter(Boolean)).size,
    sectors: new Set(projects.map((project) => project.type).filter(Boolean)).size,
  }), [projects]);

  return (
    <section className="public-live-overview" aria-live="polite">
      <div className="public-live-overview-head">
        <div>
          <span><i /> Dữ liệu năng lực trực tiếp</span>
          <strong>Tổng quan danh mục dự án</strong>
          <small>Bấm từng chỉ số để mở đúng nhóm dữ liệu.</small>
        </div>
        <button type="button" onClick={openCapabilityOverview}>Xem tổng quan <ArrowRight size={14} /></button>
      </div>

      <div className="public-live-overview-grid">
        <button type="button" onClick={() => dispatchProjectFilter("all")}>
          <PanelsTopLeft />
          <span><strong>{loaded ? metrics.total : "—"}</strong><small>Tổng dự án</small></span>
        </button>
        <button type="button" onClick={() => dispatchProjectFilter("ongoing")}>
          <Clock3 />
          <span><strong>{loaded ? metrics.ongoing : "—"}</strong><small>Đang thi công</small></span>
        </button>
        <button type="button" onClick={() => dispatchProjectFilter("completed")}>
          <CheckCircle2 />
          <span><strong>{loaded ? metrics.completed : "—"}</strong><small>Đã hoàn thành</small></span>
        </button>
        <button type="button" onClick={() => dispatchProjectFilter("warranty")}>
          <ShieldCheck />
          <span><strong>{loaded ? metrics.warranty : "—"}</strong><small>Đang bảo hành</small></span>
        </button>
      </div>

      <div className="public-live-overview-links">
        <button type="button" onClick={openCapabilityOverview}><MapPin /><span><b>{loaded ? metrics.provinces : "—"}</b> tỉnh / thành</span><ArrowRight /></button>
        <button type="button" onClick={openCapabilityOverview}><Layers3 /><span><b>{loaded ? metrics.sectors : "—"}</b> lĩnh vực</span><ArrowRight /></button>
        <button type="button" onClick={openCapabilityOverview}><Globe2 /><span><b>{loaded ? metrics.countries : "—"}</b> quốc gia dự án</span><ArrowRight /></button>
      </div>
    </section>
  );
}
