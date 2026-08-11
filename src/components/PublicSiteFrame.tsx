"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import usePublicLanguage from "../hooks/usePublicLanguage";
import PublicAIAssistant from "./PublicAIAssistant";
import PublicBrandMark from "./PublicBrandMark";
import PublicLanguageSwitcher from "./PublicLanguageSwitcher";

export const publicNavItems = [
  { key: "home", label: "TRANG CHỦ", href: "/" },
  { key: "projects", label: "CÔNG TRÌNH", href: "/portfolio/projects" },
  { key: "investment", label: "DỰ ÁN ĐẦU TƯ", href: "/portfolio/overview" },
  { key: "about", label: "GIỚI THIỆU", href: "/portfolio/about" },
  { key: "shareholders", label: "QUAN HỆ CỔ ĐÔNG", href: "/#quan-he-co-dong" },
  { key: "news", label: "TIN TỨC", href: "/#tin-tuc" },
  { key: "contact", label: "LIÊN HỆ", href: "/#lien-he" },
] as const;

const NAV_COPY = {
  vi: { home: "TRANG CHỦ", projects: "CÔNG TRÌNH", investment: "DỰ ÁN ĐẦU TƯ", about: "GIỚI THIỆU", shareholders: "QUAN HỆ CỔ ĐÔNG", news: "TIN TỨC", contact: "LIÊN HỆ" },
  en: { home: "HOME", projects: "PROJECTS", investment: "INVESTMENT", about: "ABOUT", shareholders: "INVESTORS", news: "NEWS", contact: "CONTACT" },
  ja: { home: "ホーム", projects: "施工実績", investment: "投資事業", about: "会社情報", shareholders: "株主情報", news: "ニュース", contact: "お問い合わせ" },
  ko: { home: "홈", projects: "프로젝트", investment: "투자사업", about: "회사소개", shareholders: "주주관계", news: "뉴스", contact: "문의" },
  zh: { home: "首页", projects: "工程项目", investment: "投资项目", about: "公司介绍", shareholders: "股东关系", news: "新闻", contact: "联系" },
} as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicSiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = usePublicLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = NAV_COPY[language];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
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
        node.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 42}ms`);
        observer.observe(node);
      });
      (window as typeof window & { __licogiRevealObserver?: IntersectionObserver }).__licogiRevealObserver?.disconnect();
      (window as typeof window & { __licogiRevealObserver?: IntersectionObserver }).__licogiRevealObserver = observer;
    });
    return () => {
      window.cancelAnimationFrame(frame);
      (window as typeof window & { __licogiRevealObserver?: IntersectionObserver }).__licogiRevealObserver?.disconnect();
    };
  }, [pathname]);

  return <div className="public-site public-site-v2 public-multipage-site">
    <header className={`public-header public-header-pages ${scrolled ? "is-scrolled" : ""}`}>
      <div className="public-container public-header-inner">
        <Link href="/" className="public-brand-link" aria-label="LICOGI 18.3 - Trang chủ"><PublicBrandMark /></Link>
        <nav className={`public-nav public-page-nav ${menuOpen ? "is-open" : ""}`} aria-label="Điều hướng chính">
          {publicNavItems.map((item) => <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "is-active" : ""}>{nav[item.key]}</Link>)}
        </nav>
        <div className="public-header-actions">
          <PublicLanguageSwitcher />
          <button type="button" className="public-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    {children}

    <footer className="public-footer public-page-footer">
      <div className="public-container public-footer-grid">
        <div><PublicBrandMark inverse/><p>Hồ sơ năng lực số, danh mục dự án và dữ liệu vận hành LICOGI 18.3.</p></div>
        <div><strong>Điều hướng</strong>{publicNavItems.slice(1).map((item) => <Link key={item.href} href={item.href}>{nav[item.key]}</Link>)}</div>
        <div><strong>Thông tin công ty</strong><span>Mã doanh nghiệp: 0900273641</span><span>Vốn điều lệ: 100 tỷ đồng</span><span>Mỹ Hào, Hưng Yên, Việt Nam</span></div>
        <div><strong>Liên hệ</strong><a href="tel:+842213942550">(+84) 221.3942.550 / 551</a><a href="mailto:jsclicogi18.3@gmail.com"><Mail size={14}/> jsclicogi18.3@gmail.com</a><Link href="/login">Cổng quản trị nội bộ</Link></div>
      </div>
      <div className="public-container public-footer-bottom"><span>© 2026 LICOGI 18.3. All rights reserved.</span><span>Industrial Construction Operating System</span></div>
    </footer>
    <PublicAIAssistant />
  </div>;
}
