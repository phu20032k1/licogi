import { valueRanges } from "./projects";

export type DataEntityKey = "projects" | "customers" | "employees" | "equipment" | "warranty" | "documents";

export type ImportColumn = {
  key: string;
  label: string;
  required: boolean;
  example: string;
  note?: string;
};

export type DataEntity = {
  key: DataEntityKey;
  title: string;
  owner: string;
  description: string;
  templateFile: string;
  total: number;
  cleanRate: number;
  lastImport: string;
  columns: ImportColumn[];
};

export const dataEntities: DataEntity[] = [
  {
    key: "projects",
    title: "Dữ liệu dự án",
    owner: "Ban điều hành dự án",
    description: "Nguồn dữ liệu lõi cho Dashboard, GIS, hồ sơ năng lực và báo cáo điều hành.",
    templateFile: "/templates/licogi_projects_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "project_code", label: "Mã dự án", required: true, example: "LCG-BN-025" },
      { key: "project_name", label: "Tên dự án", required: true, example: "Tên dự án cần nhập" },
      { key: "type", label: "Loại công trình", required: true, example: "Công nghiệp", note: `Một trong: ${["Công nghiệp", "Dân dụng", "Hạ tầng", "Giao thông", "Điện năng"].join(", ")}` },
      { key: "status", label: "Trạng thái", required: true, example: "ongoing", note: "ongoing / completed / warranty" },
      { key: "investor", label: "Chủ đầu tư", required: true, example: "Global Electronics Vietnam" },
      { key: "province", label: "Tỉnh/thành", required: true, example: "Tỉnh/thành" },
      { key: "value_range", label: "Khoảng giá trị", required: false, example: "300-500 tỷ", note: valueRanges.join(" / ") },
      { key: "progress", label: "Tiến độ", required: false, example: "78" },
      { key: "lat", label: "Vĩ độ", required: false, example: "21.1861" },
      { key: "lng", label: "Kinh độ", required: false, example: "106.0763" },
    ],
  },
  {
    key: "customers",
    title: "Chủ đầu tư / khách hàng",
    owner: "Phòng Kinh doanh",
    description: "Quản lý chủ đầu tư, quốc gia, ngành nghề, liên hệ và lịch sử dự án.",
    templateFile: "/templates/licogi_customers_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "customer_code", label: "Mã khách hàng", required: true, example: "CUS-001" },
      { key: "customer_name", label: "Tên khách hàng", required: true, example: "Tên khách hàng cần nhập" },
      { key: "country", label: "Quốc gia", required: false, example: "Nhật Bản" },
      { key: "industry", label: "Ngành", required: false, example: "Cơ khí chính xác" },
      { key: "contact_name", label: "Người liên hệ", required: false, example: "Yuki Tanaka" },
      { key: "contact_email", label: "Email", required: false, example: "email@domain.vn" },
    ],
  },
  {
    key: "employees",
    title: "Nhân sự công trường",
    owner: "Phòng Nhân sự",
    description: "Danh sách kỹ sư, chỉ huy trưởng, đội thi công và kỹ năng theo dự án.",
    templateFile: "/templates/licogi_employees_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "employee_code", label: "Mã nhân sự", required: true, example: "EMP-0001" },
      { key: "full_name", label: "Họ tên", required: true, example: "Nguyễn Văn Hùng" },
      { key: "department", label: "Phòng/ban", required: true, example: "Ban điều hành dự án" },
      { key: "position", label: "Chức danh", required: false, example: "Chỉ huy trưởng" },
      { key: "phone", label: "Số điện thoại", required: false, example: "0903 422 518" },
      { key: "assigned_project", label: "Dự án phụ trách", required: false, example: "LCG-BN-025" },
    ],
  },
  {
    key: "equipment",
    title: "Thiết bị thi công",
    owner: "Phòng Thiết bị",
    description: "Theo dõi máy móc, tình trạng, vị trí, hiệu suất và lịch bảo dưỡng.",
    templateFile: "/templates/licogi_equipment_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "equipment_code", label: "Mã thiết bị", required: true, example: "EQ-CRANE-001" },
      { key: "equipment_name", label: "Tên thiết bị", required: true, example: "Tên thiết bị cần nhập" },
      { key: "category", label: "Nhóm thiết bị", required: true, example: "Cẩu tháp" },
      { key: "project_code", label: "Dự án đang dùng", required: false, example: "LCG-BN-025" },
      { key: "status", label: "Tình trạng", required: false, example: "Đang hoạt động" },
      { key: "maintenance_date", label: "Ngày bảo dưỡng", required: false, example: "2026-07-30" },
    ],
  },
  {
    key: "warranty",
    title: "Bảo hành công trình",
    owner: "Phòng Kỹ thuật / Bảo hành",
    description: "Yêu cầu bảo hành, SLA, người phụ trách và trạng thái xử lý sau bàn giao.",
    templateFile: "/templates/licogi_warranty_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "ticket_code", label: "Mã yêu cầu", required: true, example: "BH-2026-041" },
      { key: "project_code", label: "Mã dự án", required: true, example: "LCG-HN-021" },
      { key: "title", label: "Nội dung", required: true, example: "Kiểm tra thấm khu vực mái" },
      { key: "priority", label: "Mức ưu tiên", required: false, example: "Cao" },
      { key: "deadline", label: "Hạn xử lý", required: false, example: "2026-07-04" },
      { key: "status", label: "Trạng thái", required: false, example: "Đang xử lý" },
    ],
  },
  {
    key: "documents",
    title: "Hồ sơ / bản vẽ",
    owner: "Phòng Kỹ thuật / BIM",
    description: "Quản lý mã hồ sơ, phiên bản, loại tài liệu, dự án liên quan và trạng thái phê duyệt.",
    templateFile: "/templates/licogi_documents_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "document_code", label: "Mã hồ sơ", required: true, example: "BV-BN-KC-204" },
      { key: "document_name", label: "Tên hồ sơ", required: true, example: "Bản vẽ kết cấu thép khu A" },
      { key: "project_code", label: "Mã dự án", required: true, example: "LCG-BN-025" },
      { key: "document_type", label: "Loại hồ sơ", required: false, example: "Bản vẽ" },
      { key: "revision", label: "Phiên bản", required: false, example: "Rev.04" },
      { key: "status", label: "Trạng thái", required: false, example: "Đã phê duyệt" },
    ],
  },
];

export const importChecklist = [
  "Không để trống các cột bắt buộc như mã, tên và trạng thái.",
  "Mã dự án/mã hồ sơ phải thống nhất để các module liên kết được với nhau.",
  "Ngày tháng nên dùng chuẩn YYYY-MM-DD để tránh lỗi khi import.",
  "Dữ liệu GIS có thể nhập tỉnh/thành trước; lat/lng sẽ bổ sung sau bằng API bản đồ.",
  "Không nhập giá trị hợp đồng tuyệt đối nếu chưa được phép công bố; dùng khoảng giá trị.",
];

export type SystemAccount = {
  role: string;
  email: string;
  passwordEnv: string;
  defaultPassword: string;
  scope: string;
};

export const systemAccounts: SystemAccount[] = [
  { role: "Super Admin IIP", email: "iip.admin@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "IIP@2026!", scope: "Toàn quyền hệ thống, tenant, database, backup, API" },
  { role: "System Admin Licogi", email: "admin@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "Licogi@2026!", scope: "Tài khoản, dữ liệu, phân quyền, module ownership" },
  { role: "Ban lãnh đạo", email: "executive@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "Executive@2026!", scope: "Dashboard, báo cáo, GIS, phê duyệt cấp lãnh đạo" },
  { role: "Quản lý dự án", email: "project.manager@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "Project@2026!", scope: "Dự án được phân công, thi công, hồ sơ, bảo hành" },
  { role: "Kỹ thuật công trường", email: "engineer@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "Engineer@2026!", scope: "Cập nhật thi công, nhật ký, tài liệu theo dự án được giao" },
  { role: "Data Steward", email: "data@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "Data@2026!", scope: "Nhập liệu, làm sạch, kiểm duyệt dữ liệu theo phòng ban" },
  { role: "Chủ đầu tư", email: "customer@licogi183.vn", passwordEnv: "PRISMA_SEED_PASSWORD", defaultPassword: "Customer@2026!", scope: "Cổng chủ đầu tư, tiến độ, hồ sơ, bảo hành thuộc sở hữu" },
];
