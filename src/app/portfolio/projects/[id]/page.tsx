import Link from "next/link";
import PublicProjectDetailClient from "../../../../components/PublicProjectDetailClient";
import PublicSiteFrame from "../../../../components/PublicSiteFrame";
import { getPublicMapProjects } from "../../../../lib/publicProjectMapData";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicProjectDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(String(rawId || "")).trim();
  const projects = await getPublicMapProjects();
  const project = projects.find((item) => item.id === id || item.code === id);

  if (!project) {
    return <PublicSiteFrame>
      <main className="public-page-main">
        <div className="public-container public-page-error public-detail-loading">
          Không tìm thấy hồ sơ dự án.<br/>
          <Link href="/portfolio/projects">Quay lại danh mục công trình</Link>
        </div>
      </main>
    </PublicSiteFrame>;
  }

  return <PublicProjectDetailClient project={project}/>;
}
