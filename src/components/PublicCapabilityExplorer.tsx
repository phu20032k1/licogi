"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  Database,
  Factory,
  Flag,
  Globe2,
  Layers3,
  MapPin,
  Target,
} from "lucide-react";
import { currentVietnamProvinces, statusLabels } from "../data/projects";

type PublicProject = {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "ongoing" | "completed" | "warranty";
  investor: string;
  investorCountry?: string;
  projectCountry?: string;
  province: string;
  legacyProvince?: string;
  valueRange: string;
  contractValueVnd?: number | null;
  scale?: string;
  progress: number;
  dataCompleteness?: number;
  healthScore?: number;
  risk?: string;
};

type ViewMode = "province" | "country" | "investorCountry" | "type" | "status";
type MetricFocus = "all" | "province" | "country" | "type" | "scale" | "completed";
type GroupItem = { key: string; label: string; count: number; percent: number };

const modeLabels: Record<ViewMode, string> = {
  province: "Tỉnh / thành",
  country: "Quốc gia dự án",
  investorCountry: "Quốc gia chủ đầu tư",
  type: "Lĩnh vực",
  status: "Trạng thái",
};

function statusLabel(value: string) {
  return statusLabels[value as keyof typeof statusLabels] || value;
}

function groupRows(projects: PublicProject[], mode: ViewMode): GroupItem[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    const raw = mode === "province"
      ? project.province
      : mode === "country"
        ? project.projectCountry || "Việt Nam"
        : mode === "investorCountry"
          ? project.investorCountry || "Chưa cập nhật"
          : mode === "type"
            ? project.type
            : project.status;
    const key = String(raw || "Chưa cập nhật").trim() || "Chưa cập nhật";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: mode === "status" ? statusLabel(key) : key,
      count,
      percent: projects.length ? Math.round((count / projects.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "vi"));
}

function formatPortfolioValue(value: number) {
  if (!value) return "—";
  if (value >= 1_000_000_000_000) return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value / 1_000_000_000_000)} nghìn tỷ`;
  if (value >= 1_000_000_000) return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value / 1_000_000_000)} tỷ`;
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}

export default function PublicCapabilityExplorer() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<ViewMode>("province");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [metricFocus, setMetricFocus] = useState<MetricFocus>("all");
  const explorerRef = useRef<HTMLDivElement>(null);

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
    const completed = projects.filter((project) => project.status === "completed").length;
    const ongoing = projects.filter((project) => project.status === "ongoing").length;
    const warranty = projects.filter((project) => project.status === "warranty").length;
    const provinces = new Set(projects.map((project) => project.province).filter(Boolean)).size;
    const countries = new Set(projects.map((project) => project.projectCountry || "Việt Nam").filter(Boolean)).size;
    const investorCountries = new Set(projects.map((project) => project.investorCountry).filter(Boolean)).size;
    const sectors = new Set(projects.map((project) => project.type).filter(Boolean)).size;
    const averageProgress = total ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / total) : 0;
    const knownScale = projects.filter((project) => project.scale && project.scale.trim()).length;
    const knownValue = projects.filter((project) => (project.contractValueVnd && project.contractValueVnd > 0) || (project.valueRange && project.valueRange !== "Chưa cập nhật")).length;
    const exactContractValue = projects.reduce((sum, project) => sum + (typeof project.contractValueVnd === "number" && project.contractValueVnd > 0 ? project.contractValueVnd : 0), 0);
    const completeness = total ? Math.round(projects.reduce((sum, project) => sum + Number(project.dataCompleteness || 0), 0) / total) : 0;
    const health = total ? Math.round(projects.reduce((sum, project) => sum + Number(project.healthScore || 0), 0) / total) : 0;
    return {
      total,
      completed,
      ongoing,
      warranty,
      provinces,
      countries,
      investorCountries,
      sectors,
      averageProgress,
      knownScale,
      knownValue,
      exactContractValue,
      completeness,
      health,
    };
  }, [projects]);

  const groups = useMemo(() => groupRows(projects, mode), [mode, projects]);

  const selectedProjects = useMemo(() => {
    if (metricFocus === "scale") {
      return projects.filter((project) => Boolean(project.scale?.trim()) || Boolean(project.contractValueVnd) || (project.valueRange && project.valueRange !== "Chưa cập nhật")).slice(0, 30);
    }
    if (!activeKey) return projects.slice(0, 18);
    return projects.filter((project) => {
      if (mode === "province") return project.province === activeKey;
      if (mode === "country") return (project.projectCountry || "Việt Nam") === activeKey;
      if (mode === "investorCountry") return (project.investorCountry || "Chưa cập nhật") === activeKey;
      if (mode === "type") return project.type === activeKey;
      return project.status === activeKey;
    }).slice(0, 30);
  }, [activeKey, metricFocus, mode, projects]);

  function switchMode(next: ViewMode) {
    setMode(next);
    setActiveKey(null);
    setMetricFocus(next === "province" ? "province" : next === "country" ? "country" : next === "type" ? "type" : "all");
  }

  function focusKpi(focus: MetricFocus) {
    setMetricFocus(focus);
    setActiveKey(null);
    if (focus === "province") setMode("province");
    else if (focus === "country") setMode("country");
    else if (focus === "type") setMode("type");
    else if (focus === "completed") {
      setMode("status");
      setActiveKey("completed");
    } else if (focus === "all") setMode("status");
    window.setTimeout(() => explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  function mapFilter(detail: { search?: string; type?: string; status?: string; projectId?: string }) {
    window.dispatchEvent(new CustomEvent("licogi-public-project-filter", {
      detail: {
        search: detail.search ?? "",
        type: detail.type ?? "all",
        status: detail.status ?? "all",
        projectId: detail.projectId ?? null,
      },
    }));
    document.getElementById("du-an")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showGroupOnMap() {
    if (metricFocus === "scale") {
      document.getElementById("du-an")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!activeKey) return;
    if (mode === "type") mapFilter({ type: activeKey });
    else if (mode === "status") mapFilter({ status: activeKey });
    else mapFilter({ search: activeKey });
  }

  const coveragePercent = Math.min(100, Math.round((metrics.provinces / currentVietnamProvinces.length) * 100));

  return (
    <section id="quy-mo" className="public-section public-scale-section">
      <div className="public-container">
        <div className="public-section-heading public-scale-heading">
          <div>
            <span className="public-kicker"><Target size={14} /> Quy mô hoạt động</span>
            <h2>Năng lực theo dữ liệu dự án</h2>
          </div>
          <div className="public-scale-heading-summary">
            <span><Database size={15} /><b>{metrics.completeness}%</b> dữ liệu đầy đủ</span>
            <span><BarChart3 size={15} /><b>{metrics.averageProgress}%</b> tiến độ bình quân</span>
            <span><Banknote size={15} /><b>{formatPortfolioValue(metrics.exactContractValue)}</b> hợp đồng ghi nhận</span>
          </div>
        </div>

        <div className="public-scale-kpis public-scale-kpis-interactive" aria-live="polite">
          <button type="button" onClick={() => focusKpi("all")} className={metricFocus === "all" ? "is-active" : ""}>
            <span><Building2 /></span><strong>{loaded ? metrics.total : "—"}</strong><b>Dự án trong dữ liệu</b>
            <small>{metrics.completed} hoàn thành · {metrics.ongoing} thi công · {metrics.warranty} bảo hành</small>
            <em><i style={{ width: `${metrics.total ? Math.round((metrics.completed / metrics.total) * 100) : 0}%` }} /></em>
            <label>Xem danh mục <ArrowRight size={13} /></label>
          </button>
          <button type="button" onClick={() => focusKpi("province")} className={metricFocus === "province" ? "is-active" : ""}>
            <span><MapPin /></span><strong>{loaded ? metrics.provinces : "—"}<small>/{currentVietnamProvinces.length}</small></strong><b>Tỉnh / thành có dự án</b>
            <small>{coveragePercent}% phạm vi hành chính cấp tỉnh hiện hành</small>
            <em><i style={{ width: `${coveragePercent}%` }} /></em>
            <label>Xem theo địa phương <ArrowRight size={13} /></label>
          </button>
          <button type="button" onClick={() => focusKpi("country")} className={metricFocus === "country" ? "is-active" : ""}>
            <span><Globe2 /></span><strong>{loaded ? metrics.countries : "—"}</strong><b>Quốc gia dự án</b>
            <small>{metrics.investorCountries} quốc gia chủ đầu tư đã ghi nhận</small>
            <em><i style={{ width: `${Math.min(100, metrics.countries * 16)}%` }} /></em>
            <label>Xem phạm vi quốc gia <ArrowRight size={13} /></label>
          </button>
          <button type="button" onClick={() => focusKpi("type")} className={metricFocus === "type" ? "is-active" : ""}>
            <span><Factory /></span><strong>{loaded ? metrics.sectors : "—"}</strong><b>Nhóm lĩnh vực thi công</b>
            <small>{metrics.averageProgress}% tiến độ bình quân danh mục</small>
            <em><i style={{ width: `${metrics.averageProgress}%` }} /></em>
            <label>Xem cơ cấu lĩnh vực <ArrowRight size={13} /></label>
          </button>
          <button type="button" onClick={() => focusKpi("scale")} className={metricFocus === "scale" ? "is-active" : ""}>
            <span><Layers3 /></span><strong>{loaded ? metrics.knownScale : "—"}</strong><b>Dự án có dữ liệu quy mô</b>
            <small>{metrics.knownValue} dự án có giá trị hợp đồng / dải giá trị</small>
            <em><i style={{ width: `${metrics.total ? Math.round((metrics.knownScale / metrics.total) * 100) : 0}%` }} /></em>
            <label>Xem hồ sơ quy mô <ArrowRight size={13} /></label>
          </button>
          <button type="button" onClick={() => focusKpi("completed")} className={metricFocus === "completed" ? "is-active" : ""}>
            <span><CheckCircle2 /></span><strong>{loaded ? metrics.completed : "—"}</strong><b>Dự án đã hoàn thành</b>
            <small>{metrics.total ? `${Math.round((metrics.completed / metrics.total) * 100)}% tổng danh mục` : "Chưa có dữ liệu"} · sức khỏe {metrics.health}/100</small>
            <em><i style={{ width: `${metrics.total ? Math.round((metrics.completed / metrics.total) * 100) : 0}%` }} /></em>
            <label>Xem dự án hoàn thành <ArrowRight size={13} /></label>
          </button>
        </div>

        <div ref={explorerRef} className="public-scale-explorer public-scale-explorer-pro">
          <div className="public-scale-groups">
            <div className="public-scale-tabs">
              {(Object.keys(modeLabels) as ViewMode[]).map((item) => (
                <button key={item} type="button" onClick={() => switchMode(item)} className={mode === item && metricFocus !== "scale" ? "is-active" : ""}>{modeLabels[item]}</button>
              ))}
            </div>
            <div className="public-scale-list">
              {groups.length ? groups.map((item) => (
                <button key={item.key} type="button" onClick={() => { setMetricFocus("all"); setActiveKey(item.key); }} className={activeKey === item.key ? "is-active" : ""}>
                  <span><b>{item.label}</b><small>{item.count} dự án</small></span>
                  <em><i style={{ width: `${item.percent}%` }} /></em>
                  <strong>{item.percent}%</strong>
                </button>
              )) : <p className="public-scale-empty">Chưa có dữ liệu để phân tích.</p>}
            </div>
          </div>

          <div className="public-scale-projects">
            <div className="public-scale-projects-head">
              <div>
                <span>{metricFocus === "scale" ? "Hồ sơ quy mô" : activeKey ? modeLabels[mode] : "Danh mục dự án"}</span>
                <h3>{metricFocus === "scale" ? "Dự án có thông tin quy mô / giá trị" : activeKey ? (mode === "status" ? statusLabel(activeKey) : activeKey) : "Dự án trong dữ liệu"}</h3>
                <p>{selectedProjects.length}{selectedProjects.length === 30 ? "+" : ""} dự án · bấm một dòng để mở hồ sơ trên bản đồ.</p>
              </div>
              {(activeKey || metricFocus === "scale") ? <button type="button" onClick={showGroupOnMap}>Mở Dự án <ArrowRight size={15} /></button> : null}
            </div>

            <div className="public-scale-project-list">
              {selectedProjects.map((project) => (
                <button key={project.id} type="button" onClick={() => mapFilter({ search: project.code, projectId: project.id })}>
                  <span className="public-scale-project-code">{project.code}</span>
                  <span className="public-scale-project-main"><b>{project.name}</b><small>{project.province}{project.legacyProvince ? ` · trước sáp nhập: ${project.legacyProvince}` : ""} · {project.type}</small></span>
                  <span className="public-scale-project-meta"><b>{project.progress}%</b><small>{statusLabel(project.status)}</small></span>
                  <ArrowRight size={15} />
                </button>
              ))}
              {!selectedProjects.length ? <p className="public-scale-empty">Không có dự án phù hợp.</p> : null}
            </div>
          </div>
        </div>

        <div className="public-scale-footnote"><Flag size={15} /> Tỉnh/thành được chuẩn hóa theo 34 đơn vị hành chính cấp tỉnh hiện hành; tên tỉnh cũ trong dữ liệu lịch sử được ánh xạ sang địa phương mới nhưng vẫn giữ tọa độ gốc khi có thể.</div>
      </div>
    </section>
  );
}
