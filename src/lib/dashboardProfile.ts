import type { UserSession } from "./authSession";

export type DashboardAudience =
  | "CHAIRMAN"
  | "GENERAL_DIRECTOR"
  | "DEPUTY_GENERAL_DIRECTOR"
  | "DEPARTMENT_HEAD"
  | "DEPUTY_DEPARTMENT_HEAD"
  | "EMPLOYEE";

export type DashboardProfile = {
  code: DashboardAudience;
  label: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  boardTitle: string;
  alertTitle: string;
  directiveTitle: string;
  workTitle: string;
  maxProjectRows: number;
  maxTaskRows: number;
  quickLinks: Array<{ href: string; label: string; note: string }>;
  priorities: string[];
};

export const dashboardProfiles: Record<DashboardAudience, DashboardProfile> = {
  CHAIRMAN: {
    code: "CHAIRMAN",
    label: "Chủ tịch HĐQT",
    shortLabel: "Chủ tịch",
    eyebrow: "HĐQT · Chiến lược & giám sát",
    title: "Dashboard Chủ tịch HĐQT",
    description: "Tập trung vào tăng trưởng, danh mục đầu tư, hiệu quả toàn công ty, rủi ro lớn và các nội dung cần quyết nghị.",
    boardTitle: "Danh mục chiến lược toàn công ty",
    alertTitle: "Vấn đề cần HĐQT quan tâm",
    directiveTitle: "Nội dung cần quyết nghị / giám sát",
    workTitle: "Chỉ tiêu chiến lược",
    maxProjectRows: 6,
    maxTaskRows: 4,
    quickLinks: [
      { href: "/reports", label: "Báo cáo quản trị", note: "Kết quả toàn công ty" },
      { href: "/finance", label: "Tài chính", note: "Dòng tiền & hiệu quả" },
      { href: "/projects", label: "Danh mục dự án", note: "Danh mục chiến lược" },
      { href: "/activity", label: "Nhật ký điều hành", note: "Theo dõi quyết định" },
    ],
    priorities: ["Tăng trưởng và hiệu quả danh mục", "Rủi ro cấp công ty", "Dòng tiền và công nợ", "Tiến độ các dự án trọng điểm"],
  },
  GENERAL_DIRECTOR: {
    code: "GENERAL_DIRECTOR",
    label: "Tổng giám đốc",
    shortLabel: "TGĐ",
    eyebrow: "Ban điều hành · Điều hành toàn công ty",
    title: "Dashboard Tổng giám đốc",
    description: "Điều hành trực tiếp tiến độ, nguồn lực, doanh thu, chất lượng và các điểm nghẽn cần chỉ đạo trong ngày.",
    boardTitle: "Bảng điều hành toàn công ty",
    alertTitle: "Cảnh báo cần Tổng giám đốc xử lý",
    directiveTitle: "Chỉ đạo điều hành",
    workTitle: "Tình hình thực thi",
    maxProjectRows: 10,
    maxTaskRows: 6,
    quickLinks: [
      { href: "/projects", label: "Dự án", note: "Tiến độ & sức khỏe" },
      { href: "/construction", label: "Thi công", note: "Hiện trường" },
      { href: "/tasks", label: "Phê duyệt", note: "Công việc & quyết định" },
      { href: "/reports", label: "Báo cáo", note: "Tổng hợp điều hành" },
    ],
    priorities: ["Tiến độ toàn công ty", "Dự án chậm và rủi ro cao", "Điều phối nguồn lực", "Phê duyệt và tháo gỡ điểm nghẽn"],
  },
  DEPUTY_GENERAL_DIRECTOR: {
    code: "DEPUTY_GENERAL_DIRECTOR",
    label: "Phó Tổng giám đốc",
    shortLabel: "PTGĐ",
    eyebrow: "Ban điều hành · Khối phụ trách",
    title: "Dashboard Phó Tổng giám đốc",
    description: "Tập trung vào danh mục được phân công, tiến độ hiện trường, phối hợp liên phòng và các vấn đề cần báo cáo Tổng giám đốc.",
    boardTitle: "Danh mục cần điều phối",
    alertTitle: "Cảnh báo trong khối phụ trách",
    directiveTitle: "Điều phối liên phòng / dự án",
    workTitle: "Kết quả khối phụ trách",
    maxProjectRows: 8,
    maxTaskRows: 6,
    quickLinks: [
      { href: "/construction", label: "Thi công", note: "Điều hành hiện trường" },
      { href: "/planning", label: "Kế hoạch", note: "Bù tiến độ" },
      { href: "/tasks", label: "Công việc", note: "Phối hợp & phê duyệt" },
      { href: "/documents", label: "Hồ sơ", note: "Hồ sơ kỹ thuật" },
    ],
    priorities: ["Bù tiến độ dự án", "Phối hợp phòng ban", "Chất lượng và an toàn", "Báo cáo điểm nghẽn lên TGĐ"],
  },
  DEPARTMENT_HEAD: {
    code: "DEPARTMENT_HEAD",
    label: "Trưởng phòng / Trưởng ban",
    shortLabel: "Trưởng phòng",
    eyebrow: "Quản lý cấp phòng · Kế hoạch & giao việc",
    title: "Dashboard Trưởng phòng",
    description: "Quản lý kế hoạch phòng ban, phân công nhân sự, chất lượng đầu ra, tiến độ dự án và các đầu việc cần duyệt.",
    boardTitle: "Dự án và đầu việc của phòng",
    alertTitle: "Việc cần Trưởng phòng xử lý",
    directiveTitle: "Giao việc & kiểm soát",
    workTitle: "Năng suất phòng ban",
    maxProjectRows: 7,
    maxTaskRows: 8,
    quickLinks: [
      { href: "/tasks", label: "Công việc", note: "Giao việc & duyệt" },
      { href: "/planning", label: "Kế hoạch", note: "Kế hoạch tuần/tháng" },
      { href: "/projects", label: "Dự án", note: "Phạm vi phòng phụ trách" },
      { href: "/documents", label: "Hồ sơ", note: "Chất lượng đầu ra" },
    ],
    priorities: ["Phân công đúng người", "Theo dõi hạn công việc", "Kiểm soát chất lượng hồ sơ", "Báo cáo cấp điều hành"],
  },
  DEPUTY_DEPARTMENT_HEAD: {
    code: "DEPUTY_DEPARTMENT_HEAD",
    label: "Phó phòng / Phó ban",
    shortLabel: "Phó phòng",
    eyebrow: "Điều phối cấp phòng · Theo dõi hằng ngày",
    title: "Dashboard Phó phòng",
    description: "Theo dõi công việc hằng ngày, nhắc hạn, kiểm tra hồ sơ và hỗ trợ Trưởng phòng điều phối nhân sự, dự án.",
    boardTitle: "Danh sách cần theo dõi hằng ngày",
    alertTitle: "Việc sắp đến hạn / đang chậm",
    directiveTitle: "Điều phối thực hiện",
    workTitle: "Tiến độ công việc",
    maxProjectRows: 6,
    maxTaskRows: 10,
    quickLinks: [
      { href: "/tasks", label: "Công việc", note: "Theo dõi thực hiện" },
      { href: "/documents", label: "Hồ sơ", note: "Kiểm tra đầu ra" },
      { href: "/construction", label: "Thi công", note: "Phối hợp hiện trường" },
      { href: "/planning", label: "Kế hoạch", note: "Cập nhật tiến độ" },
    ],
    priorities: ["Nhắc việc đến hạn", "Kiểm tra tiến độ thực hiện", "Tổng hợp vướng mắc", "Chuẩn bị báo cáo Trưởng phòng"],
  },
  EMPLOYEE: {
    code: "EMPLOYEE",
    label: "Nhân viên",
    shortLabel: "Nhân viên",
    eyebrow: "Không gian làm việc cá nhân",
    title: "Dashboard công việc cá nhân",
    description: "Chỉ tập trung vào việc được giao, hạn hoàn thành, dự án đang tham gia, tài liệu cần cập nhật và các cảnh báo liên quan trực tiếp.",
    boardTitle: "Dự án / hạng mục đang tham gia",
    alertTitle: "Việc của tôi cần chú ý",
    directiveTitle: "Việc cần làm tiếp theo",
    workTitle: "Công việc của tôi",
    maxProjectRows: 5,
    maxTaskRows: 12,
    quickLinks: [
      { href: "/tasks", label: "Công việc của tôi", note: "Danh sách được giao" },
      { href: "/construction", label: "Cập nhật thi công", note: "Nhật ký hiện trường" },
      { href: "/documents", label: "Tài liệu", note: "Hồ sơ cần cập nhật" },
      { href: "/storage", label: "Kho file", note: "Ảnh & minh chứng" },
    ],
    priorities: ["Hoàn thành việc đúng hạn", "Cập nhật tiến độ thực tế", "Bổ sung hồ sơ minh chứng", "Báo sớm khi có vướng mắc"],
  },
};

function normalize(value?: string | null) {
  return String(value || "")
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveDashboardAudience(session: UserSession | null | undefined): DashboardAudience {
  const haystack = normalize(`${session?.name || ""} ${session?.role || ""} ${session?.email || ""}`);
  const roleCode = String(session?.roleCode || "").toUpperCase();

  if (/chu tich|chairman|hdqt/.test(haystack)) return "CHAIRMAN";
  if (/pho tong giam doc|pho tong|deputy general|deputy ceo|ptgd/.test(haystack)) return "DEPUTY_GENERAL_DIRECTOR";
  if (/tong giam doc|general director|ceo|tgd/.test(haystack)) return "GENERAL_DIRECTOR";
  if (/pho phong|pho ban|deputy head|deputy manager/.test(haystack)) return "DEPUTY_DEPARTMENT_HEAD";
  if (/truong phong|truong ban|department head|head of/.test(haystack)) return "DEPARTMENT_HEAD";

  if (roleCode === "SUPER_ADMIN" || roleCode === "SYSTEM_ADMIN") return "CHAIRMAN";
  if (roleCode === "EXECUTIVE") return "GENERAL_DIRECTOR";
  if (roleCode === "PROJECT_MANAGER") return "DEPARTMENT_HEAD";
  return "EMPLOYEE";
}

export const dashboardAudienceOptions = (Object.keys(dashboardProfiles) as DashboardAudience[]).map((code) => ({
  code,
  label: dashboardProfiles[code].label,
}));
