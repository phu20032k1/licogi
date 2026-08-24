"use client";

import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Database, Factory, Globe2, MapPin } from "lucide-react";
import PublicSiteFrame from "../../../components/PublicSiteFrame";
import usePublicProjects from "../../../hooks/usePublicProjects";
import { formatVnd, projectMoney, sumProjectMoney } from "../../../lib/publicProject";

export default function PublicOverviewPage() {
  const { projects, loading, error } = usePublicProjects();
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const warranty = projects.filter((project) => project.status === "warranty");
  const provinces = new Set(projects.map((project) => project.province).filter(Boolean)).size;
  const sectors = new Set(projects.map((project) => project.type).filter(Boolean)).size;
  const countries = new Set(projects.map((project) => project.projectCountry || "Việt Nam").filter(Boolean)).size;
  const totalContract = sumProjectMoney(projects);
  const requested = projects.reduce((sum, project) => sum + Number(project.financial?.paymentRequestedVnd || 0), 0);
  const paid = projects.reduce((sum, project) => sum + Number(project.financial?.paymentPaidVnd || 0), 0);
  const outstanding = projects.reduce((sum, project) => sum + Number(project.financial?.outstandingReceivableVnd || 0), 0);
  const avgProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / projects.length) : 0;
  const avgCompleteness = projects.length ? Math.round(projects.reduce((sum, project) => sum + Number(project.dataCompleteness || 0), 0) / projects.length) : 0;
  const topProjects = [...projects].sort((a, b) => projectMoney(b) - projectMoney(a)).slice(0, 10);

  const kpis = [
    { label: "Tổng công trình", value: projects.length, icon: Building2, href: "/portfolio/projects" },
    { label: "Đã hoàn thành", value: completed.length, icon: CheckCircle2, href: "/portfolio/projects?status=completed" },
    { label: "Đang thi công", value: ongoing.length, icon: Factory, href: "/portfolio/projects?status=ongoing" },
    { label: "Tỉnh / thành", value: provinces, icon: MapPin, href: "/portfolio/locations" },
    { label: "Lĩnh vực", value: sectors, icon: Factory, href: "/portfolio/capabilities" },
    { label: "Quốc gia dự án", value: countries, icon: Globe2, href: "/portfolio/locations" },
    { label: "Tiến độ bình quân", value: `${avgProgress}%`, icon: Database, href: "/portfolio/projects?status=ongoing" },
    { label: "Độ đầy đủ dữ liệu", value: `${avgCompleteness}%`, icon: Database, href: "/portfolio/projects" },
  ];

  return <PublicSiteFrame>
    <main className="public-page-main public-investment-route">
      <section className="public-page-hero public-page-hero-compact">
        <div className="public-container">
          <span>Tổng quan dữ liệu</span>
          <h1>Năng lực LICOGI 18.3 qua dữ liệu dự án</h1>
        </div>
      </section>

      <section className="public-page-section">
        <div className="public-container">
          {loading ? <div className="public-page-loading">Đang tổng hợp dữ liệu...</div> : error ? <div className="public-page-error">{error}</div> : <>
            <div className="public-overview-kpi-grid">
              {kpis.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href}><Icon size={18}/><strong>{item.value}</strong><span>{item.label}</span><ArrowRight size={14}/></Link>; })}
            </div>

            <div className="public-finance-overview">
              <article><span>Tổng giá trị hợp đồng</span><strong>{formatVnd(totalContract, "0 đồng")}</strong></article>
              <article><span>Đề nghị thanh toán</span><strong>{formatVnd(requested, "0 đồng")}</strong></article>
              <article><span>Đã thanh toán</span><strong>{formatVnd(paid, "0 đồng")}</strong></article>
              <article><span>Phải thu còn lại</span><strong>{formatVnd(outstanding, "0 đồng")}</strong></article>
            </div>

            <div className="public-overview-split">
              <article className="public-overview-status-panel">
                <div className="public-page-block-head"><div><span>Cơ cấu trạng thái</span><h2>{projects.length} công trình</h2></div></div>
                <Link href="/portfolio/projects?status=completed"><span>Đã hoàn thành</span><strong>{completed.length}</strong><i style={{ width: `${projects.length ? completed.length / projects.length * 100 : 0}%` }}/></Link>
                <Link href="/portfolio/projects?status=ongoing"><span>Đang thi công</span><strong>{ongoing.length}</strong><i style={{ width: `${projects.length ? ongoing.length / projects.length * 100 : 0}%` }}/></Link>
                <Link href="/portfolio/projects?status=warranty"><span>Bảo hành</span><strong>{warranty.length}</strong><i style={{ width: `${projects.length ? warranty.length / projects.length * 100 : 0}%` }}/></Link>
              </article>

              <article className="public-overview-top-projects">
                <div className="public-page-block-head"><div><span>Danh mục theo giá trị</span><h2>Dự án nổi bật</h2></div><Link href="/portfolio/projects">Xem tất cả <ArrowRight size={14}/></Link></div>
                <div className="public-overview-project-table">
                  {topProjects.map((project, index) => <Link key={project.id} href={`/portfolio/projects/${encodeURIComponent(project.id)}`}><b>{String(index + 1).padStart(2, "0")}</b><span><strong>{project.name}</strong><small>{project.province} · {project.type}</small></span><em>{formatVnd(projectMoney(project))}</em><ArrowRight size={14}/></Link>)}
                </div>
              </article>
            </div>
          </>}
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
