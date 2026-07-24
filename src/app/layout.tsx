import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LICOGI 18.3 | Kiến tạo hạ tầng - Dẫn dắt phát triển", template: "%s | LICOGI 18.3" },
  description: "Website năng lực và hệ điều hành quản trị số dành cho LICOGI 18.3: ngành hàng, bản đồ GIS, dự án, video, tin tức và trợ lý AI.",
  icons: { icon: "/brand/licogi183-logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
