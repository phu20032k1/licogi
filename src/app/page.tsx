"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Building2, CheckCircle2, ChevronRight, CircuitBoard, Factory, HardHat,
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
  { title: "Công nghiệp & nhà máy", desc: "Thi công nhà máy, kho vận, khu công nghiệp và các công trình công nghiệp quy mô lớn.", icon: Factory, code: "01", image: "/media/industrial.svg" },
  { title: "Dân dụng", desc: "Công trình dân dụng, đô thị, dịch vụ và hạ tầng xã hội với quy trình kiểm soát chất lượng chặt chẽ.", icon: Building2, code: "02", image: "/media/infrastructure.svg" },
  { title: "Hạ tầng kỹ thuật", desc: "Hạ tầng khu công nghiệp, san nền, cấp thoát nước và hệ thống kỹ thuật đồng bộ.", icon: Landmark, code: "03", image: "/media/infrastructure.svg" },
  { title: "Giao thông", desc: "Đường, cầu và các hạng mục giao thông phục vụ kết nối vùng và phát triển công nghiệp.", icon: Route, code: "04", image: "/media/transport.svg" },
  { title: "Điện năng", desc: "Thi công công trình điện, trạm và hạ tầng năng lượng phục vụ sản xuất và đô thị.", icon: Power, code: "05", image: "/media/industrial.svg" },
  { title: "Vật liệu & thiết bị", desc: "Bê tông thương phẩm, vật liệu xây dựng, kết cấu kim loại, thiết bị thi công và dịch vụ kiểm định.", icon: HardHat, code: "06", image: "/media/transport.svg" },
];

const news = [
  { date: "07.2026", title: "LICOGI 18 tổ chức Hội nghị giao ban tháng 6 năm 2026", excerpt: "Cập nhật công tác điều hành, sản xuất kinh doanh và những nhiệm vụ trọng tâm trong giai đoạn tiếp theo.", href: "https://licogi18.com.vn/licogi-18-to-chuc-hoi-nghi-giao-ban-thang-6-nam-2026-10055410/", image: "/media/industrial.svg" },
  { date: "2026", title: "Công bố Chủ tịch HĐQT và Tổng Giám đốc nhiệm kỳ 2026–2031", excerpt: "Kiện toàn bộ máy lãnh đạo, tạo nền tảng quản trị vững chắc cho chiến lược phát triển mới.", href: "https://licogi18.com.vn/cong-ty-licogi-18-to-chuc-hoi-nghi-cong-bo-quyet-dinh-bau-chu-tich-hdqt-va-tong-giam-doc-cong-ty-nhiem-ky-2026-2031-10055355/", image: "/media/infrastructure.svg" },
  { date: "2026", title: "Đại hội đồng cổ đông thường niên năm 2026", excerpt: "Thông qua các định hướng quan trọng về quản trị, đầu tư và kế hoạch sản xuất kinh doanh.", href: "https://licogi18.com.vn/cong-ty-licogi-18-to-chuc-thanh-cong-dai-hoi-dong-co-dong-thuong-nien-nam-2026-10055330/", image: "/media/transport.svg" },
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
          <div className="public-hero-copy">
            <span className="public-kicker public-kicker-light"><Sparkles size={15} /> Năng lực xây dựng được chứng minh bằng dữ liệu</span>
            <h1>Quy mô thật.<br/><em>Dự án thật.</em><br/>Năng lực nhìn thấy được.</h1>
            <p>Trang chủ LICOGI 18.3 tổng hợp trực tiếp dữ liệu dự án để thể hiện phạm vi hoạt động theo tỉnh/thành, quốc gia, lĩnh vực, chủ đầu tư, quy mô và tiến độ. Mỗi con số đều có thể mở ra danh sách dự án đứng phía sau.</p>
            <div className="public-hero-actions">
              <a href="#du-an" className="public-primary-button"><MapPinned size={18} /> Khám phá dự án <ArrowRight size={17} /></a>
              <a href="#quy-mo" className="public-secondary-button">Xem quy mô năng lực <ChevronRight size={17} /></a>
            </div>
            <div className="public-hero-trust">
              <span><CheckCircle2 /> Dữ liệu cập nhật từ Data Center</span>
              <span><CheckCircle2 /> Theo dõi đa tỉnh/thành</span>
              <span><CheckCircle2 /> Liên kết GIS và hồ sơ dự án</span>
            </div>
          </div>

          <div className="public-hero-media">
            <div className="public-hero-video-frame">
              <div className="public-hero-video-head"><span><i /> Video năng lực</span><b>LICOGI 18.3</b></div>
              <video controls poster="/media/hero-construction.svg" preload="metadata"><source src="/videos/licogi183-digital-intro.mp4" type="video/mp4" /></video>
              <div className="public-hero-video-caption"><Play size={15} /><span><strong>Công trường · Thiết bị · Quy trình</strong><small>Khung video nằm ngay đầu trang để khách hàng nhìn thấy năng lực thi công trước khi đi sâu vào dữ liệu.</small></span></div>
            </div>
            <PublicLiveMetrics />
          </div>
        </div>
        <a href="#du-an" className="public-scroll-cue"><span /> Xem mạng lưới dự án</a>
      </section>

      <section id="du-an" className="public-section public-map-section public-project-section">
        <div className="public-container">
          <div className="public-section-heading public-section-heading-light">
            <div><span className="public-kicker public-kicker-light"><MapPinned size={14}/> Dự án</span><h2>Mạng lưới dự án tập trung tại Việt Nam.</h2></div>
            <p>Marker được tạo từ dữ liệu tọa độ thực hoặc tọa độ tỉnh/thành. Bấm vào từng điểm để xem dự án, chủ đầu tư, quốc gia, lĩnh vực, quy mô, giá trị và tiến độ; dùng tìm kiếm để chuyển tới dữ liệu ngoài Việt Nam khi có.</p>
          </div>
          <PublicProjectMap />
        </div>
      </section>

      <PublicCapabilityExplorer />

      <section className="public-logo-strip public-capability-strip">
        <div className="public-container"><span>LICOGI 18.3</span><i /> <b>Công nghiệp</b><i /><b>Hạ tầng</b><i /><b>Giao thông</b><i /><b>Điện năng</b><i /><b>Vật liệu xây dựng</b></div>
      </section>

      <section id="nganh-hang" className="public-section public-sectors">
        <div className="public-container">
          <div className="public-section-heading">
            <div><span className="public-kicker"><Zap size={14} /> Năng lực thi công</span><h2>Đa lĩnh vực, liên kết trực tiếp với dữ liệu dự án.</h2></div>
            <p>Mỗi nhóm năng lực là một cửa vào dữ liệu thực tế. Khách hàng có thể xem dự án liên quan thay vì chỉ đọc mô tả năng lực chung.</p>
          </div>
          <div className="public-sector-grid">
            {sectors.map((sector) => { const Icon = sector.icon; return <article key={sector.title} className="public-sector-card">
              <div className="public-sector-image"><img src={sector.image} alt=""/><span>{sector.code}</span></div>
              <div className="public-sector-content"><span className="public-sector-icon"><Icon size={21} /></span><h3>{sector.title}</h3><p>{sector.desc}</p><a href="#quy-mo">Xem dữ liệu năng lực <ArrowRight size={15}/></a></div>
            </article>; })}
          </div>
        </div>
      </section>

      <section id="gioi-thieu" className="public-section public-about">
        <div className="public-container public-about-grid">
          <div className="public-about-visual">
            <img src="/media/hero-construction.svg" alt="Công trường và năng lực thi công LICOGI 18.3" />
            <div className="public-about-badge"><strong>18.3</strong><span>Thành viên hệ sinh thái<br/>LICOGI 18</span></div>
            <div className="public-about-quote"><Quote size={19}/><p>Năng lực không chỉ được mô tả — năng lực được mở ra từ từng dự án, từng địa phương và từng dữ liệu thi công.</p></div>
          </div>
          <div className="public-about-copy">
            <span className="public-kicker"><Building2 size={14}/> Giới thiệu LICOGI 18.3</span>
            <h2>Nền tảng thi công của LICOGI 18, được mở rộng bằng quản trị dữ liệu hiện đại.</h2>
            <p className="public-about-lead">Công ty Cổ phần Đầu tư và Xây dựng số 18.3 được chuyển đổi từ Chi nhánh Hưng Yên của LICOGI 18, kế thừa năng lực tổ chức thi công, kinh nghiệm và hệ sinh thái ngành xây dựng.</p>
            <p>Website công khai được thiết kế như một hồ sơ năng lực sống: dữ liệu dự án, địa bàn, quốc gia, chủ đầu tư, quy mô và trạng thái được kết nối trên cùng một trải nghiệm để khách hàng có thể kiểm chứng sâu hơn.</p>
            <div className="public-about-values">
              <div><ShieldCheck/><strong>Minh bạch</strong><span>Con số đi cùng dự án nguồn</span></div>
              <div><CircuitBoard/><strong>Dữ liệu hóa</strong><span>Data Center đồng bộ toàn hệ thống</span></div>
              <div><Users/><strong>Kết nối</strong><span>Khách hàng, đối tác, nội bộ</span></div>
            </div>
            <div className="public-contact-card">
              <div><MapPin/><span><small>Trụ sở</small>Số 98 Nguyễn Văn Linh, phường Mỹ Hào, tỉnh Hưng Yên</span></div>
              <div><Phone/><span><small>Điện thoại</small>(+84) 221.3942.550 / 551</span></div>
              <div><Mail/><span><small>Email</small>jsclicogi18.3@gmail.com</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-statement">
        <div className="public-container"><span>LICOGI 18.3 · DATA-DRIVEN CONSTRUCTION CAPABILITY</span><h2>Từ hồ sơ năng lực tĩnh thành một hệ thống chứng minh năng lực.</h2><p>Một nguồn dữ liệu được dùng để giới thiệu quy mô ra bên ngoài và đồng thời hỗ trợ quản trị dự án bên trong doanh nghiệp.</p></div>
      </section>

      <section id="tin-tuc" className="public-section public-news">
        <div className="public-container">
          <div className="public-section-heading">
            <div><span className="public-kicker"><Newspaper size={14}/> Tin tức & hoạt động</span><h2>Dấu ấn mới của hệ sinh thái LICOGI 18</h2></div>
            <a href="https://licogi18.com.vn/" target="_blank" rel="noreferrer" className="public-outline-button">Xem trang tin chính thức <ArrowRight size={16}/></a>
          </div>
          <div className="public-news-grid">
            {news.map((item) => <article key={item.title} className="public-news-card"><a href={item.href} target="_blank" rel="noreferrer" className="public-news-image"><img src={item.image} alt=""/><span>{item.date}</span></a><div><p>Tin doanh nghiệp</p><h3><a href={item.href} target="_blank" rel="noreferrer">{item.title}</a></h3><span>{item.excerpt}</span><a href={item.href} target="_blank" rel="noreferrer" className="public-text-link">Đọc chi tiết <ArrowRight size={15}/></a></div></article>)}
          </div>
        </div>
      </section>

      <section className="public-cta">
        <div className="public-container public-cta-inner"><div><span>Sẵn sàng kết nối</span><h2>Cùng kiến tạo những công trình bền vững.</h2><p>Liên hệ LICOGI 18.3 để trao đổi về dự án, năng lực thi công và cơ hội hợp tác.</p></div><div><a href="mailto:jsclicogi18.3@gmail.com" className="public-primary-button"><Mail size={18}/> Gửi yêu cầu hợp tác</a><Link href="/login" className="public-secondary-button"><LogIn size={17}/> Đăng nhập quản trị</Link></div></div>
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
