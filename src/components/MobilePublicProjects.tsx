"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Layers3, MapPin, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
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
  const progress = Math.max(0, Math.min(100, Number(project.progress || 0)));

  return <article className="phone-project-card">
    <div className="phone-project-card-top">
      <span className={`phone-project-status ${statusTone(project.status)}`}>{statusLabels[project.status]}</span>
      <span className="phone-project-code">{project.code}</span>
    </div>

    <h3>{project.name}</h3>
    <div className="phone-project-tags">
      <span><Layers3 size={13}/>{project.type}</span>
      <span><MapPin size={13}/>{project.province}</span>
    </div>
    <p className="phone-project-investor"><Building2 size={15}/>{project.investor || "Thông tin chủ đầu tư đang được cập nhật"}</p>

    <div className="phone-project-metrics">
      <div><span>Giá trị hợp đồng</span><strong>{formatVnd(projectMoney(project), project.valueRange || "Đang cập nhật")}</strong></div>
      <div><span>Tiến độ</span><strong>{progress}%</strong></div>
    </div>

    <div className="phone-project-progress" aria-label={`Tiến độ ${progress}%`}><span style={{ width: `${progress}%` }}/></div>

    <div className="phone-project-actions">
      <Link href={`/portfolio/projects/${encodeURIComponent(project.code || project.id)}`}>Hồ sơ công trình <ArrowRight size={15}/></Link>
      {mapsHref ? <a href={mapsHref} target="_blank" rel="noreferrer"><MapPin size={15}/> Xem vị trí</a> : <span className="phone-project-map-unavailable"><MapPin size={15}/> Chưa có vị trí</span>}
    </div>
  </article>;
}

export default function MobilePublicProjects({ initialStatus = "all", initialType = "all", initialSearch = "" }: Props) {
  const { projects, error, reload } = usePublicProjects();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState(initialType);
  const [retrying, setRetrying] = useState(false);

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
  const mapped = projects.filter((project) => Number.isFinite(project.lat) && Number.isFinite(project.lng) && project.lat >= 8 && project.lng >= 102).length;
  const provinces = new Set(projects.map((project) => project.province).filter((province) => province && province !== "Đang cập nhật")).size;

  async function retryProjects() {
    setRetrying(true);
    try {
      await reload();
    } finally {
      setRetrying(false);
    }
  }

  return <div className="phone-projects-page">
    <section className="phone-projects-hero">
      <div className="phone-projects-hero-copy">
        <span>HỒ SƠ NĂNG LỰC · CÔNG TRÌNH</span>
        <h1>Dấu ấn xây dựng trên toàn quốc</h1>
        <p>Khám phá các công trình LICOGI 18.3 theo địa bàn, lĩnh vực, quy mô và tiến độ triển khai.</p>
      </div>
      <div className="phone-projects-summary">
        <div><strong>{projects.length}</strong><span>Công trình</span></div>
        <div><strong>{ongoing}</strong><span>Đang thi công</span></div>
        <div><strong>{completed}</strong><span>Đã hoàn thành</span></div>
        <div><strong>{provinces}</strong><span>Địa bàn</span></div>
      </div>
      {mapped > 0 ? <div className="phone-projects-map-note"><MapPin size={14}/>{mapped} vị trí công trình đã được định vị trên bản đồ</div> : null}
    </section>

    <MobileProjectOverviewMap
      projects={projects}
      loading={false}
      error={error}
      onReload={() => { void retryProjects(); }}
      compact
    />

    <section className="phone-project-filters">
      <div className="phone-project-filter-heading">
        <div><span>TRA CỨU CÔNG TRÌNH</span><strong>Tìm kiếm & bộ lọc</strong></div>
        <span className="phone-project-filter-count">{filtered.length}/{projects.length}</span>
      </div>
      <label className="phone-project-search"><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên công trình, địa phương, chủ đầu tư..." /></label>

      <div className="phone-project-status-tabs" role="group" aria-label="Lọc trạng thái">
        <button type="button" onClick={() => setStatus("all")} className={status === "all" ? "is-active" : ""}>Tất cả</button>
        <button type="button" onClick={() => setStatus("ongoing")} className={status === "ongoing" ? "is-active" : ""}>Đang thi công</button>
        <button type="button" onClick={() => setStatus("completed")} className={status === "completed" ? "is-active" : ""}>Hoàn thành</button>
        <button type="button" onClick={() => setStatus("warranty")} className={status === "warranty" ? "is-active" : ""}>Bảo hành</button>
      </div>

      <div className="phone-project-filter-row">
        <label><SlidersHorizontal size={16}/><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">Tất cả lĩnh vực</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
    </section>

    <div className="phone-project-result-head"><strong>{filtered.length}</strong><span>công trình phù hợp</span>{error && projects.length > 0 ? <em>Đang hiển thị dữ liệu gần nhất</em> : null}</div>

    {filtered.length > 0 ? <div className="phone-project-list">{filtered.map((project) => <MobileProjectCard key={project.id} project={project}/>)}</div> : null}

    {projects.length === 0 ? <div className="phone-project-error"><strong>Danh mục tạm thời chưa khả dụng</strong><p>{error || "Hệ thống chưa nhận được dữ liệu công trình."}</p><button type="button" onClick={() => { void retryProjects(); }} disabled={retrying}><RefreshCcw size={16}/> {retrying ? "Đang thử lại" : "Thử lại"}</button></div> : null}

    {projects.length > 0 && filtered.length === 0 ? <div className="phone-project-empty"><Search size={26}/><strong>Không có công trình phù hợp</strong><span>Điều chỉnh bộ lọc hoặc sử dụng từ khóa khác.</span></div> : null}
  </div>;
}
