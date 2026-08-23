"use client";

import { useMemo, useState } from "react";
import { currentVietnamProvinces, normalizeProvinceName, type ProjectType } from "../data/projects";
import { vietnamPostMergerProvinces } from "../data/vietnamPostMergerMap";
import usePublicProjects from "../hooks/usePublicProjects";
import type { PublicLanguage } from "../hooks/usePublicLanguage";
import type { PublicProjectRecord } from "../lib/publicProject";
import { projectTypeVisuals } from "../lib/projectMapVisuals";
import styles from "./HomepageVietnamProjectMap.module.css";

const VIEW_X = 35;
const VIEW_Y = 0;
const VIEW_WIDTH = 375;
const VIEW_HEIGHT = 735;
const KNOWN_PROJECT_TYPES = Object.keys(projectTypeVisuals) as ProjectType[];

const COPY: Record<PublicLanguage, { title: string; projects: string; ongoing: string; value: string; fields: string; open: string; legend: string; strong: string; medium: string; early: string }> = {
  vi: { title: "Bản đồ hoạt động LICOGI sau sáp nhập", projects: "công trình", ongoing: "đang thi công", value: "Tổng giá trị", fields: "Lĩnh vực", open: "Bấm để mở danh sách", legend: "Mức độ hoạt động theo dữ liệu LICOGI", strong: "Mạnh", medium: "Đang phát triển", early: "Có dự án" },
  en: { title: "LICOGI post-merger activity map", projects: "projects", ongoing: "under construction", value: "Total value", fields: "Sectors", open: "Click to open project list", legend: "Activity based on LICOGI project data", strong: "Strong", medium: "Growing", early: "Active" },
  ja: { title: "統合後のLICOGI活動マップ", projects: "件", ongoing: "施工中", value: "総額", fields: "分野", open: "クリックして一覧を表示", legend: "LICOGIプロジェクトデータによる活動度", strong: "高", medium: "中", early: "実績あり" },
  ko: { title: "통합 이후 LICOGI 활동 지도", projects: "프로젝트", ongoing: "시공 중", value: "총 가치", fields: "분야", open: "클릭하여 목록 열기", legend: "LICOGI 프로젝트 데이터 기반 활동도", strong: "높음", medium: "성장", early: "프로젝트 있음" },
  zh: { title: "合并后的 LICOGI 项目地图", projects: "个项目", ongoing: "在建", value: "项目总值", fields: "领域", open: "点击查看项目列表", legend: "基于 LICOGI 项目数据的活跃度", strong: "强", medium: "发展中", early: "已有项目" },
};

type ProvinceStat = {
  name: string;
  projects: PublicProjectRecord[];
  ongoing: number;
  completed: number;
  totalValue: number;
  averageProgress: number;
  typeCounts: Partial<Record<ProjectType, number>>;
  dominantType: ProjectType;
  score: number;
};

function splitProvinceNames(value?: string) {
  const normalized = normalizeProvinceName(value || "");
  const current = new Set<string>(currentVietnamProvinces);
  return Array.from(new Set(normalized.split(/\s*\/\s*/).map((item) => item.trim()).filter((item) => current.has(item))));
}

function formatValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const billions = value / 1_000_000_000;
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: billions >= 100 ? 0 : 1 }).format(billions)} tỷ`;
}

function countryFlag(value?: string) {
  const raw = (value || "").toLocaleLowerCase("vi");
  if (raw.includes("nhật") || raw.includes("japan")) return "🇯🇵";
  if (raw.includes("hàn") || raw.includes("korea")) return "🇰🇷";
  if (raw.includes("trung quốc") || raw.includes("china")) return "🇨🇳";
  if (raw.includes("đài loan") || raw.includes("taiwan")) return "🇹🇼";
  if (raw.includes("việt") || raw.includes("vietnam")) return "🇻🇳";
  return "🌐";
}

function buildProvinceStats(projects: PublicProjectRecord[]) {
  const buckets = new Map<string, PublicProjectRecord[]>();
  for (const project of projects) {
    const names = splitProvinceNames(project.province || project.legacyProvince);
    for (const name of names) {
      const bucket = buckets.get(name) || [];
      if (!bucket.some((item) => item.id === project.id)) bucket.push(project);
      buckets.set(name, bucket);
    }
  }

  const stats = new Map<string, ProvinceStat>();
  for (const [name, provinceProjects] of buckets) {
    const typeCounts: Partial<Record<ProjectType, number>> = {};
    provinceProjects.forEach((project) => {
      const projectType = KNOWN_PROJECT_TYPES.includes(project.type as ProjectType) ? project.type as ProjectType : "Công nghiệp";
      typeCounts[projectType] = (typeCounts[projectType] || 0) + 1;
    });
    const dominantType = (Object.entries(typeCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Công nghiệp") as ProjectType;
    const totalValue = provinceProjects.reduce((sum, project) => sum + Number(project.contractValueVnd || 0), 0);
    const ongoingProjects = provinceProjects.filter((project) => project.status === "ongoing");
    const averageProgress = ongoingProjects.length ? Math.round(ongoingProjects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / ongoingProjects.length) : 100;
    const industrialCount = Number(typeCounts["Công nghiệp"] || 0);
    const score = provinceProjects.length * 2 + industrialCount * 2.5 + Math.min(5, totalValue / 250_000_000_000);
    stats.set(name, { name, projects: provinceProjects, ongoing: ongoingProjects.length, completed: provinceProjects.filter((project) => project.status === "completed").length, totalValue, averageProgress, typeCounts, dominantType, score });
  }
  return stats;
}

function activityFill(score: number, maxScore: number) {
  if (score <= 0 || maxScore <= 0) return "rgba(255,255,255,.20)";
  const ratio = score / maxScore;
  if (ratio >= .67) return "#ef5a32";
  if (ratio >= .36) return "#fb923c";
  return "#f8c95b";
}

export default function HomepageVietnamProjectMap({ language }: { language: PublicLanguage }) {
  const { projects } = usePublicProjects();
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const stats = useMemo(() => buildProvinceStats(projects), [projects]);
  const maxScore = useMemo(() => Math.max(0, ...Array.from(stats.values()).map((item) => item.score)), [stats]);
  const active = activeProvince ? stats.get(activeProvince) || null : null;
  const activeShape = activeProvince ? vietnamPostMergerProvinces.find((item) => item.name === activeProvince) || null : null;
  const t = COPY[language];

  return <aside className={styles.wrap} aria-label={t.title}>
    <div className={styles.mapGlow} aria-hidden="true" />
    <svg className={styles.svg} viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`} role="img" aria-label="Bản đồ Việt Nam 34 tỉnh thành sau sáp nhập">
      <g className={styles.provinces}>
        {vietnamPostMergerProvinces.map((province) => {
          const stat = stats.get(province.name);
          const href = `/portfolio/projects?q=${encodeURIComponent(province.name)}`;
          const isActive = activeProvince === province.name;
          return <a key={province.name} href={href} aria-label={`${province.name}${stat ? `, ${stat.projects.length} ${t.projects}` : ""}`}><path d={province.d} className={`${styles.province} ${stat ? styles.hasProjects : ""} ${isActive ? styles.isActive : ""}`} style={{ fill: activityFill(stat?.score || 0, maxScore) }} onMouseEnter={() => setActiveProvince(province.name)} onMouseLeave={() => setActiveProvince((current) => current === province.name ? null : current)} onFocus={() => setActiveProvince(province.name)} onBlur={() => setActiveProvince((current) => current === province.name ? null : current)} /></a>;
        })}
      </g>
      <g className={styles.islands} aria-hidden="true"><circle cx="395" cy="308" r="2.1"/><circle cx="402" cy="322" r="1.6"/><circle cx="397" cy="340" r="1.3"/><circle cx="386" cy="585" r="1.7"/><circle cx="400" cy="612" r="1.4"/><circle cx="392" cy="640" r="1.2"/></g>
      <g className={styles.projectPins}>
        {vietnamPostMergerProvinces.map((province) => {
          const stat = stats.get(province.name);
          if (!stat) return null;
          const visual = projectTypeVisuals[stat.dominantType];
          const flag = countryFlag(stat.projects[0]?.investorCountry);
          const href = `/portfolio/projects?q=${encodeURIComponent(province.name)}`;
          return <a key={`pin-${province.name}`} href={href} className={styles.pinLink} onMouseEnter={() => setActiveProvince(province.name)} onMouseLeave={() => setActiveProvince((current) => current === province.name ? null : current)} onFocus={() => setActiveProvince(province.name)} onBlur={() => setActiveProvince((current) => current === province.name ? null : current)}><g transform={`translate(${province.cx} ${province.cy})`}><circle className={styles.pinPulse} cx="0" cy="-5" r="12" style={{ color: visual.color }} /><path className={styles.pinDrop} d="M0-15C-8.3-15-15-8.3-15 0c0 11.7 15 27 15 27S15 11.7 15 0C15-8.3 8.3-15 0-15Z" style={{ fill: visual.color }} /><circle className={styles.pinInner} cx="0" cy="0" r="7.2" /><text className={styles.pinCount} x="0" y="3">{stat.projects.length}</text><text className={styles.pinFlag} x="11" y="-10">{flag}</text></g></a>;
        })}
      </g>
    </svg>
    <div className={styles.legend} aria-label={t.legend}><strong>{t.legend}</strong><span><i className={styles.levelStrong}/>{t.strong}</span><span><i className={styles.levelMedium}/>{t.medium}</span><span><i className={styles.levelEarly}/>{t.early}</span></div>
    {active && activeShape ? <div className={`${styles.tooltip} ${activeShape.cx > VIEW_X + VIEW_WIDTH * .58 ? styles.tooltipLeft : ""}`} style={{ left: `${((activeShape.cx - VIEW_X) / VIEW_WIDTH) * 100}%`, top: `${((activeShape.cy - VIEW_Y) / VIEW_HEIGHT) * 100}%` }} aria-hidden="true"><div className={styles.tooltipTitle}><strong>{active.name}</strong><b>{active.projects.length} {t.projects}</b></div><div className={styles.tooltipMetrics}><span><small>{t.ongoing}</small><b>{active.ongoing}{active.ongoing ? ` · ${active.averageProgress}%` : ""}</b></span><span><small>{t.value}</small><b>{formatValue(active.totalValue)}</b></span></div><p>{t.fields}: {Object.entries(active.typeCounts).filter(([, count]) => Number(count) > 0).map(([type, count]) => `${type} ${count}`).join(" · ")}</p><em>{t.open}</em></div> : null}
  </aside>;
}
