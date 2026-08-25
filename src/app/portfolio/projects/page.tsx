import PublicProjectsWorkspace from "../../../components/PublicProjectsWorkspace";
import { PublicProjectBootstrapProvider } from "../../../components/PublicProjectBootstrapContext";
import PublicSiteFrame from "../../../components/PublicSiteFrame";
import { getPublicMapProjects } from "../../../lib/publicProjectMapData";
import type { PublicProjectRecord } from "../../../lib/publicProject";

type Props = {
  searchParams: Promise<{
    status?: string | string[];
    type?: string | string[];
    q?: string | string[];
  }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function PublicProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialStatus = firstParam(params.status) || "all";
  const initialType = firstParam(params.type) || "all";
  const initialSearch = firstParam(params.q);

  let initialProjects: PublicProjectRecord[] = [];
  try {
    initialProjects = await getPublicMapProjects();
  } catch (error) {
    console.error("project directory bootstrap failed", error instanceof Error ? error.message : error);
  }

  return <PublicSiteFrame>
    <main className="public-page-main public-projects-route">
      <section className="public-page-hero public-page-hero-compact public-projects-hero-tight">
        <div className="public-container">
          <div><span>Danh mục công trình</span><h1>Công trình LICOGI 18.3</h1></div>
          <p>Bản đồ Việt Nam theo 34 tỉnh/thành sau sắp xếp · chọn tỉnh, điểm công trình hoặc bộ lọc để tự động đưa bản đồ tới đúng khu vực.</p>
        </div>
      </section>
      <section className="public-page-section public-projects-page-section">
        <div className="public-container">
          <PublicProjectBootstrapProvider initialProjects={initialProjects}>
            <PublicProjectsWorkspace initialStatus={initialStatus} initialType={initialType} initialSearch={initialSearch} />
          </PublicProjectBootstrapProvider>
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
