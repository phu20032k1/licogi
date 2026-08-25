"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, MapPin, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import usePublicProjects from "../hooks/usePublicProjects";
import { formatVnd, projectMoney } from "../lib/publicProject";
import type { PublicProjectRecord, PublicProjectStatus } from "../lib/publicProject";
import MobileProjectOverviewMap from "./MobileProjectOverviewMap";

type Props = {
  initialStatus?: string;
  initialType?: string;
  initialSearch?: string;
};

const statusLabels: Record<PublicProjectStatus, string> = {
  ongoing: "Đang thi công",
  completed: "Hoàn thành",
  warranty: "Bảo hành",
};

function normalize(value?: string) {
  return (value || "").trim().toLocaleLowerCase("vi");
}

function statusTone(status: PublicProjectStatus) {
  if (status === "completed") return "is-completed";
  if (status === "warranty") return "is-warranty";
  return "is-ongoing";
}

function MobileProjectCard({ project }: { project: PublicProjectRecord }) {
  const hasCoordinates = Number.isFinite(project.lat) && Number.isFinite(project.lng) && project.lat !== 0 && project.lng !== 0;
  const mapsHref = project.mapsUrl || (hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}` : "");

  return <article className="phone-project-card">
    <div className="phone-project-card-top">
      <span className={`phone-project-status ${statusTone(project.status)}`}>{statusLabels[project.status]}</span>
      <span className="phone-project-code">{project.code}</span>
    </div>

    <h3>{project.name}</h3>
    <p className="phone-project-location"><MapPin size={15}/>{project.province}{project.projectCountry ? ` · ${project.projectCountry}` : ""}</p>
    <p className="phone-project-investor"><Building2 size={15}/>{project.investor || "Chưa cập nhật chủ đầu tư"}</p>

    <div className="phone-project-metrics">
      <div><span>Giá trị</span><strong>{formatVnd(projectMoney(project), project.valueRange || "Chưa cập nhật")}</strong></div>
      <div><span>Tiến độ</span><strong>{Math.max(0, Math.min(100, Number(project.progress || 0)))}%</strong></div>
    </div>

    <div className="phone-project-progress" aria-label={`Tiến độ ${project.progress}%`}><span style={{ width: `${Math.max(0, Math.min(100, Number(project.progress || 0)))}%` }}/></div>

    <div className="phone-project-actions">
      <Link href={`/portfolio/projects/${encodeURIComponent(project.code || project.id)}`}>Xem hồ sơ <ArrowRight size={15}/></Link>
      {mapsHref ? <a href={mapsHref} target="_blank" rel="noreferrer"><MapPin size={15}/> Vị trí</a> : <span className="phone-project-map-unavailable"><MapPin size={15}/> Đang cập nhật vị trí</span>}
    </div>
  </article>;
}

export default function MobilePublicProjects({ initialStatus = "all", initialType = "all", initialSearch = "" }: Props) {
  const { projects, error, reload } = usePublicProjects();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState(initialType);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => setSearch(initialSearch), [initialSearch]);
  useEffect(() => setStatus(initialStatus), [initialStatus]);
  useEffect(() => setType(initialType), [initialType]);

  const types = useMemo(() => Array.from(new Set(projects.map((project) => project.type).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi")), [projects]);

  const filtered = useMemo(() => {
    const keyword = normalize(search);
    return projects.filter((project) => {
      const haystack = normalize([project.name, project.code, project.province, project.investor, project.type, project.projectCountry].filter(Boolean).join(" "));
      return (!keyword || haystack.includes(keyword))
        && (status === "all" || project.status === status)
        && (type === "all" || project.type === type);
    });
  }, [projects, search, status, type]);

  const completed = projects.filter((project) => project.status === "completed").length;
  const ongoing = projects.filter((project) => project.status === "ongoing").length;
  const warranty = projects.filter((project) => project.status === "warranty").length;

  async function syncProjects() {
    setSyncing(true);
    try {
      await reload();
    } finally {
      setSyncing(false);
    }
  }

  return <div className="phone-projects-page">
    <section className="phone-projects-hero">
      <div className="phone-projects-hero-copy">
        <span>DANH MỤC CÔNG TRÌNH</span>
        <h1>Dự án LICOGI 18.3</h1>
        <p>Tra cứu danh mục công trình, tiến độ, giá trị và vị trí từ dữ liệu vận hành được cập nhật tập trung.</p>
      </div>
      <div className="phone-projects-summary">
        <div><strong>{projects.length}</strong><span>Tổng dự án</span></div>
        <div><strong>{ongoing}</strong><span>Thi công</span></div>
        <div><strong>{completed}</strong><span>Hoàn thành</span></div>
        <div><strong>{warranty}</strong><span>Bảo hành</span></div>
      </div>
    </section>

    <MobileProjectOverviewMap
      projects={projects}
      loading={false}
      error={error}
      onReload={() => { void syncProjects(); }}
      compact
    />

    <section className="phone-project-filters">
      <div className="phone-project-filter-heading"><div><span>BỘ LỌC DANH MỤC</span><strong>Tìm công trình phù hợp</strong></div><button type="button" onClick={() => { void syncProjects(); }} className="phone-project-reload" disabled={syncing}><RefreshCcw size={16} className={syncing ? "animate-spin" : ""}/> Đồng bộ</button></div>
      <label className="phone-project-search"><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên dự án, địa phương, chủ đầu tư..." /></label>

      <div className="phone-project-status-tabs" role="group" aria-label="Lọc trạng thái">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}>Tất cả</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={status === "ongoing" ? "is-active" : ""}>Thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={status === "completed" ? "is-active" : ""}>Hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={status === "warranty" ? "is-active" : ""}>Bảo hành</button>
      </div>

      <div className="phone-project-filter-row">
        <label><SlidersHorizontal size={16}/><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">Tất cả lĩnh vực</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
    </section>

    <div className="phone-project-result-head"><strong>{filtered.length}</strong><span>công trình phù hợp</span>{error && projects.length > 0 ? <em>Dữ liệu gần nhất đang được sử dụng</em> : null}</div>

    {filtered.length > 0 ? <div className="phone-project-list">{filtered.map((project) => <MobileProjectCard key={project.id} project={project}/>)}</div> : null}

    {projects.length === 0 ? <div className="phone-project-error"><strong>Danh mục tạm thời chưa khả dụng</strong><p>{error || "Hệ thống chưa nhận được dữ liệu công trình."}</p><button type="button" onClick={() => { void syncProjects(); }}><RefreshCcw size={16}/> Đồng bộ lại</button></div> : null}

    {projects.length > 0 && filtered.length === 0 ? <div className="phone-project-empty"><Search size={26}/><strong>Không có dự án phù hợp</strong><span>Điều chỉnh bộ lọc hoặc sử dụng từ khóa khác.</span></div> : null}
  </div>;
}
