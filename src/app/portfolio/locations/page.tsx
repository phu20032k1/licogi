"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import PublicSiteFrame from "../../../components/PublicSiteFrame";
import usePublicProjects from "../../../hooks/usePublicProjects";
import { formatVnd, projectMoney } from "../../../lib/publicProject";

export default function PublicLocationsPage() {
  const { projects, loading, error } = usePublicProjects();
  const groups = Array.from(new Set(projects.map((project) => project.province).filter(Boolean)))
    .map((province) => {
      const items = projects.filter((project) => project.province === province);
      return {
        province,
        items,
        completed: items.filter((project) => project.status === "completed").length,
        ongoing: items.filter((project) => project.status === "ongoing").length,
        value: items.reduce((sum, project) => sum + projectMoney(project), 0),
      };
    })
    .sort((a, b) => b.items.length - a.items.length || a.province.localeCompare(b.province, "vi"));

  return <PublicSiteFrame>
    <main className="public-page-main">
      <section className="public-page-hero public-page-hero-compact"><div className="public-container"><span>Địa bàn hoạt động</span><h1>Mạng lưới dự án theo tỉnh / thành</h1></div></section>
      <section className="public-page-section">
        <div className="public-container">
          {loading ? <div className="public-page-loading">Đang tổng hợp địa bàn...</div> : error ? <div className="public-page-error">{error}</div> : <>
            <div className="public-location-summary"><strong>{groups.length}</strong><span>tỉnh / thành có dữ liệu dự án trên mô hình 34 đơn vị cấp tỉnh hiện hành</span></div>
            <div className="public-location-grid">
              {groups.map((group) => <article key={group.province}>
                <div className="public-location-card-head"><MapPin size={18}/><h2>{group.province}</h2><strong>{group.items.length}</strong></div>
                <div className="public-location-card-metrics"><span><b>{group.completed}</b> hoàn thành</span><span><b>{group.ongoing}</b> thi công</span><span><b>{formatVnd(group.value, "0 đồng")}</b> hợp đồng</span></div>
                <div className="public-location-projects">{group.items.slice(0, 5).map((project) => <Link key={project.id} href={`/portfolio/projects/${encodeURIComponent(project.id)}`}><span>{project.name}<small>{project.type}</small></span><ArrowRight size={14}/></Link>)}</div>
                <Link className="public-directory-more" href={`/portfolio/projects?q=${encodeURIComponent(group.province)}`}>Xem dự án tại {group.province} <ArrowRight size={14}/></Link>
              </article>)}
            </div>
          </>}
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
