"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Factory, MapPin, WalletCards } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, projectMoney, PublicProjectRecord, sumProjectMoney } from "../lib/publicProject";

function moneyTotal(projects: PublicProjectRecord[], key: "paymentPaidVnd" | "outstandingReceivableVnd") {
  return projects.reduce((sum, project) => sum + Number(project.financial?.[key] || 0), 0);
}

function ProjectMiniCard({ project, completed }: { project: PublicProjectRecord; completed: boolean }) {
  const paid = Number(project.financial?.paymentPaidVnd || 0);
  const outstanding = Number(project.financial?.outstandingReceivableVnd || 0);

  return <Link href={`/portfolio/projects/${encodeURIComponent(project.id)}`} className="public-opening-project-card">
    <div className="public-opening-project-card-top">
      <span>{project.code}</span>
      <ArrowRight size={14}/>
    </div>
    <strong>{project.name}</strong>
    <small><MapPin size={12}/>{project.province} · {project.type}</small>
    <div className="public-opening-project-money">
      <div><span>Giá trị hợp đồng</span><b>{formatVnd(projectMoney(project), project.valueRange || "Chưa cập nhật")}</b></div>
      {completed ? <>
        <div><span>Đã thanh toán</span><b>{formatVnd(paid, "—")}</b></div>
        <div><span>Phải thu</span><b>{formatVnd(outstanding, "—")}</b></div>
      </> : <div><span>Tiến độ</span><b>{Math.max(0, Math.min(100, Number(project.progress || 0)))}%</b></div>}
    </div>
  </Link>;
}

export default function PublicHomeOpeningPortfolio() {
  const { projects, loading, error } = usePublicProjects();
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const completedPaid = moneyTotal(completed, "paymentPaidVnd");
  const completedOutstanding = moneyTotal(completed, "outstandingReceivableVnd");
  const ongoingProgress = ongoing.length
    ? Math.round(ongoing.reduce((sum, project) => sum + Number(project.progress || 0), 0) / ongoing.length)
    : 0;

  if (loading) return <div className="public-opening-portfolio public-opening-loading">Đang tổng hợp dữ liệu công trình...</div>;
  if (error) return <div className="public-opening-portfolio public-opening-error">{error}</div>;

  return <div className="public-opening-portfolio">
    <section className="public-opening-group is-completed">
      <header>
        <div><span><CheckCircle2 size={14}/> Công trình đã hoàn thành</span><strong>{completed.length}</strong></div>
        <div className="public-opening-aggregate">
          <span><WalletCards size={13}/> Tổng giá trị <b>{formatVnd(sumProjectMoney(completed), "0 đồng")}</b></span>
          {completedPaid > 0 ? <span>Đã thanh toán <b>{formatVnd(completedPaid, "0 đồng")}</b></span> : null}
          {completedOutstanding > 0 ? <span>Phải thu <b>{formatVnd(completedOutstanding, "0 đồng")}</b></span> : null}
        </div>
        <Link href="/portfolio/projects?status=completed">Xem tất cả <ArrowRight size={13}/></Link>
      </header>
      <div className="public-opening-project-rail">
        {completed.slice(0, 6).map((project) => <ProjectMiniCard key={project.id} project={project} completed />)}
        {!completed.length ? <div className="public-opening-empty">Chưa có công trình hoàn thành.</div> : null}
      </div>
    </section>

    <section className="public-opening-group is-ongoing">
      <header>
        <div><span><Factory size={14}/> Công trình đang thi công</span><strong>{ongoing.length}</strong></div>
        <div className="public-opening-aggregate">
          <span><WalletCards size={13}/> Tổng giá trị <b>{formatVnd(sumProjectMoney(ongoing), "0 đồng")}</b></span>
          <span>Tiến độ bình quân <b>{ongoingProgress}%</b></span>
        </div>
        <Link href="/portfolio/projects?status=ongoing">Xem tất cả <ArrowRight size={13}/></Link>
      </header>
      <div className="public-opening-project-rail">
        {ongoing.slice(0, 6).map((project) => <ProjectMiniCard key={project.id} project={project} completed={false} />)}
        {!ongoing.length ? <div className="public-opening-empty">Chưa có công trình đang thi công.</div> : null}
      </div>
    </section>
  </div>;
}
