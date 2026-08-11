"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import PublicAIAssistant from "./PublicAIAssistant";
import PublicLanguageSwitcher from "./PublicLanguageSwitcher";

export const publicNavItems = [
  { label: "TRANG CHỦ", href: "/" },
  { label: "CÔNG TRÌNH", href: "/portfolio/projects" },
  { label: "DỰ ÁN ĐẦU TƯ", href: "/portfolio/overview" },
  { label: "GIỚI THIỆU", href: "/portfolio/about" },
  { label: "QUAN HỆ CỔ ĐÔNG", href: "/#quan-he-co-dong" },
  { label: "TIN TỨC", href: "/#tin-tuc" },
  { label: "LIÊN HỆ", href: "/#lien-he" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicSiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        <Link href="/" className="public-brand-link" aria-label="LICOGI 18.3 - Trang chủ"><BrandLogo /></Link>
        <nav className={`public-nav public-page-nav ${menuOpen ? "is-open" : ""}`} aria-label="Điều hướng chính">
          {publicNavItems.map((item) => <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "is-active" : ""}>{item.label}</Link>)}
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
        <div><BrandLogo inverse/><p>Hồ sơ năng lực số, danh mục dự án và dữ liệu vận hành LICOGI 18.3.</p></div>
        <div><strong>Điều hướng</strong>{publicNavItems.slice(1).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
        <div><strong>Thông tin công ty</strong><span>Mã doanh nghiệp: 0900273641</span><span>Vốn điều lệ: 100 tỷ đồng</span><span>Mỹ Hào, Hưng Yên, Việt Nam</span></div>
        <div><strong>Liên hệ</strong><a href="tel:+842213942550">(+84) 221.3942.550 / 551</a><a href="mailto:jsclicogi18.3@gmail.com"><Mail size={14}/> jsclicogi18.3@gmail.com</a><Link href="/login">Cổng quản trị nội bộ</Link></div>
      </div>
      <div className="public-container public-footer-bottom"><span>© 2026 LICOGI 18.3. All rights reserved.</span><span>Industrial Construction Operating System</span></div>
    </footer>
    <PublicAIAssistant />
  </div>;
}
