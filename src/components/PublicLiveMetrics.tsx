"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
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
  progress?: number;
  contractValueVnd?: number | null;
  healthScore?: number;
  dataCompleteness?: number;
  risk?: string;
};

type FilterInput = {
  status?: "all" | ProjectStatus;
  type?: string;
};

const sectorColors = ["#f97316", "#0ea5e9", "#22c55e", "#8b5cf6", "#eab308", "#06b6d4"];

function dispatchProjectFilter({ status = "all", type = "all" }: FilterInput = {}) {
  window.dispatchEvent(new CustomEvent("licogi-public-project-filter", {
    detail: { search: "", type, status, projectId: null },
  }));
  document.getElementById("du-an")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCapabilityOverview() {
  document.getElementById("quy-mo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatPortfolioValue(value: number) {
  if (!value) return "Chưa đủ dữ liệu";
  if (value >= 1_000_000_000_000) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value / 1_000_000_000_000)} nghìn tỷ`;
  }
  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value / 1_000_000_000)} tỷ`;
  }
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
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

  const metrics = useMemo(() => {
    const total = projects.length;
    const ongoing = projects.filter((project) => project.status === "ongoing").length;
    const completed = projects.filter((project) => project.status === "completed").length;
    const warranty = projects.filter((project) => project.status === "warranty").length;
    const progressValues = projects.map((project) => Number(project.progress)).filter(Number.isFinite);
    const healthValues = projects.map((project) => Number(project.healthScore)).filter(Number.isFinite);
    const completenessValues = projects.map((project) => Number(project.dataCompleteness)).filter(Number.isFinite);
    const averageProgress = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;
    const averageHealth = healthValues.length ? Math.round(healthValues.reduce((sum, value) => sum + value, 0) / healthValues.length) : 0;
    const averageCompleteness = completenessValues.length ? Math.round(completenessValues.reduce((sum, value) => sum + value, 0) / completenessValues.length) : 0;
    const exactContractRows = projects.filter((project) => typeof project.contractValueVnd === "number" && Number.isFinite(project.contractValueVnd) && Number(project.contractValueVnd) > 0);
    const contractValue = exactContractRows.reduce((sum, project) => sum + Number(project.contractValueVnd || 0), 0);

    return {
      total,
      ongoing,
      completed,
      warranty,
      provinces: new Set(projects.map((project) => project.province).filter(Boolean)).size,
      countries: new Set(projects.map((project) => project.projectCountry || "Việt Nam").filter(Boolean)).size,
      sectors: new Set(projects.map((project) => project.type).filter(Boolean)).size,
      averageProgress,
      averageHealth,
      averageCompleteness,
      highRisk: projects.filter((project) => String(project.risk || "").toLowerCase() === "high").length,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      contractValue,
      contractCount: exactContractRows.length,
    };
  }, [projects]);

  const sectorStats = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      const key = String(project.type || "Chưa phân loại").trim() || "Chưa phân loại";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count], index) => ({ name, count, color: sectorColors[index % sectorColors.length] }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "vi"))
      .slice(0, 6);
  }, [projects]);

  const maxSectorCount = Math.max(1, ...sectorStats.map((item) => item.count));
  const statusTotal = Math.max(1, metrics.total);

  return (
    <section className="public-live-overview" aria-live="polite">
      <div className="public-live-overview-head">
        <div>
          <span><i /> Dữ liệu năng lực trực tiếp</span>
          <strong>Tổng quan hoạt động</strong>
        </div>
        <button type="button" onClick={openCapabilityOverview}>Chi tiết <ArrowRight size={14} /></button>
      </div>

      <div className="public-live-dashboard">
        <button type="button" className="public-live-total" onClick={() => dispatchProjectFilter()}>
          <span>Danh mục dự án</span>
          <strong>{loaded ? metrics.total : "—"}</strong>
          <small>{loaded ? `${metrics.provinces} tỉnh/thành · ${metrics.sectors} lĩnh vực · ${metrics.countries} quốc gia` : "Đang tải dữ liệu"}</small>
          <em>Xem dự án <ArrowRight size={13} /></em>
        </button>

        <div className="public-live-progress-card">
          <div className="public-live-progress-ring" style={{ background: `conic-gradient(#f97316 ${metrics.averageProgress}%, rgba(148,163,184,.18) 0)` }} aria-label={`Tiến độ bình quân ${metrics.averageProgress}%`}>
            <span><strong>{loaded ? metrics.averageProgress : "—"}</strong><small>%</small></span>
          </div>
          <div><small>Tiến độ bình quân</small><strong>{loaded ? `${metrics.completionRate}%` : "—"}</strong><span>tỷ lệ hoàn thành</span></div>
        </div>

        <div className="public-live-contract-card">
          <small>Giá trị hợp đồng đã ghi nhận</small>
          <strong>{loaded ? formatPortfolioValue(metrics.contractValue) : "—"}</strong>
          <span>{loaded ? `${metrics.contractCount}/${metrics.total || 0} dự án có giá trị chính xác` : "Đang tổng hợp"}</span>
        </div>
      </div>

      <div className="public-live-quality-row">
        <div><Activity /><span><small>Sức khỏe danh mục</small><strong>{loaded ? `${metrics.averageHealth}/100` : "—"}</strong></span></div>
        <div><Database /><span><small>Độ đầy đủ dữ liệu</small><strong>{loaded ? `${metrics.averageCompleteness}%` : "—"}</strong></span></div>
        <div><ShieldCheck /><span><small>Rủi ro cao</small><strong>{loaded ? metrics.highRisk : "—"}</strong></span></div>
      </div>

      <div className="public-live-status-block">
        <div className="public-live-block-title"><span>Cơ cấu trạng thái</span><small>Bấm để lọc dự án</small></div>
        <div className="public-live-status-bar" aria-label="Cơ cấu trạng thái dự án">
          <button type="button" className="is-ongoing" style={{ width: `${(metrics.ongoing / statusTotal) * 100}%` }} onClick={() => dispatchProjectFilter({ status: "ongoing" })} title={`${metrics.ongoing} dự án đang thi công`} />
          <button type="button" className="is-completed" style={{ width: `${(metrics.completed / statusTotal) * 100}%` }} onClick={() => dispatchProjectFilter({ status: "completed" })} title={`${metrics.completed} dự án đã hoàn thành`} />
          <button type="button" className="is-warranty" style={{ width: `${(metrics.warranty / statusTotal) * 100}%` }} onClick={() => dispatchProjectFilter({ status: "warranty" })} title={`${metrics.warranty} dự án đang bảo hành`} />
        </div>
        <div className="public-live-status-legend">
          <button type="button" onClick={() => dispatchProjectFilter({ status: "ongoing" })}><i className="is-ongoing" /><span><Clock3 /> Đang thi công</span><strong>{loaded ? metrics.ongoing : "—"}</strong></button>
          <button type="button" onClick={() => dispatchProjectFilter({ status: "completed" })}><i className="is-completed" /><span><CheckCircle2 /> Đã hoàn thành</span><strong>{loaded ? metrics.completed : "—"}</strong></button>
          <button type="button" onClick={() => dispatchProjectFilter({ status: "warranty" })}><i className="is-warranty" /><span><ShieldCheck /> Bảo hành</span><strong>{loaded ? metrics.warranty : "—"}</strong></button>
        </div>
      </div>

      <div className="public-live-sector-block">
        <div className="public-live-block-title"><span>Phân bổ lĩnh vực</span><small>{loaded ? `${metrics.sectors} nhóm` : "Đang tải"}</small></div>
        <div className="public-live-sector-list">
          {sectorStats.length ? sectorStats.map((item) => (
            <button key={item.name} type="button" onClick={() => dispatchProjectFilter({ type: item.name })}>
              <span><i style={{ background: item.color }} />{item.name}</span>
              <em><i style={{ width: `${Math.max(8, (item.count / maxSectorCount) * 100)}%`, background: item.color }} /></em>
              <strong>{item.count}</strong>
            </button>
          )) : <p>Chưa có dữ liệu lĩnh vực.</p>}
        </div>
      </div>

      <div className="public-live-overview-links">
        <button type="button" onClick={openCapabilityOverview}><MapPin /><span><b>{loaded ? metrics.provinces : "—"}</b> tỉnh / thành</span><ArrowRight /></button>
        <button type="button" onClick={openCapabilityOverview}><Layers3 /><span><b>{loaded ? metrics.sectors : "—"}</b> lĩnh vực</span><ArrowRight /></button>
        <button type="button" onClick={openCapabilityOverview}><Globe2 /><span><b>{loaded ? metrics.countries : "—"}</b> quốc gia</span><ArrowRight /></button>
        <button type="button" onClick={() => dispatchProjectFilter()}><PanelsTopLeft /><span>Danh sách dự án</span><ArrowRight /></button>
      </div>
    </section>
  );
}
