export type PermissionAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "IMPORT" | "EXPORT" | "MANAGE";
export type ModuleCode = "DASHBOARD" | "PROJECTS" | "DATA_CENTER" | "GIS_MAP" | "CONSTRUCTION" | "TASKS" | "DOCUMENTS" | "WARRANTY" | "PORTAL" | "PARTNERS" | "REPORTS" | "AI_PROFILE" | "USERS" | "ACTIVITY" | "SETTINGS" | "CONTRACTS" | "PAYMENTS" | "DEBT" | "PLANNING" | "BIM" | "AI_BRAIN" | "FINANCE" | "CRM" | "ERP" | "STORAGE";
export type DataScope = "ALL" | "DEPARTMENT" | "ASSIGNED" | "OWN" | "CUSTOMER";

export type SessionPermission = { module: ModuleCode; action: PermissionAction };
export type ClientSessionLike = { permissions?: SessionPermission[]; roleCode?: string } | null | undefined;

export const ADMIN_ROLE_CODES = new Set(["SUPER_ADMIN", "SYSTEM_ADMIN"]);

export const ALL_MODULES: ModuleCode[] = [
  "DASHBOARD", "PROJECTS", "DATA_CENTER", "GIS_MAP", "CONSTRUCTION", "TASKS", "DOCUMENTS", "WARRANTY", "PORTAL", "PARTNERS",
  "REPORTS", "AI_PROFILE", "USERS", "ACTIVITY", "SETTINGS", "CONTRACTS", "PAYMENTS", "DEBT", "PLANNING", "BIM", "AI_BRAIN",
  "FINANCE", "CRM", "ERP", "STORAGE",
];

export const routeModuleMap: Record<string, ModuleCode> = {
  "/dashboard": "DASHBOARD",
  "/projects": "PROJECTS",
  "/data": "DATA_CENTER",
  "/map": "GIS_MAP",
  "/gis": "GIS_MAP",
  "/construction": "CONSTRUCTION",
  "/planning": "PLANNING",
  "/tasks": "TASKS",
  "/documents": "DOCUMENTS",
  "/storage": "STORAGE",
  "/warranty": "WARRANTY",
  "/portal": "PORTAL",
  "/partners": "PARTNERS",
  "/reports": "REPORTS",
  "/ai-profile": "AI_PROFILE",
  "/ai-brain": "AI_BRAIN",
  "/contracts": "CONTRACTS",
  "/payments": "PAYMENTS",
  "/debt": "DEBT",
  "/bim": "BIM",
  "/finance": "FINANCE",
  "/crm": "CRM",
  "/erp": "ERP",
  "/users": "USERS",
  "/activity": "ACTIVITY",
  "/settings": "SETTINGS",
  "/admin": "SETTINGS",
};

export const moduleLabels: Record<ModuleCode, string> = {
  DASHBOARD: "Dashboard điều hành",
  PROJECTS: "Danh mục dự án",
  DATA_CENTER: "Trung tâm dữ liệu",
  GIS_MAP: "Bản đồ GIS",
  CONSTRUCTION: "Điều hành thi công",
  PLANNING: "Kế hoạch thi công",
  TASKS: "Công việc & phê duyệt",
  DOCUMENTS: "Hồ sơ tài liệu",
  STORAGE: "Kho file S3/MinIO",
  WARRANTY: "Bảo hành công trình",
  PORTAL: "Cổng chủ đầu tư",
  PARTNERS: "Đối tác",
  REPORTS: "Báo cáo quản trị",
  AI_PROFILE: "Hồ sơ năng lực AI",
  AI_BRAIN: "AI Construction Brain",
  CONTRACTS: "Hợp đồng",
  PAYMENTS: "Thanh toán",
  DEBT: "Công nợ",
  BIM: "BIM",
  FINANCE: "Tài chính kế toán",
  CRM: "CRM",
  ERP: "ERP Workflow",
  USERS: "Tài khoản & phân quyền",
  ACTIVITY: "Nhật ký hệ thống",
  SETTINGS: "Cài đặt & API",
};

export const roleHomeRoutes: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  SYSTEM_ADMIN: "/admin",
  EXECUTIVE: "/dashboard",
  PROJECT_MANAGER: "/projects",
  ENGINEER: "/construction",
  DATA_STEWARD: "/data",
  CUSTOMER: "/portal",
};

const roleVisibleModules: Record<string, ModuleCode[]> = {
  SUPER_ADMIN: ALL_MODULES,
  SYSTEM_ADMIN: ALL_MODULES,
  EXECUTIVE: ["DASHBOARD", "PROJECTS", "GIS_MAP", "REPORTS", "CONTRACTS", "PAYMENTS", "DEBT", "FINANCE", "CRM", "ERP", "AI_PROFILE", "AI_BRAIN", "ACTIVITY"],
  PROJECT_MANAGER: ["DASHBOARD", "PROJECTS", "GIS_MAP", "CONSTRUCTION", "PLANNING", "TASKS", "DOCUMENTS", "STORAGE", "WARRANTY", "REPORTS", "CONTRACTS", "PAYMENTS", "DEBT", "BIM", "AI_BRAIN", "AI_PROFILE"],
  ENGINEER: ["PROJECTS", "GIS_MAP", "CONSTRUCTION", "PLANNING", "TASKS", "DOCUMENTS", "STORAGE", "WARRANTY", "BIM", "AI_BRAIN"],
  DATA_STEWARD: ["DATA_CENTER", "DOCUMENTS", "STORAGE", "AI_BRAIN", "ACTIVITY"],
  CUSTOMER: ["PORTAL", "PROJECTS", "GIS_MAP", "DOCUMENTS", "WARRANTY", "TASKS", "STORAGE"],
};

export function roleDefaultRoute(session: ClientSessionLike) {
  return roleHomeRoutes[session?.roleCode ?? ""] ?? "/dashboard";
}

export function isModuleInRoleProfile(session: ClientSessionLike, module: ModuleCode) {
  const roleCode = session?.roleCode;
  if (!roleCode) return false;
  if (ADMIN_ROLE_CODES.has(roleCode)) return true;
  return roleVisibleModules[roleCode]?.includes(module) ?? false;
}

export function hasPermission(session: ClientSessionLike, module: ModuleCode, action: PermissionAction = "VIEW") {
  if (!session) return false;
  if (ADMIN_ROLE_CODES.has(session.roleCode ?? "")) return true;
  if (!isModuleInRoleProfile(session, module)) return false;
  return Boolean(session.permissions?.some((item) => item.module === module && (item.action === action || item.action === "MANAGE")));
}

export function canViewModule(session: ClientSessionLike, module: ModuleCode) {
  return hasPermission(session, module, "VIEW") || hasPermission(session, module, "MANAGE");
}

export function moduleFromPath(pathname: string) {
  const entry = Object.entries(routeModuleMap).sort((a, b) => b[0].length - a[0].length).find(([path]) => pathname === path || pathname.startsWith(`${path}/`));
  return entry?.[1];
}
