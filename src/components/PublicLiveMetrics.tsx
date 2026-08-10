"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, Factory, MapPin, WalletCards } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, sumProjectMoney } from "../lib/publicProject";

export default function PublicLiveMetrics() {
  const { projects, loading } = usePublicProjects();
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const provinces = new Set(projects.map((project) => project.province).filter(Boolean)).size;
  const sectors = new Set(projects.map((project) => project.type).filter(Boolean)).size;
  const contractValue = sumProjectMoney(projects);

  const metrics = [
    { label: "Tổng công trình", value: loading ? "—" : String(projects.length), href: "/projects", icon: Building2 },
    { label: "Đã hoàn thành", value: loading ? "—" : String(completed.length), href: "/projects?status=completed", icon: CheckCircle2 },
    { label: "Đang thi công", value: loading ? "—" : String(ongoing.length), href: "/projects?status=ongoing", icon: Factory },
    { label: "Tổng giá trị hợp đồng", value: loading ? "—" : formatVnd(contractValue, "0 đồng"), href: "/overview", icon: WalletCards, wide: true },
    { label: "Tỉnh / thành", value: loading ? "—" : String(provinces), href: "/locations", icon: MapPin },
    { label: "Lĩnh vực", value: loading ? "—" : String(sectors), href: "/capabilities", icon: Factory },
  ];

  return <section className="public-live-overview public-live-overview-simple" aria-label="Tổng quan dữ liệu năng lực">
    <div className="public-live-overview-head">
      <div><span><i /> Dữ liệu trực tiếp</span><strong>Tổng quan hoạt động</strong></div>
      <Link href="/overview">Xem chi tiết <ArrowUpRight size={14}/></Link>
    </div>
    <div className="public-simple-metric-grid">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return <Link key={metric.label} href={metric.href} className={metric.wide ? "is-wide" : ""}>
          <span><Icon size={17}/>{metric.label}</span>
          <strong>{metric.value}</strong>
          <ArrowUpRight className="public-simple-metric-arrow" size={15}/>
        </Link>;
      })}
    </div>
  </section>;
}
