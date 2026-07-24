"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Building2, CheckCircle2, ChevronRight, CircuitBoard, Factory, HardHat,
  Landmark, LogIn, Mail, Map, MapPin, MapPinned, Menu, Newspaper, Phone, Play, Power, Quote,
  Route, ShieldCheck, Sparkles, Users, X, Zap,
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import PublicAIAssistant from "../components/PublicAIAssistant";

const PublicProjectMap = dynamic(() => import("../components/PublicProjectMap"), { ssr: false, loading: () => <div className="public-map-skeleton">Đang khởi tạo bản đồ dự án...</div> });

const navItems = [
  ["Trang chủ", "#trang-chu"],
  ["Danh sách ngành hàng", "#nganh-hang"],
  ["Giới thiệu", "#gioi-thieu"],
  ["Bản đồ", "#ban-do"],
  ["Video", "#video"],
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

  return <div className="public-site">
    <header className={`public-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="public-container public-header-inner">
        <BrandLogo />
        <nav className={`public-nav ${menuOpen ? "is-open" : ""}`}>
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="public-header-actions">
          <a className="public-header-phone" href="tel:+842213942550"><Phone size={15} /> 0221 3942 550</a>
          <Link href="/login" className="public-login"><LogIn size={16} /> Đăng nhập</Link>
          <button type="button" className="public-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Mở menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main>
      <section id="trang-chu" className="public-hero">
        <div className="public-hero-bg"><img src="/media/hero-construction.svg" alt="Minh họa công trình công nghiệp và bản đồ dữ liệu" /></div>
        <div className="public-hero-grid" />
        <div className="public-container public-hero-content">
          <div className="public-hero-copy">
            <span className="public-kicker public-kicker-light"><Sparkles size={15} /> Tổng thầu số · Dữ liệu sống · Năng lực thực chiến</span>
            <h1>Kiến tạo hạ tầng.<br/><em>Dẫn dắt phát triển.</em></h1>
            <p>Không chỉ giới thiệu doanh nghiệp, nền tảng mới giúp LICOGI 18.3 chứng minh năng lực bằng dữ liệu dự án, bản đồ GIS, video công trường và hệ điều hành quản trị số.</p>
            <div className="public-hero-actions">
              <a href="#ban-do" className="public-primary-button"><Map size={18} /> Khám phá bản đồ dự án <ArrowRight size={17} /></a>
              <a href="#gioi-thieu" className="public-secondary-button">Về LICOGI 18.3 <ChevronRight size={17} /></a>
            </div>
            <div className="public-hero-trust">
              <span><CheckCircle2 /> Bề dày hệ sinh thái LICOGI</span>
              <span><CheckCircle2 /> Năng lực đa ngành</span>
              <span><CheckCircle2 /> Số hóa quản trị EPC</span>
            </div>
          </div>

          <div className="public-hero-dashboard">
            <div className="public-dashboard-head"><span><i /> Dữ liệu năng lực</span><b>LIVE</b></div>
            <div className="public-dashboard-number"><strong>360°</strong><span>Góc nhìn toàn diện<br/>về dự án và nguồn lực</span></div>
            <div className="public-dashboard-bars">
              <div><span>Năng lực công nghiệp</span><b>92%</b><i><em style={{ width: "92%" }} /></i></div>
              <div><span>Hạ tầng & giao thông</span><b>86%</b><i><em style={{ width: "86%" }} /></i></div>
              <div><span>Quản trị dữ liệu</span><b>78%</b><i><em style={{ width: "78%" }} /></i></div>
            </div>
            <div className="public-dashboard-modules">
              <span><MapPin /> GIS Map</span><span><CircuitBoard /> AI Profile</span><span><ShieldCheck /> EPC OS</span>
            </div>
          </div>
        </div>
        <a href="#nganh-hang" className="public-scroll-cue"><span /> Khám phá năng lực</a>
      </section>

      <section className="public-logo-strip">
        <div className="public-container"><span>LICOGI 18.3</span><i /> <b>Công nghiệp</b><i /><b>Hạ tầng</b><i /><b>Giao thông</b><i /><b>Điện năng</b><i /><b>Vật liệu xây dựng</b></div>
      </section>

      <section id="nganh-hang" className="public-section public-sectors">
        <div className="public-container">
          <div className="public-section-heading">
            <div><span className="public-kicker"><Zap size={14} /> Danh sách ngành hàng</span><h2>Năng lực thi công đa lĩnh vực</h2></div>
            <p>Từ công trình công nghiệp đến hạ tầng kỹ thuật, mỗi nhóm ngành hàng được trình bày trực quan và có thể liên kết trực tiếp với dữ liệu dự án trên bản đồ.</p>
          </div>
          <div className="public-sector-grid">
            {sectors.map((sector) => { const Icon = sector.icon; return <article key={sector.title} className="public-sector-card">
              <div className="public-sector-image"><img src={sector.image} alt=""/><span>{sector.code}</span></div>
              <div className="public-sector-content"><span className="public-sector-icon"><Icon size={21} /></span><h3>{sector.title}</h3><p>{sector.desc}</p><a href="#ban-do">Xem dự án liên quan <ArrowRight size={15}/></a></div>
            </article>; })}
          </div>
        </div>
      </section>

      <section id="gioi-thieu" className="public-section public-about">
        <div className="public-container public-about-grid">
          <div className="public-about-visual">
            <img src="/media/hero-construction.svg" alt="Công trường và năng lực thi công LICOGI 18.3" />
            <div className="public-about-badge"><strong>18.3</strong><span>Thành viên hệ sinh thái<br/>LICOGI 18</span></div>
            <div className="public-about-quote"><Quote size={19}/><p>Chuyển từ “giới thiệu công ty” sang “chứng minh năng lực thực chiến”.</p></div>
          </div>
          <div className="public-about-copy">
            <span className="public-kicker"><Building2 size={14}/> Giới thiệu LICOGI 18.3</span>
            <h2>Đơn vị xây dựng trưởng thành từ nền tảng thi công và quản trị của LICOGI 18</h2>
            <p className="public-about-lead">Công ty Cổ phần Đầu tư và Xây dựng số 18.3 được chuyển đổi từ Chi nhánh Hưng Yên của LICOGI 18, kế thừa năng lực tổ chức thi công, kinh nghiệm và hệ sinh thái ngành xây dựng.</p>
            <p>Định hướng website mới tập trung vào minh bạch dữ liệu, cập nhật dự án theo thời gian thực và kết nối năng lực công nghiệp, dân dụng, hạ tầng, giao thông, điện năng, vật liệu xây dựng trên một nền tảng thống nhất.</p>
            <div className="public-about-values">
              <div><ShieldCheck/><strong>Minh bạch</strong><span>Dữ liệu dự án rõ ràng</span></div>
              <div><CircuitBoard/><strong>Thông minh</strong><span>AI hỗ trợ khai thác tri thức</span></div>
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
        <div className="public-container"><span>LICOGI 18.3 INDUSTRIAL CONSTRUCTION OPERATING SYSTEM</span><h2>Biến dữ liệu dự án thành lợi thế cạnh tranh.</h2><p>Một nguồn dữ liệu, hai góc nhìn: trải nghiệm công khai thuyết phục khách hàng và bản đồ quản trị hỗ trợ điều hành nội bộ.</p></div>
      </section>

      <section id="ban-do" className="public-section public-map-section">
        <div className="public-container">
          <div className="public-section-heading public-section-heading-light">
            <div><span className="public-kicker public-kicker-light"><MapPinned size={14}/> Bản đồ GIS</span><h2>Dự án hiện lên ngay sau khi import dữ liệu</h2></div>
            <p>Mỗi marker có ký hiệu theo ngành hàng và màu theo trạng thái. Dữ liệu được dùng đồng thời cho trang chủ và trang quản trị.</p>
          </div>
          <PublicProjectMap />
        </div>
      </section>

      <section id="video" className="public-section public-video-section">
        <div className="public-container public-video-grid">
          <div className="public-video-copy">
            <span className="public-kicker"><Play size={14}/> Video năng lực</span>
            <h2>Kể câu chuyện công trình bằng hình ảnh chuyển động</h2>
            <p>Khu vực video được thiết kế để giới thiệu công trường, quy trình thi công, thiết bị và những dấu mốc dự án. Tệp video mẫu đã được tích hợp sẵn và có thể thay bằng video doanh nghiệp bất cứ lúc nào.</p>
            <ul><li><CheckCircle2/> Video giới thiệu thương hiệu</li><li><CheckCircle2/> Nhật ký công trường theo dự án</li><li><CheckCircle2/> Hình ảnh trước – trong – sau thi công</li></ul>
            <a href="#tin-tuc" className="public-text-link">Xem hoạt động mới nhất <ArrowRight size={16}/></a>
          </div>
          <div className="public-video-player">
            <video controls poster="/media/hero-construction.svg" preload="metadata"><source src="/videos/licogi183-digital-intro.mp4" type="video/mp4"/></video>
            <span className="public-video-label"><i/> LICOGI 18.3 · DIGITAL INTRO</span>
          </div>
        </div>
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
