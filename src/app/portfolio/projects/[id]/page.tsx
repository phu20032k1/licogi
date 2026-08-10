"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Database, FileText, MapPin, Ruler, ShieldCheck, WalletCards, Wrench } from "lucide-react";
import PublicSiteFrame from "../../../../components/PublicSiteFrame";
import usePublicProjects from "../../../../hooks/usePublicProjects";
import { formatPublicDate, formatVnd, projectMoney, publicStatusLabels } from "../../../../lib/publicProject";

const PublicSingleProjectMap = dynamic(() => import("../../../../components/PublicSingleProjectMap"), { ssr: false, loading: () => <div className="public-project-detail-map-loading">Đang tải bản đồ...</div> });

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  return <div className="public-project-detail-row"><span>{label}</span><strong>{value}</strong></div>;
}

export default function PublicProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { projects, loading, error } = usePublicProjects();
  const id = decodeURIComponent(String(params?.id || ""));
  const project = projects.find((item) => item.id === id || item.code === id);

  if (loading) return <PublicSiteFrame><main className="public-page-main"><div className="public-container public-page-loading public-detail-loading">Đang tải hồ sơ dự án...</div></main></PublicSiteFrame>;
  if (error || !project) return <PublicSiteFrame><main className="public-page-main"><div className="public-container public-page-error public-detail-loading">{error || "Không tìm thấy dự án."}<br/><Link href="/portfolio/projects">Quay lại danh mục</Link></div></main></PublicSiteFrame>;

  const financial = project.financial || {};
  const related = project.related || {};
  const mapHref = project.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`;

  return <PublicSiteFrame>
    <main className="public-page-main public-project-detail-page">
      <section className="public-project-detail-hero">
        <div className="public-container">
          <Link href="/portfolio/projects" className="public-detail-back"><ArrowLeft size={15}/> Danh mục dự án</Link>
          <div className="public-project-detail-title-grid">
            <div><span className={`public-detail-status is-${project.status}`}>{publicStatusLabels[project.status]}</span><h1>{project.name}</h1><p><MapPin size={15}/>{project.province}{project.legacyProvince ? ` · dữ liệu cũ: ${project.legacyProvince}` : ""}<i/> {project.type}</p></div>
            <div className="public-detail-contract-highlight"><span>Giá trị hợp đồng</span><strong>{formatVnd(projectMoney(project))}</strong><small>{project.code}</small></div>
          </div>
        </div>
      </section>

      <section className="public-page-section public-project-detail-content">
        <div className="public-container">
          <div className="public-project-detail-finance">
            <article><WalletCards/><span>Giá trị hợp đồng</span><strong>{formatVnd(financial.contractValueVnd || project.contractValueVnd, "0 đồng")}</strong></article>
            <article><FileText/><span>Đề nghị thanh toán</span><strong>{formatVnd(financial.paymentRequestedVnd, "0 đồng")}</strong></article>
            <article><ShieldCheck/><span>Đã thanh toán</span><strong>{formatVnd(financial.paymentPaidVnd, "0 đồng")}</strong></article>
            <article><Database/><span>Phải thu còn lại</span><strong>{formatVnd(financial.outstandingReceivableVnd, "0 đồng")}</strong></article>
          </div>

          <div className="public-project-detail-layout">
            <div className="public-project-detail-main">
              <article className="public-detail-panel public-detail-map-panel">
                <div className="public-detail-panel-head"><div><MapPin/><span>Vị trí dự án</span></div><a href={mapHref} target="_blank" rel="noreferrer">Mở bản đồ <ArrowUpRight size={14}/></a></div>
                <PublicSingleProjectMap project={project} />
              </article>

              <article className="public-detail-panel">
                <div className="public-detail-panel-head"><div><Building2/><span>Chủ đầu tư & hợp đồng</span></div></div>
                <div className="public-project-detail-rows">
                  <DetailRow label="Chủ đầu tư" value={project.investor}/><DetailRow label="Mã khách hàng" value={project.customerCode}/><DetailRow label="Ngành chủ đầu tư" value={project.customerIndustry}/><DetailRow label="Quốc gia chủ đầu tư" value={project.investorCountry}/><DetailRow label="Số hợp đồng" value={project.contractNumber}/><DetailRow label="Gói thầu" value={project.packageName}/><DetailRow label="Vai trò nhà thầu" value={project.contractorRole}/><DetailRow label="Số bản ghi hợp đồng" value={financial.contractCount}/>
                </div>
              </article>

              <article className="public-detail-panel">
                <div className="public-detail-panel-head"><div><Ruler/><span>Quy mô thi công</span></div></div>
                <div className="public-project-detail-rows"><DetailRow label="Quy mô / phạm vi" value={project.scale}/><DetailRow label="Diện tích xây dựng" value={project.constructionArea}/><DetailRow label="Tổng diện tích sàn" value={project.floorArea}/><DetailRow label="Dải giá trị" value={project.valueRange}/><DetailRow label="Quốc gia dự án" value={project.projectCountry || "Việt Nam"}/><DetailRow label="Tọa độ" value={`${project.lat.toFixed(5)}, ${project.lng.toFixed(5)}`}/></div>
              </article>

              {project.description ? <article className="public-detail-panel"><div className="public-detail-panel-head"><div><FileText/><span>Mô tả dự án</span></div></div><p className="public-project-description">{project.description}</p></article> : null}
            </div>

            <aside className="public-project-detail-aside">
              <article className="public-detail-panel public-detail-progress-panel">
                <div className="public-detail-panel-head"><div><Wrench/><span>Tiến độ & quản trị</span></div></div>
                <div className="public-detail-progress-number"><strong>{project.progress}%</strong><span>tiến độ</span></div><div className="public-detail-progress-track"><i style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}/></div>
                <div className="public-project-detail-rows"><DetailRow label="Trạng thái" value={publicStatusLabels[project.status]}/><DetailRow label="Health score" value={project.healthScore !== undefined ? `${project.healthScore}/100` : undefined}/><DetailRow label="Độ đầy đủ dữ liệu" value={project.dataCompleteness !== undefined ? `${project.dataCompleteness}%` : undefined}/><DetailRow label="Rủi ro" value={project.risk}/><DetailRow label="Khởi công" value={project.startDate ? formatPublicDate(project.startDate) : undefined}/><DetailRow label="Kết thúc" value={project.endDate ? formatPublicDate(project.endDate) : undefined}/><DetailRow label="Nguồn dữ liệu" value={project.source}/><DetailRow label="Cập nhật" value={formatPublicDate(project.updatedAt)}/></div>
              </article>

              <article className="public-detail-panel">
                <div className="public-detail-panel-head"><div><Database/><span>Dữ liệu liên quan</span></div></div>
                <div className="public-detail-related-grid">
                  <div><strong>{related.contracts || 0}</strong><span>Hợp đồng</span></div><div><strong>{related.paymentRequests || 0}</strong><span>Thanh toán</span></div><div><strong>{related.debtLedgers || 0}</strong><span>Công nợ</span></div><div><strong>{related.documents || 0}</strong><span>Hồ sơ</span></div><div><strong>{related.equipment || 0}</strong><span>Thiết bị</span></div><div><strong>{related.tasks || 0}</strong><span>Công việc</span></div><div><strong>{related.dailyReports || 0}</strong><span>Nhật ký</span></div><div><strong>{related.bimModels || 0}</strong><span>BIM</span></div><div><strong>{related.warranties || 0}</strong><span>Bảo hành</span></div>
                </div>
              </article>

              <article className="public-detail-panel public-detail-date-panel"><CalendarDays/><div><span>Ngày ghi nhận</span><strong>{formatPublicDate(project.createdAt)}</strong></div></article>
            </aside>
          </div>
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
