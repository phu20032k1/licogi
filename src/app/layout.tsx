import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import AppShell from "../components/AppShell";
import HorizontalScrollReset from "../components/HorizontalScrollReset";
import { siteConfig } from "../lib/siteConfig";
import "./globals.css";
import "./production.css";
import "./map-professional.css";
import "./home-overview.css";
import "./vietnamese-typography.css";
import "./public-enterprise.css";
import "./public-refresh.css";
import "./public-pages.css";
import "./homepage-restore.css";
import "./homepage-overview-upgrade.css";
import "./public-typography-upgrade.css";
import "./home-hero-asset.css";
import "./mobile-polish.css";
import "./mobile-icons.css";
import "./mobile-floating.css";
import "./mobile-universal.css";
import "./photo-background.css";
import "./phone-only-v2.css";
import "./phone-route-fixes.css";
import "./phone-touch-data-fixes.css";
import "./phone-directory-visibility.css";
import "./homepage-reference.css";
import "./homepage-compact-fix.css";
import "./homepage-kpi-selector-fix.css";
import "./homepage-hero-cache-final.css";
import "./homepage-click-cards-reference.css";
import "./homepage-click-cards-reference-v2.css";
import "./homepage-click-cards-simplemaps-url.css";
import "./public-map-2026.css";
import "./public-map-marker-layout-hotfix.css";
import "./public-map-layout-final.css";
import "./homepage-map-hard-reset.css";
import "./map-ui-polish-final.css";
import "./catalog-investment-polish-final.css";
import "./mobile-enterprise.css";
import "./mobile-premium.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-licogi",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "LICOGI 18.3 | Năng lực xây dựng & danh mục dự án",
    template: "%s | LICOGI 18.3",
  },
  description: siteConfig.description,
  applicationName: siteConfig.productName,
  category: "construction",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand/licogi183-logo.svg", shortcut: "/brand/licogi183-logo.svg" },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: "LICOGI 18.3",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: "LICOGI 18.3 | Năng lực xây dựng & danh mục dự án",
    description: siteConfig.description,
    images: [{ url: "/media/hero-construction.svg", width: 1400, height: 900, alt: "LICOGI 18.3 Industrial Construction" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LICOGI 18.3 | Năng lực xây dựng & danh mục dự án",
    description: siteConfig.description,
    images: ["/media/hero-construction.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f8fa",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={beVietnamPro.variable}>
        <HorizontalScrollReset />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
