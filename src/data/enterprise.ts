import {
  BarChart3,
  FileText,
  Building2,
  ClipboardCheck,
  Handshake,
  HardHat,
  Layers3,
  LifeBuoy,
  LucideIcon,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export type OperatingModule = {
  id: number;
  title: string;
  shortTitle: string;
  layer: "Tầng 1" | "Tầng 2" | "Tầng 3" | "Tầng 4" | "Tầng nền";
  audience: string;
  value: string;
  status: "Đã dựng UI" | "Chờ dữ liệu thật" | "Sẵn sàng nối API";
  icon: LucideIcon;
  href: string;
};

export const operatingModules: OperatingModule[] = [
  { id: 1, title: "Dashboard Điều hành & Thương hiệu", shortTitle: "Executive Dashboard", layer: "Tầng 1", audience: "Ban lãnh đạo, khách hàng chiến lược", value: "Doanh thu, backlog, rủi ro, nguồn lực và hình ảnh thương hiệu trong một màn hình.", status: "Đã dựng UI", icon: BarChart3, href: "/dashboard" },
  { id: 2, title: "Bản đồ dự án thông minh", shortTitle: "GIS Project Map", layer: "Tầng 1", audience: "Kinh doanh, chào thầu, khách FDI", value: "Hiển thị năng lực thực chiến theo vùng, loại công trình, trạng thái và heatmap.", status: "Sẵn sàng nối API", icon: MapPinned, href: "/map" },
  { id: 3, title: "Hồ sơ năng lực số", shortTitle: "Profile Builder", layer: "Tầng 1", audience: "Phòng chào thầu, khách hàng", value: "Tạo hồ sơ đa ngôn ngữ từ dữ liệu dự án, ảnh, bảo hành và KPI đã nhập.", status: "Chờ dữ liệu thật", icon: FileText, href: "/ai-profile" },
  { id: 4, title: "Báo cáo điều hành", shortTitle: "Control Report", layer: "Tầng 2", audience: "Ban lãnh đạo, phòng ban", value: "Tổng hợp dữ liệu đã duyệt thành báo cáo điều hành, tiến độ, hồ sơ và rủi ro.", status: "Chờ dữ liệu thật", icon: BarChart3, href: "/reports" },
  { id: 5, title: "Điều hành thi công", shortTitle: "Construction Ops", layer: "Tầng 2", audience: "Ban điều hành, chỉ huy trưởng", value: "Gantt, nhật ký công trường, HSE, QA/QC, thiết bị, nhân lực, vật tư.", status: "Đã dựng UI", icon: HardHat, href: "/construction" },
  { id: 6, title: "Quản lý thiết kế & BIM", shortTitle: "Design & BIM", layer: "Tầng 2", audience: "Phòng thiết kế, QA/QC", value: "Kho bản vẽ số, revision, RFI, liên kết BIM 360 / Autodesk Platform Services.", status: "Sẵn sàng nối API", icon: Layers3, href: "/documents" },
  { id: 7, title: "Quản lý vòng đời dự án", shortTitle: "Lifecycle", layer: "Tầng 3", audience: "Kinh doanh, thi công, bảo hành", value: "Kết nối cơ hội → đấu thầu → thi công → bàn giao → bảo hành không đứt đoạn dữ liệu.", status: "Đã dựng UI", icon: ClipboardCheck, href: "/projects" },
  { id: 8, title: "Cổng Chủ đầu tư", shortTitle: "Customer Portal", layer: "Tầng 3", audience: "Chủ đầu tư", value: "Tiến độ, ảnh/video, hồ sơ nghiệm thu, yêu cầu hỗ trợ và project health theo thời gian thực.", status: "Đã dựng UI", icon: UsersRound, href: "/portal" },
  { id: 9, title: "Quản lý bảo hành công trình", shortTitle: "Warranty", layer: "Tầng 3", audience: "Phòng kỹ thuật, chủ đầu tư", value: "Ticket, SLA, lịch bảo hành định kỳ, lịch sử xử lý và đánh giá khách hàng.", status: "Đã dựng UI", icon: ShieldCheck, href: "/warranty" },
  { id: 10, title: "Hệ sinh thái & Marketplace đối tác", shortTitle: "Partner Marketplace", layer: "Tầng 4", audience: "Nhà thầu phụ, nhà cung cấp", value: "Subcontractor Passport, rating, safety score, gợi ý đối tác phù hợp theo từng dự án.", status: "Đã dựng UI", icon: Handshake, href: "/partners" },
];

export const strategicPillars = [
  { title: "Outside", subtitle: "Chứng minh năng lực ra thị trường", metric: "5 ngôn ngữ", icon: Building2 },
  { title: "Inside", subtitle: "Điều hành nội bộ bằng dữ liệu", metric: "KPI realtime", icon: BarChart3 },
  { title: "Market Bridge", subtitle: "Kết nối khách hàng, đối tác, cơ hội", metric: "FDI ready", icon: Handshake },
  { title: "Service Loop", subtitle: "Đồng hành sau bàn giao", metric: "SLA 95%", icon: LifeBuoy },
];

export const dataLakeGroups = [
  { name: "Projects", count: "0", detail: "Dự án hoàn thành, đang thi công, đang bảo hành" },
  { name: "Drawings", count: "0", detail: "Bản vẽ, revision, RFI, biên bản nghiệm thu" },
  { name: "Media", count: "0", detail: "Ảnh, video, flycam, nhật ký hiện trường" },
  { name: "Equipment", count: "0", detail: "Máy móc, trạng thái, hiệu suất, lịch bảo dưỡng" },
  { name: "Partners", count: "0", detail: "Nhà thầu phụ, nhà cung cấp, rating, HSE" },
  { name: "Knowledge", count: "0", detail: "Bài học thắng/thua, biện pháp thi công, checklist" },
];
