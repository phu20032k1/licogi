import { valueRanges } from "./projects";

export type DataEntityKey = "projects" | "customers" | "employees" | "equipment" | "warranty" | "documents" | "ai_knowledge";

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
      { key: "project_code", label: "Mã dự án", required: true, example: "LCG-PROJ-001" },
      { key: "project_name", label: "Tên dự án", required: true, example: "Nhà máy sản xuất linh kiện ABC" },
      { key: "customer_code", label: "Mã chủ đầu tư", required: false, example: "CUS-001", note: "Nên trùng mã trong bảng khách hàng" },
      { key: "type", label: "Loại công trình", required: true, example: "Công nghiệp", note: `Một trong: ${["Công nghiệp", "Dân dụng", "Hạ tầng", "Giao thông", "Điện năng"].join(", ")}` },
      { key: "status", label: "Trạng thái", required: true, example: "completed", note: "ongoing / completed / warranty" },
      { key: "investor", label: "Chủ đầu tư", required: true, example: "Công ty TNHH ABC Việt Nam" },
      { key: "province", label: "Tỉnh/thành", required: true, example: "Bắc Ninh" },
      { key: "value_range", label: "Khoảng giá trị", required: false, example: "300-500 tỷ", note: valueRanges.join(" / ") },
      { key: "contract_value_vnd", label: "Giá trị hợp đồng", required: false, example: "350000000000", note: "Chỉ nhập khi được phép công bố" },
      { key: "construction_area", label: "Diện tích xây dựng", required: false, example: "25.000 m2" },
      { key: "floor_area", label: "Tổng diện tích sàn", required: false, example: "42.000 m2" },
      { key: "scale", label: "Quy mô / phạm vi", required: false, example: "02 nhà xưởng, văn phòng và hạ tầng kỹ thuật" },
      { key: "progress", label: "Tiến độ", required: false, example: "100", note: "Từ 0 đến 100" },
      { key: "risk", label: "Mức rủi ro", required: false, example: "low", note: "low / medium / high" },
      { key: "health_score", label: "Điểm sức khỏe", required: false, example: "92", note: "Từ 0 đến 100" },
      { key: "lat", label: "Vĩ độ", required: false, example: "21.1861" },
      { key: "lng", label: "Kinh độ", required: false, example: "106.0763" },
      { key: "maps_url", label: "Liên kết bản đồ", required: false, example: "https://www.google.com/maps/..." },
      { key: "source", label: "Nguồn dữ liệu", required: false, example: "Hồ sơ năng lực 2026.xlsx" },
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
      { key: "employee_code", label: "Mã nhân sự / nhóm", required: true, example: "HR-GRP-001" },
      { key: "full_name", label: "Họ tên / tên nhóm", required: true, example: "Kỹ sư xây dựng" },
      { key: "english_name", label: "Tên tiếng Anh", required: false, example: "Civil Engineer" },
      { key: "department", label: "Phòng/ban hoặc nhóm năng lực", required: true, example: "Phòng Nhân sự / Năng lực nhân sự" },
      { key: "position", label: "Chức danh / cấp nhóm", required: false, example: "Nhóm năng lực" },
      { key: "quantity", label: "Số lượng", required: false, example: "120", note: "Dùng cho thống kê nguồn lực theo nhóm" },
      { key: "phone", label: "Số điện thoại", required: false, example: "0903422518" },
      { key: "assigned_project", label: "Dự án phụ trách", required: false, example: "LCG-PROJ-001" },
      { key: "group", label: "Nhóm chuyên môn", required: false, example: "Engineers, Supervisors and Managers" },
      { key: "source", label: "Nguồn dữ liệu", required: false, example: "Danh sách nhân sự 2026.docx" },
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
      { key: "equipment_code", label: "Mã thiết bị", required: true, example: "EQ-001" },
      { key: "equipment_name", label: "Tên thiết bị", required: true, example: "Cẩu tháp QTZ 6012" },
      { key: "category", label: "Nhóm thiết bị", required: true, example: "Cẩu / nâng hạ" },
      { key: "quantity", label: "Số lượng hiển thị", required: false, example: "11 ea" },
      { key: "quantity_number", label: "Số lượng dạng số", required: false, example: "11", note: "Chỉ nhập số để tổng hợp báo cáo" },
      { key: "specifications", label: "Thông số kỹ thuật", required: false, example: "Qmax 8-12 tấn; Lmax 60-70 m" },
      { key: "project_code", label: "Dự án đang dùng", required: false, example: "LCG-PROJ-001" },
      { key: "status", label: "Tình trạng", required: false, example: "Sẵn sàng", note: "Sẵn sàng / Đang hoạt động / Bảo dưỡng / Hỏng" },
      { key: "maintenance_date", label: "Ngày bảo dưỡng", required: false, example: "2026-07-30", note: "Chuẩn YYYY-MM-DD" },
      { key: "source", label: "Nguồn dữ liệu", required: false, example: "Danh mục thiết bị 2026.docx" },
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
      { key: "document_code", label: "Mã hồ sơ", required: true, example: "DOC-CAP-001" },
      { key: "document_name", label: "Tên hồ sơ", required: true, example: "Hồ sơ năng lực tổng thầu công nghiệp 2026" },
      { key: "project_code", label: "Mã dự án", required: false, example: "LCG-PROJ-001", note: "Để trống nếu là hồ sơ cấp công ty" },
      { key: "document_type", label: "Loại hồ sơ", required: false, example: "Hồ sơ năng lực" },
      { key: "revision", label: "Phiên bản", required: false, example: "Rev.01 / 2026-07-23" },
      { key: "status", label: "Trạng thái", required: false, example: "Đã phê duyệt" },
      { key: "file_url", label: "Đường dẫn file", required: false, example: "https://storage.example.com/profile.pdf" },
      { key: "source", label: "Nguồn dữ liệu", required: false, example: "Phòng Kinh doanh" },
    ],
  },
  {
    key: "ai_knowledge",
    title: "Tri thức AI / RAG",
    owner: "CNTT / Data Steward",
    description: "Nhập hàng loạt tri thức đã làm sạch để AI Construction Brain tìm kiếm, tóm tắt và trả lời theo dữ liệu doanh nghiệp.",
    templateFile: "/templates/licogi_ai_knowledge_template.csv",
    total: 0,
    cleanRate: 0,
    lastImport: "Chưa nhập",
    columns: [
      { key: "knowledge_code", label: "Mã tri thức", required: true, example: "AI-KNOW-001", note: "Mã ổn định để cập nhật lại cùng một mục" },
      { key: "title", label: "Tiêu đề", required: true, example: "Năng lực thi công nhà máy FDI" },
      { key: "source_type", label: "Loại nguồn", required: true, example: "DOCUMENT", note: "DOCUMENT / PROJECT / EMPLOYEE / EQUIPMENT / PROCEDURE / FAQ" },
      { key: "project_code", label: "Mã dự án liên quan", required: false, example: "LCG-PROJ-001" },
      { key: "document_code", label: "Mã hồ sơ liên quan", required: false, example: "DOC-CAP-001" },
      { key: "source_url", label: "Liên kết nguồn", required: false, example: "https://storage.example.com/profile.pdf" },
      { key: "summary", label: "Tóm tắt", required: false, example: "Tóm tắt ngắn 2-5 câu cho AI" },
      { key: "content_text", label: "Nội dung tri thức", required: true, example: "Nội dung sạch, đầy đủ, có ngữ cảnh..." },
      { key: "language", label: "Ngôn ngữ", required: false, example: "vi" },
      { key: "tags", label: "Từ khóa", required: false, example: "năng lực;FDI;nhà máy;EPC" },
      { key: "vector_status", label: "Trạng thái vector", required: false, example: "PENDING", note: "PENDING / READY / ERROR" },
      { key: "embedding_model", label: "Mô hình embedding", required: false, example: "text-embedding-3-small" },
      { key: "source", label: "Nguồn nội bộ", required: false, example: "Hồ sơ năng lực 2026.xlsx" },
    ],
  },
];

export const importChecklist = [
  "Không để trống các cột bắt buộc như mã, tên và trạng thái.",
  "Mã dự án/mã hồ sơ phải thống nhất để các module liên kết được với nhau.",
  "Ngày tháng nên dùng chuẩn YYYY-MM-DD để tránh lỗi khi import.",
  "Dữ liệu GIS có thể nhập tỉnh/thành trước; lat/lng sẽ bổ sung sau bằng API bản đồ.",
  "Không nhập giá trị hợp đồng tuyệt đối nếu chưa được phép công bố; dùng khoảng giá trị.",
  "Tri thức AI phải có mã ổn định, nội dung sạch và không chứa thông tin mật chưa được phê duyệt.",
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
