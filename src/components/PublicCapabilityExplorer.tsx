"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Factory, Flag, Globe2, Layers3, MapPin, Target } from "lucide-react";
import { statusLabels } from "../data/projects";

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
  valueRange: string;
  scale?: string;
  progress: number;
};

type ViewMode = "province" | "country" | "investorCountry" | "type" | "status";
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
    .map(([key, count]) => ({ key, label: mode === "status" ? statusLabel(key) : key, count, percent: projects.length ? Math.round((count / projects.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "vi"));
}

export default function PublicCapabilityExplorer() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<ViewMode>("province");
  const [activeKey, setActiveKey] = useState<string | null>(null);

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
    const provinces = new Set(projects.map((project) => project.province).filter(Boolean)).size;
    const countries = new Set(projects.map((project) => project.projectCountry || "Việt Nam").filter(Boolean)).size;
    const investorCountries = new Set(projects.map((project) => project.investorCountry).filter(Boolean)).size;
    const sectors = new Set(projects.map((project) => project.type).filter(Boolean)).size;
    const averageProgress = total ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / total) : 0;
    const knownScale = projects.filter((project) => project.scale && project.scale.trim()).length;
    const knownValue = projects.filter((project) => project.valueRange && project.valueRange !== "Chưa cập nhật").length;
    return { total, completed, ongoing, provinces, countries, investorCountries, sectors, averageProgress, knownScale, knownValue };
  }, [projects]);

  const groups = useMemo(() => groupRows(projects, mode), [mode, projects]);

  const selectedProjects = useMemo(() => {
    if (!activeKey) return projects.slice(0, 12);
    return projects.filter((project) => {
      if (mode === "province") return project.province === activeKey;
      if (mode === "country") return (project.projectCountry || "Việt Nam") === activeKey;
      if (mode === "investorCountry") return (project.investorCountry || "Chưa cập nhật") === activeKey;
      if (mode === "type") return project.type === activeKey;
      return project.status === activeKey;
    }).slice(0, 30);
  }, [activeKey, mode, projects]);

  function switchMode(next: ViewMode) {
    setMode(next);
    setActiveKey(null);
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
    if (!activeKey) return;
    if (mode === "type") mapFilter({ type: activeKey });
    else if (mode === "status") mapFilter({ status: activeKey });
    else mapFilter({ search: activeKey });
  }

  return (
    <section id="quy-mo" className="public-section public-scale-section">
      <div className="public-container">
        <div className="public-section-heading">
          <div>
            <span className="public-kicker"><Target size={14} /> Quy mô từ dữ liệu thực</span>
            <h2>Năng lực được chứng minh bằng từng dự án.</h2>
          </div>
          <p>Toàn bộ con số bên dưới được tổng hợp trực tiếp từ dữ liệu dự án công khai. Bấm vào tỉnh/thành, quốc gia, lĩnh vực hoặc trạng thái để xem các dự án tạo nên con số đó.</p>
        </div>

        <div className="public-scale-kpis" aria-live="polite">
          <article><span><Building2 /></span><strong>{loaded ? metrics.total : "—"}</strong><b>Dự án trong dữ liệu</b><small>{metrics.completed} hoàn thành · {metrics.ongoing} đang thi công</small></article>
          <article><span><MapPin /></span><strong>{loaded ? metrics.provinces : "—"}</strong><b>Tỉnh / thành đã có dự án</b><small>{metrics.provinces ? `${Math.round((metrics.provinces / 63) * 100)}% phạm vi 63 tỉnh/thành` : "Chưa có dữ liệu"}</small></article>
          <article><span><Globe2 /></span><strong>{loaded ? metrics.countries : "—"}</strong><b>Quốc gia dự án</b><small>{metrics.investorCountries} quốc gia chủ đầu tư được ghi nhận</small></article>
          <article><span><Factory /></span><strong>{loaded ? metrics.sectors : "—"}</strong><b>Nhóm lĩnh vực thi công</b><small>{metrics.averageProgress}% tiến độ trung bình toàn danh mục</small></article>
          <article><span><Layers3 /></span><strong>{loaded ? metrics.knownScale : "—"}</strong><b>Dự án có dữ liệu quy mô</b><small>{metrics.knownValue} dự án có dải giá trị/hợp đồng</small></article>
          <article><span><CheckCircle2 /></span><strong>{loaded ? metrics.completed : "—"}</strong><b>Dự án đã hoàn thành</b><small>{metrics.total ? `${Math.round((metrics.completed / metrics.total) * 100)}% tổng danh mục` : "Chưa có dữ liệu"}</small></article>
        </div>

        <div className="public-scale-explorer">
          <div className="public-scale-groups">
            <div className="public-scale-tabs">
              {(Object.keys(modeLabels) as ViewMode[]).map((item) => (
                <button key={item} type="button" onClick={() => switchMode(item)} className={mode === item ? "is-active" : ""}>{modeLabels[item]}</button>
              ))}
            </div>
            <div className="public-scale-list">
              {groups.length ? groups.map((item) => (
                <button key={item.key} type="button" onClick={() => setActiveKey(item.key)} className={activeKey === item.key ? "is-active" : ""}>
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
                <span>{activeKey ? modeLabels[mode] : "Danh mục dự án"}</span>
                <h3>{activeKey ? (mode === "status" ? statusLabel(activeKey) : activeKey) : "Các dự án mới nhất trong dữ liệu"}</h3>
                <p>{selectedProjects.length}{activeKey && selectedProjects.length === 30 ? "+" : ""} dự án đang được hiển thị trong khung chi tiết.</p>
              </div>
              {activeKey ? <button type="button" onClick={showGroupOnMap}>Xem trên Dự án <ArrowRight size={15} /></button> : null}
            </div>

            <div className="public-scale-project-list">
              {selectedProjects.map((project) => (
                <button key={project.id} type="button" onClick={() => mapFilter({ search: project.code, projectId: project.id })}>
                  <span className="public-scale-project-code">{project.code}</span>
                  <span className="public-scale-project-main"><b>{project.name}</b><small>{project.province} · {project.projectCountry || "Việt Nam"} · {project.type}</small></span>
                  <span className="public-scale-project-meta"><b>{project.progress}%</b><small>{statusLabel(project.status)}</small></span>
                  <ArrowRight size={15} />
                </button>
              ))}
              {!selectedProjects.length ? <p className="public-scale-empty">Không có dự án phù hợp.</p> : null}
            </div>
          </div>
        </div>

        <div className="public-scale-footnote"><Flag size={15} /> “Quốc gia dự án” lấy từ trường <code>project_country</code>; nếu chưa khai báo, hệ thống mặc định là Việt Nam. “Quốc gia chủ đầu tư” lấy từ hồ sơ khách hàng/dữ liệu dự án.</div>
      </div>
    </section>
  );
}
