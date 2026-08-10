"use client";

import Link from "next/link";
import { ArrowRight, MapPinned, Sparkles } from "lucide-react";
import PublicLiveMetrics from "../components/PublicLiveMetrics";
import PublicProjectPortfolio from "../components/PublicProjectPortfolio";
import PublicSiteFrame from "../components/PublicSiteFrame";
import PublicVideoRail from "../components/PublicVideoRail";

export default function HomePage() {
  return <PublicSiteFrame>
    <main>
      <section className="public-home-hero">
        <div className="public-container public-home-hero-grid">
          <div className="public-home-hero-copy" data-reveal="left">
            <span className="public-kicker"><Sparkles size={15}/> LICOGI 18.3 · Hồ sơ năng lực số</span>
            <h1>Năng lực xây dựng<br/><em>LICOGI 18.3</em></h1>
            <div className="public-home-hero-actions">
              <Link href="/portfolio/projects" className="public-primary-button"><MapPinned size={18}/> Xem dự án <ArrowRight size={16}/></Link>
              <Link href="/portfolio/overview" className="public-secondary-button">Tổng quan dữ liệu <ArrowRight size={16}/></Link>
            </div>
            <div className="public-home-video-wrap"><PublicVideoRail /></div>
          </div>
          <div className="public-home-hero-data" data-reveal="right"><PublicLiveMetrics /></div>
        </div>
      </section>

      <PublicProjectPortfolio />

      <section className="public-home-directory-links">
        <div className="public-container public-home-directory-grid">
          <Link href="/portfolio/capabilities"><span>01</span><strong>Lĩnh vực thi công</strong><small>Xem năng lực và dự án theo từng nhóm công trình.</small><ArrowRight size={18}/></Link>
          <Link href="/portfolio/locations"><span>02</span><strong>Địa bàn hoạt động</strong><small>Xem danh mục dự án theo tỉnh / thành sau sắp xếp.</small><ArrowRight size={18}/></Link>
          <Link href="/portfolio/overview"><span>03</span><strong>Dữ liệu tổng quan</strong><small>Xem hợp đồng, thanh toán, tiến độ và cơ cấu danh mục.</small><ArrowRight size={18}/></Link>
        </div>
      </section>
    </main>
  </PublicSiteFrame>;
}
