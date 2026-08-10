"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Factory, WalletCards } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, projectMoney } from "../lib/publicProject";

export default function PublicCapabilitiesDirectory() {
  const { projects, loading, error } = usePublicProjects();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type") || "";
  const groups = Array.from(new Set(projects.map((project) => project.type).filter(Boolean)))
    .map((type) => {
      const items = projects.filter((project) => project.type === type);
      return {
        type,
        items,
        completed: items.filter((project) => project.status === "completed").length,
        ongoing: items.filter((project) => project.status === "ongoing").length,
        value: items.reduce((sum, project) => sum + projectMoney(project), 0),
        avgProgress: items.length ? Math.round(items.reduce((sum, project) => sum + Number(project.progress || 0), 0) / items.length) : 0,
      };
    })
    .sort((a, b) => b.items.length - a.items.length || a.type.localeCompare(b.type, "vi"));

  if (loading) return <div className="public-page-loading">Đang tổng hợp lĩnh vực...</div>;
  if (error) return <div className="public-page-error">{error}</div>;

  const visible = selectedType ? groups.filter((group) => group.type === selectedType) : groups;

  return <div className="public-capability-directory">
    <div className="public-directory-filter-row">
      <Link href="/portfolio/capabilities" className={!selectedType ? "is-active" : ""}>Tất cả</Link>
      {groups.map((group) => <Link key={group.type} href={`/portfolio/capabilities?type=${encodeURIComponent(group.type)}`} className={selectedType === group.type ? "is-active" : ""}>{group.type}</Link>)}
    </div>
    <div className="public-capability-group-grid">
      {visible.map((group) => <article key={group.type} className="public-capability-group-card">
        <div className="public-capability-group-head"><span><Factory size={18}/>{group.type}</span><strong>{group.items.length}</strong></div>
        <div className="public-capability-group-metrics">
          <div><span>Hoàn thành</span><strong>{group.completed}</strong></div>
          <div><span>Đang thi công</span><strong>{group.ongoing}</strong></div>
          <div><span>Tiến độ bình quân</span><strong>{group.avgProgress}%</strong></div>
          <div><span>Giá trị hợp đồng</span><strong>{formatVnd(group.value, "0 đồng")}</strong></div>
        </div>
        <div className="public-capability-project-list">
          {group.items.slice(0, 8).map((project) => <Link key={project.id} href={`/portfolio/projects/${encodeURIComponent(project.id)}`}>
            <span>{project.status === "completed" ? <CheckCircle2 size={14}/> : <Factory size={14}/>}<b>{project.name}</b><small>{project.province}</small></span>
            <em>{formatVnd(projectMoney(project))}</em><ArrowRight size={14}/>
          </Link>)}
        </div>
        {group.items.length > 8 ? <Link className="public-directory-more" href={`/portfolio/projects?type=${encodeURIComponent(group.type)}`}>Xem toàn bộ {group.items.length} dự án <ArrowRight size={14}/></Link> : null}
      </article>)}
    </div>
  </div>;
}
