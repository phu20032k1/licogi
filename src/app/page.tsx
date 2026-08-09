"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Building2, ChevronRight, CircuitBoard, Factory, HardHat,
  Landmark, LogIn, Mail, MapPin, MapPinned, Menu, Newspaper, Phone, Play, Power, Quote,
  Route, ShieldCheck, Sparkles, Users, X, Zap,
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import PublicAIAssistant from "../components/PublicAIAssistant";
import PublicCapabilityExplorer from "../components/PublicCapabilityExplorer";
import PublicLiveMetrics from "../components/PublicLiveMetrics";

const PublicProjectMap = dynamic(() => import("../components/PublicProjectMap"), { ssr: false, loading: () => <div className="public-map-skeleton">Đang khởi tạo dữ liệu dự án...</div> });

const navItems = [
  ["Trang chủ", "#trang-chu"],
  ["Dự án", "#du-an"],
  ["Quy mô", "#quy-mo"],
  ["Năng lực", "#nganh-hang"],
  ["Giới thiệu", "#gioi-thieu"],
  ["Tin tức", "#tin-tuc"],
] as const;

const sectors = [
  { title: "Công nghiệp & nhà máy", icon: Factory, code: "01", image: "/media/industrial.svg" },
  { title: "Dân dụng", icon: Building2, code: "02", image: "/media/infrastructure.svg" },
  { title: "Hạ tầng kỹ thuật", icon: Landmark, code: "03", image: "/media/infrastructure.svg" },
  { title: "Giao thông", icon: Route, code: "04", image: "/media/transport.svg" },
  { title: "Điện năng", icon: Power, code: "05", image: "/media/industrial.svg" },
  { title: "Vật liệu & thiết bị", icon: HardHat, code: "06", image: "/media/transport.svg" },
];

const news = [
  { date: "07.2026", title: "LICOGI 18 tổ chức Hội nghị giao ban tháng 6 năm 2026", href: "https://licogi18.com.vn/licogi-18-to-chuc-hoi-nghi-giao-ban-thang-6-nam-2026-10055410/", image: "/media/industrial.svg" },
  { date: "2026", title: "Công bố Chủ tịch HĐQT và Tổng Giám đốc nhiệm kỳ 2026–2031", href: "https://licogi18.com.vn/cong-ty-licogi-18-to-chuc-hoi-nghi-cong-bo-quyet-dinh-bau-chu-tich-hdqt-va-tong-giam-doc-cong-ty-nhiem-ky-2026-2031-10055355/", image: "/media/infrastructure.svg" },
  { date: "2026", title: "Đại hội đồng cổ đông thường niên năm 2026", href: "https://licogi18.com.vn/cong-ty-licogi-18-to-chuc-thanh-cong-dai-hoi-dong-co-dong-thuong-nien-nam-2026-10055330/", image: "/media/transport.svg" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    nodes.forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return <div className="public-site public-site-v2">
    <header className={`public-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="public-container public-header-inner">
        <BrandLogo />
        <nav className={`public-nav ${menuOpen ? "is-open" : ""}`}>
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="public-header-actions">
          <a className="public-header-phone" href="tel:+842213942550"><Phone size={15} /> 0221 3942 550</a>
          <Link href="/login" className="public-login"><LogIn size={16} /> Đăng nhập</Link>
          <button type="button" className="public-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main>
      <section id="trang-chu" className="public-hero public-hero-v2">
        <div className="public-hero-bg"><img src="/media/hero-construction.svg" alt="Công trình công nghiệp LICOGI 18.3" /></div>
        <div className="public-hero-grid" />
        <div className="public-container public-hero-content public-hero-content-v2">
          <div className="public-hero-copy" data-reveal>
            <span className="public-kicker public-kicker-light"><Sparkles size={15} /> LICOGI 18.3 · Hồ sơ năng lực số</span>
            <h1>Năng lực thi công.<br/><em>Mạng lưới dự án LICOGI 18.3.</em></h1>
            <div className="public-hero-actions">
              <a href="#du-an" className="public-primary-button"><MapPinned size={18} /> Xem dự án <ArrowRight size={17} /></a>
              <a href="#quy-mo" className="public-secondary-button">Tổng quan năng lực <ChevronRight size={17} /></a>
            </div>
          </div>

          <div className="public-hero-video-frame public-hero-video-portrait" data-reveal>
            <div className="public-hero-video-head"><span><i /> Video năng lực</span><b>LICOGI 18.3</b></div>
            <video controls poster="/media/hero-construction.svg" preload="metadata"><source src="/videos/licogi183-digital-intro.mp4" type="video/mp4" /></video>
            <div className="public-hero-video-caption"><Play size={15} /><span><strong>Công trường · Thiết bị · Quy trình</strong></span></div>
          </div>

          <div className="public-hero-dashboard" data-reveal><PublicLiveMetrics /></div>
        </div>
        <a href="#du-an" className="public-scroll-cue"><span /> Dự án</a>
      </section>

      <section id="du-an" className="public-section public-map-section public-project-section" data-reveal>
        <div className="public-container">
          <div className="public-section-heading public-section-heading-light">
            <div><span className="public-kicker public-kicker-light"><MapPinned size={14}/> Dự án</span><h2>Mạng lưới dự án tại Việt Nam</h2></div>
          </div>
          <PublicProjectMap />
        </div>
      </section>

      <div data-reveal><PublicCapabilityExplorer /></div>

      <section className="public-logo-strip public-capability-strip" data-reveal>
        <div className="public-container"><span>LICOGI 18.3</span><i /> <b>Công nghiệp</b><i /><b>Hạ tầng</b><i /><b>Giao thông</b><i /><b>Điện năng</b><i /><b>Vật liệu xây dựng</b></div>
      </section>

      <section id="nganh-hang" className="public-section public-sectors">
        <div className="public-container">
          <div className="public-section-heading" data-reveal>
            <div><span className="public-kicker"><Zap size={14} /> Năng lực thi công</span><h2>Các lĩnh vực triển khai</h2></div>
          </div>
          <div className="public-sector-grid">
            {sectors.map((sector) => { const Icon = sector.icon; return <article key={sector.title} className="public-sector-card" data-reveal>
              <div className="public-sector-image"><img src={sector.image} alt=""/><span>{sector.code}</span></div>
              <div className="public-sector-content"><span className="public-sector-icon"><Icon size={21} /></span><h3>{sector.title}</h3><a href="#quy-mo">Xem dự án liên quan <ArrowRight size={15}/></a></div>
            </article>; })}
          </div>
        </div>
      </section>

      <section id="gioi-thieu" className="public-section public-about">
        <div className="public-container public-about-grid">
          <div className="public-about-visual" data-reveal>
            <img src="/media/hero-construction.svg" alt="Công trường và năng lực thi công LICOGI 18.3" />
            <div className="public-about-badge"><strong>18.3</strong><span>Thành viên hệ sinh thái<br/>LICOGI 18</span></div>
            <div className="public-about-quote"><Quote size={19}/><p>Năng lực được thể hiện bằng dự án, địa bàn và dữ liệu thi công.</p></div>
          </div>
          <div className="public-about-copy" data-reveal>
            <span className="public-kicker"><Building2 size={14}/> Giới thiệu LICOGI 18.3</span>
            <h2>Nền tảng thi công thuộc hệ sinh thái LICOGI 18</h2>
            <p className="public-about-lead">Công ty Cổ phần Đầu tư và Xây dựng số 18.3 kế thừa kinh nghiệm tổ chức thi công và năng lực ngành xây dựng của LICOGI 18.</p>
            <div className="public-about-values">
              <div><ShieldCheck/><strong>Minh bạch</strong><span>Dữ liệu gắn với dự án</span></div>
              <div><CircuitBoard/><strong>Dữ liệu hóa</strong><span>Đồng bộ Data Center</span></div>
              <div><Users/><strong>Kết nối</strong><span>Khách hàng và đối tác</span></div>
            </div>
            <div className="public-contact-card">
              <div><MapPin/><span><small>Trụ sở</small>Số 98 Nguyễn Văn Linh, phường Mỹ Hào, tỉnh Hưng Yên</span></div>
              <div><Phone/><span><small>Điện thoại</small>(+84) 221.3942.550 / 551</span></div>
              <div><Mail/><span><small>Email</small>jsclicogi18.3@gmail.com</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-statement" data-reveal>
        <div className="public-container"><span>LICOGI 18.3</span><h2>Hồ sơ năng lực được cập nhật từ dữ liệu vận hành.</h2></div>
      </section>

      <section id="tin-tuc" className="public-section public-news">
        <div className="public-container">
          <div className="public-section-heading" data-reveal>
            <div><span className="public-kicker"><Newspaper size={14}/> Tin tức & hoạt động</span><h2>Hoạt động LICOGI 18</h2></div>
            <a href="https://licogi18.com.vn/" target="_blank" rel="noreferrer" className="public-outline-button">Trang tin chính thức <ArrowRight size={16}/></a>
          </div>
          <div className="public-news-grid">
            {news.map((item) => <article key={item.title} className="public-news-card" data-reveal><a href={item.href} target="_blank" rel="noreferrer" className="public-news-image"><img src={item.image} alt=""/><span>{item.date}</span></a><div><p>Tin doanh nghiệp</p><h3><a href={item.href} target="_blank" rel="noreferrer">{item.title}</a></h3><a href={item.href} target="_blank" rel="noreferrer" className="public-text-link">Đọc chi tiết <ArrowRight size={15}/></a></div></article>)}
          </div>
        </div>
      </section>

      <section className="public-cta" data-reveal>
        <div className="public-container public-cta-inner"><div><span>Kết nối</span><h2>Trao đổi về dự án và năng lực thi công.</h2></div><div><a href="mailto:jsclicogi18.3@gmail.com" className="public-primary-button"><Mail size={18}/> Liên hệ hợp tác</a><Link href="/login" className="public-secondary-button"><LogIn size={17}/> Đăng nhập quản trị</Link></div></div>
      </section>
    </main>

    <footer className="public-footer">
      <div className="public-container public-footer-grid">
        <div><BrandLogo inverse/><p>Hệ điều hành số cho tổng thầu EPC, kết nối năng lực, dữ liệu dự án và vận hành doanh nghiệp.</p></div>
        <div><strong>Liên kết</strong>{navItems.slice(1).map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>
        <div><strong>Thông tin công ty</strong><span>Mã doanh nghiệp: 0900273641</span><span>Vốn điều lệ: 100 tỷ đồng</span><span>Mỹ Hào, Hưng Yên, Việt Nam</span></div>
        <div><strong>Liên hệ</strong><a href="tel:+842213942550">(+84) 221.3942.550 / 551</a><a href="mailto:jsclicogi18.3@gmail.com">jsclicogi18.3@gmail.com</a><Link href="/login">Cổng quản trị nội bộ</Link></div>
      </div>
      <div className="public-container public-footer-bottom"><span>© 2026 LICOGI 18.3. All rights reserved.</span><span>Industrial Construction Operating System</span></div>
    </footer>

    <PublicAIAssistant />
  </div>;
}
