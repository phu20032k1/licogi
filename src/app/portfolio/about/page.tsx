import { Building2, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import PublicSiteFrame from "../../../components/PublicSiteFrame";

export default function PublicAboutPage() {
  return <PublicSiteFrame>
    <main className="public-page-main">
      <section className="public-page-hero public-page-hero-compact"><div className="public-container"><span>Giới thiệu doanh nghiệp</span><h1>Công ty Cổ phần Đầu tư và Xây dựng số 18.3</h1></div></section>
      <section className="public-page-section"><div className="public-container public-about-page-grid">
        <article className="public-about-page-main"><Building2 size={26}/><h2>LICOGI 18.3</h2><p>Doanh nghiệp xây dựng thuộc hệ sinh thái LICOGI 18, tập trung tổ chức thi công, quản trị dự án và số hóa dữ liệu công trình.</p><div className="public-about-page-values"><div><ShieldCheck/><strong>Năng lực được chứng minh bằng dữ liệu dự án</strong></div><div><ShieldCheck/><strong>Danh mục công trình liên kết với GIS và hồ sơ vận hành</strong></div><div><ShieldCheck/><strong>Dữ liệu được cập nhật từ hệ thống quản trị nội bộ</strong></div></div></article>
        <aside className="public-about-page-contact"><h2>Thông tin liên hệ</h2><div><MapPin/><span><small>Trụ sở</small>Số 98 Nguyễn Văn Linh, phường Mỹ Hào, tỉnh Hưng Yên</span></div><div><Phone/><span><small>Điện thoại</small>(+84) 221.3942.550 / 551</span></div><div><Mail/><span><small>Email</small>jsclicogi18.3@gmail.com</span></div><div><Building2/><span><small>Mã doanh nghiệp</small>0900273641</span></div></aside>
      </div></section>
    </main>
  </PublicSiteFrame>;
}
