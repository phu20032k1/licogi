import { Suspense } from "react";
import PublicProjectsWorkspace from "../../../components/PublicProjectsWorkspace";
import PublicSiteFrame from "../../../components/PublicSiteFrame";

export default function PublicProjectsPage() {
  return <PublicSiteFrame>
    <main className="public-page-main public-projects-route">
      <section className="public-page-hero public-page-hero-compact">
        <div className="public-container">
          <span>Danh mục dự án</span>
          <h1>Dự án LICOGI 18.3</h1>
        </div>
      </section>
      <section className="public-page-section public-projects-page-section">
        <div className="public-container">
          <Suspense fallback={<div className="public-page-loading">Đang khởi tạo danh mục dự án...</div>}>
            <PublicProjectsWorkspace />
          </Suspense>
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
