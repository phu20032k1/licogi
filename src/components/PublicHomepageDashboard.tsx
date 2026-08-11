"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Coins,
  Construction,
  Cpu,
  Droplets,
  Factory,
  Globe2,
  HardHat,
  Home,
  Map,
  MapPin,
  RefreshCw,
  Route,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import usePublicLanguage, { PublicLanguage } from "../hooks/usePublicLanguage";
import usePublicProjects from "../hooks/usePublicProjects";
import { sumProjectMoney } from "../lib/publicProject";
import styles from "./PublicHomepageDashboard.module.css";

const COPY = {
  vi: {
    eyebrow: "Tổng thầu xây dựng · Dữ liệu công trình",
    line1: "XÂY DỰNG GIÁ TRỊ",
    line2: "KIẾN TẠO TƯƠNG LAI",
    lead: "Tổng thầu xây dựng chuyên nghiệp cho công trình công nghiệp, dân dụng và hạ tầng kỹ thuật.",
    completed: "Công trình đã hoàn thành",
    ongoing: "Công trình đang thi công",
    provinces: "Tỉnh / thành phố đã triển khai",
    countries: "Quốc gia khách hàng",
    value: "Tỷ đồng giá trị công trình",
    investors: "Đồng hành cùng các nhà đầu tư",
    explore: "Khám phá công trình",
    map: "Xem bản đồ toàn quốc",
    national: "Công trình trên toàn quốc",
    clickTitle: "Khám phá dữ liệu công trình chỉ với 1 click",
    click: "Click vào",
    metric: "Số liệu",
    city: "Tỉnh / thành phố",
    type: "Loại công trình",
    customer: "Quốc gia khách hàng",
    point: "Điểm trên bản đồ",
    updated: "Tất cả dữ liệu luôn cập nhật",
    metricDesc: "Xem danh sách công trình tương ứng",
    cityDesc: "Xem công trình tại địa phương",
    typeDesc: "Lọc theo loại công trình bạn quan tâm",
    customerDesc: "Xem công trình theo quốc gia khách hàng",
    pointDesc: "Xem chi tiết từng công trình",
    updatedDesc: "Tự động cập nhật khi có dữ liệu mới",
    experience: "20+ năm",
    experienceSub: "Kinh nghiệm",
    commitment: "100% cam kết",
    commitmentSub: "Tiến độ · Chất lượng · An toàn",
    engineers: "500+ kỹ sư",
    engineersSub: "Đội ngũ chuyên nghiệp",
    standards: "Chuẩn quốc tế",
    standardsSub: "ISO 9001, 14001, 45001",
    equipment: "Thiết bị hiện đại",
    equipmentSub: "Công nghệ thi công tiên tiến",
  },
  en: {
    eyebrow: "General contractor · Project data",
    line1: "BUILDING VALUE",
    line2: "CREATING THE FUTURE",
    lead: "Professional general contractor for industrial, civil and technical infrastructure projects.",
    completed: "Completed projects", ongoing: "Projects under construction", provinces: "Provinces / cities covered", countries: "Customer countries", value: "VND billion project value",
    investors: "Trusted by investors", explore: "Explore projects", map: "View nationwide map", national: "Projects nationwide", clickTitle: "Explore project data in just 1 click", click: "Click", metric: "Metrics", city: "Province / city", type: "Project type", customer: "Customer country", point: "Map point", updated: "Data always up to date", metricDesc: "Open the matching project list", cityDesc: "View projects by location", typeDesc: "Filter by project type", customerDesc: "View projects by customer country", pointDesc: "Open project details", updatedDesc: "Automatically refreshes with new data", experience: "20+ years", experienceSub: "Experience", commitment: "100% commitment", commitmentSub: "Schedule · Quality · Safety", engineers: "500+ engineers", engineersSub: "Professional team", standards: "International standards", standardsSub: "ISO 9001, 14001, 45001", equipment: "Modern equipment", equipmentSub: "Advanced construction technology",
  },
  ja: {
    eyebrow: "総合建設請負 · プロジェクトデータ", line1: "価値を築き", line2: "未来を創る", lead: "産業・民生・技術インフラ工事に対応するプロフェッショナルな総合建設会社。", completed: "完成工事", ongoing: "施工中工事", provinces: "展開した省・都市", countries: "顧客の国・地域", value: "工事価値（10億VND）", investors: "投資家と共に", explore: "工事を見る", map: "全国マップ", national: "全国の工事", clickTitle: "1クリックで工事データを探索", click: "クリック", metric: "数値", city: "省・都市", type: "工事種別", customer: "顧客国", point: "地図ポイント", updated: "常に最新データ", metricDesc: "該当する工事一覧を表示", cityDesc: "地域別の工事を表示", typeDesc: "工事種別で絞り込み", customerDesc: "顧客国別に表示", pointDesc: "工事詳細を表示", updatedDesc: "新しいデータを自動更新", experience: "20年以上", experienceSub: "経験", commitment: "100%の約束", commitmentSub: "工程 · 品質 · 安全", engineers: "500名以上", engineersSub: "専門エンジニア", standards: "国際規格", standardsSub: "ISO 9001, 14001, 45001", equipment: "最新設備", equipmentSub: "先進施工技術",
  },
  ko: {
    eyebrow: "종합건설 · 프로젝트 데이터", line1: "가치를 건설하고", line2: "미래를 창조합니다", lead: "산업·민간·기술 인프라 프로젝트를 위한 전문 종합건설사입니다.", completed: "완료 프로젝트", ongoing: "시공 중 프로젝트", provinces: "진출 성·도시", countries: "고객 국가", value: "프로젝트 가치(십억 VND)", investors: "투자자와 함께", explore: "프로젝트 보기", map: "전국 지도 보기", national: "전국 프로젝트", clickTitle: "한 번의 클릭으로 프로젝트 데이터 탐색", click: "클릭", metric: "지표", city: "성 / 도시", type: "프로젝트 유형", customer: "고객 국가", point: "지도 포인트", updated: "항상 최신 데이터", metricDesc: "해당 프로젝트 목록 보기", cityDesc: "지역별 프로젝트 보기", typeDesc: "프로젝트 유형별 필터", customerDesc: "고객 국가별 보기", pointDesc: "프로젝트 상세 보기", updatedDesc: "새 데이터 자동 업데이트", experience: "20년+", experienceSub: "경험", commitment: "100% 약속", commitmentSub: "공정 · 품질 · 안전", engineers: "500명+", engineersSub: "전문 엔지니어", standards: "국제 표준", standardsSub: "ISO 9001, 14001, 45001", equipment: "현대 장비", equipmentSub: "첨단 시공 기술",
  },
  zh: {
    eyebrow: "建筑总承包 · 项目数据", line1: "构筑价值", line2: "共创未来", lead: "面向工业、民用及技术基础设施项目的专业建筑总承包商。", completed: "已完工项目", ongoing: "在建项目", provinces: "已覆盖省市", countries: "客户国家/地区", value: "项目价值（十亿越南盾）", investors: "与投资者同行", explore: "探索项目", map: "查看全国地图", national: "全国项目", clickTitle: "一键探索项目数据", click: "点击", metric: "数据", city: "省 / 城市", type: "项目类型", customer: "客户国家", point: "地图点位", updated: "数据持续更新", metricDesc: "查看对应项目列表", cityDesc: "查看当地项目", typeDesc: "按项目类型筛选", customerDesc: "按客户国家查看", pointDesc: "查看项目详情", updatedDesc: "新数据自动更新", experience: "20+年", experienceSub: "经验", commitment: "100%承诺", commitmentSub: "进度 · 质量 · 安全", engineers: "500+工程师", engineersSub: "专业团队", standards: "国际标准", standardsSub: "ISO 9001, 14001, 45001", equipment: "现代设备", equipmentSub: "先进施工技术",
  },
} as const;

const COUNTRY_LABELS: Record<PublicLanguage, Record<string, string>> = {
  vi: { japan: "Nhật Bản", korea: "Hàn Quốc", china: "Trung Quốc", taiwan: "Đài Loan", vietnam: "Việt Nam", other: "Khác" },
  en: { japan: "Japan", korea: "Korea", china: "China", taiwan: "Taiwan", vietnam: "Vietnam", other: "Other" },
  ja: { japan: "日本", korea: "韓国", china: "中国", taiwan: "台湾", vietnam: "ベトナム", other: "その他" },
  ko: { japan: "일본", korea: "한국", china: "중국", taiwan: "대만", vietnam: "베트남", other: "기타" },
  zh: { japan: "日本", korea: "韩国", china: "中国", taiwan: "台湾", vietnam: "越南", other: "其他" },
};

const countryDefs = [
  { key: "japan", flag: "🇯🇵", query: "Nhật Bản", aliases: ["nhật bản", "japan", "japanese"] },
  { key: "korea", flag: "🇰🇷", query: "Hàn Quốc", aliases: ["hàn quốc", "korea", "korean"] },
  { key: "china", flag: "🇨🇳", query: "Trung Quốc", aliases: ["trung quốc", "china", "chinese"] },
  { key: "taiwan", flag: "🇹🇼", query: "Đài Loan", aliases: ["đài loan", "taiwan", "taiwanese"] },
  { key: "vietnam", flag: "🇻🇳", query: "Việt Nam", aliases: ["việt nam", "viet nam", "vietnam"] },
] as const;

const localeByLanguage: Record<PublicLanguage, string> = { vi: "vi-VN", en: "en-US", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN" };

function normalize(value?: string) {
  return (value || "").trim().toLocaleLowerCase("vi");
}

function VietnamDataMap() {
  return <svg className={styles.mapVisual} viewBox="0 0 260 540" aria-label="Bản đồ công trình Việt Nam" role="img">
    <path d="M109 14c22 16 49 17 65 41 17 25 4 55 15 78 8 19 35 28 39 50 5 29-25 47-41 67-17 22-16 48-9 74 8 30 11 57-5 85-17 29-47 50-60 82-8 20-8 33-7 36-18-7-35-20-47-36-18-25-7-54 7-77 15-24 35-42 33-72-1-23-17-44-17-68 0-28 22-47 35-68 14-23 7-52-3-73-12-25-4-48 4-67 8-18 13-37 7-55-7-21-28-31-31-47-4-21 23-31 42-26Z"/>
    <circle cx="136" cy="67" r="7"/><circle cx="166" cy="99" r="6"/><circle cx="151" cy="136" r="6"/>
    <circle cx="168" cy="204" r="6"/><circle cx="139" cy="303" r="7"/><circle cx="119" cy="400" r="7"/>
    <circle cx="104" cy="447" r="6"/><circle cx="91" cy="477" r="7"/><circle cx="140" cy="468" r="5"/>
  </svg>;
}

export default function PublicHomepageDashboard() {
  const { language } = usePublicLanguage();
  const { projects, loading, error } = usePublicProjects();
  const t = COPY[language];
  const completed = projects.filter((project) => project.status === "completed");
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const provinces = new Set(projects.map((project) => project.province).filter(Boolean));
  const customerCountries = new Set(projects.map((project) => normalize(project.investorCountry)).filter(Boolean));
  const totalValue = sumProjectMoney(projects);
  const totalBillions = totalValue / 1_000_000_000;
  const numberFormat = new Intl.NumberFormat(localeByLanguage[language], { maximumFractionDigits: totalBillions >= 100 ? 0 : 1 });
  const valueText = loading ? "—" : `${numberFormat.format(totalBillions)}+`;

  const metrics = [
    { icon: Building2, value: loading ? "—" : `${completed.length}+`, label: t.completed, href: "/portfolio/projects?status=completed" },
    { icon: Construction, value: loading ? "—" : `${ongoing.length}+`, label: t.ongoing, href: "/portfolio/projects?status=ongoing" },
    { icon: MapPin, value: loading ? "—" : String(provinces.size), label: t.provinces, href: "/portfolio/locations" },
    { icon: Globe2, value: loading ? "—" : `${customerCountries.size}+`, label: t.countries, href: "/portfolio/projects" },
    { icon: Coins, value: valueText, label: t.value, href: "/portfolio/overview" },
  ];

  const countryCounts = countryDefs.map((country) => ({
    ...country,
    count: projects.filter((project) => country.aliases.includes(normalize(project.investorCountry) as never)).length,
  }));
  const recognizedCount = countryCounts.reduce((sum, country) => sum + country.count, 0);
  const otherCount = Math.max(0, projects.filter((project) => project.investorCountry).length - recognizedCount);
  const labels = COUNTRY_LABELS[language];

  const explorationCards = [
    { key: "metric", title: `${t.click} ${t.metric}`, desc: t.metricDesc, href: "/portfolio/projects", visual: <div className={styles.miniNumbers}><span>{completed.length}+</span><span>{ongoing.length}+</span><span>{provinces.size}</span></div> },
    { key: "city", title: `${t.click} ${t.city}`, desc: t.cityDesc, href: "/portfolio/locations", visual: <div className={styles.miniList}>{Array.from(provinces).slice(0, 5).map((province) => <span key={province}>{province}<b>{projects.filter((item) => item.province === province).length}</b></span>)}</div> },
    { key: "type", title: `${t.click} ${t.type}`, desc: t.typeDesc, href: "/portfolio/capabilities", visual: <div className={styles.miniIcons}><span><Factory size={19}/>CN</span><span><Home size={19}/>DD</span><span><Route size={19}/>HT</span><span><Construction size={19}/>GT</span><span><Droplets size={19}/>TL</span><span><Zap size={19}/>NL</span></div> },
    { key: "customer", title: `${t.click} ${t.customer}`, desc: t.customerDesc, href: "/portfolio/projects?q=Nhật%20Bản", visual: <div className={styles.miniList}>{countryCounts.slice(0, 5).map((country) => <span key={country.key}>{country.flag} {labels[country.key]}<b>{country.count}</b></span>)}</div> },
    { key: "point", title: `${t.click} ${t.point}`, desc: t.pointDesc, href: "/portfolio/projects", visual: <MapPin size={46} color="#c2410c"/> },
    { key: "updated", title: t.updated, desc: t.updatedDesc, href: "/portfolio/overview", visual: <RefreshCw size={52} className={styles.refreshIcon}/> },
  ];

  return <>
    <section className={styles.hero} id="trang-chu">
      <div className={styles.heroBg}><img src="/media/hero-construction.svg" alt="Năng lực thi công LICOGI 18.3"/></div>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><HardHat size={15}/> {t.eyebrow}</div>
          <h1 className={styles.heroTitle}>{t.line1}<span>{t.line2}</span></h1>
          <p className={styles.heroLead}>{t.lead}</p>

          <div className={styles.dataPanel}>
            <div className={styles.kpiGrid}>
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return <Link key={metric.label} href={metric.href} className={styles.kpi}>
                  <span className={styles.kpiIcon}><Icon size={24}/></span>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </Link>;
              })}
            </div>
            <div className={styles.investors}>
              <span className={styles.investorsTitle}>{t.investors}</span>
              <div className={styles.countryGrid}>
                {countryCounts.map((country) => <Link key={country.key} href={`/portfolio/projects?q=${encodeURIComponent(country.query)}`} className={styles.country} title={`${labels[country.key]} · ${country.count}`}><b>{country.flag}</b><span>{labels[country.key]}</span></Link>)}
                <Link href="/portfolio/projects" className={styles.country} title={`${labels.other} · ${otherCount}`}><b>•••</b><span>{labels.other}</span></Link>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/portfolio/projects" className={styles.primaryButton}>{t.explore}<ArrowRight size={15}/></Link>
            <Link href="/portfolio/locations" className={styles.secondaryButton}><Map size={15}/>{t.map}<ArrowRight size={14}/></Link>
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
        <VietnamDataMap />
        <Link href="/portfolio/projects" className={styles.nationalBadge}><Building2 size={35}/><div><strong>{loading ? "—" : `${projects.length}+`}</strong><span>{t.national}</span></div></Link>
      </div>
    </section>

    <section className={styles.explore} aria-label={t.clickTitle}>
      <div className={styles.exploreInner}>
        <h2 className={styles.exploreTitle}>{t.clickTitle}</h2>
        <div className={styles.exploreGrid}>
          {explorationCards.map((card) => <Link key={card.key} href={card.href} className={styles.exploreCard}>
            <small>{card.title}</small>
            <div className={styles.miniVisual}>{card.visual}</div>
            <strong>{card.desc}</strong>
          </Link>)}
        </div>
      </div>
    </section>

    <section className={styles.trustStrip} aria-label="LICOGI 18.3">
      <div className={styles.trustInner}>
        <div className={styles.trustItem}><Building2 size={25}/><div><strong>{t.experience}</strong><span>{t.experienceSub}</span></div></div>
        <div className={styles.trustItem}><ShieldCheck size={25}/><div><strong>{t.commitment}</strong><span>{t.commitmentSub}</span></div></div>
        <div className={styles.trustItem}><Users size={25}/><div><strong>{t.engineers}</strong><span>{t.engineersSub}</span></div></div>
        <div className={styles.trustItem}><BadgeCheck size={25}/><div><strong>{t.standards}</strong><span>{t.standardsSub}</span></div></div>
        <div className={styles.trustItem}><Cpu size={25}/><div><strong>{t.equipment}</strong><span>{t.equipmentSub}</span></div></div>
      </div>
    </section>
  </>;
}
