import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "LICOGI 18.3 | Industrial Construction OS",
  description: "Hệ điều hành quản trị số dành cho tổng thầu EPC LICOGI 18.3",
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
