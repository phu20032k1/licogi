"use client";

import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Factory, MapPin, WalletCards } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, projectMoney, PublicProjectRecord, sumProjectMoney } from "../lib/publicProject";

function ProjectCard({ project, mode }: { project: PublicProjectRecord; mode: "completed" | "ongoing" }) {
  const paid = Number(project.financial?.paymentPaidVnd || 0);
  const outstanding = Number(project.financial?.outstandingReceivableVnd || 0);
  const contract = projectMoney(project);

  return <Link href={`/portfolio/projects/${encodeURIComponent(project.id)}`} className="public-project-portfolio-card">
    <div className="public-project-portfolio-card-head">
      <span className={mode === "completed" ? "is-completed" : "is-ongoing"}>{mode === "completed" ? <CheckCircle2 size={15}/> : <Factory size={15}/>} {mode === "completed" ? "Hoàn thành" : "Đang thi công"}</span>
      <ArrowRight size={17}/>
    </div>
    <h3>{project.name}</h3>
    <p><MapPin size={14}/>{project.province}<i/> {project.type}</p>
    <div className="public-project-money-row">
      <div><span>Giá trị hợp đồng</span><strong>{formatVnd(contract)}</strong></div>
      {paid > 0 ? <div><span>Đã thanh toán</span><strong>{formatVnd(paid)}</strong></div> : null}
      {mode === "completed" && outstanding > 0 ? <div><span>Phải thu còn lại</span><strong>{formatVnd(outstanding)}</strong></div> : null}
      {mode === "ongoing" ? <div><span>Tiến độ</span><strong>{Math.max(0, Math.min(100, Number(project.progress || 0)))}%</strong></div> : null}
    </div>
  </Link>;
}

export default function PublicProjectPortfolio() {
  const { projects, loading, error } = usePublicProjects();
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const sectors = Array.from(new Set(projects.map((project) => project.type).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));

  if (loading) return <section className="public-home-portfolio"><div className="public-container"><div className="public-page-loading">Đang tổng hợp danh mục công trình...</div></div></section>;
  if (error) return <section className="public-home-portfolio"><div className="public-container"><div className="public-page-error">{error}</div></div></section>;

  return <section className="public-home-portfolio">
    <div className="public-container">
      <div className="public-home-sector-links">
        <span>Lĩnh vực</span>
        {sectors.map((sector) => <Link key={sector} href={`/portfolio/capabilities?type=${encodeURIComponent(sector)}`}>{sector}</Link>)}
        <Link href="/portfolio/capabilities" className="is-all">Tất cả <ArrowRight size={14}/></Link>
      </div>

      <div className="public-portfolio-section public-portfolio-completed">
        <div className="public-portfolio-heading">
          <div><span><CheckCircle2 size={16}/> Công trình đã hoàn thành</span><h2>{completed.length}</h2></div>
          <div className="public-portfolio-total"><WalletCards size={19}/><span>Tổng giá trị hợp đồng</span><strong>{formatVnd(sumProjectMoney(completed), "0 đồng")}</strong></div>
          <Link href="/portfolio/projects?status=completed">Xem toàn bộ <ArrowRight size={15}/></Link>
        </div>
        <div className="public-project-portfolio-grid">
          {completed.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} mode="completed" />)}
          {!completed.length ? <div className="public-project-empty">Chưa có công trình hoàn thành trong dữ liệu public.</div> : null}
        </div>
      </div>

      <div className="public-portfolio-section public-portfolio-ongoing">
        <div className="public-portfolio-heading">
          <div><span><Building2 size={16}/> Công trình đang thi công</span><h2>{ongoing.length}</h2></div>
          <div className="public-portfolio-total"><WalletCards size={19}/><span>Tổng giá trị hợp đồng</span><strong>{formatVnd(sumProjectMoney(ongoing), "0 đồng")}</strong></div>
          <Link href="/portfolio/projects?status=ongoing">Xem toàn bộ <ArrowRight size={15}/></Link>
        </div>
        <div className="public-project-portfolio-grid">
          {ongoing.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} mode="ongoing" />)}
          {!ongoing.length ? <div className="public-project-empty">Chưa có công trình đang thi công trong dữ liệu public.</div> : null}
        </div>
      </div>
    </div>
  </section>;
}
