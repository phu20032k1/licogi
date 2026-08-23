"use client";

import { useMemo, useState } from "react";
import { currentVietnamProvinces, normalizeProvinceName, type ProjectType } from "../data/projects";
import { vietnamPostMergerProvinces } from "../data/vietnamPostMergerMap";
import usePublicProjects from "../hooks/usePublicProjects";
import type { PublicLanguage } from "../hooks/usePublicLanguage";
import { projectMoney, type PublicProjectRecord } from "../lib/publicProject";
import { projectTypeVisuals } from "../lib/projectMapVisuals";
import styles from "./HomepageVietnamProjectMap.module.css";

const VIEW_X = 35;
const VIEW_Y = 0;
const VIEW_WIDTH = 375;
const VIEW_HEIGHT = 735;
const KNOWN_PROJECT_TYPES = Object.keys(projectTypeVisuals) as ProjectType[];

type ActivityLevel = "strong" | "developing" | "active";

const COPY: Record<PublicLanguage, {
  title: string;
  projects: string;
  ongoing: string;
  completed: string;
  progress: string;
  value: string;
  fields: string;
  open: string;
  legend: string;
  strong: string;
  medium: string;
  early: string;
}> = {
  vi: {
    title: "Bản đồ hoạt động LICOGI sau sáp nhập",
    projects: "công trình",
    ongoing: "Đang thi công",
    completed: "Đã hoàn thành",
    progress: "Tiến độ TB",
    value: "Tổng giá trị",
    fields: "Lĩnh vực",
    open: "Bấm vào điểm để xem danh sách công trình",
    legend: "Mức độ phát triển công nghiệp",
    strong: "Phát triển mạnh",
    medium: "Đang phát triển",
    early: "Đã có công trình",
  },
  en: {
    title: "LICOGI post-merger activity map",
    projects: "projects",
    ongoing: "Under construction",
    completed: "Completed",
    progress: "Avg. progress",
    value: "Total value",
    fields: "Sectors",
    open: "Click a point to open the project list",
    legend: "Industrial development level",
    strong: "Strong",
    medium: "Developing",
    early: "Projects delivered",
  },
  ja: {
    title: "統合後のLICOGI活動マップ",
    projects: "件",
    ongoing: "施工中",
    completed: "完了",
    progress: "平均進捗",
    value: "総額",
    fields: "分野",
    open: "ポイントをクリックして工事一覧を表示",
    legend: "産業開発レベル",
    strong: "高",
    medium: "発展中",
    early: "工事実績あり",
  },
  ko: {
    title: "통합 이후 LICOGI 활동 지도",
    projects: "프로젝트",
    ongoing: "시공 중",
    completed: "완료",
    progress: "평균 진행률",
    value: "총 가치",
    fields: "분야",
    open: "포인트를 눌러 프로젝트 목록 보기",
    legend: "산업 발전 수준",
    strong: "높음",
    medium: "발전 중",
    early: "프로젝트 있음",
  },
  zh: {
    title: "合并后的 LICOGI 项目地图",
    projects: "个项目",
    ongoing: "在建",
    completed: "已完工",
    progress: "平均进度",
    value: "项目总值",
    fields: "领域",
    open: "点击点位查看项目列表",
    legend: "工业发展程度",
    strong: "发展强",
    medium: "发展中",
    early: "已有项目",
  },
};

type ProvinceStat = {
  name: string;
  projects: PublicProjectRecord[];
  ongoing: number;
  completed: number;
  totalValue: number;
  industrialProjects: number;
  industrialValue: number;
  industrialScore: number;
  averageProgress: number;
  typeCounts: Partial<Record<ProjectType, number>>;
  dominantType: ProjectType;
};

function splitProvinceNames(value?: string) {
  const normalized = normalizeProvinceName(value || "");
  const current = new Set<string>(currentVietnamProvinces);
  return Array.from(new Set(
    normalized
      .split(/\s*\/\s*/)
      .map((item) => item.trim())
      .filter((item) => current.has(item)),
  ));
}

function knownProjectType(value?: string): ProjectType | null {
  return KNOWN_PROJECT_TYPES.includes(value as ProjectType) ? value as ProjectType : null;
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
      const projectType = knownProjectType(project.type);
      if (projectType) typeCounts[projectType] = (typeCounts[projectType] || 0) + 1;
    });

    const dominantType = (Object.entries(typeCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Công nghiệp") as ProjectType;
    const totalValue = provinceProjects.reduce((sum, project) => sum + projectMoney(project), 0);
    const ongoingProjects = provinceProjects.filter((project) => project.status === "ongoing");
    const completedProjects = provinceProjects.filter((project) => project.status === "completed");
    const industrial = provinceProjects.filter((project) => knownProjectType(project.type) === "Công nghiệp");
    const industrialValue = industrial.reduce((sum, project) => sum + projectMoney(project), 0);
    const industrialOngoing = industrial.filter((project) => project.status === "ongoing").length;
    const industrialCompleted = industrial.filter((project) => project.status === "completed").length;
    const industrialScore = industrial.length * 4
      + industrialOngoing * 1.5
      + industrialCompleted
      + Math.min(8, industrialValue / 150_000_000_000);
    const averageProgress = ongoingProjects.length
      ? Math.round(ongoingProjects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / ongoingProjects.length)
      : 100;

    stats.set(name, {
      name,
      projects: provinceProjects,
      ongoing: ongoingProjects.length,
      completed: completedProjects.length,
      totalValue,
      industrialProjects: industrial.length,
      industrialValue,
      industrialScore,
      averageProgress,
      typeCounts,
      dominantType,
    });
  }
  return stats;
}

function activityLevel(stat: ProvinceStat | undefined, maxIndustrialScore: number): ActivityLevel | null {
  if (!stat || stat.projects.length === 0) return null;
  if (stat.industrialProjects === 0 || maxIndustrialScore <= 0) return "active";

  const ratio = stat.industrialScore / maxIndustrialScore;
  if (ratio >= .66) return "strong";
  if (ratio >= .28) return "developing";
  return "active";
}

function activityFill(level: ActivityLevel | null) {
  if (level === "strong") return "#ef5b62";
  if (level === "developing") return "#ff944d";
  if (level === "active") return "#f7c94a";
  return "rgba(255,255,255,.18)";
}

export default function HomepageVietnamProjectMap({ language }: { language: PublicLanguage }) {
  const { projects } = usePublicProjects();
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const stats = useMemo(() => buildProvinceStats(projects), [projects]);
  const maxIndustrialScore = useMemo(
    () => Math.max(0, ...Array.from(stats.values()).map((item) => item.industrialScore)),
    [stats],
  );
  const active = activeProvince ? stats.get(activeProvince) || null : null;
  const activeShape = activeProvince
    ? vietnamPostMergerProvinces.find((item) => item.name === activeProvince) || null
    : null;
  const t = COPY[language];

  const activate = (provinceName: string) => setActiveProvince(provinceName);
  const deactivate = (provinceName: string) => setActiveProvince((current) => current === provinceName ? null : current);

  return <aside className={styles.wrap} aria-label={t.title}>
    <div className={styles.mapGlow} aria-hidden="true" />

    <svg
      className={styles.svg}
      viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="Bản đồ Việt Nam 34 tỉnh thành sau sáp nhập"
    >
      <g className={styles.provinces}>
        {vietnamPostMergerProvinces.map((province) => {
          const stat = stats.get(province.name);
          const level = activityLevel(stat, maxIndustrialScore);
          const href = `/portfolio/projects?q=${encodeURIComponent(province.name)}`;
          const isActive = activeProvince === province.name;
          return <a
            key={province.name}
            href={href}
            aria-label={`${province.name}${stat ? `, ${stat.projects.length} ${t.projects}` : ""}`}
            onMouseEnter={() => activate(province.name)}
            onMouseLeave={() => deactivate(province.name)}
            onFocus={() => activate(province.name)}
            onBlur={() => deactivate(province.name)}
          >
            <path
              d={province.d}
              className={`${styles.province} ${stat ? styles.hasProjects : ""} ${level ? styles[`level${level[0].toUpperCase()}${level.slice(1)}`] : ""} ${isActive ? styles.isActive : ""}`}
              style={{ fill: activityFill(level) }}
            />
          </a>;
        })}
      </g>

      <g className={styles.islands} aria-hidden="true">
        <circle cx="395" cy="308" r="2.1" />
        <circle cx="402" cy="322" r="1.6" />
        <circle cx="397" cy="340" r="1.3" />
        <circle cx="386" cy="585" r="1.7" />
        <circle cx="400" cy="612" r="1.4" />
        <circle cx="392" cy="640" r="1.2" />
      </g>

      <g className={styles.projectPins}>
        {vietnamPostMergerProvinces.map((province) => {
          const stat = stats.get(province.name);
          if (!stat) return null;
          const visual = projectTypeVisuals[stat.dominantType];
          const flag = countryFlag(stat.projects[0]?.investorCountry);
          const href = `/portfolio/projects?q=${encodeURIComponent(province.name)}`;
          return <a
            key={`pin-${province.name}`}
            href={href}
            className={styles.pinLink}
            aria-label={`${province.name}: ${stat.projects.length} ${t.projects}`}
            onMouseEnter={() => activate(province.name)}
            onMouseLeave={() => deactivate(province.name)}
            onFocus={() => activate(province.name)}
            onBlur={() => deactivate(province.name)}
          >
            <g transform={`translate(${province.cx} ${province.cy})`}>
              <circle className={styles.pinPulse} cx="0" cy="0" r="10" style={{ color: visual.color }} />
              <circle className={styles.pinDot} cx="0" cy="0" r="7.5" style={{ fill: visual.color }} />
              <circle className={styles.pinInner} cx="0" cy="0" r="3.4" />
              <text className={styles.pinFlag} x="10" y="-8">{flag}</text>
            </g>
          </a>;
        })}
      </g>
    </svg>

    <div className={styles.legend} aria-label={t.legend}>
      <strong>{t.legend}</strong>
      <span><i className={styles.levelStrong} />{t.strong}</span>
      <span><i className={styles.levelMedium} />{t.medium}</span>
      <span><i className={styles.levelEarly} />{t.early}</span>
    </div>

    {active && activeShape ? <div
      className={`${styles.tooltip} ${activeShape.cx > VIEW_X + VIEW_WIDTH * .58 ? styles.tooltipLeft : ""}`}
      style={{
        left: `${((activeShape.cx - VIEW_X) / VIEW_WIDTH) * 100}%`,
        top: `${((activeShape.cy - VIEW_Y) / VIEW_HEIGHT) * 100}%`,
      }}
      aria-hidden="true"
    >
      <div className={styles.tooltipTitle}>
        <strong>{active.name}</strong>
        <b>{active.projects.length} {t.projects}</b>
      </div>

      <div className={styles.tooltipMetrics}>
        <span><small>{t.ongoing}</small><b>{active.ongoing}</b></span>
        <span><small>{t.completed}</small><b>{active.completed}</b></span>
        <span><small>{t.progress}</small><b>{active.ongoing ? `${active.averageProgress}%` : "100%"}</b></span>
        <span><small>{t.value}</small><b>{formatValue(active.totalValue)}</b></span>
      </div>

      <div className={styles.tooltipFields}>
        <small>{t.fields}</small>
        <div>
          {Object.entries(active.typeCounts)
            .filter(([, count]) => Number(count) > 0)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .map(([type, count]) => {
              const projectType = type as ProjectType;
              const visual = projectTypeVisuals[projectType];
              return <span key={type}><i style={{ background: visual.color }} />{type}<b>{count}</b></span>;
            })}
        </div>
      </div>

      <em>{t.open}</em>
    </div> : null}
  </aside>;
}
