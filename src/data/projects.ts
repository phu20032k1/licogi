export type ProjectStatus = "completed" | "ongoing" | "warranty";

export type ProjectType =
  | "Công nghiệp"
  | "Nông nghiệp"
  | "Dân dụng"
  | "Hạ tầng"
  | "Giao thông"
  | "Điện năng";

export type ProjectRisk = "low" | "medium" | "high";

export type ProjectTimeline = {
  label: string;
  date: string;
  status: "done" | "active" | "upcoming";
};

export type ProjectEvidence = {
  label: string;
  value: string;
};

export type Project = {
  id: number;
  code?: string;
  name: string;
  type: ProjectType;
  subType?: string;
  status: ProjectStatus;
  investor: string;
  investorCountry?: string;
  province: string;
  valueRange: string;
  scale?: string;
  role?: "EPC" | "Tổng thầu" | "Nhà thầu chính" | "Nhà thầu phụ";
  contractorUnit?: string;
  progress: number;
  plannedProgress?: number;
  lat: number;
  lng: number;
  description?: string;
  manager?: string;
  startDate?: string;
  endDate?: string;
  warrantyUntil?: string;
  healthScore?: number;
  risk?: ProjectRisk;
  photos?: number;
  videos?: number;
  documents?: number;
  customerRating?: number;
  timeline?: ProjectTimeline[];
  evidence?: ProjectEvidence[];
};

export const projectTypes: ProjectType[] = [
  "Công nghiệp",
  "Nông nghiệp",
  "Dân dụng",
  "Hạ tầng",
  "Giao thông",
  "Điện năng",
];

export const projectStatuses: ProjectStatus[] = ["ongoing", "completed", "warranty"];

export const statusLabels: Record<ProjectStatus, string> = {
  completed: "Đã hoàn thành",
  ongoing: "Đang thi công",
  warranty: "Đang bảo hành",
};

export const riskLabels: Record<ProjectRisk, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

export const valueRanges = [
  "Dưới 100 tỷ",
  "100-200 tỷ",
  "200-300 tỷ",
  "300-500 tỷ",
  "Trên 500 tỷ",
];

/**
 * 34 đơn vị hành chính cấp tỉnh sau đợt sắp xếp năm 2025.
 * Dùng danh sách này cho thống kê public và các UI chọn địa phương mới.
 */
export const currentVietnamProvinces = [
  "Tuyên Quang",
  "Lào Cai",
  "Thái Nguyên",
  "Phú Thọ",
  "Bắc Ninh",
  "Hưng Yên",
  "Hải Phòng",
  "Ninh Bình",
  "Quảng Trị",
  "Đà Nẵng",
  "Quảng Ngãi",
  "Gia Lai",
  "Khánh Hòa",
  "Lâm Đồng",
  "Đắk Lắk",
  "TP. Hồ Chí Minh",
  "Đồng Nai",
  "Tây Ninh",
  "Cần Thơ",
  "Vĩnh Long",
  "Đồng Tháp",
  "Cà Mau",
  "An Giang",
  "Cao Bằng",
  "Điện Biên",
  "Hà Tĩnh",
  "Lai Châu",
  "Lạng Sơn",
  "Nghệ An",
  "Quảng Ninh",
  "Thanh Hóa",
  "Sơn La",
  "Hà Nội",
  "Huế",
] as const;

export type CurrentVietnamProvince = (typeof currentVietnamProvinces)[number];

function provinceKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .replace(/^(tỉnh|thành phố|tp\.?|city)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

const provinceAliasEntries: Array<[string, CurrentVietnamProvince]> = [
  ["Hà Giang", "Tuyên Quang"], ["Tuyên Quang", "Tuyên Quang"],
  ["Yên Bái", "Lào Cai"], ["Lào Cai", "Lào Cai"],
  ["Bắc Kạn", "Thái Nguyên"], ["Thái Nguyên", "Thái Nguyên"],
  ["Vĩnh Phúc", "Phú Thọ"], ["Hòa Bình", "Phú Thọ"], ["Hoà Bình", "Phú Thọ"], ["Phú Thọ", "Phú Thọ"],
  ["Bắc Giang", "Bắc Ninh"], ["Bắc Ninh", "Bắc Ninh"],
  ["Thái Bình", "Hưng Yên"], ["Hưng Yên", "Hưng Yên"],
  ["Hải Dương", "Hải Phòng"], ["Hải Phòng", "Hải Phòng"],
  ["Hà Nam", "Ninh Bình"], ["Nam Định", "Ninh Bình"], ["Ninh Bình", "Ninh Bình"],
  ["Quảng Bình", "Quảng Trị"], ["Quảng Trị", "Quảng Trị"],
  ["Quảng Nam", "Đà Nẵng"], ["Đà Nẵng", "Đà Nẵng"],
  ["Kon Tum", "Quảng Ngãi"], ["Quảng Ngãi", "Quảng Ngãi"],
  ["Bình Định", "Gia Lai"], ["Gia Lai", "Gia Lai"],
  ["Ninh Thuận", "Khánh Hòa"], ["Khánh Hòa", "Khánh Hòa"],
  ["Đắk Nông", "Lâm Đồng"], ["Đắc Nông", "Lâm Đồng"], ["Bình Thuận", "Lâm Đồng"], ["Lâm Đồng", "Lâm Đồng"],
  ["Phú Yên", "Đắk Lắk"], ["Đắk Lắk", "Đắk Lắk"], ["Đắc Lắc", "Đắk Lắk"],
  ["Bà Rịa - Vũng Tàu", "TP. Hồ Chí Minh"], ["Bà Rịa – Vũng Tàu", "TP. Hồ Chí Minh"], ["Bình Dương", "TP. Hồ Chí Minh"], ["Hồ Chí Minh", "TP. Hồ Chí Minh"], ["TP. Hồ Chí Minh", "TP. Hồ Chí Minh"],
  ["Bình Phước", "Đồng Nai"], ["Đồng Nai", "Đồng Nai"],
  ["Long An", "Tây Ninh"], ["Tây Ninh", "Tây Ninh"],
  ["Sóc Trăng", "Cần Thơ"], ["Hậu Giang", "Cần Thơ"], ["Cần Thơ", "Cần Thơ"],
  ["Bến Tre", "Vĩnh Long"], ["Trà Vinh", "Vĩnh Long"], ["Vĩnh Long", "Vĩnh Long"],
  ["Tiền Giang", "Đồng Tháp"], ["Đồng Tháp", "Đồng Tháp"],
  ["Bạc Liêu", "Cà Mau"], ["Cà Mau", "Cà Mau"],
  ["Kiên Giang", "An Giang"], ["An Giang", "An Giang"],
  ["Thừa Thiên Huế", "Huế"], ["Huế", "Huế"],
  ["Cao Bằng", "Cao Bằng"], ["Điện Biên", "Điện Biên"], ["Hà Tĩnh", "Hà Tĩnh"],
  ["Lai Châu", "Lai Châu"], ["Lạng Sơn", "Lạng Sơn"], ["Nghệ An", "Nghệ An"],
  ["Quảng Ninh", "Quảng Ninh"], ["Thanh Hóa", "Thanh Hóa"], ["Thanh Hoá", "Thanh Hóa"],
  ["Sơn La", "Sơn La"], ["Hà Nội", "Hà Nội"],
];

export const provinceAliases: Record<string, CurrentVietnamProvince> = Object.fromEntries(
  provinceAliasEntries.map(([name, canonical]) => [provinceKey(name), canonical]),
) as Record<string, CurrentVietnamProvince>;

export function normalizeProvinceName(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "Hà Nội";
  return provinceAliases[provinceKey(raw)] || raw.replace(/^(tỉnh|thành phố|tp\.?|city)\s+/i, "").trim();
}

/** Tọa độ đại diện của 34 tỉnh/thành mới để fit bản đồ khi bản ghi chưa có lat/lng. */
export const provinceCoordinates: Record<string, { lat: number; lng: number }> = {
  "Tuyên Quang": { lat: 21.8236, lng: 105.2140 },
  "Lào Cai": { lat: 21.7168, lng: 104.8986 },
  "Thái Nguyên": { lat: 21.5942, lng: 105.8482 },
  "Phú Thọ": { lat: 21.3227, lng: 105.4019 },
  "Bắc Ninh": { lat: 21.1861, lng: 106.0763 },
  "Hưng Yên": { lat: 20.8526, lng: 106.0169 },
  "Hải Phòng": { lat: 20.8449, lng: 106.6881 },
  "Ninh Bình": { lat: 20.2506, lng: 105.9745 },
  "Quảng Trị": { lat: 17.4688, lng: 106.6223 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
  "Quảng Ngãi": { lat: 15.1205, lng: 108.7923 },
  "Gia Lai": { lat: 13.7820, lng: 109.2190 },
  "Khánh Hòa": { lat: 12.2388, lng: 109.1967 },
  "Lâm Đồng": { lat: 11.9404, lng: 108.4583 },
  "Đắk Lắk": { lat: 12.6667, lng: 108.0500 },
  "TP. Hồ Chí Minh": { lat: 10.8231, lng: 106.6297 },
  "Đồng Nai": { lat: 10.9574, lng: 106.8427 },
  "Tây Ninh": { lat: 11.3352, lng: 106.1099 },
  "Cần Thơ": { lat: 10.0452, lng: 105.7469 },
  "Vĩnh Long": { lat: 10.2537, lng: 105.9722 },
  "Đồng Tháp": { lat: 10.4493, lng: 106.3421 },
  "Cà Mau": { lat: 9.1769, lng: 105.1524 },
  "An Giang": { lat: 10.0125, lng: 105.0809 },
  "Cao Bằng": { lat: 22.6666, lng: 106.2639 },
  "Điện Biên": { lat: 21.3860, lng: 103.0230 },
  "Hà Tĩnh": { lat: 18.3559, lng: 105.8877 },
  "Lai Châu": { lat: 22.3862, lng: 103.4703 },
  "Lạng Sơn": { lat: 21.8537, lng: 106.7615 },
  "Nghệ An": { lat: 18.6796, lng: 105.6813 },
  "Quảng Ninh": { lat: 21.0064, lng: 107.2925 },
  "Thanh Hóa": { lat: 19.8067, lng: 105.7852 },
  "Sơn La": { lat: 21.3256, lng: 103.9188 },
  "Hà Nội": { lat: 21.0278, lng: 105.8342 },
  "Huế": { lat: 16.4637, lng: 107.5909 },
};

/**
 * Giữ tọa độ gần địa bàn cũ khi import file lịch sử dùng tên tỉnh trước sáp nhập.
 * Tên hiển thị vẫn được chuẩn hóa sang 34 tỉnh/thành mới.
 */
export const legacyProvinceCoordinates: Record<string, { lat: number; lng: number }> = {
  "Hà Giang": { lat: 22.8233, lng: 104.9836 },
  "Yên Bái": { lat: 21.7168, lng: 104.8986 },
  "Lào Cai": { lat: 22.4809, lng: 103.9755 },
  "Bắc Kạn": { lat: 22.1470, lng: 105.8348 },
  "Vĩnh Phúc": { lat: 21.3609, lng: 105.5474 },
  "Hòa Bình": { lat: 20.8133, lng: 105.3383 },
  "Bắc Giang": { lat: 21.2731, lng: 106.1946 },
  "Thái Bình": { lat: 20.4463, lng: 106.3366 },
  "Hải Dương": { lat: 20.9373, lng: 106.3146 },
  "Hà Nam": { lat: 20.5835, lng: 105.9230 },
  "Nam Định": { lat: 20.4388, lng: 106.1621 },
  "Quảng Bình": { lat: 17.4688, lng: 106.6223 },
  "Quảng Nam": { lat: 15.5394, lng: 108.0191 },
  "Kon Tum": { lat: 14.3545, lng: 108.0076 },
  "Bình Định": { lat: 13.7820, lng: 109.2190 },
  "Ninh Thuận": { lat: 11.6739, lng: 108.8629 },
  "Đắk Nông": { lat: 12.2646, lng: 107.6098 },
  "Bình Thuận": { lat: 10.9289, lng: 108.1021 },
  "Phú Yên": { lat: 13.0882, lng: 109.0929 },
  "Bà Rịa - Vũng Tàu": { lat: 10.5417, lng: 107.2429 },
  "Bình Dương": { lat: 11.3254, lng: 106.4770 },
  "Bình Phước": { lat: 11.7512, lng: 106.7235 },
  "Long An": { lat: 10.6956, lng: 106.2431 },
  "Sóc Trăng": { lat: 9.6025, lng: 105.9739 },
  "Hậu Giang": { lat: 9.7845, lng: 105.4701 },
  "Bến Tre": { lat: 10.2434, lng: 106.3756 },
  "Trà Vinh": { lat: 9.9347, lng: 106.3452 },
  "Tiền Giang": { lat: 10.4493, lng: 106.3421 },
  "Bạc Liêu": { lat: 9.2941, lng: 105.7278 },
  "Kiên Giang": { lat: 10.0125, lng: 105.0809 },
  "Thừa Thiên Huế": { lat: 16.4637, lng: 107.5909 },
};

export const projects: Project[] = [];
