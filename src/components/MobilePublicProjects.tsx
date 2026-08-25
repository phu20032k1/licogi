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
  const mapsHref = project.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`;
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

    <div className="phone-project-progress" aria-label={`Tiến độ ${project.progress}%`}><span style={{ width: `${Math.max(0, Math.min(100, Number(project.progress || 0)))}%` }} /></div>

    <div className="phone-project-actions">
      <Link href={`/portfolio/projects/${encodeURIComponent(project.id)}`}>Xem hồ sơ <ArrowRight size={15}/></Link>
      <a href={mapsHref} target="_blank" rel="noreferrer"><MapPin size={15}/> Vị trí</a>
    </div>
  </article>;
}

export default function MobilePublicProjects({ initialStatus = "all", initialType = "all", initialSearch = "" }: Props) {
  const { projects, loading, error, reload } = usePublicProjects();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState(initialType);

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
  const pending = loading && projects.length === 0;

  return <div className="phone-projects-page">
    <section className="phone-projects-hero">
      <div className="phone-projects-hero-copy">
        <span>DANH MỤC CÔNG TRÌNH</span>
        <h1>Dự án LICOGI 18.3</h1>
        <p>Xem nhanh công trình, tiến độ và vị trí theo cách tối ưu riêng cho iPhone và Android.</p>
      </div>
      <div className="phone-projects-summary">
        <div><strong>{projects.length || "—"}</strong><span>Tổng dự án</span></div>
        <div><strong>{ongoing}</strong><span>Thi công</span></div>
        <div><strong>{completed}</strong><span>Hoàn thành</span></div>
        <div><strong>{warranty}</strong><span>Bảo hành</span></div>
      </div>
    </section>

    <section className="phone-project-filters">
      <label className="phone-project-search"><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm dự án, tỉnh, chủ đầu tư..." /></label>

      <div className="phone-project-status-tabs" role="group" aria-label="Lọc trạng thái">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}>Tất cả</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={status === "ongoing" ? "is-active" : ""}>Thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={status === "completed" ? "is-active" : ""}>Hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={status === "warranty" ? "is-active" : ""}>Bảo hành</button>
      </div>

      <div className="phone-project-filter-row">
        <label><SlidersHorizontal size={16}/><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">Tất cả lĩnh vực</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <button type="button" onClick={() => { void reload(); }} className="phone-project-reload"><RefreshCcw size={16} className={pending ? "animate-spin" : ""}/> Tải lại</button>
      </div>
    </section>

    <div className="phone-project-result-head"><strong>{filtered.length}</strong><span>công trình phù hợp</span>{error && projects.length > 0 ? <em>Đang dùng dữ liệu gần nhất</em> : null}</div>

    <MobileProjectOverviewMap
      projects={projects}
      loading={pending}
      error={error}
      onReload={() => { void reload(); }}
      compact
    />

    {pending ? <div className="phone-project-skeleton-list" aria-live="polite">{[0, 1, 2].map((item) => <div key={item} className="phone-project-skeleton"><i/><span/><span/><b/></div>)}</div> : null}

    {!pending && error && projects.length === 0 ? <div className="phone-project-error"><strong>Chưa lấy được dữ liệu</strong><p>{error}</p><button type="button" onClick={() => { void reload(); }}><RefreshCcw size={16}/> Thử lại</button></div> : null}

    {!pending && filtered.length > 0 ? <div className="phone-project-list">{filtered.map((project) => <MobileProjectCard key={project.id} project={project} />)}</div> : null}

    {!pending && !error && filtered.length === 0 ? <div className="phone-project-empty"><Search size={26}/><strong>Không có dự án phù hợp</strong><span>Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác.</span></div> : null}
  </div>;
}
