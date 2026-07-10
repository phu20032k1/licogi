/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, ModuleCode, PermissionAction, RoleCode, DataScope } = require("@prisma/client");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data", "licogi.seed.json"), "utf8"));

function passwordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 210000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

const departments = [
  ["BOD", "Ban lãnh đạo"],
  ["IT", "Phòng CNTT / Chuyển đổi số"],
  ["PMO", "Ban điều hành dự án"],
  ["TECH", "Phòng Kỹ thuật / BIM"],
  ["HR", "Phòng Nhân sự"],
  ["EQUIP", "Phòng Thiết bị"],
  ["SALES", "Phòng Kinh doanh"],
  ["FINANCE", "Phòng Tài chính - Kế toán"],
  ["CRM", "Kinh doanh / CRM"],
  ["WARRANTY", "Phòng Bảo hành"],
  ["CUSTOMER", "Chủ đầu tư / Khách hàng"],
];

const modules = Object.values(ModuleCode);
const actions = Object.values(PermissionAction);
const roleDefs = [
  { code: RoleCode.SUPER_ADMIN, name: "Super Admin IIP", scope: DataScope.ALL, desc: "Toàn quyền hệ thống, cấu hình tenant, database, backup và API." },
  { code: RoleCode.SYSTEM_ADMIN, name: "System Admin Licogi", scope: DataScope.ALL, desc: "Quản trị người dùng, phân quyền, dữ liệu và module nội bộ." },
  { code: RoleCode.EXECUTIVE, name: "Ban lãnh đạo", scope: DataScope.ALL, desc: "Xem toàn cảnh, báo cáo, phê duyệt cấp lãnh đạo." },
  { code: RoleCode.PROJECT_MANAGER, name: "Quản lý dự án", scope: DataScope.ASSIGNED, desc: "Quản trị dự án được phân công, tiến độ, hồ sơ, bảo hành." },
  { code: RoleCode.ENGINEER, name: "Kỹ thuật công trường", scope: DataScope.ASSIGNED, desc: "Cập nhật thi công, nhật ký, tài liệu và nhiệm vụ được giao." },
  { code: RoleCode.DATA_STEWARD, name: "Data Steward", scope: DataScope.DEPARTMENT, desc: "Nhập liệu, kiểm duyệt và làm sạch dữ liệu theo phòng ban sở hữu." },
  { code: RoleCode.CUSTOMER, name: "Chủ đầu tư", scope: DataScope.CUSTOMER, desc: "Chỉ xem dự án, hồ sơ và bảo hành thuộc chủ đầu tư của mình." },
];

const adminModules = modules;
const allow = {
  SUPER_ADMIN: adminModules.flatMap((m) => actions.map((a) => [m, a])),
  SYSTEM_ADMIN: adminModules.flatMap((m) => actions.map((a) => [m, a])),
  EXECUTIVE: [
    [ModuleCode.DASHBOARD, PermissionAction.VIEW], [ModuleCode.PROJECTS, PermissionAction.VIEW], [ModuleCode.GIS_MAP, PermissionAction.VIEW],
    [ModuleCode.CONSTRUCTION, PermissionAction.VIEW], [ModuleCode.DOCUMENTS, PermissionAction.VIEW], [ModuleCode.WARRANTY, PermissionAction.VIEW],
    [ModuleCode.REPORTS, PermissionAction.VIEW], [ModuleCode.REPORTS, PermissionAction.EXPORT], [ModuleCode.TASKS, PermissionAction.APPROVE],
    [ModuleCode.AI_PROFILE, PermissionAction.VIEW], [ModuleCode.AI_PROFILE, PermissionAction.EXPORT], [ModuleCode.ACTIVITY, PermissionAction.VIEW],
    [ModuleCode.CONTRACTS, PermissionAction.VIEW], [ModuleCode.PAYMENTS, PermissionAction.VIEW], [ModuleCode.DEBT, PermissionAction.VIEW], [ModuleCode.PLANNING, PermissionAction.VIEW], [ModuleCode.BIM, PermissionAction.VIEW], [ModuleCode.AI_BRAIN, PermissionAction.VIEW], [ModuleCode.FINANCE, PermissionAction.VIEW], [ModuleCode.CRM, PermissionAction.VIEW], [ModuleCode.ERP, PermissionAction.VIEW],
  ],
  PROJECT_MANAGER: [
    [ModuleCode.DASHBOARD, PermissionAction.VIEW], [ModuleCode.PROJECTS, PermissionAction.VIEW], [ModuleCode.PROJECTS, PermissionAction.CREATE], [ModuleCode.PROJECTS, PermissionAction.UPDATE], [ModuleCode.PROJECTS, PermissionAction.EXPORT],
    [ModuleCode.GIS_MAP, PermissionAction.VIEW], [ModuleCode.CONSTRUCTION, PermissionAction.VIEW], [ModuleCode.CONSTRUCTION, PermissionAction.CREATE], [ModuleCode.CONSTRUCTION, PermissionAction.UPDATE],
    [ModuleCode.TASKS, PermissionAction.VIEW], [ModuleCode.TASKS, PermissionAction.CREATE], [ModuleCode.TASKS, PermissionAction.UPDATE], [ModuleCode.TASKS, PermissionAction.APPROVE],
    [ModuleCode.DOCUMENTS, PermissionAction.VIEW], [ModuleCode.DOCUMENTS, PermissionAction.CREATE], [ModuleCode.DOCUMENTS, PermissionAction.UPDATE], [ModuleCode.WARRANTY, PermissionAction.VIEW], [ModuleCode.WARRANTY, PermissionAction.UPDATE],
    [ModuleCode.DATA_CENTER, PermissionAction.VIEW], [ModuleCode.REPORTS, PermissionAction.VIEW], [ModuleCode.AI_PROFILE, PermissionAction.VIEW],
    [ModuleCode.CONTRACTS, PermissionAction.VIEW], [ModuleCode.CONTRACTS, PermissionAction.UPDATE], [ModuleCode.PAYMENTS, PermissionAction.VIEW], [ModuleCode.DEBT, PermissionAction.VIEW], [ModuleCode.PLANNING, PermissionAction.VIEW], [ModuleCode.PLANNING, PermissionAction.CREATE], [ModuleCode.PLANNING, PermissionAction.UPDATE], [ModuleCode.BIM, PermissionAction.VIEW], [ModuleCode.BIM, PermissionAction.CREATE], [ModuleCode.AI_BRAIN, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.CREATE],
  ],
  ENGINEER: [
    [ModuleCode.PROJECTS, PermissionAction.VIEW], [ModuleCode.GIS_MAP, PermissionAction.VIEW], [ModuleCode.CONSTRUCTION, PermissionAction.VIEW], [ModuleCode.CONSTRUCTION, PermissionAction.CREATE], [ModuleCode.CONSTRUCTION, PermissionAction.UPDATE],
    [ModuleCode.TASKS, PermissionAction.VIEW], [ModuleCode.TASKS, PermissionAction.UPDATE], [ModuleCode.DOCUMENTS, PermissionAction.VIEW], [ModuleCode.DOCUMENTS, PermissionAction.UPDATE], [ModuleCode.WARRANTY, PermissionAction.VIEW], [ModuleCode.PLANNING, PermissionAction.VIEW], [ModuleCode.PLANNING, PermissionAction.CREATE], [ModuleCode.BIM, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.CREATE],
  ],
  DATA_STEWARD: [
    [ModuleCode.DATA_CENTER, PermissionAction.VIEW], [ModuleCode.DATA_CENTER, PermissionAction.IMPORT], [ModuleCode.DATA_CENTER, PermissionAction.CREATE], [ModuleCode.DATA_CENTER, PermissionAction.UPDATE], [ModuleCode.DATA_CENTER, PermissionAction.DELETE], [ModuleCode.DATA_CENTER, PermissionAction.EXPORT],
    [ModuleCode.PROJECTS, PermissionAction.VIEW], [ModuleCode.DOCUMENTS, PermissionAction.VIEW], [ModuleCode.DOCUMENTS, PermissionAction.CREATE], [ModuleCode.DOCUMENTS, PermissionAction.UPDATE],
    [ModuleCode.USERS, PermissionAction.VIEW], [ModuleCode.ACTIVITY, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.CREATE], [ModuleCode.AI_BRAIN, PermissionAction.VIEW],
  ],
  CUSTOMER: [
    [ModuleCode.PORTAL, PermissionAction.VIEW], [ModuleCode.PROJECTS, PermissionAction.VIEW], [ModuleCode.GIS_MAP, PermissionAction.VIEW], [ModuleCode.DOCUMENTS, PermissionAction.VIEW],
    [ModuleCode.WARRANTY, PermissionAction.VIEW], [ModuleCode.WARRANTY, PermissionAction.CREATE], [ModuleCode.TASKS, PermissionAction.VIEW], [ModuleCode.STORAGE, PermissionAction.VIEW],
  ],
};

const accountDefs = [
  { email: "iip.admin@licogi183.vn", password: "IIP@2026!", name: "Super Admin IIP", role: RoleCode.SUPER_ADMIN, dept: "IT" },
  { email: "admin@licogi183.vn", password: "Licogi@2026!", name: "System Admin Licogi", role: RoleCode.SYSTEM_ADMIN, dept: "IT" },
  { email: "executive@licogi183.vn", password: "Executive@2026!", name: "Ban lãnh đạo", role: RoleCode.EXECUTIVE, dept: "BOD" },
  { email: "project.manager@licogi183.vn", password: "Project@2026!", name: "Quản lý dự án", role: RoleCode.PROJECT_MANAGER, dept: "PMO" },
  { email: "engineer@licogi183.vn", password: "Engineer@2026!", name: "Kỹ thuật công trường", role: RoleCode.ENGINEER, dept: "TECH" },
  { email: "data@licogi183.vn", password: "Data@2026!", name: "Data Steward", role: RoleCode.DATA_STEWARD, dept: "PMO" },
  { email: "customer@licogi183.vn", password: "Customer@2026!", name: "Chủ đầu tư", role: RoleCode.CUSTOMER, dept: "CUSTOMER" },
];

function statusFromText(value) {
  const s = String(value || "").toLowerCase();
  if (s.includes("completed") || s.includes("hoàn")) return "COMPLETED";
  if (s.includes("warranty") || s.includes("bảo hành")) return "WARRANTY";
  if (s.includes("plan") || s.includes("kế hoạch")) return "PLANNING";
  return "ONGOING";
}
function riskFromText(value) {
  const s = String(value || "").toLowerCase();
  if (s.includes("high") || s.includes("cao")) return "HIGH";
  if (s.includes("medium") || s.includes("trung")) return "MEDIUM";
  return "LOW";
}
function n(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}
function d(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function main() {
  const org = await prisma.organization.upsert({
    where: { code: seed.organization.code },
    update: { name: seed.organization.name },
    create: seed.organization,
  });

  const deptByCode = {};
  for (const [code, name] of departments) {
    deptByCode[code] = await prisma.department.upsert({
      where: { organizationId_code: { organizationId: org.id, code } },
      update: { name },
      create: { organizationId: org.id, code, name },
    });
  }

  const permissionByKey = {};
  for (const moduleCode of modules) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: { module_action: { module: moduleCode, action } },
        update: { name: `${moduleCode}.${action}` },
        create: { module: moduleCode, action, name: `${moduleCode}.${action}` },
      });
      permissionByKey[`${moduleCode}:${action}`] = permission;
    }
  }

  const roleByCode = {};
  for (const def of roleDefs) {
    const role = await prisma.role.upsert({
      where: { organizationId_code: { organizationId: org.id, code: def.code } },
      update: { name: def.name, dataScope: def.scope, description: def.desc },
      create: { organizationId: org.id, code: def.code, name: def.name, dataScope: def.scope, description: def.desc },
    });
    roleByCode[def.code] = role;
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const [module, action] of allow[def.code] || []) {
      const permission = permissionByKey[`${module}:${action}`];
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const userByEmail = {};
  for (const acc of accountDefs) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: { name: acc.name, roleId: roleByCode[acc.role].id, departmentId: deptByCode[acc.dept]?.id, status: "ACTIVE", mustChangePassword: false },
      create: { organizationId: org.id, email: acc.email, name: acc.name, roleId: roleByCode[acc.role].id, departmentId: deptByCode[acc.dept]?.id, passwordHash: passwordHash(acc.password), status: "ACTIVE", mustChangePassword: false },
    });
    userByEmail[acc.email] = user;
  }

  const customerByCode = {};
  for (const row of seed.customers) {
    customerByCode[row.customer_code] = await prisma.customer.upsert({
      where: { organizationId_code: { organizationId: org.id, code: row.customer_code } },
      update: { name: row.customer_name, country: row.country, industry: row.industry, contactName: row.contact_name || null, contactEmail: row.contact_email || null, metadata: row },
      create: { organizationId: org.id, code: row.customer_code, name: row.customer_name, country: row.country, industry: row.industry, contactName: row.contact_name || null, contactEmail: row.contact_email || null, metadata: row },
    });
  }

  const pm = userByEmail["project.manager@licogi183.vn"];
  const customerUser = userByEmail["customer@licogi183.vn"];
  let firstCustomerId = null;
  for (const row of seed.projects) {
    const customer = customerByCode[row.customer_code];
    if (!firstCustomerId && customer) firstCustomerId = customer.id;
    const project = await prisma.project.upsert({
      where: { organizationId_code: { organizationId: org.id, code: row.project_code } },
      update: {
        name: row.project_name, type: row.type, status: statusFromText(row.status), province: row.province || null,
        contractValueVnd: n(row.contract_value_vnd), valueRange: row.value_range || null, constructionArea: row.construction_area || null, floorArea: row.floor_area || null,
        scale: row.scale || null, progress: n(row.progress, 0), risk: riskFromText(row.risk), healthScore: n(row.health_score, 80), lat: n(row.lat), lng: n(row.lng), mapsUrl: row.maps_url || null,
        customerId: customer?.id, departmentId: deptByCode.PMO.id, ownerId: pm.id, updatedById: pm.id, metadata: row,
      },
      create: {
        organizationId: org.id, code: row.project_code, name: row.project_name, type: row.type, status: statusFromText(row.status), province: row.province || null,
        contractValueVnd: n(row.contract_value_vnd), valueRange: row.value_range || null, constructionArea: row.construction_area || null, floorArea: row.floor_area || null,
        scale: row.scale || null, progress: n(row.progress, 0), risk: riskFromText(row.risk), healthScore: n(row.health_score, 80), lat: n(row.lat), lng: n(row.lng), mapsUrl: row.maps_url || null,
        customerId: customer?.id, departmentId: deptByCode.PMO.id, ownerId: pm.id, createdById: pm.id, updatedById: pm.id, metadata: row,
      },
    });
    await prisma.projectMember.upsert({ where: { projectId_userId: { projectId: project.id, userId: pm.id } }, update: { responsibility: "Chủ nhiệm dự án", canApprove: true }, create: { projectId: project.id, userId: pm.id, responsibility: "Chủ nhiệm dự án", canApprove: true } });
  }
  if (customerUser && firstCustomerId) await prisma.user.update({ where: { id: customerUser.id }, data: { customerId: firstCustomerId } });

  for (const row of seed.employees) {
    await prisma.employee.upsert({
      where: { organizationId_code: { organizationId: org.id, code: row.employee_code } },
      update: { fullName: row.full_name, englishName: row.english_name || null, position: row.position || null, quantity: n(row.quantity), skillGroup: row.group || null, assignedProjectCode: row.assigned_project || null, departmentId: deptByCode.HR.id, metadata: row },
      create: { organizationId: org.id, code: row.employee_code, fullName: row.full_name, englishName: row.english_name || null, position: row.position || null, quantity: n(row.quantity), skillGroup: row.group || null, assignedProjectCode: row.assigned_project || null, departmentId: deptByCode.HR.id, metadata: row },
    });
  }

  for (const row of seed.equipment) {
    await prisma.equipment.upsert({
      where: { organizationId_code: { organizationId: org.id, code: row.equipment_code } },
      update: { name: row.equipment_name, category: row.category, quantity: row.quantity || null, quantityNumber: n(row.quantity_number), specifications: row.specifications || null, status: row.status || null, maintenanceDate: d(row.maintenance_date), departmentId: deptByCode.EQUIP.id, metadata: row },
      create: { organizationId: org.id, code: row.equipment_code, name: row.equipment_name, category: row.category, quantity: row.quantity || null, quantityNumber: n(row.quantity_number), specifications: row.specifications || null, status: row.status || null, maintenanceDate: d(row.maintenance_date), departmentId: deptByCode.EQUIP.id, metadata: row },
    });
  }

  for (const row of seed.documents) {
    const project = row.project_code ? await prisma.project.findFirst({ where: { organizationId: org.id, code: row.project_code } }) : null;
    await prisma.document.upsert({
      where: { organizationId_code: { organizationId: org.id, code: row.document_code } },
      update: { name: row.document_name, type: row.document_type || null, revision: row.revision || null, status: row.status || null, projectId: project?.id, departmentId: deptByCode.TECH.id, metadata: row },
      create: { organizationId: org.id, code: row.document_code, name: row.document_name, type: row.document_type || null, revision: row.revision || null, status: row.status || null, projectId: project?.id, departmentId: deptByCode.TECH.id, createdById: userByEmail["data@licogi183.vn"].id, updatedById: userByEmail["data@licogi183.vn"].id, metadata: row },
    });
  }

  for (const row of seed.warranty) {
    const project = await prisma.project.findFirst({ where: { organizationId: org.id, code: row.project_code } });
    await prisma.warrantyTicket.upsert({
      where: { organizationId_code: { organizationId: org.id, code: row.ticket_code } },
      update: { title: row.title, priority: row.priority || null, deadline: d(row.deadline), status: row.status || null, projectId: project?.id, assigneeId: pm.id, metadata: row },
      create: { organizationId: org.id, code: row.ticket_code, title: row.title, priority: row.priority || null, deadline: d(row.deadline), status: row.status || null, projectId: project?.id, assigneeId: pm.id, createdById: pm.id, metadata: row },
    });
  }


  const firstProject = await prisma.project.findFirst({ where: { organizationId: org.id }, include: { customer: true } });
  if (firstProject) {
    const contract = await prisma.contract.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "HD-LICOGI-0001" } },
      update: { title: `Hợp đồng EPC mẫu - ${firstProject.name}`, projectId: firstProject.id, customerId: firstProject.customerId, departmentId: deptByCode.FINANCE.id, valueVnd: firstProject.contractValueVnd || 150000000000, status: "SIGNED" },
      create: { organizationId: org.id, projectId: firstProject.id, customerId: firstProject.customerId, departmentId: deptByCode.FINANCE.id, createdById: userByEmail["project.manager@licogi183.vn"].id, code: "HD-LICOGI-0001", contractNo: "18.3/EPC/2026/001", title: `Hợp đồng EPC mẫu - ${firstProject.name}`, type: "EPC", status: "SIGNED", valueVnd: firstProject.contractValueVnd || 150000000000, vatRate: 10, retentionRate: 5, signedDate: new Date("2026-06-22"), startDate: new Date("2026-07-01"), endDate: new Date("2027-03-31"), metadata: { source: "production-seed" } },
    });
    const payment = await prisma.paymentRequest.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "TT-LICOGI-0001" } },
      update: { title: "Đề nghị thanh toán đợt 1", projectId: firstProject.id, contractId: contract.id, amountVnd: Math.round((firstProject.contractValueVnd || 150000000000) * 0.15), status: "REQUESTED" },
      create: { organizationId: org.id, projectId: firstProject.id, contractId: contract.id, createdById: userByEmail["project.manager@licogi183.vn"].id, code: "TT-LICOGI-0001", title: "Đề nghị thanh toán đợt 1", phase: "Tạm ứng / Mobilization", amountVnd: Math.round((firstProject.contractValueVnd || 150000000000) * 0.15), dueDate: new Date("2026-08-15"), status: "REQUESTED", metadata: { source: "production-seed" } },
    });
    await prisma.debtLedger.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "CN-LICOGI-0001" } },
      update: { partnerName: firstProject.customer?.name || "Chủ đầu tư mẫu", projectId: firstProject.id, contractId: contract.id, paymentRequestId: payment.id },
      create: { organizationId: org.id, projectId: firstProject.id, contractId: contract.id, paymentRequestId: payment.id, code: "CN-LICOGI-0001", partnerName: firstProject.customer?.name || "Chủ đầu tư mẫu", type: "RECEIVABLE", amountVnd: payment.amountVnd, paidVnd: 0, dueDate: new Date("2026-08-15"), status: "OPEN", notes: "Công nợ phải thu theo đề nghị thanh toán đợt 1.", metadata: { source: "production-seed" } },
    });
    const plan = await prisma.constructionPlan.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "KH-LICOGI-0001" } },
      update: { projectId: firstProject.id, name: `Kế hoạch thi công tổng thể - ${firstProject.name}`, progress: firstProject.progress || 0 },
      create: { organizationId: org.id, projectId: firstProject.id, departmentId: deptByCode.PMO.id, code: "KH-LICOGI-0001", name: `Kế hoạch thi công tổng thể - ${firstProject.name}`, status: "IN_PROGRESS", baselineStart: new Date("2026-07-01"), baselineFinish: new Date("2027-03-31"), forecastFinish: new Date("2027-04-15"), progress: firstProject.progress || 0, metadata: { source: "production-seed" } },
    });
    const planTasks = [
      ["WBS-00001", "1", "Chuẩn bị mặt bằng", 100, "DONE", "2026-07-01", "2026-07-20"],
      ["WBS-00002", "2", "Thi công móng", 60, "DOING", "2026-07-21", "2026-09-15"],
      ["WBS-00003", "3", "Kết cấu thân", 20, "DOING", "2026-09-16", "2026-12-30"],
      ["WBS-00004", "4", "MEP và hoàn thiện", 0, "TODO", "2027-01-01", "2027-03-31"],
    ];
    for (const [code, wbs, name, progress, status, start, end] of planTasks) {
      await prisma.planTask.upsert({
        where: { organizationId_code: { organizationId: org.id, code } },
        update: { progress, status },
        create: { organizationId: org.id, projectId: firstProject.id, planId: plan.id, code, wbs, name, progress, status, startDate: new Date(start), endDate: new Date(end), critical: code === "WBS-00002", metadata: { source: "production-seed" } },
      });
    }
    await prisma.dailyReport.create({ data: { organizationId: org.id, projectId: firstProject.id, createdById: userByEmail["engineer@licogi183.vn"].id, reportDate: new Date(), weather: "Nắng nhẹ", manpowerCount: 86, equipmentCount: 14, workDone: "Hoàn thiện coffa và nghiệm thu thép khu vực móng trục A-B.", issues: "Cần bổ sung 02 máy đầm dùi trong ca chiều.", safetyNotes: "Không ghi nhận tai nạn, đã toolbox meeting đầu ca.", progress: firstProject.progress || 0, metadata: { source: "production-seed" } } }).catch(() => null);
    await prisma.bimModel.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "BIM-LICOGI-0001" } },
      update: { projectId: firstProject.id, name: `BIM tổng thể - ${firstProject.name}` },
      create: { organizationId: org.id, projectId: firstProject.id, createdById: userByEmail["engineer@licogi183.vn"].id, code: "BIM-LICOGI-0001", name: `BIM tổng thể - ${firstProject.name}`, version: "v1", discipline: "ARCH/STRUCT/MEP", modelUrl: null, viewerProvider: "AUTODESK_APS", status: "REGISTERED", metadata: { source: "production-seed" } },
    });
    const projectDoc = await prisma.document.findFirst({ where: { organizationId: org.id, projectId: firstProject.id } });
    await prisma.aiKnowledgeItem.create({ data: { organizationId: org.id, projectId: firstProject.id, documentId: projectDoc?.id, createdById: userByEmail["data@licogi183.vn"].id, title: "Tri thức mẫu về năng lực thi công Licogi 18.3", sourceType: "SEED", summary: "Kho tri thức ban đầu cho AI Construction Brain, dùng để RAG hồ sơ dự án, nhân sự, thiết bị, hợp đồng và nhật ký thi công.", contentText: "Licogi 18.3 cần số hóa dữ liệu dự án, nhân sự, thiết bị, BIM, bảo hành, hợp đồng và công nợ để phục vụ điều hành EPC.", vectorStatus: "PENDING", embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small", metadata: { source: "production-seed" } } }).catch(() => null);
    const layer = await prisma.gisLayer.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "GIS-PROJECTS" } },
      update: { name: "Bản đồ dự án Licogi 18.3", visible: true },
      create: { organizationId: org.id, code: "GIS-PROJECTS", name: "Bản đồ dự án Licogi 18.3", layerType: "PROJECT", visible: true, style: { color: "orange" }, metadata: { source: "production-seed" } },
    });
    if (firstProject.lat && firstProject.lng) {
      await prisma.gisFeature.upsert({
        where: { organizationId_code: { organizationId: org.id, code: "GEOF-LICOGI-0001" } },
        update: { projectId: firstProject.id, geometry: { type: "Point", coordinates: [firstProject.lng, firstProject.lat] } },
        create: { organizationId: org.id, layerId: layer.id, projectId: firstProject.id, code: "GEOF-LICOGI-0001", name: firstProject.name, geometry: { type: "Point", coordinates: [firstProject.lng, firstProject.lat] }, properties: { province: firstProject.province, progress: firstProject.progress }, },
      });
    }
    const financeAccounts = [
      ["111", "Tiền mặt", "ASSET"], ["112", "Tiền gửi ngân hàng", "ASSET"], ["131", "Phải thu khách hàng", "ASSET"], ["331", "Phải trả người bán", "LIABILITY"], ["511", "Doanh thu xây lắp", "REVENUE"], ["621", "Chi phí nguyên vật liệu trực tiếp", "EXPENSE"], ["622", "Chi phí nhân công trực tiếp", "EXPENSE"], ["627", "Chi phí sản xuất chung", "EXPENSE"]
    ];
    const accByCode = {};
    for (const [code, name, type] of financeAccounts) {
      accByCode[code] = await prisma.financeAccount.upsert({ where: { organizationId_code: { organizationId: org.id, code } }, update: { name, type, isActive: true }, create: { organizationId: org.id, code, name, type, metadata: { source: "seed" } } });
    }
    const entry = await prisma.journalEntry.upsert({
      where: { organizationId_code: { organizationId: org.id, code: "BT-LICOGI-0001" } },
      update: { description: "Ghi nhận doanh thu theo hợp đồng mẫu", status: "POSTED" },
      create: { organizationId: org.id, createdById: userByEmail["data@licogi183.vn"].id, code: "BT-LICOGI-0001", postingDate: new Date("2026-08-01"), description: "Ghi nhận doanh thu theo hợp đồng mẫu", sourceModule: "CONTRACTS", status: "POSTED", metadata: { source: "production-seed" } },
    });
    await prisma.journalLine.create({ data: { organizationId: org.id, entryId: entry.id, debitAccountId: accByCode["131"].id, creditAccountId: accByCode["511"].id, amountVnd: payment.amountVnd, description: "Phải thu chủ đầu tư theo đề nghị thanh toán đợt 1", projectCode: firstProject.code, metadata: { source: "production-seed" } } }).catch(() => null);
    const lead = await prisma.crmLead.upsert({ where: { organizationId_code: { organizationId: org.id, code: "LEAD-LICOGI-0001" } }, update: { companyName: "FDI Manufacturing Investor", stage: "QUALIFIED" }, create: { organizationId: org.id, customerId: firstProject.customerId, createdById: userByEmail["project.manager@licogi183.vn"].id, code: "LEAD-LICOGI-0001", companyName: "FDI Manufacturing Investor", contactName: "Mr. Tanaka", contactEmail: "tanaka@example.com", country: "Japan", source: "Website / AI Profile", stage: "QUALIFIED", estimatedValueVnd: 250000000000, nextActionAt: new Date("2026-08-10"), notes: "Lead mẫu cho pipeline FDI.", metadata: { source: "production-seed" } } });
    await prisma.crmOpportunity.upsert({ where: { organizationId_code: { organizationId: org.id, code: "OPP-LICOGI-0001" } }, update: { name: "Nhà máy FDI mở rộng giai đoạn 2", stage: "PROPOSAL" }, create: { organizationId: org.id, leadId: lead.id, customerId: firstProject.customerId, projectId: firstProject.id, code: "OPP-LICOGI-0001", name: "Nhà máy FDI mở rộng giai đoạn 2", stage: "PROPOSAL", probability: 45, estimatedValueVnd: 250000000000, expectedCloseDate: new Date("2026-10-30"), metadata: { source: "production-seed" } } });
    const wf = await prisma.erpProcess.upsert({ where: { organizationId_code: { organizationId: org.id, code: "WF-PAYMENT-001" } }, update: { name: "Duyệt đề nghị thanh toán" }, create: { organizationId: org.id, code: "WF-PAYMENT-001", name: "Duyệt đề nghị thanh toán", module: ModuleCode.PAYMENTS, steps: [{ step: 1, role: "PROJECT_MANAGER" }, { step: 2, role: "FINANCE" }, { step: 3, role: "EXECUTIVE" }], isActive: true } });
    await prisma.erpApproval.upsert({ where: { organizationId_code: { organizationId: org.id, code: "APR-LICOGI-0001" } }, update: { status: "PENDING" }, create: { organizationId: org.id, processId: wf.id, createdById: userByEmail["project.manager@licogi183.vn"].id, assigneeId: userByEmail["executive@licogi183.vn"].id, code: "APR-LICOGI-0001", title: "Duyệt đề nghị thanh toán đợt 1", module: ModuleCode.PAYMENTS, entity: "paymentRequest", entityId: payment.id, status: "PENDING", payload: { amountVnd: payment.amountVnd, contractCode: contract.code } } });
  }

  const moduleOwners = [
    [ModuleCode.DASHBOARD, "BOD", DataScope.ALL, "Ban lãnh đạo sở hữu chỉ số điều hành."],
    [ModuleCode.PROJECTS, "PMO", DataScope.ASSIGNED, "Ban điều hành dự án sở hữu danh mục dự án và quyền phân công."],
    [ModuleCode.DATA_CENTER, "PMO", DataScope.DEPARTMENT, "Data Steward kiểm duyệt dữ liệu trước khi đưa vào vận hành."],
    [ModuleCode.GIS_MAP, "PMO", DataScope.ALL, "GIS dùng dữ liệu dự án đã được chuẩn hóa."],
    [ModuleCode.CONSTRUCTION, "PMO", DataScope.ASSIGNED, "Chỉ huy/quản lý dự án cập nhật theo công trình được giao."],
    [ModuleCode.DOCUMENTS, "TECH", DataScope.ASSIGNED, "Phòng Kỹ thuật/BIM sở hữu bản vẽ và phiên bản hồ sơ."],
    [ModuleCode.WARRANTY, "WARRANTY", DataScope.ASSIGNED, "Phòng Bảo hành sở hữu quy trình sau bàn giao."],
    [ModuleCode.PORTAL, "CUSTOMER", DataScope.CUSTOMER, "Chủ đầu tư chỉ xem dữ liệu thuộc dự án của họ."],
    [ModuleCode.USERS, "IT", DataScope.ALL, "CNTT sở hữu tài khoản, vai trò và phân quyền."],
    [ModuleCode.SETTINGS, "IT", DataScope.ALL, "CNTT sở hữu cấu hình, tích hợp API và bảo mật."],
    [ModuleCode.STORAGE, "IT", DataScope.ALL, "CNTT sở hữu kho file S3/MinIO, phân quyền và backup."],
    [ModuleCode.CONTRACTS, "FINANCE", DataScope.ASSIGNED, "Tài chính - Kế toán sở hữu hợp đồng và điều khoản thanh toán."],
    [ModuleCode.PAYMENTS, "FINANCE", DataScope.ASSIGNED, "Tài chính - Kế toán sở hữu đề nghị thanh toán, nghiệm thu, hóa đơn."],
    [ModuleCode.DEBT, "FINANCE", DataScope.ASSIGNED, "Tài chính - Kế toán sở hữu công nợ phải thu/phải trả."],
    [ModuleCode.FINANCE, "FINANCE", DataScope.ALL, "Tài chính - Kế toán sở hữu hệ thống tài khoản và bút toán."],
    [ModuleCode.PLANNING, "PMO", DataScope.ASSIGNED, "PMO sở hữu WBS, tiến độ, nhật ký và cảnh báo chậm tiến độ."],
    [ModuleCode.BIM, "TECH", DataScope.ASSIGNED, "Phòng Kỹ thuật/BIM sở hữu mô hình, bản vẽ, phiên bản BIM."],
    [ModuleCode.AI_BRAIN, "IT", DataScope.ALL, "CNTT/Data Steward sở hữu tri thức AI, embedding và RAG."],
    [ModuleCode.CRM, "CRM", DataScope.ASSIGNED, "Kinh doanh sở hữu lead, cơ hội, pipeline và khách hàng FDI."],
    [ModuleCode.ERP, "IT", DataScope.ALL, "CNTT và Ban lãnh đạo sở hữu quy trình phê duyệt liên phòng ban."],
  ];
  for (const [module, dept, dataScope, description] of moduleOwners) {
    await prisma.moduleOwnership.upsert({
      where: { organizationId_module: { organizationId: org.id, module } },
      update: { ownerDepartmentId: deptByCode[dept].id, dataScope, description },
      create: { organizationId: org.id, module, ownerDepartmentId: deptByCode[dept].id, dataScope, description },
    });
  }

  await prisma.auditLog.create({ data: { organizationId: org.id, userId: userByEmail["iip.admin@licogi183.vn"].id, module: ModuleCode.SETTINGS, action: PermissionAction.MANAGE, message: "Seed Prisma database, RBAC, ownership and Licogi source data." } });
  console.log(`Seed xong: ${seed.projects.length} dự án, ${seed.customers.length} chủ đầu tư, ${seed.employees.length} nhóm nhân sự, ${seed.equipment.length} thiết bị.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
