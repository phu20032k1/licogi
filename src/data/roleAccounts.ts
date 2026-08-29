export type RoleAccountAudience =
  | "CHAIRMAN"
  | "GENERAL_DIRECTOR"
  | "DEPUTY_GENERAL_DIRECTOR"
  | "DEPARTMENT_HEAD"
  | "DEPUTY_DEPARTMENT_HEAD"
  | "EMPLOYEE";

export type RoleDomain =
  | "BOARD"
  | "CONTROL"
  | "CORPORATE"
  | "FINANCE"
  | "BUSINESS_PRODUCTION_DESIGN"
  | "CONSTRUCTION"
  | "WARRANTY"
  | "SAFETY"
  | "ADMIN"
  | "PROJECT_DESIGN"
  | "TECH_ECON"
  | "ACCOUNTING"
  | "STEEL"
  | "ELECTROMECHANICAL"
  | "EQUIPMENT"
  | "HANOI_OFFICE"
  | "CONCRETE";

export type RoleAccountProfile = {
  code: string;
  email: string;
  name: string;
  position: string;
  shortPosition: string;
  audience: RoleAccountAudience;
  domain: RoleDomain;
  roleCode: "EXECUTIVE" | "PROJECT_MANAGER" | "ENGINEER";
  departmentCode: string;
  departmentName: string;
  unitLabel: string;
  levelLabel: string;
  passwordEnv: string;
  focusChain: string[];
  priorities: string[];
  quickLinks: Array<{ href: string; label: string; note: string }>;
};

type DepartmentSpec = {
  code: string;
  slug: string;
  name: string;
  short: string;
  domain: RoleDomain;
  focusChain: string[];
  priorities: string[];
  quickLinks: Array<{ href: string; label: string; note: string }>;
};

const executiveAccounts: RoleAccountProfile[] = [
  {
    code: "CHAIRMAN",
    email: "chairman@licogi183.vn",
    name: "Chủ tịch HĐQT",
    position: "Chủ tịch Hội đồng quản trị",
    shortPosition: "Chủ tịch HĐQT",
    audience: "CHAIRMAN",
    domain: "BOARD",
    roleCode: "EXECUTIVE",
    departmentCode: "BOD",
    departmentName: "Hội đồng quản trị",
    unitLabel: "HĐQT",
    levelLabel: "Cấp chiến lược",
    passwordEnv: "LICOGI_ROLE_PASSWORD_CHAIRMAN",
    focusChain: ["Mục tiêu tăng trưởng", "Doanh thu", "Lợi nhuận", "Dòng tiền", "Backlog", "Pipeline", "Rủi ro", "Quyết nghị"],
    priorities: [
      "Theo dõi mức độ đạt mục tiêu tăng trưởng và hiệu quả toàn công ty",
      "Giám sát doanh thu, lợi nhuận, dòng tiền và backlog ở cấp chiến lược",
      "Nhận diện dự án/đơn vị có rủi ro lớn hoặc không đạt mục tiêu",
      "Tập trung các vấn đề thực sự cần HĐQT quyết định",
    ],
    quickLinks: [
      { href: "/reports", label: "Báo cáo quản trị", note: "Kết quả toàn công ty" },
      { href: "/finance", label: "Tài chính", note: "Dòng tiền & hiệu quả" },
      { href: "/projects", label: "Danh mục chiến lược", note: "Dự án trọng điểm" },
      { href: "/activity", label: "Nhật ký quyết định", note: "Theo dõi chỉ đạo" },
    ],
  },
  {
    code: "CONTROL_BOARD",
    email: "control.board@licogi183.vn",
    name: "Ban Kiểm soát",
    position: "Ban Kiểm soát",
    shortPosition: "Ban Kiểm soát",
    audience: "CHAIRMAN",
    domain: "CONTROL",
    roleCode: "EXECUTIVE",
    departmentCode: "CONTROL",
    departmentName: "Ban Kiểm soát",
    unitLabel: "BKS",
    levelLabel: "Cấp giám sát",
    passwordEnv: "LICOGI_ROLE_PASSWORD_CONTROL_BOARD",
    focusChain: ["Tuân thủ", "Kiểm soát nội bộ", "Tài chính", "Rủi ro", "Phê duyệt", "Khắc phục", "Theo dõi kiến nghị"],
    priorities: [
      "Giám sát tuân thủ và các ngoại lệ trong vận hành",
      "Theo dõi rủi ro tài chính, dự án và kiểm soát nội bộ",
      "Kiểm tra tình trạng xử lý kiến nghị sau kiểm tra",
      "Báo cáo độc lập các vấn đề trọng yếu lên HĐQT",
    ],
    quickLinks: [
      { href: "/reports", label: "Báo cáo kiểm soát", note: "Ngoại lệ & rủi ro" },
      { href: "/finance", label: "Tài chính", note: "Bút toán & kiểm tra" },
      { href: "/activity", label: "Nhật ký hệ thống", note: "Dấu vết thao tác" },
      { href: "/projects", label: "Dự án", note: "Rủi ro dự án" },
    ],
  },
  {
    code: "GENERAL_DIRECTOR",
    email: "ceo@licogi183.vn",
    name: "Tổng Giám đốc",
    position: "Tổng Giám đốc",
    shortPosition: "TGĐ",
    audience: "GENERAL_DIRECTOR",
    domain: "CORPORATE",
    roleCode: "EXECUTIVE",
    departmentCode: "BOD",
    departmentName: "Ban Tổng Giám đốc",
    unitLabel: "TGĐ",
    levelLabel: "Cấp điều hành toàn công ty",
    passwordEnv: "LICOGI_ROLE_PASSWORD_GENERAL_DIRECTOR",
    focusChain: ["Doanh thu", "Lợi nhuận", "Dòng tiền", "Hợp đồng", "Đấu thầu", "Dự án", "Sản xuất", "Thi công", "Thiết bị", "Nhân sự", "An toàn", "Bảo hành", "Risk/Issue"],
    priorities: [
      "Điều hành toàn bộ cỗ máy từ mục tiêu đến kết quả thực tế",
      "Drill-down từ KPI toàn công ty xuống khối, phòng, dự án và người chịu trách nhiệm",
      "Xử lý điểm nghẽn về tiến độ, nguồn lực, nghiệm thu và dòng tiền",
      "Theo dõi phương án xử lý và trách nhiệm đến khi đóng vấn đề",
    ],
    quickLinks: [
      { href: "/projects", label: "Dự án", note: "Tiến độ & sức khỏe" },
      { href: "/construction", label: "Thi công", note: "Hiện trường" },
      { href: "/tasks", label: "Công việc & phê duyệt", note: "Điểm nghẽn" },
      { href: "/reports", label: "Báo cáo điều hành", note: "Tổng hợp toàn công ty" },
    ],
  },
  {
    code: "DEPUTY_FINANCE",
    email: "deputy.finance@licogi183.vn",
    name: "Phó TGĐ Tài chính",
    position: "Phó Tổng Giám đốc Tài chính",
    shortPosition: "PGĐ Tài chính",
    audience: "DEPUTY_GENERAL_DIRECTOR",
    domain: "FINANCE",
    roleCode: "EXECUTIVE",
    departmentCode: "FINANCE",
    departmentName: "Khối Tài chính",
    unitLabel: "PGĐ Tài chính",
    levelLabel: "Khối Phó Tổng Giám đốc",
    passwordEnv: "LICOGI_ROLE_PASSWORD_DEPUTY_FINANCE",
    focusChain: ["Doanh thu", "Giá vốn", "Lợi nhuận", "Công nợ", "Dòng tiền", "Chi phí", "Thanh toán", "Thu hồi công nợ", "Hiệu quả dự án"],
    priorities: ["Kiểm soát dòng tiền và công nợ", "Theo dõi biên lợi nhuận theo dự án", "Đôn đốc thanh toán và thu hồi nợ", "Cảnh báo dự án có nguy cơ ảnh hưởng hiệu quả tài chính"],
    quickLinks: [
      { href: "/finance", label: "Tài chính kế toán", note: "Tài khoản & bút toán" },
      { href: "/debt", label: "Công nợ", note: "Phải thu / phải trả" },
      { href: "/payments", label: "Thanh toán", note: "Nghiệm thu & đề nghị" },
      { href: "/contracts", label: "Hợp đồng", note: "Giá trị & điều khoản" },
    ],
  },
  {
    code: "DEPUTY_BUSINESS",
    email: "deputy.business@licogi183.vn",
    name: "Phó TGĐ Kinh doanh - Sản xuất - Thiết kế",
    position: "Phó Tổng Giám đốc Kinh doanh - Sản xuất - Thiết kế",
    shortPosition: "PGĐ KD-SX-TK",
    audience: "DEPUTY_GENERAL_DIRECTOR",
    domain: "BUSINESS_PRODUCTION_DESIGN",
    roleCode: "EXECUTIVE",
    departmentCode: "SALES",
    departmentName: "Khối Kinh doanh - Sản xuất - Thiết kế",
    unitLabel: "PGĐ KD-SX-TK",
    levelLabel: "Khối Phó Tổng Giám đốc",
    passwordEnv: "LICOGI_ROLE_PASSWORD_DEPUTY_BUSINESS",
    focusChain: ["Pipeline", "Đấu thầu", "Hợp đồng", "Đơn hàng", "Thiết kế", "Kế hoạch sản xuất", "Năng lực sản xuất", "Tiến độ cung ứng"],
    priorities: ["Tăng chất lượng pipeline và tỷ lệ chuyển đổi", "Kiểm soát tiến độ thiết kế trước sản xuất", "Cân đối năng lực sản xuất với đơn hàng", "Cảnh báo chậm cung ứng ảnh hưởng công trường"],
    quickLinks: [
      { href: "/crm", label: "CRM / Pipeline", note: "Lead & cơ hội" },
      { href: "/contracts", label: "Hợp đồng", note: "Đơn hàng đã chốt" },
      { href: "/planning", label: "Kế hoạch", note: "Thiết kế & sản xuất" },
      { href: "/projects", label: "Dự án", note: "Nhu cầu cung ứng" },
    ],
  },
  {
    code: "DEPUTY_CONSTRUCTION",
    email: "deputy.construction@licogi183.vn",
    name: "Phó TGĐ Quản lý thi công",
    position: "Phó Tổng Giám đốc Quản lý thi công",
    shortPosition: "PGĐ Thi công",
    audience: "DEPUTY_GENERAL_DIRECTOR",
    domain: "CONSTRUCTION",
    roleCode: "EXECUTIVE",
    departmentCode: "PMO",
    departmentName: "Khối Quản lý thi công",
    unitLabel: "PGĐ QL Thi công",
    levelLabel: "Khối Phó Tổng Giám đốc",
    passwordEnv: "LICOGI_ROLE_PASSWORD_DEPUTY_CONSTRUCTION",
    focusChain: ["Danh mục dự án", "Tiến độ", "Khối lượng", "Sản lượng", "Nhân lực", "Vật tư", "Thiết bị", "Nghiệm thu", "Thanh toán", "Vấn đề công trường"],
    priorities: ["Bù tiến độ các dự án chậm", "Điều phối nhân lực - vật tư - thiết bị", "Đóng vướng mắc nghiệm thu", "Báo cáo sớm vấn đề cần TGĐ hỗ trợ"],
    quickLinks: [
      { href: "/construction", label: "Điều hành thi công", note: "Hiện trường & nhật ký" },
      { href: "/planning", label: "Kế hoạch", note: "WBS & bù tiến độ" },
      { href: "/projects", label: "Danh mục dự án", note: "Sức khỏe dự án" },
      { href: "/tasks", label: "Điểm nghẽn", note: "Giao việc & xử lý" },
    ],
  },
  {
    code: "DEPUTY_WARRANTY",
    email: "deputy.warranty@licogi183.vn",
    name: "Phó TGĐ Bảo hành - Bảo trì",
    position: "Phó Tổng Giám đốc Bảo hành - Bảo trì",
    shortPosition: "PGĐ Bảo hành",
    audience: "DEPUTY_GENERAL_DIRECTOR",
    domain: "WARRANTY",
    roleCode: "EXECUTIVE",
    departmentCode: "WARRANTY",
    departmentName: "Khối Bảo hành - Bảo trì",
    unitLabel: "PGĐ Bảo hành",
    levelLabel: "Khối Phó Tổng Giám đốc",
    passwordEnv: "LICOGI_ROLE_PASSWORD_DEPUTY_WARRANTY",
    focusChain: ["Công trình bàn giao", "Yêu cầu bảo hành", "SLA", "Thời gian xử lý", "Chi phí", "Chất lượng", "Lỗi lặp lại", "Đóng yêu cầu"],
    priorities: ["Giảm thời gian xử lý yêu cầu bảo hành", "Theo dõi yêu cầu quá SLA", "Phân tích lỗi lặp lại", "Kiểm soát chi phí bảo hành và chất lượng sau bàn giao"],
    quickLinks: [
      { href: "/warranty", label: "Bảo hành", note: "Ticket & SLA" },
      { href: "/projects", label: "Công trình bàn giao", note: "Danh mục bảo hành" },
      { href: "/tasks", label: "Công việc xử lý", note: "Phân công đội" },
      { href: "/documents", label: "Hồ sơ chất lượng", note: "Biên bản & nghiệm thu" },
    ],
  },
  {
    code: "DEPUTY_SAFETY",
    email: "deputy.safety@licogi183.vn",
    name: "Phó TGĐ An toàn",
    position: "Phó Tổng Giám đốc An toàn",
    shortPosition: "PGĐ An toàn",
    audience: "DEPUTY_GENERAL_DIRECTOR",
    domain: "SAFETY",
    roleCode: "EXECUTIVE",
    departmentCode: "SAFETY",
    departmentName: "Khối An toàn",
    unitLabel: "PGĐ An toàn",
    levelLabel: "Khối Phó Tổng Giám đốc",
    passwordEnv: "LICOGI_ROLE_PASSWORD_DEPUTY_SAFETY",
    focusChain: ["An toàn lao động", "Nguy cơ", "Vi phạm", "Sự cố", "Kiểm tra", "Khắc phục", "Đóng hành động", "An toàn từng công trường"],
    priorities: ["Không để nguy cơ nghiêm trọng tồn tại quá hạn", "Theo dõi sự cố và hành động khắc phục", "Kiểm soát tuân thủ theo từng công trường", "Cảnh báo ngay dự án có rủi ro an toàn cao"],
    quickLinks: [
      { href: "/construction", label: "Hiện trường", note: "Nhật ký & an toàn" },
      { href: "/projects", label: "Dự án", note: "Risk & health" },
      { href: "/tasks", label: "Khắc phục", note: "Theo dõi hành động" },
      { href: "/reports", label: "Báo cáo an toàn", note: "Tổng hợp cảnh báo" },
    ],
  },
];

const departmentSpecs: DepartmentSpec[] = [
  {
    code: "ADMIN",
    slug: "admin",
    name: "Phòng Tổ chức - Hành chính",
    short: "P.TCHC",
    domain: "ADMIN",
    focusChain: ["Nhân sự", "Tổ chức", "Hành chính", "Hồ sơ", "Đào tạo", "Chấm công", "Văn thư"],
    priorities: ["Bảo đảm nguồn lực nhân sự đúng nhu cầu", "Theo dõi hồ sơ và thủ tục đúng hạn", "Kiểm soát phân công và năng suất", "Tổng hợp vướng mắc hành chính"],
    quickLinks: [{ href: "/tasks", label: "Công việc phòng", note: "Phân công & tiến độ" }, { href: "/documents", label: "Hồ sơ", note: "Văn bản & tài liệu" }, { href: "/users", label: "Nhân sự hệ thống", note: "Tài khoản & đơn vị" }, { href: "/reports", label: "Báo cáo", note: "Tổng hợp phòng" }],
  },
  {
    code: "DESIGN_PMO",
    slug: "project-design",
    name: "Phòng Thiết kế & Quản lý dự án",
    short: "P.TK&QLDA",
    domain: "PROJECT_DESIGN",
    focusChain: ["Thiết kế", "Kế hoạch dự án", "Tiến độ", "Hồ sơ", "Phối hợp", "Nghiệm thu", "Bàn giao"],
    priorities: ["Đóng hồ sơ thiết kế đúng mốc", "Bám tiến độ danh mục dự án", "Kiểm soát đầu việc liên phòng", "Cảnh báo vướng mắc ảnh hưởng nghiệm thu"],
    quickLinks: [{ href: "/projects", label: "Dự án", note: "Danh mục phụ trách" }, { href: "/planning", label: "Kế hoạch", note: "Mốc & WBS" }, { href: "/documents", label: "Thiết kế", note: "Hồ sơ & revision" }, { href: "/tasks", label: "Công việc", note: "Giao việc & phối hợp" }],
  },
  {
    code: "TECH_ECON",
    slug: "tech-economy",
    name: "Phòng Kinh tế - Kỹ thuật",
    short: "P.KTKT",
    domain: "TECH_ECON",
    focusChain: ["Khối lượng", "Dự toán", "Đơn giá", "Biện pháp", "Đấu thầu", "Kiểm soát chi phí", "Thanh quyết toán"],
    priorities: ["Kiểm soát khối lượng và đơn giá", "Bám dự toán và chi phí theo dự án", "Chuẩn hóa hồ sơ kinh tế kỹ thuật", "Cảnh báo phát sinh ảnh hưởng hiệu quả"],
    quickLinks: [{ href: "/contracts", label: "Hợp đồng", note: "Giá trị & phạm vi" }, { href: "/payments", label: "Thanh toán", note: "Khối lượng nghiệm thu" }, { href: "/projects", label: "Dự án", note: "Theo dõi giá trị" }, { href: "/documents", label: "Hồ sơ KTKT", note: "Biện pháp & dự toán" }],
  },
  {
    code: "ACCOUNTING",
    slug: "accounting",
    name: "Phòng Tài chính - Kế toán",
    short: "P.TCKT",
    domain: "ACCOUNTING",
    focusChain: ["Doanh thu", "Chi phí", "Công nợ", "Dòng tiền", "Thanh toán", "Bút toán", "Báo cáo"],
    priorities: ["Theo dõi thu - chi và dòng tiền", "Đôn đốc công nợ đến hạn", "Kiểm soát chứng từ và bút toán", "Báo cáo hiệu quả theo dự án"],
    quickLinks: [{ href: "/finance", label: "Tài chính", note: "Bút toán & tài khoản" }, { href: "/debt", label: "Công nợ", note: "Phải thu / trả" }, { href: "/payments", label: "Thanh toán", note: "Đề nghị & trạng thái" }, { href: "/contracts", label: "Hợp đồng", note: "Điều khoản tài chính" }],
  },
  {
    code: "STEEL",
    slug: "steel",
    name: "Phòng Kết cấu thép",
    short: "P.KCT",
    domain: "STEEL",
    focusChain: ["Bản vẽ", "Vật tư thép", "Gia công", "Sản lượng", "Chất lượng", "Giao hàng", "Lắp dựng"],
    priorities: ["Bám kế hoạch gia công kết cấu", "Cân đối vật tư với tiến độ", "Kiểm soát chất lượng trước giao hàng", "Không để sản xuất làm chậm công trường"],
    quickLinks: [{ href: "/planning", label: "Kế hoạch sản xuất", note: "Mốc gia công" }, { href: "/documents", label: "Bản vẽ", note: "Shopdrawing & revision" }, { href: "/projects", label: "Nhu cầu dự án", note: "Ưu tiên giao hàng" }, { href: "/tasks", label: "Công việc", note: "Phân công sản xuất" }],
  },
  {
    code: "MEP",
    slug: "electromechanical",
    name: "Phòng Cơ điện",
    short: "P.CĐ",
    domain: "ELECTROMECHANICAL",
    focusChain: ["Thiết kế MEP", "Vật tư", "Lắp đặt", "Kiểm tra", "Testing", "Nghiệm thu", "Bàn giao"],
    priorities: ["Bám thiết kế và vật tư MEP", "Đồng bộ tiến độ với xây dựng", "Kiểm soát testing/commissioning", "Đóng punch-list trước bàn giao"],
    quickLinks: [{ href: "/construction", label: "Thi công MEP", note: "Hiện trường" }, { href: "/planning", label: "Kế hoạch", note: "Mốc lắp đặt" }, { href: "/documents", label: "Hồ sơ MEP", note: "Bản vẽ & nghiệm thu" }, { href: "/tasks", label: "Punch-list", note: "Việc cần đóng" }],
  },
  {
    code: "EQUIP",
    slug: "equipment",
    name: "Phòng Quản lý thiết bị",
    short: "P.QLTB",
    domain: "EQUIPMENT",
    focusChain: ["Danh mục thiết bị", "Điều phối", "Vận hành", "Hiệu suất", "Bảo trì", "Sự cố", "Sẵn sàng"],
    priorities: ["Tăng tỷ lệ thiết bị sẵn sàng", "Giảm thiết bị nhàn rỗi và hỏng", "Bảo trì đúng lịch", "Điều phối thiết bị không làm chậm dự án"],
    quickLinks: [{ href: "/data", label: "Dữ liệu thiết bị", note: "Danh mục & tình trạng" }, { href: "/construction", label: "Nhu cầu công trường", note: "Điều phối thiết bị" }, { href: "/tasks", label: "Bảo trì", note: "Việc cần xử lý" }, { href: "/projects", label: "Dự án", note: "Ảnh hưởng tiến độ" }],
  },
  {
    code: "HANOI",
    slug: "hanoi-office",
    name: "Văn phòng Hà Nội",
    short: "VP Hà Nội",
    domain: "HANOI_OFFICE",
    focusChain: ["Giao dịch", "Đối tác", "Hồ sơ", "Hỗ trợ dự án", "Phối hợp", "Theo dõi yêu cầu", "Báo cáo"],
    priorities: ["Theo dõi đầu việc với đối tác tại Hà Nội", "Hỗ trợ hồ sơ và thủ tục dự án", "Đóng yêu cầu phối hợp đúng hạn", "Báo cáo vấn đề cần trụ sở hỗ trợ"],
    quickLinks: [{ href: "/crm", label: "Đối tác", note: "Lead & quan hệ" }, { href: "/documents", label: "Hồ sơ", note: "Công văn & thủ tục" }, { href: "/tasks", label: "Yêu cầu phối hợp", note: "Theo dõi đầu việc" }, { href: "/reports", label: "Báo cáo VP", note: "Tổng hợp hoạt động" }],
  },
  {
    code: "CONCRETE",
    slug: "concrete",
    name: "Trạm Bê tông thương phẩm",
    short: "Trạm BTTP",
    domain: "CONCRETE",
    focusChain: ["Đơn hàng", "Kế hoạch trộn", "Vật liệu", "Sản lượng", "Chất lượng", "Xe vận chuyển", "Giao nhận"],
    priorities: ["Bảo đảm sản lượng theo nhu cầu công trường", "Kiểm soát cấp phối và chất lượng", "Cân đối vật liệu đầu vào", "Theo dõi giao nhận không gây chờ đợi"],
    quickLinks: [{ href: "/planning", label: "Kế hoạch sản xuất", note: "Sản lượng theo ca" }, { href: "/construction", label: "Nhu cầu dự án", note: "Lịch đổ bê tông" }, { href: "/tasks", label: "Vận hành", note: "Đầu việc trong ca" }, { href: "/reports", label: "Sản lượng", note: "Tổng hợp trạm" }],
  },
];

function passwordEnvFor(code: string) {
  return `LICOGI_ROLE_PASSWORD_${code}`;
}

function makeDepartmentAccounts(unit: DepartmentSpec): RoleAccountProfile[] {
  const upper = unit.code;
  const base = {
    domain: unit.domain,
    departmentCode: unit.code,
    departmentName: unit.name,
    unitLabel: unit.short,
    focusChain: unit.focusChain,
    priorities: unit.priorities,
    quickLinks: unit.quickLinks,
  };
  return [
    {
      ...base,
      code: `HEAD_${upper}`,
      email: `head.${unit.slug}@licogi183.vn`,
      name: `Trưởng ${unit.name}`,
      position: `Trưởng ${unit.name}`,
      shortPosition: `Trưởng ${unit.short}`,
      audience: "DEPARTMENT_HEAD",
      roleCode: "PROJECT_MANAGER",
      levelLabel: "Trưởng phòng / Trưởng đơn vị",
      passwordEnv: passwordEnvFor(`HEAD_${upper}`),
    },
    {
      ...base,
      code: `DEPUTY_HEAD_${upper}`,
      email: `deputyhead.${unit.slug}@licogi183.vn`,
      name: `Phó ${unit.name}`,
      position: `Phó ${unit.name}`,
      shortPosition: `Phó ${unit.short}`,
      audience: "DEPUTY_DEPARTMENT_HEAD",
      roleCode: "PROJECT_MANAGER",
      levelLabel: "Phó phòng / Phó đơn vị",
      passwordEnv: passwordEnvFor(`DEPUTY_HEAD_${upper}`),
      priorities: ["Đôn đốc đầu việc đến hạn", ...unit.priorities.slice(0, 3)],
    },
    {
      ...base,
      code: `STAFF_${upper}`,
      email: `staff.${unit.slug}@licogi183.vn`,
      name: `Nhân viên ${unit.name}`,
      position: `Nhân viên ${unit.name}`,
      shortPosition: `NV ${unit.short}`,
      audience: "EMPLOYEE",
      roleCode: "ENGINEER",
      levelLabel: "Nhân viên tác nghiệp",
      passwordEnv: passwordEnvFor(`STAFF_${upper}`),
      priorities: ["Hoàn thành công việc được giao đúng hạn", "Cập nhật tiến độ và minh chứng", "Báo sớm vướng mắc", ...unit.priorities.slice(0, 1)],
    },
  ];
}

export const roleAccountProfiles: RoleAccountProfile[] = [
  ...executiveAccounts,
  ...departmentSpecs.flatMap(makeDepartmentAccounts),
];

export const roleAccountByEmail = new Map(roleAccountProfiles.map((item) => [item.email.toLowerCase(), item]));
export const roleAccountByCode = new Map(roleAccountProfiles.map((item) => [item.code, item]));

export function getRoleAccountProfile(email?: string | null) {
  return email ? roleAccountByEmail.get(email.toLowerCase()) : undefined;
}

export const organizationDepartments = departmentSpecs.map((item) => ({
  code: item.code,
  name: item.name,
  short: item.short,
  domain: item.domain,
}));

export const organizationExecutives = executiveAccounts;
