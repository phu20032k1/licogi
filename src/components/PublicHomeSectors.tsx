"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Factory, Gauge, Layers3 } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, sumProjectMoney } from "../lib/publicProject";
import { normalizeProjectType, projectTypeVisuals } from "../lib/projectMapVisuals";

export default function PublicHomeSectors() {
  const { projects, loading, error } = usePublicProjects();

  if (loading) return <section id="nganh-hang" className="public-section public-sectors"><div className="public-container"><div className="public-page-loading">Đang tổng hợp lĩnh vực...</div></div></section>;
  if (error) return <section id="nganh-hang" className="public-section public-sectors"><div className="public-container"><div className="public-page-error">{error}</div></div></section>;

  const groups = Array.from(new Set(projects.map((project) => project.type).filter(Boolean)))
    .map((type) => {
      const items = projects.filter((project) => project.type === type);
      const completed = items.filter((project) => project.status === "completed").length;
      const ongoing = items.filter((project) => project.status === "ongoing").length;
      const avgProgress = items.length
        ? Math.round(items.reduce((sum, project) => sum + Number(project.progress || 0), 0) / items.length)
        : 0;
      const visual = projectTypeVisuals[normalizeProjectType(type)];
      return { type, items, completed, ongoing, avgProgress, value: sumProjectMoney(items), visual };
    })
    .sort((a, b) => b.items.length - a.items.length || a.type.localeCompare(b.type, "vi"));

  return <section id="nganh-hang" className="public-section public-sectors public-home-sector-data">
    <div className="public-container">
      <div className="public-section-heading" data-reveal="left">
        <div><span className="public-kicker"><Layers3 size={14}/> Năng lực theo dữ liệu dự án</span><h2>Lĩnh vực đang triển khai</h2></div>
        <Link href="/portfolio/capabilities" className="public-outline-button">Xem toàn bộ lĩnh vực <ArrowRight size={15}/></Link>
      </div>

      <div className="public-home-sector-data-grid">
        {groups.map((group) => <Link key={group.type} href={`/portfolio/projects?type=${encodeURIComponent(group.type)}`} className="public-home-sector-data-card" data-reveal="card">
          <div className="public-home-sector-data-accent" style={{ background: group.visual.color }}/>
          <div className="public-home-sector-data-head">
            <span style={{ color: group.visual.color, background: group.visual.softColor }}><Factory size={18}/></span>
            <b>{group.items.length}</b>
          </div>
          <h3>{group.type}</h3>
          <div className="public-home-sector-data-stats">
            <div><CheckCircle2/><span>Hoàn thành</span><strong>{group.completed}</strong></div>
            <div><Factory/><span>Đang thi công</span><strong>{group.ongoing}</strong></div>
            <div><Gauge/><span>Tiến độ bình quân</span><strong>{group.avgProgress}%</strong></div>
          </div>
          <div className="public-home-sector-data-value"><span>Tổng giá trị hợp đồng</span><strong>{formatVnd(group.value, "Chưa có dữ liệu")}</strong></div>
          <div className="public-home-sector-data-link">Xem {group.items.length} dự án <ArrowRight size={14}/></div>
        </Link>)}
        {!groups.length ? <div className="public-project-empty">Chưa có dữ liệu lĩnh vực.</div> : null}
      </div>
    </div>
  </section>;
}
