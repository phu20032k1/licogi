import { Suspense } from "react";
import PublicProjectsWorkspace from "../../../components/PublicProjectsWorkspace";
import { PublicProjectBootstrapProvider } from "../../../components/PublicProjectBootstrapContext";
import PublicSiteFrame from "../../../components/PublicSiteFrame";
import { getPublicMapProjects } from "../../../lib/publicProjectMapData";
import type { PublicProjectRecord } from "../../../lib/publicProject";

export default async function PublicProjectsPage() {
  let initialProjects: PublicProjectRecord[] = [];
  try {
    initialProjects = await getPublicMapProjects();
  } catch (error) {
    console.error("project directory bootstrap failed", error instanceof Error ? error.message : error);
  }

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
          <PublicProjectBootstrapProvider initialProjects={initialProjects}>
            <Suspense fallback={<div className="public-page-loading">Đang khởi tạo danh mục dự án...</div>}>
              <PublicProjectsWorkspace />
            </Suspense>
          </PublicProjectBootstrapProvider>
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
