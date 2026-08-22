"use client";

import { useMemo, useState } from "react";
import usePublicProjects from "../hooks/usePublicProjects";
import type { PublicLanguage } from "../hooks/usePublicLanguage";
import type { PublicProjectRecord } from "../lib/publicProject";
import styles from "./HomepageVietnamProjectMap.module.css";

const MAP_WIDTH = 300;
const MAP_HEIGHT = 520;
const LAT_MIN = 8.0;
const LAT_MAX = 23.6;
const LNG_MIN = 101.8;
const LNG_MAX = 109.6;

const VIETNAM_PATH = "M 30.0 52.7 C 34.4 46.4, 58.9 29.1, 73.3 27.6 C 87.8 26.0, 106.1 44.3, 116.7 43.3 C 127.2 42.2, 126.7 22.3, 136.7 21.3 C 146.7 20.2, 167.2 31.8, 176.7 37.0 C 186.1 42.2, 186.7 45.9, 193.3 52.7 C 200.0 59.5, 213.3 70.5, 216.7 77.8 C 220.0 85.1, 218.3 89.9, 213.3 96.7 C 208.3 103.5, 194.4 111.8, 186.7 118.7 C 178.9 125.5, 172.2 129.1, 166.7 137.5 C 161.1 145.9, 154.4 159.5, 153.3 168.9 C 152.2 178.3, 152.2 185.1, 160.0 194.0 C 167.8 202.9, 187.8 213.4, 200.0 222.3 C 212.2 231.2, 225.0 239.1, 233.3 247.4 C 241.7 255.8, 245.0 264.7, 250.0 272.6 C 255.0 280.4, 260.0 284.6, 263.3 294.6 C 266.7 304.5, 269.4 320.7, 270.0 332.2 C 270.6 343.8, 268.9 353.2, 266.7 363.7 C 264.4 374.1, 261.1 385.1, 256.7 395.1 C 252.2 405.0, 247.2 416.5, 240.0 423.3 C 232.8 430.1, 222.8 431.7, 213.3 435.9 C 203.9 440.1, 195.0 444.8, 183.3 448.5 C 171.7 452.1, 152.8 453.7, 143.3 457.9 C 133.9 462.1, 130.6 468.9, 126.7 473.6 C 122.8 478.3, 120.6 483.0, 120.0 486.2 C 119.4 489.3, 125.6 491.9, 123.3 492.4 C 121.1 493.0, 110.6 493.5, 106.7 489.3 C 102.8 485.1, 99.4 474.1, 100.0 467.3 C 100.6 460.5, 106.1 454.7, 110.0 448.5 C 113.9 442.2, 119.4 434.9, 123.3 429.6 C 127.2 424.4, 127.2 421.2, 133.3 417.1 C 139.4 412.9, 150.0 410.8, 160.0 404.5 C 170.0 398.2, 185.0 387.7, 193.3 379.4 C 201.7 371.0, 207.2 361.6, 210.0 354.2 C 212.8 346.9, 209.4 342.2, 210.0 335.4 C 210.6 328.6, 215.0 321.8, 213.3 313.4 C 211.7 305.0, 203.3 293.5, 200.0 285.1 C 196.7 276.8, 196.7 269.4, 193.3 263.1 C 190.0 256.9, 183.9 253.2, 180.0 247.4 C 176.1 241.7, 173.3 234.9, 170.0 228.6 C 166.7 222.3, 165.0 216.0, 160.0 209.7 C 155.0 203.5, 146.7 197.2, 140.0 190.9 C 133.3 184.6, 126.1 178.3, 120.0 172.1 C 113.9 165.8, 108.9 160.5, 103.3 153.2 C 97.8 145.9, 92.2 136.5, 86.7 128.1 C 81.1 119.7, 75.0 110.8, 70.0 102.9 C 65.0 95.1, 60.6 87.2, 56.7 81.0 C 52.8 74.7, 51.1 70.0, 46.7 65.3 C 42.2 60.5, 25.6 59.0, 30.0 52.7 Z";

const COPY: Record<PublicLanguage, { title: string; status: string; hint: string; progress: string }> = {
  vi: { title: "Công trình đang thi công", status: "Đang thi công", hint: "Bấm vào điểm để xem", progress: "Tiến độ" },
  en: { title: "Projects under construction", status: "Under construction", hint: "Click a point to view", progress: "Progress" },
  ja: { title: "施工中の工事", status: "施工中", hint: "ポイントをクリック", progress: "進捗" },
  ko: { title: "시공 중 프로젝트", status: "시공 중", hint: "점을 눌러 보기", progress: "진행률" },
  zh: { title: "在建项目", status: "在建", hint: "点击点位查看", progress: "进度" },
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
  const baseX = 20 + ((project.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (MAP_WIDTH - 40);
  const baseY = 15 + ((LAT_MAX - project.lat) / (LAT_MAX - LAT_MIN)) * (MAP_HEIGHT - 30);
  return { x: clamp(baseX, 18, MAP_WIDTH - 18), y: clamp(baseY, 14, MAP_HEIGHT - 18) };
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
    .filter((project) => project.lat >= LAT_MIN - 0.4 && project.lat <= LAT_MAX + 0.4 && project.lng >= LNG_MIN - 0.4 && project.lng <= LNG_MAX + 0.8)
    .sort((a, b) => b.lat - a.lat || a.lng - b.lng)
    .map((project) => {
      const point = projectToPoint(project);
      const key = `${project.lat.toFixed(2)}:${project.lng.toFixed(2)}`;
      const duplicateIndex = repeated.get(key) || 0;
      repeated.set(key, duplicateIndex + 1);

      if (duplicateIndex === 0) return { project, ...point } satisfies ProjectPin;

      const ring = Math.floor((duplicateIndex - 1) / 6);
      const angle = ((duplicateIndex - 1) % 6) * (Math.PI / 3);
      const radius = 7 + ring * 5;
      return {
        project,
        x: clamp(point.x + Math.cos(angle) * radius, 18, MAP_WIDTH - 18),
        y: clamp(point.y + Math.sin(angle) * radius, 14, MAP_HEIGHT - 18),
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
      <svg className={styles.svg} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Bản đồ Việt Nam">
        <defs>
          <linearGradient id="licogi-vietnam-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,.20)" />
            <stop offset="1" stopColor="rgba(255,255,255,.06)" />
          </linearGradient>
          <filter id="licogi-vietnam-pin-glow" x="-250%" y="-250%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path className={styles.shapeGlow} d={VIETNAM_PATH} />
        <path className={styles.shape} d={VIETNAM_PATH} fill="url(#licogi-vietnam-fill)" />

        <path className={styles.detailLine} d="M58 91 C94 105 139 108 187 101" />
        <path className={styles.detailLine} d="M112 171 C144 185 170 197 190 219" />
        <path className={styles.detailLine} d="M171 300 C190 320 201 340 201 360" />
        <path className={styles.detailLine} d="M127 431 C154 440 183 442 210 434" />

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
              <circle className={styles.pinHit} cx={x} cy={y} r="14" />
              <circle
                className={styles.pinPulse}
                cx={x}
                cy={y}
                r="8"
                style={{ animationDelay: `${(index % 8) * 110}ms` }}
              />
              <circle className={styles.pinCore} cx={x} cy={y} r="4.8" filter="url(#licogi-vietnam-pin-glow)" />
              <title>{`${project.name} · ${project.province} · ${t.status}`}</title>
            </a>
          );
        })}
      </svg>

      <div className={styles.caption}>
        <span className={styles.captionDot} />
        <div>
          <strong>{pins.length} {t.title.toLocaleLowerCase()}</strong>
          <span>{t.hint}</span>
        </div>
      </div>

      {activePin ? (
        <div
          className={`${styles.tooltip} ${activePin.x > MAP_WIDTH * 0.58 ? styles.tooltipLeft : ""}`}
          style={{
            left: `${(activePin.x / MAP_WIDTH) * 100}%`,
            top: `${(activePin.y / MAP_HEIGHT) * 100}%`,
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
