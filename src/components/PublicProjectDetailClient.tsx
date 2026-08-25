"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Building2, FileText, MapPin, Ruler, ShieldCheck, WalletCards, Wrench } from "lucide-react";
import type { PublicProjectRecord } from "../lib/publicProject";
import { formatPublicDate, formatVnd, projectMoney, publicStatusLabels } from "../lib/publicProject";
import PublicSiteFrame from "./PublicSiteFrame";
import ResponsiveSingleProjectMap from "./ResponsiveSingleProjectMap";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  return <div className="public-project-detail-row"><span>{label}</span><strong>{value}</strong></div>;
}

function hasMoney(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export default function PublicProjectDetailClient({ project }: { project: PublicProjectRecord }) {
  const financial = project.financial || {};
  const hasCoordinates = Number.isFinite(project.lat) && Number.isFinite(project.lng) && project.lat !== 0 && project.lng !== 0;
  const mapHref = project.mapsUrl || (hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}` : "");
  const paymentCards = [
    hasMoney(financial.paymentRequestedVnd) ? { label: "Đề nghị thanh toán", value: financial.paymentRequestedVnd, icon: FileText } : null,
    hasMoney(financial.paymentPaidVnd) ? { label: "Đã thanh toán", value: financial.paymentPaidVnd, icon: ShieldCheck } : null,
    hasMoney(financial.outstandingReceivableVnd) ? { label: "Phải thu còn lại", value: financial.outstandingReceivableVnd, icon: WalletCards } : null,
  ].filter(Boolean) as Array<{ label: string; value: number; icon: typeof FileText }>;

  return <PublicSiteFrame>
    <main className="public-page-main public-project-detail-page">
      <section className="public-project-detail-hero">
        <div className="public-container">
          <Link href="/portfolio/projects" className="public-detail-back"><ArrowLeft size={15}/> Danh mục công trình</Link>
          <div className="public-project-detail-title-grid">
            <div>
              <span className={`public-detail-status is-${project.status}`}>{publicStatusLabels[project.status]}</span>
              <h1>{project.name}</h1>
              <p><MapPin size={15}/>{project.province}{project.legacyProvince ? ` · địa bàn trước sắp xếp: ${project.legacyProvince}` : ""}<i/> {project.type}</p>
            </div>
            <div className="public-detail-contract-highlight"><span>Giá trị hợp đồng</span><strong>{formatVnd(projectMoney(project), project.valueRange || "Đang cập nhật")}</strong><small>{project.code}</small></div>
          </div>
        </div>
      </section>

      <section className="public-page-section public-project-detail-content">
        <div className="public-container">
          <div className="public-project-detail-finance">
            <article><WalletCards/><span>Giá trị hợp đồng</span><strong>{formatVnd(financial.contractValueVnd || project.contractValueVnd, project.valueRange || "Đang cập nhật")}</strong></article>
            {paymentCards.map(({ label, value, icon: Icon }) => <article key={label}><Icon/><span>{label}</span><strong>{formatVnd(value)}</strong></article>)}
          </div>

          <div className="public-project-detail-layout">
            <div className="public-project-detail-main">
              <article className="public-detail-panel public-detail-map-panel">
                <div className="public-detail-panel-head">
                  <div><MapPin/><span>Vị trí công trình</span></div>
                  {mapHref ? <a href={mapHref} target="_blank" rel="noreferrer">Mở vị trí <ArrowUpRight size={14}/></a> : null}
                </div>
                <ResponsiveSingleProjectMap project={project}/>
              </article>

              <article className="public-detail-panel">
                <div className="public-detail-panel-head"><div><Building2/><span>Chủ đầu tư & hợp đồng</span></div></div>
                <div className="public-project-detail-rows">
                  <DetailRow label="Chủ đầu tư" value={project.investor}/>
                  <DetailRow label="Quốc gia chủ đầu tư" value={project.investorCountry}/>
                  <DetailRow label="Số hợp đồng" value={project.contractNumber}/>
                  <DetailRow label="Gói thầu" value={project.packageName}/>
                  <DetailRow label="Vai trò nhà thầu" value={project.contractorRole}/>
                </div>
              </article>

              <article className="public-detail-panel">
                <div className="public-detail-panel-head"><div><Ruler/><span>Quy mô thi công</span></div></div>
                <div className="public-project-detail-rows">
                  <DetailRow label="Quy mô / phạm vi" value={project.scale}/>
                  <DetailRow label="Diện tích xây dựng" value={project.constructionArea}/>
                  <DetailRow label="Tổng diện tích sàn" value={project.floorArea}/>
                  <DetailRow label="Dải giá trị" value={project.valueRange}/>
                  <DetailRow label="Quốc gia dự án" value={project.projectCountry || "Việt Nam"}/>
                </div>
              </article>

              {project.description ? <article className="public-detail-panel"><div className="public-detail-panel-head"><div><FileText/><span>Mô tả công trình</span></div></div><p className="public-project-description">{project.description}</p></article> : null}
            </div>

            <aside className="public-project-detail-aside">
              <article className="public-detail-panel public-detail-progress-panel">
                <div className="public-detail-panel-head"><div><Wrench/><span>Thông tin tiến độ</span></div></div>
                <div className="public-detail-progress-number"><strong>{project.progress}%</strong><span>hoàn thành</span></div>
                <div className="public-detail-progress-track"><i style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}/></div>
                <div className="public-project-detail-rows">
                  <DetailRow label="Trạng thái" value={publicStatusLabels[project.status]}/>
                  <DetailRow label="Khởi công" value={project.startDate ? formatPublicDate(project.startDate) : undefined}/>
                  <DetailRow label="Hoàn thành dự kiến" value={project.endDate ? formatPublicDate(project.endDate) : undefined}/>
                  <DetailRow label="Cập nhật gần nhất" value={formatPublicDate(project.updatedAt)}/>
                </div>
              </article>
            </aside>
          </div>
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
