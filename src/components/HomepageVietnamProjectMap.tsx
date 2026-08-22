"use client";

import { useMemo, useState } from "react";
import usePublicProjects from "../hooks/usePublicProjects";
import type { PublicLanguage } from "../hooks/usePublicLanguage";
import type { PublicProjectRecord } from "../lib/publicProject";
import styles from "./HomepageVietnamProjectMap.module.css";

const VIEW_X = 260;
const VIEW_Y = 20;
const VIEW_WIDTH = 500;
const VIEW_HEIGHT = 960;

const LAND_X_MIN = 284;
const LAND_X_MAX = 716;
const LAND_Y_MIN = 46;
const LAND_Y_MAX = 955;

const LAT_MIN = 8.0;
const LAT_MAX = 23.6;
const LNG_MIN = 102.0;
const LNG_MAX = 109.6;

const COPY: Record<PublicLanguage, { title: string; status: string; progress: string }> = {
  vi: { title: "Công trình đang thi công", status: "Đang thi công", progress: "Tiến độ" },
  en: { title: "Projects under construction", status: "Under construction", progress: "Progress" },
  ja: { title: "施工中の工事", status: "施工中", progress: "進捗" },
  ko: { title: "시공 중 프로젝트", status: "시공 중", progress: "진행률" },
  zh: { title: "在建项目", status: "在建", progress: "进度" },
};

type ProjectPin = {
  project: PublicProjectRecord;
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function projectToPoint(project: PublicProjectRecord) {
  const baseX = LAND_X_MIN + ((project.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (LAND_X_MAX - LAND_X_MIN);
  const baseY = LAND_Y_MIN + ((LAT_MAX - project.lat) / (LAT_MAX - LAT_MIN)) * (LAND_Y_MAX - LAND_Y_MIN);
  return {
    x: clamp(baseX, LAND_X_MIN, LAND_X_MAX),
    y: clamp(baseY, LAND_Y_MIN, LAND_Y_MAX),
  };
}

function isVietnamProject(project: PublicProjectRecord) {
  const country = (project.projectCountry || "").trim().toLocaleLowerCase("vi");
  if (!country) return true;
  return country.includes("việt nam") || country.includes("viet nam") || country.includes("vietnam");
}

function buildPins(projects: PublicProjectRecord[]) {
  const repeated = new Map<string, number>();

  return projects
    .filter((project) => project.status === "ongoing")
    .filter(isVietnamProject)
    .filter((project) => Number.isFinite(project.lat) && Number.isFinite(project.lng))
    .filter((project) => project.lat >= LAT_MIN - 0.4 && project.lat <= LAT_MAX + 0.4 && project.lng >= LNG_MIN - 0.5 && project.lng <= LNG_MAX + 0.8)
    .sort((a, b) => b.lat - a.lat || a.lng - b.lng)
    .map((project) => {
      const point = projectToPoint(project);
      const key = `${project.lat.toFixed(2)}:${project.lng.toFixed(2)}`;
      const duplicateIndex = repeated.get(key) || 0;
      repeated.set(key, duplicateIndex + 1);

      if (duplicateIndex === 0) return { project, ...point } satisfies ProjectPin;

      const ring = Math.floor((duplicateIndex - 1) / 6);
      const angle = ((duplicateIndex - 1) % 6) * (Math.PI / 3);
      const radius = 12 + ring * 8;
      return {
        project,
        x: clamp(point.x + Math.cos(angle) * radius, LAND_X_MIN, LAND_X_MAX),
        y: clamp(point.y + Math.sin(angle) * radius, LAND_Y_MIN, LAND_Y_MAX),
      } satisfies ProjectPin;
    });
}

export default function HomepageVietnamProjectMap({ language }: { language: PublicLanguage }) {
  const { projects } = usePublicProjects();
  const [activeId, setActiveId] = useState<string | null>(null);
  const pins = useMemo(() => buildPins(projects), [projects]);
  const activePin = pins.find((pin) => pin.project.id === activeId) || null;
  const t = COPY[language];

  return (
    <aside className={styles.wrap} aria-label={t.title}>
      <div className={styles.mapGlow} aria-hidden="true" />
      <svg
        className={styles.svg}
        viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Bản đồ Việt Nam"
      >
        <defs>
          <filter id="licogi-vietnam-pin-glow" x="-250%" y="-250%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <image
          className={styles.mapImage}
          href="/maps/vietnam-accurate.svg"
          x={VIEW_X}
          y={VIEW_Y}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
        />

        {pins.map((pin, index) => {
          const { project, x, y } = pin;
          const href = `/portfolio/projects?q=${encodeURIComponent(project.code || project.name)}`;
          return (
            <a
              key={project.id}
              href={href}
              className={styles.pinLink}
              aria-label={`${project.name}, ${project.province}, ${t.status}`}
              onMouseEnter={() => setActiveId(project.id)}
              onMouseLeave={() => setActiveId((current) => current === project.id ? null : current)}
              onFocus={() => setActiveId(project.id)}
              onBlur={() => setActiveId((current) => current === project.id ? null : current)}
            >
              <circle className={styles.pinHit} cx={x} cy={y} r="25" />
              <circle
                className={styles.pinPulse}
                cx={x}
                cy={y}
                r="13"
                style={{ animationDelay: `${(index % 8) * 110}ms` }}
              />
              <circle className={styles.pinCore} cx={x} cy={y} r="7.5" filter="url(#licogi-vietnam-pin-glow)" />
              <title>{`${project.name} · ${project.province} · ${t.status}`}</title>
            </a>
          );
        })}
      </svg>

      {activePin ? (
        <div
          className={`${styles.tooltip} ${activePin.x > VIEW_X + VIEW_WIDTH * 0.58 ? styles.tooltipLeft : ""}`}
          style={{
            left: `${((activePin.x - VIEW_X) / VIEW_WIDTH) * 100}%`,
            top: `${((activePin.y - VIEW_Y) / VIEW_HEIGHT) * 100}%`,
          }}
          aria-hidden="true"
        >
          <strong>{activePin.project.name}</strong>
          <span>{activePin.project.province} · {activePin.project.code}</span>
          <small>{t.progress}: {Math.round(activePin.project.progress || 0)}%</small>
        </div>
      ) : null}
    </aside>
  );
}
