"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  Factory,
  Gauge,
  Layers3,
  MapPin,
  MapPinned,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, projectMoney, PublicProjectRecord, sumProjectMoney } from "../lib/publicProject";
import { normalizeProjectType, projectTypeVisuals } from "../lib/projectMapVisuals";

function clampPercent(value?: number | null) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function average(projects: PublicProjectRecord[], getter: (project: PublicProjectRecord) => number | null | undefined) {
  const values = projects.map(getter).map(Number).filter((value) => Number.isFinite(value) && value >= 0);
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function ProjectMiniCard({ project, completed }: { project: PublicProjectRecord; completed: boolean }) {
  const progress = clampPercent(project.progress);
  const visual = projectTypeVisuals[normalizeProjectType(project.type)];

  return <Link href={`/portfolio/projects/${encodeURIComponent(project.id)}`} className="public-opening-project-card">
    <div className="public-opening-project-card-top">
      <span className="public-opening-project-code">{project.code}</span>
      <span className="public-opening-project-type" style={{ color: visual.color, background: visual.softColor }}>{project.type}</span>
      <ArrowRight size={15}/>
    </div>
    <strong>{project.name}</strong>
    <small><MapPin size={13}/>{project.province}<i/> {project.investor}</small>
    <div className="public-opening-project-money">
      <div><span>Giá trị hợp đồng</span><b>{formatVnd(projectMoney(project), project.valueRange || "Chưa cập nhật")}</b></div>
      {completed
        ? <div><span>Quy mô</span><b>{project.scale || project.constructionArea || "Chưa cập nhật"}</b></div>
        : <div><span>Tiến độ</span><b>{progress}%</b><em><i style={{ width: `${progress}%` }}/></em></div>}
      <div><span>{completed ? "Hoàn thành" : "Sức khỏe dự án"}</span><b>{completed ? "100%" : project.healthScore != null ? `${clampPercent(project.healthScore)}/100` : "Chưa cập nhật"}</b></div>
    </div>
  </Link>;
}

export default function PublicHomeOpeningPortfolio() {
  const { projects, loading, error } = usePublicProjects();
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const warranty = projects.filter((project) => project.status === "warranty");
  const provinces = new Set(projects.map((project) => project.province).filter(Boolean));
  const totalValue = sumProjectMoney(projects);
  const avgProgress = average(projects, (project) => project.progress);
  const avgCompleteness = average(projects, (project) => project.dataCompleteness);
  const ongoingHealth = average(ongoing, (project) => project.healthScore);

  const sectors = Array.from(new Set(projects.map((project) => project.type).filter(Boolean)))
    .map((type) => {
      const items = projects.filter((project) => project.type === type);
      const visual = projectTypeVisuals[normalizeProjectType(type)];
      return {
        type,
        visual,
        count: items.length,
        completed: items.filter((project) => project.status === "completed").length,
        ongoing: items.filter((project) => project.status === "ongoing").length,
        value: sumProjectMoney(items),
      };
    })
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type, "vi"));

  if (loading) return <div className="public-opening-portfolio public-opening-loading">Đang tổng hợp dữ liệu công trình...</div>;
  if (error) return <div className="public-opening-portfolio public-opening-error">{error}</div>;

  return <div className="public-opening-portfolio">
    <div className="public-opening-summary">
      <div className="public-opening-summary-head">
        <div>
          <span><Database size={14}/> Dữ liệu năng lực trực tiếp</span>
          <strong>Tổng quan danh mục công trình</strong>
        </div>
        <Link href="/portfolio/overview">Xem chi tiết <ArrowRight size={14}/></Link>
      </div>

      <div className="public-opening-kpi-grid">
        <Link href="/portfolio/projects"><MapPinned/><span>Tổng công trình</span><strong>{projects.length}</strong></Link>
        <Link href="/portfolio/projects?status=completed"><CheckCircle2/><span>Đã hoàn thành</span><strong>{completed.length}</strong></Link>
        <Link href="/portfolio/projects?status=ongoing"><Factory/><span>Đang thi công</span><strong>{ongoing.length}</strong></Link>
        <Link href="/portfolio/overview"><WalletCards/><span>Tổng giá trị hợp đồng</span><strong>{formatVnd(totalValue, "0 đồng")}</strong></Link>
        <Link href="/portfolio/locations"><MapPin/><span>Tỉnh / thành</span><strong>{provinces.size}</strong></Link>
        <Link href="/portfolio/capabilities"><Layers3/><span>Lĩnh vực thực tế</span><strong>{sectors.length}</strong></Link>
      </div>

      <div className="public-opening-health-row">
        <div><Gauge/><span>Tiến độ bình quân</span><strong>{avgProgress}%</strong></div>
        <div><Database/><span>Độ đầy đủ dữ liệu</span><strong>{avgCompleteness}%</strong></div>
        <div><ShieldCheck/><span>Đang bảo hành</span><strong>{warranty.length}</strong></div>
      </div>

      <div className="public-opening-sector-block">
        <div className="public-opening-sector-title"><span>Lĩnh vực đang có trong dữ liệu</span><b>{sectors.length} nhóm</b></div>
        <div className="public-opening-sector-strip">
          {sectors.map((sector) => <Link key={sector.type} href={`/portfolio/projects?type=${encodeURIComponent(sector.type)}`} className="public-opening-sector-item">
            <i style={{ background: sector.visual.color }}/>
            <span><strong>{sector.type}</strong><small>{sector.completed} hoàn thành · {sector.ongoing} đang thi công</small></span>
            <em><b>{sector.count}</b><small>{formatVnd(sector.value, "—")}</small></em>
          </Link>)}
          {!sectors.length ? <div className="public-opening-empty">Chưa có dữ liệu lĩnh vực.</div> : null}
        </div>
      </div>
    </div>

    <section className="public-opening-group is-completed">
      <header>
        <div><span><CheckCircle2 size={15}/> Công trình đã hoàn thành</span><strong>{completed.length}</strong></div>
        <div className="public-opening-aggregate">
          <span><WalletCards size={14}/> Tổng giá trị hợp đồng <b>{formatVnd(sumProjectMoney(completed), "0 đồng")}</b></span>
          <span><Building2 size={14}/> {new Set(completed.map((project) => project.province).filter(Boolean)).size} tỉnh / thành</span>
        </div>
        <Link href="/portfolio/projects?status=completed">Xem tất cả <ArrowRight size={14}/></Link>
      </header>
      <div className="public-opening-project-rail">
        {completed.slice(0, 6).map((project) => <ProjectMiniCard key={project.id} project={project} completed />)}
        {!completed.length ? <div className="public-opening-empty">Chưa có công trình hoàn thành.</div> : null}
      </div>
    </section>

    <section className="public-opening-group is-ongoing">
      <header>
        <div><span><Factory size={15}/> Công trình đang thi công</span><strong>{ongoing.length}</strong></div>
        <div className="public-opening-aggregate">
          <span><WalletCards size={14}/> Tổng giá trị hợp đồng <b>{formatVnd(sumProjectMoney(ongoing), "0 đồng")}</b></span>
          <span><Gauge size={14}/> Tiến độ bình quân <b>{average(ongoing, (project) => project.progress)}%</b></span>
          {ongoingHealth > 0 ? <span><ShieldCheck size={14}/> Sức khỏe bình quân <b>{ongoingHealth}/100</b></span> : null}
        </div>
        <Link href="/portfolio/projects?status=ongoing">Xem tất cả <ArrowRight size={14}/></Link>
      </header>
      <div className="public-opening-project-rail">
        {ongoing.slice(0, 6).map((project) => <ProjectMiniCard key={project.id} project={project} completed={false} />)}
        {!ongoing.length ? <div className="public-opening-empty">Chưa có công trình đang thi công.</div> : null}
      </div>
    </section>
  </div>;
}
