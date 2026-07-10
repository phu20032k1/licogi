export type ProjectStatus = "completed" | "ongoing" | "warranty";

export type ProjectType =
  | "Công nghiệp"
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

export const provinceCoordinates: Record<string, { lat: number; lng: number }> = {
  "Hà Nội": { lat: 21.0278, lng: 105.8342 },
  "Bắc Ninh": { lat: 21.1861, lng: 106.0763 },
  "Hải Phòng": { lat: 20.8449, lng: 106.6881 },
  "Hưng Yên": { lat: 20.8526, lng: 106.0169 },
  "Hải Dương": { lat: 20.9373, lng: 106.3146 },
  "Quảng Ninh": { lat: 21.0064, lng: 107.2925 },
  "Thái Nguyên": { lat: 21.5942, lng: 105.8482 },
  "Vĩnh Phúc": { lat: 21.3609, lng: 105.5474 },
  "Thanh Hóa": { lat: 19.8067, lng: 105.7852 },
  "Nghệ An": { lat: 18.6796, lng: 105.6813 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
  "Quảng Nam": { lat: 15.5394, lng: 108.0191 },
  "TP. Hồ Chí Minh": { lat: 10.8231, lng: 106.6297 },
  "Bình Dương": { lat: 11.3254, lng: 106.477 },
  "Đồng Nai": { lat: 10.9574, lng: 106.8427 },
  "Long An": { lat: 10.6956, lng: 106.2431 },
  "Bà Rịa - Vũng Tàu": { lat: 10.5417, lng: 107.2429 },
};

export const projects: Project[] = [];
