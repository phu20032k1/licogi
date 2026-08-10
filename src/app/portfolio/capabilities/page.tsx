import { Suspense } from "react";
import PublicCapabilitiesDirectory from "../../../components/PublicCapabilitiesDirectory";
import PublicSiteFrame from "../../../components/PublicSiteFrame";

export default function PublicCapabilitiesPage() {
  return <PublicSiteFrame>
    <main className="public-page-main">
      <section className="public-page-hero public-page-hero-compact">
        <div className="public-container"><span>Lĩnh vực thi công</span><h1>Năng lực theo từng nhóm công trình</h1></div>
      </section>
      <section className="public-page-section"><div className="public-container"><Suspense fallback={<div className="public-page-loading">Đang tải lĩnh vực...</div>}><PublicCapabilitiesDirectory /></Suspense></div></section>
    </main>
  </PublicSiteFrame>;
}
