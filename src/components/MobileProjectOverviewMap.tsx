"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { ArrowRight, LocateFixed, Map as MapIcon, MapPin, RefreshCcw } from "lucide-react";
import { normalizeProvinceNames } from "../data/projects";
import { vietnamPostMergerProvinces } from "../data/vietnamPostMergerMap";
import type { PublicProjectRecord } from "../lib/publicProject";

type Props = {
  projects: PublicProjectRecord[];
  loading?: boolean;
  error?: string;
  onReload?: () => void;
  compact?: boolean;
};

type LiveMapProps = { projects: PublicProjectRecord[] };

type ProvinceStats = {
  count: number;
  ongoing: number;
  completed: number;
  warranty: number;
};

function isMappable(project: PublicProjectRecord) {
  return Number.isFinite(project.lat)
    && Number.isFinite(project.lng)
    && project.lat >= 8
    && project.lat <= 24.5
    && project.lng >= 102
    && project.lng <= 110.8;
}

function provinceTone(stats: ProvinceStats) {
  if (stats.ongoing > 0) return "is-ongoing";
  if (stats.warranty > 0) return "is-warranty";
  return "is-completed";
}

export default function MobileProjectOverviewMap({ projects, loading = false, error = "", onReload, compact = false }: Props) {
  const [LiveMap, setLiveMap] = useState<ComponentType<LiveMapProps> | null>(null);
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [liveMapLoading, setLiveMapLoading] = useState(false);
  const [liveMapError, setLiveMapError] = useState(false);
  const mappableProjects = projects.filter(isMappable).slice(0, 80);
  const provinces = new Set(projects.map((project) => project.province).filter((province) => Boolean(province) && province !== "Đang cập nhật"));
  const ongoing = projects.filter((project) => project.status === "ongoing").length;
  const completed = projects.filter((project) => project.status === "completed").length;
  const warranty = projects.filter((project) => project.status === "warranty").length;

  const provinceStats = useMemo(() => {
    const stats = new globalThis.Map<string, ProvinceStats>();

    projects.forEach((project) => {
      const names = Array.from(new Set(normalizeProvinceNames(project.province).filter((name) => name && name !== "Đang cập nhật")));
      names.forEach((name) => {
        const current = stats.get(name) || { count: 0, ongoing: 0, completed: 0, warranty: 0 };
        current.count += 1;
        current[project.status] += 1;
        stats.set(name, current);
      });
    });

    return stats;
  }, [projects]);

  useEffect(() => {
    if (!showLiveMap || LiveMap || liveMapLoading || !mappableProjects.length) return;

    let active = true;
    setLiveMapLoading(true);
    setLiveMapError(false);

    void import("./MobileLeafletProjectMap")
      .then((module) => {
        if (!active) return;
        setLiveMap(() => module.default);
        setLiveMapLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLiveMapLoading(false);
        setLiveMapError(true);
        setShowLiveMap(false);
      });

    return () => { active = false; };
  }, [LiveMap, liveMapLoading, mappableProjects.length, showLiveMap]);

  return <section className={`phone-data-map ${compact ? "is-compact" : ""}`} aria-label="Bản đồ công trình LICOGI 18.3">
    <div className="phone-data-map-head">
      <div>
        <span>MẠNG LƯỚI CÔNG TRÌNH</span>
        <strong>{projects.length > 0 ? `${projects.length} công trình · ${provinces.size} địa bàn` : loading ? "Đang cập nhật danh mục" : "Bản đồ tạm thời chưa khả dụng"}</strong>
        {mappableProjects.length > 0 ? <small><LocateFixed size={12}/> {mappableProjects.length} vị trí đã định vị</small> : null}
      </div>
      <Link href="/portfolio/projects">Xem tất cả <ArrowRight size={14}/></Link>
    </div>

    <div className="phone-data-map-canvas">
      <div className="phone-data-map-fallback" aria-hidden={showLiveMap && Boolean(LiveMap)}>
        <svg className="phone-data-province-map" viewBox="35 0 375 735" role="img" aria-label={`Bản đồ Việt Nam với ${provinceStats.size} địa bàn có công trình`}>
          {vietnamPostMergerProvinces.map((province) => {
            const stats = provinceStats.get(province.name);
            const tone = stats ? provinceTone(stats) : "";
            return <g key={province.name}>
              <path
                d={province.d}
                className={`phone-data-province ${stats ? `has-projects ${tone}` : ""}`}
              />
              {stats ? <a href={`/portfolio/projects?q=${encodeURIComponent(province.name)}`} aria-label={`${province.name}: ${stats.count} công trình`}>
                <circle cx={province.cx} cy={province.cy} r="13" className={`phone-data-province-halo ${tone}`}/>
                <circle cx={province.cx} cy={province.cy} r="8.5" className={`phone-data-province-marker ${tone}`}/>
                <text x={province.cx} y={province.cy + 3.1} textAnchor="middle" className="phone-data-province-count">{stats.count}</text>
              </a> : null}
            </g>;
          })}
        </svg>
      </div>

      {showLiveMap && LiveMap && mappableProjects.length > 0 ? <LiveMap projects={mappableProjects}/> : null}

      {mappableProjects.length > 0 ? <div className="phone-data-map-mode">
        <button
          type="button"
          aria-pressed={showLiveMap}
          onClick={() => setShowLiveMap((value) => !value)}
          disabled={liveMapLoading}
        >
          <MapIcon size={14}/>
          {liveMapLoading ? "Đang mở bản đồ nền" : showLiveMap ? "Bản đồ tỉnh/thành" : "Mở bản đồ nền"}
        </button>
        {liveMapError ? <span>Không tải được bản đồ nền · bản đồ công trình vẫn khả dụng</span> : null}
      </div> : null}

      {projects.length === 0 && !loading ? <div className="phone-data-map-state">
        <MapPin size={22}/>
        <strong>Bản đồ tạm thời chưa khả dụng</strong>
        {error ? <span>{error}</span> : <span>Danh mục công trình chưa có dữ liệu vị trí.</span>}
        {onReload ? <button type="button" onClick={onReload}><RefreshCcw size={15}/> Thử lại</button> : null}
      </div> : null}

      <div className="phone-data-map-legend" aria-label="Chú thích trạng thái">
        <span><i className="is-ongoing"/>Đang thi công <b>{ongoing}</b></span>
        <span><i className="is-completed"/>Hoàn thành <b>{completed}</b></span>
        {warranty > 0 ? <span><i className="is-warranty"/>Bảo hành <b>{warranty}</b></span> : null}
      </div>
    </div>

    <div className="phone-data-map-foot">
      <span><MapPin size={14}/> Chạm vào điểm số để lọc công trình theo địa bàn</span>
      <Link href="/portfolio/projects">Danh mục <ArrowRight size={15}/></Link>
    </div>
  </section>;
}
