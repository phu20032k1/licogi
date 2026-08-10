"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  Gauge,
  Layers3,
  MapPin,
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

  return <Link href={`/portfolio/projects/${encodeURIComponent(project.id)}`} className={`public-opening-project-card ${completed ? "is-completed" : "is-ongoing"}`}>
    <div className="public-opening-project-card-accent" style={{ background: visual.color }} />
    <div className="public-opening-project-card-top">
      <span className="public-opening-project-code">{project.code}</span>
      <span className="public-opening-project-type" style={{ color: visual.color, background: visual.softColor }}>{project.type}</span>
      <ArrowRight size={18}/>
    </div>

    <strong className="public-opening-project-name">{project.name}</strong>
    <div className="public-opening-project-meta"><MapPin size={14}/><span>{project.province}</span><i/><span>{project.investor}</span></div>

    <div className="public-opening-project-money">
      <div className="is-primary"><span>Giá trị hợp đồng</span><b>{formatVnd(projectMoney(project), project.valueRange || "Chưa cập nhật")}</b></div>
      {completed ? <>
        <div><span>Quy mô / phạm vi</span><b>{project.scale || project.constructionArea || "Chưa cập nhật"}</b></div>
        <div><span>Trạng thái</span><b>Đã hoàn thành</b></div>
      </> : <>
        <div><span>Tiến độ thi công</span><b>{progress}%</b><em><i style={{ width: `${progress}%` }}/></em></div>
        <div><span>Sức khỏe dự án</span><b>{project.healthScore != null ? `${clampPercent(project.healthScore)}/100` : "Chưa cập nhật"}</b></div>
      </>}
    </div>

    <div className="public-opening-project-open">Mở hồ sơ công trình <ArrowRight size={15}/></div>
  </Link>;
}

export default function PublicHomeOpeningPortfolio() {
  const { projects, loading, error } = usePublicProjects();
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const provinces = new Set(projects.map((project) => project.province).filter(Boolean));
  const totalValue = sumProjectMoney(projects);
  const ongoingHealth = average(ongoing, (project) => project.healthScore);

  const sectors = Array.from(new Set(projects.map((project) => project.type).filter(Boolean)))
    .map((type) => {
      const items = projects.filter((project) => project.type === type);
      const visual = projectTypeVisuals[normalizeProjectType(type)];
      return { type, visual, count: items.length };
    })
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type, "vi"));

  if (loading) return <div className="public-opening-portfolio public-opening-loading">Đang tổng hợp dữ liệu công trình...</div>;
  if (error) return <div className="public-opening-portfolio public-opening-error">{error}</div>;

  return <div className="public-opening-portfolio public-opening-portfolio-priority">
    <div className="public-opening-snapshot" aria-label="Tóm tắt danh mục">
      <Link href="/portfolio/projects"><strong>{projects.length}</strong><span>Công trình</span></Link>
      <Link href="/portfolio/overview"><strong>{formatVnd(totalValue, "0 đồng")}</strong><span>Tổng giá trị hợp đồng</span></Link>
      <Link href="/portfolio/locations"><strong>{provinces.size}</strong><span>Tỉnh / thành</span></Link>
      <Link href="/portfolio/capabilities"><strong>{sectors.length}</strong><span>Lĩnh vực</span></Link>
      <div className="public-opening-snapshot-sectors">
        <Layers3 size={14}/>
        {sectors.slice(0, 5).map((sector) => <Link key={sector.type} href={`/portfolio/projects?type=${encodeURIComponent(sector.type)}`}>
          <i style={{ background: sector.visual.color }}/><span>{sector.type}</span><b>{sector.count}</b>
        </Link>)}
      </div>
    </div>

    <section className="public-opening-group is-completed">
      <header>
        <div className="public-opening-group-title">
          <span><CheckCircle2 size={18}/> Công trình đã hoàn thành</span>
          <strong>{completed.length}</strong>
        </div>
        <div className="public-opening-aggregate">
          <span><WalletCards size={16}/><small>Tổng giá trị hợp đồng</small><b>{formatVnd(sumProjectMoney(completed), "0 đồng")}</b></span>
          <span><Building2 size={16}/><small>Địa bàn</small><b>{new Set(completed.map((project) => project.province).filter(Boolean)).size} tỉnh / thành</b></span>
        </div>
        <Link href="/portfolio/projects?status=completed">Xem tất cả <ArrowRight size={16}/></Link>
      </header>
      <div className="public-opening-project-rail">
        {completed.slice(0, 6).map((project) => <ProjectMiniCard key={project.id} project={project} completed />)}
        {!completed.length ? <div className="public-opening-empty">Chưa có công trình hoàn thành.</div> : null}
      </div>
    </section>

    <section className="public-opening-group is-ongoing">
      <header>
        <div className="public-opening-group-title">
          <span><Factory size={18}/> Công trình đang thi công</span>
          <strong>{ongoing.length}</strong>
        </div>
        <div className="public-opening-aggregate">
          <span><WalletCards size={16}/><small>Tổng giá trị hợp đồng</small><b>{formatVnd(sumProjectMoney(ongoing), "0 đồng")}</b></span>
          <span><Gauge size={16}/><small>Tiến độ bình quân</small><b>{average(ongoing, (project) => project.progress)}%</b></span>
          {ongoingHealth > 0 ? <span><ShieldCheck size={16}/><small>Sức khỏe bình quân</small><b>{ongoingHealth}/100</b></span> : null}
        </div>
        <Link href="/portfolio/projects?status=ongoing">Xem tất cả <ArrowRight size={16}/></Link>
      </header>
      <div className="public-opening-project-rail">
        {ongoing.slice(0, 6).map((project) => <ProjectMiniCard key={project.id} project={project} completed={false} />)}
        {!ongoing.length ? <div className="public-opening-empty">Chưa có công trình đang thi công.</div> : null}
      </div>
    </section>
  </div>;
}
