import { Prisma } from "@prisma/client";
import { DataEntityKey, dataEntities } from "../data/dataCenter";
import { prisma } from "./prisma";
import { AuthUser } from "./authServer";

export type StoredRow = Record<string, string> & {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
};

type StoreContext = { user?: AuthUser };
type DbBaseRow = { id: string; createdAt: Date; updatedAt: Date };
type ProjectDbRow = DbBaseRow & { code: string; name: string; type: string; status: string; customer?: { name?: string | null; code?: string | null } | null; province?: string | null; valueRange?: string | null; contractValueVnd?: number | null; constructionArea?: string | null; floorArea?: string | null; scale?: string | null; progress?: number | null; risk: string; healthScore?: number | null; lat?: number | null; lng?: number | null; mapsUrl?: string | null; metadata?: Prisma.JsonValue | null };
type CustomerDbRow = DbBaseRow & { code: string; name: string; country?: string | null; industry?: string | null; contactName?: string | null; contactEmail?: string | null };
type EmployeeDbRow = DbBaseRow & { code: string; fullName: string; englishName?: string | null; skillGroup?: string | null; position?: string | null; quantity?: number | null; phone?: string | null; assignedProjectCode?: string | null; metadata?: Prisma.JsonValue | null };
type EquipmentDbRow = DbBaseRow & { code: string; name: string; category: string; quantity?: string | null; quantityNumber?: number | null; specifications?: string | null; project?: { code?: string | null } | null; status?: string | null; maintenanceDate?: Date | null; metadata?: Prisma.JsonValue | null };
type DocumentDbRow = DbBaseRow & { code: string; name: string; project?: { code?: string | null } | null; type?: string | null; revision?: string | null; status?: string | null; fileUrl?: string | null; metadata?: Prisma.JsonValue | null };
type WarrantyDbRow = DbBaseRow & { code: string; project?: { code?: string | null } | null; title: string; priority?: string | null; deadline?: Date | null; status?: string | null };
type AiKnowledgeDbRow = DbBaseRow & { title: string; sourceType: string; sourceUrl?: string | null; summary?: string | null; contentText?: string | null; vectorStatus: string; embeddingModel?: string | null; metadata?: Prisma.JsonValue | null; project?: { code?: string | null } | null; document?: { code?: string | null } | null };

export function isValidEntity(entity: string): entity is DataEntityKey {
  return dataEntities.some((item) => item.key === entity);
}

function s(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function n(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function ni(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
}

function nf(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function d(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function statusFromText(value: unknown) {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("completed") || raw.includes("hoàn")) return "COMPLETED" as const;
  if (raw.includes("warranty") || raw.includes("bảo hành")) return "WARRANTY" as const;
  if (raw.includes("planning") || raw.includes("kế hoạch")) return "PLANNING" as const;
  return "ONGOING" as const;
}

function statusToText(value: string) {
  return value === "COMPLETED" ? "completed" : value === "WARRANTY" ? "warranty" : value === "PLANNING" ? "planning" : "ongoing";
}

function riskFromText(value: unknown) {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("high") || raw.includes("cao")) return "HIGH" as const;
  if (raw.includes("medium") || raw.includes("trung")) return "MEDIUM" as const;
  return "LOW" as const;
}

function riskToText(value: string) {
  return value === "HIGH" ? "high" : value === "MEDIUM" ? "medium" : "low";
}

function json(row: Record<string, string>) {
  return row as Prisma.InputJsonValue;
}

function metadataValue(metadata: Prisma.JsonValue | null | undefined, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const value = (metadata as Record<string, unknown>)[key];
  return s(value);
}

async function firstOrgId() {
  const org = await prisma.organization.findFirst({ select: { id: true } });
  return org?.id;
}

async function organizationId(context?: StoreContext) {
  return context?.user?.organizationId ?? await firstOrgId();
}

async function departmentIdByCode(orgId: string, code: string) {
  const dept = await prisma.department.findFirst({ where: { organizationId: orgId, code }, select: { id: true } });
  return dept?.id ?? null;
}

function projectScope(user?: AuthUser): Prisma.ProjectWhereInput {
  if (!user) return {};
  if (user.dataScope === "ALL") return { organizationId: user.organizationId };
  if (user.dataScope === "CUSTOMER") return { organizationId: user.organizationId, customerId: user.customerId ?? "__none__" };
  if (user.dataScope === "DEPARTMENT") return { organizationId: user.organizationId, OR: [{ departmentId: user.departmentId ?? "__none__" }, { departmentId: null }] };
  if (user.dataScope === "OWN") return { organizationId: user.organizationId, OR: [{ ownerId: user.id }, { createdById: user.id }] };
  return { organizationId: user.organizationId, OR: [{ ownerId: user.id }, { createdById: user.id }, { members: { some: { userId: user.id } } }] };
}

function departmentScope(user?: AuthUser): Prisma.EmployeeWhereInput {
  if (!user) return {};
  if (user.dataScope === "ALL") return { organizationId: user.organizationId };
  if (user.dataScope === "DEPARTMENT") return { organizationId: user.organizationId, OR: [{ departmentId: user.departmentId ?? "__none__" }, { departmentId: null }] };
  return { organizationId: user.organizationId };
}

function customerScope(user?: AuthUser): Prisma.CustomerWhereInput {
  if (!user) return {};
  if (user.dataScope === "CUSTOMER") return { organizationId: user.organizationId, id: user.customerId ?? "__none__" };
  return { organizationId: user.organizationId };
}

function equipmentScope(user?: AuthUser): Prisma.EquipmentWhereInput {
  if (!user) return {};
  if (user.dataScope === "ALL") return { organizationId: user.organizationId };
  if (user.dataScope === "CUSTOMER") return { organizationId: user.organizationId, project: { customerId: user.customerId ?? "__none__" } };
  if (user.dataScope === "DEPARTMENT") return { organizationId: user.organizationId, OR: [{ departmentId: user.departmentId ?? "__none__" }, { departmentId: null }] };
  return { organizationId: user.organizationId, OR: [{ project: { members: { some: { userId: user.id } } } }, { project: { ownerId: user.id } }, { projectId: null }] };
}

function documentScope(user?: AuthUser): Prisma.DocumentWhereInput {
  if (!user) return {};
  if (user.dataScope === "ALL") return { organizationId: user.organizationId };
  if (user.dataScope === "CUSTOMER") return { organizationId: user.organizationId, project: { customerId: user.customerId ?? "__none__" } };
  if (user.dataScope === "DEPARTMENT") return { organizationId: user.organizationId, OR: [{ departmentId: user.departmentId ?? "__none__" }, { departmentId: null }] };
  return { organizationId: user.organizationId, OR: [{ createdById: user.id }, { project: { members: { some: { userId: user.id } } } }, { project: { ownerId: user.id } }, { projectId: null }] };
}

function warrantyScope(user?: AuthUser): Prisma.WarrantyTicketWhereInput {
  if (!user) return {};
  if (user.dataScope === "ALL") return { organizationId: user.organizationId };
  if (user.dataScope === "CUSTOMER") return { organizationId: user.organizationId, project: { customerId: user.customerId ?? "__none__" } };
  if (user.dataScope === "OWN") return { organizationId: user.organizationId, OR: [{ assigneeId: user.id }, { createdById: user.id }] };
  return { organizationId: user.organizationId, OR: [{ assigneeId: user.id }, { createdById: user.id }, { project: { members: { some: { userId: user.id } } } }, { project: { ownerId: user.id } }] };
}

function aiKnowledgeScope(user?: AuthUser): Prisma.AiKnowledgeItemWhereInput {
  if (!user) return {};
  if (user.dataScope === "CUSTOMER") return { organizationId: user.organizationId, project: { customerId: user.customerId ?? "__none__" } };
  if (user.dataScope === "OWN") return { organizationId: user.organizationId, OR: [{ createdById: user.id }, { project: { ownerId: user.id } }] };
  return { organizationId: user.organizationId };
}

function base(row: { id: string; createdAt: Date; updatedAt: Date }) {
  return { _id: row.id, _createdAt: row.createdAt.toISOString(), _updatedAt: row.updatedAt.toISOString() };
}

export async function readRows(entity: DataEntityKey, context?: StoreContext): Promise<StoredRow[]> {
  if (entity === "projects") {
    const rows = await prisma.project.findMany({ where: projectScope(context?.user), include: { customer: true }, orderBy: { updatedAt: "desc" } });
    return rows.map((row: ProjectDbRow) => ({ ...base(row), project_code: row.code, project_name: row.name, type: row.type, status: statusToText(row.status), investor: row.customer?.name ?? "", customer_code: row.customer?.code ?? "", province: s(row.province), value_range: s(row.valueRange), contract_value_vnd: s(row.contractValueVnd), construction_area: s(row.constructionArea), floor_area: s(row.floorArea), scale: s(row.scale), progress: s(row.progress), risk: riskToText(row.risk), health_score: s(row.healthScore), lat: s(row.lat), lng: s(row.lng), maps_url: s(row.mapsUrl), source: metadataValue(row.metadata, "source") }));
  }
  if (entity === "customers") {
    const rows = await prisma.customer.findMany({ where: customerScope(context?.user), orderBy: { updatedAt: "desc" } });
    return rows.map((row: CustomerDbRow) => ({ ...base(row), customer_code: row.code, customer_name: row.name, country: s(row.country), industry: s(row.industry), contact_name: s(row.contactName), contact_email: s(row.contactEmail) }));
  }
  if (entity === "employees") {
    const rows = await prisma.employee.findMany({ where: departmentScope(context?.user), orderBy: { updatedAt: "desc" } });
    return rows.map((row: EmployeeDbRow) => ({ ...base(row), employee_code: row.code, full_name: row.fullName, english_name: s(row.englishName), department: s(row.skillGroup || "Phòng Nhân sự"), position: s(row.position), quantity: s(row.quantity), phone: s(row.phone), assigned_project: s(row.assignedProjectCode), group: metadataValue(row.metadata, "group"), source: metadataValue(row.metadata, "source") }));
  }
  if (entity === "equipment") {
    const rows = await prisma.equipment.findMany({ where: equipmentScope(context?.user), include: { project: true }, orderBy: { updatedAt: "desc" } });
    return rows.map((row: EquipmentDbRow) => ({ ...base(row), equipment_code: row.code, equipment_name: row.name, category: row.category, quantity: s(row.quantity), quantity_number: s(row.quantityNumber), specifications: s(row.specifications), project_code: s(row.project?.code), status: s(row.status), maintenance_date: row.maintenanceDate ? row.maintenanceDate.toISOString().slice(0, 10) : "", source: metadataValue(row.metadata, "source") }));
  }
  if (entity === "documents") {
    const rows = await prisma.document.findMany({ where: documentScope(context?.user), include: { project: true }, orderBy: { updatedAt: "desc" } });
    return rows.map((row: DocumentDbRow) => ({ ...base(row), document_code: row.code, document_name: row.name, project_code: s(row.project?.code), document_type: s(row.type), revision: s(row.revision), status: s(row.status), file_url: s(row.fileUrl), source: metadataValue(row.metadata, "source") }));
  }
  if (entity === "ai_knowledge") {
    const rows = await prisma.aiKnowledgeItem.findMany({ where: aiKnowledgeScope(context?.user), include: { project: true, document: true }, orderBy: { updatedAt: "desc" } });
    return rows.map((row: AiKnowledgeDbRow) => ({ ...base(row), knowledge_code: metadataValue(row.metadata, "knowledge_code"), title: row.title, source_type: row.sourceType, project_code: s(row.project?.code), document_code: s(row.document?.code), source_url: s(row.sourceUrl), summary: s(row.summary), content_text: s(row.contentText), language: metadataValue(row.metadata, "language"), tags: metadataValue(row.metadata, "tags"), vector_status: row.vectorStatus, embedding_model: s(row.embeddingModel), source: metadataValue(row.metadata, "source") }));
  }
  const rows = await prisma.warrantyTicket.findMany({ where: warrantyScope(context?.user), include: { project: true }, orderBy: { updatedAt: "desc" } });
  return rows.map((row: WarrantyDbRow) => ({ ...base(row), ticket_code: row.code, project_code: s(row.project?.code), title: row.title, priority: s(row.priority), deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : "", status: s(row.status) }));
}

export async function appendRows(entity: DataEntityKey, rows: Record<string, string>[], context?: StoreContext) {
  const orgId = await organizationId(context);
  if (!orgId) return [];
  for (const row of rows) {
    if (entity === "customers") {
      const code = row.customer_code || `CUS-${Date.now()}`;
      await prisma.customer.upsert({ where: { organizationId_code: { organizationId: orgId, code } }, update: { name: row.customer_name || code, country: row.country || null, industry: row.industry || null, contactName: row.contact_name || null, contactEmail: row.contact_email || null, metadata: json(row) }, create: { organizationId: orgId, code, name: row.customer_name || code, country: row.country || null, industry: row.industry || null, contactName: row.contact_name || null, contactEmail: row.contact_email || null, metadata: json(row) } });
    } else if (entity === "projects") {
      const code = row.project_code || `PRJ-${Date.now()}`;
      let customer = row.customer_code ? await prisma.customer.findFirst({ where: { organizationId: orgId, code: row.customer_code } }) : null;
      if (!customer && row.investor) customer = await prisma.customer.create({ data: { organizationId: orgId, code: row.customer_code || `CUS-${Date.now()}`, name: row.investor, metadata: json(row) } });
      await prisma.project.upsert({ where: { organizationId_code: { organizationId: orgId, code } }, update: { name: row.project_name || code, type: row.type || "Công nghiệp", status: statusFromText(row.status), province: row.province || null, contractValueVnd: nf(row.contract_value_vnd), valueRange: row.value_range || null, constructionArea: row.construction_area || null, floorArea: row.floor_area || null, scale: row.scale || null, progress: n(row.progress), risk: riskFromText(row.risk), healthScore: n(row.health_score, 80), lat: nf(row.lat), lng: nf(row.lng), mapsUrl: row.maps_url || null, customerId: customer?.id, ownerId: context?.user?.id, updatedById: context?.user?.id, metadata: json(row) }, create: { organizationId: orgId, code, name: row.project_name || code, type: row.type || "Công nghiệp", status: statusFromText(row.status), province: row.province || null, contractValueVnd: nf(row.contract_value_vnd), valueRange: row.value_range || null, constructionArea: row.construction_area || null, floorArea: row.floor_area || null, scale: row.scale || null, progress: n(row.progress), risk: riskFromText(row.risk), healthScore: n(row.health_score, 80), lat: nf(row.lat), lng: nf(row.lng), mapsUrl: row.maps_url || null, customerId: customer?.id, departmentId: context?.user?.departmentId, ownerId: context?.user?.id, createdById: context?.user?.id, updatedById: context?.user?.id, metadata: json(row) } });
    } else if (entity === "employees") {
      const code = row.employee_code || `EMP-${Date.now()}`;
      const deptId = context?.user?.departmentId ?? await departmentIdByCode(orgId, "HR");
      await prisma.employee.upsert({ where: { organizationId_code: { organizationId: orgId, code } }, update: { fullName: row.full_name || code, englishName: row.english_name || null, position: row.position || null, phone: row.phone || null, quantity: ni(row.quantity), skillGroup: row.department || row.group || null, assignedProjectCode: row.assigned_project || null, departmentId: deptId, metadata: json(row) }, create: { organizationId: orgId, code, fullName: row.full_name || code, englishName: row.english_name || null, position: row.position || null, phone: row.phone || null, quantity: ni(row.quantity), skillGroup: row.department || row.group || null, assignedProjectCode: row.assigned_project || null, departmentId: deptId, metadata: json(row) } });
    } else if (entity === "equipment") {
      const code = row.equipment_code || `EQ-${Date.now()}`;
      const project = row.project_code ? await prisma.project.findFirst({ where: { organizationId: orgId, code: row.project_code } }) : null;
      const deptId = context?.user?.departmentId ?? await departmentIdByCode(orgId, "EQUIP");
      await prisma.equipment.upsert({ where: { organizationId_code: { organizationId: orgId, code } }, update: { name: row.equipment_name || code, category: row.category || "Thiết bị", quantity: row.quantity || null, quantityNumber: ni(row.quantity_number), specifications: row.specifications || null, projectId: project?.id, status: row.status || null, maintenanceDate: d(row.maintenance_date), departmentId: deptId, metadata: json(row) }, create: { organizationId: orgId, code, name: row.equipment_name || code, category: row.category || "Thiết bị", quantity: row.quantity || null, quantityNumber: ni(row.quantity_number), specifications: row.specifications || null, projectId: project?.id, status: row.status || null, maintenanceDate: d(row.maintenance_date), departmentId: deptId, metadata: json(row) } });
    } else if (entity === "documents") {
      const code = row.document_code || `DOC-${Date.now()}`;
      const project = row.project_code ? await prisma.project.findFirst({ where: { organizationId: orgId, code: row.project_code } }) : null;
      const deptId = context?.user?.departmentId ?? await departmentIdByCode(orgId, "TECH");
      await prisma.document.upsert({ where: { organizationId_code: { organizationId: orgId, code } }, update: { name: row.document_name || code, type: row.document_type || null, revision: row.revision || null, status: row.status || null, fileUrl: row.file_url || null, projectId: project?.id, departmentId: deptId, updatedById: context?.user?.id, metadata: json(row) }, create: { organizationId: orgId, code, name: row.document_name || code, type: row.document_type || null, revision: row.revision || null, status: row.status || null, fileUrl: row.file_url || null, projectId: project?.id, departmentId: deptId, createdById: context?.user?.id, updatedById: context?.user?.id, metadata: json(row) } });
    } else if (entity === "ai_knowledge") {
      const project = row.project_code ? await prisma.project.findFirst({ where: { organizationId: orgId, code: row.project_code } }) : null;
      const document = row.document_code ? await prisma.document.findFirst({ where: { organizationId: orgId, code: row.document_code } }) : null;
      const code = row.knowledge_code || `AI-KNOW-${Date.now()}`;
      const existingRows = await prisma.aiKnowledgeItem.findMany({ where: { organizationId: orgId }, select: { id: true, title: true, metadata: true } });
      const existing = existingRows.find((item) => metadataValue(item.metadata, "knowledge_code") === code) ?? existingRows.find((item) => item.title === row.title);
      const data = { projectId: project?.id ?? null, documentId: document?.id ?? null, title: row.title || code, sourceType: row.source_type || "DOCUMENT", sourceUrl: row.source_url || null, summary: row.summary || null, contentText: row.content_text || null, vectorStatus: row.vector_status || "PENDING", embeddingModel: row.embedding_model || process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small", metadata: json({ ...row, knowledge_code: code }) };
      if (existing) await prisma.aiKnowledgeItem.update({ where: { id: existing.id }, data });
      else await prisma.aiKnowledgeItem.create({ data: { organizationId: orgId, createdById: context?.user?.id, ...data } });
    } else {
      const code = row.ticket_code || `BH-${Date.now()}`;
      const project = row.project_code ? await prisma.project.findFirst({ where: { organizationId: orgId, code: row.project_code } }) : null;
      await prisma.warrantyTicket.upsert({ where: { organizationId_code: { organizationId: orgId, code } }, update: { title: row.title || code, priority: row.priority || null, deadline: d(row.deadline), status: row.status || null, projectId: project?.id, assigneeId: context?.user?.id, metadata: json(row) }, create: { organizationId: orgId, code, title: row.title || code, priority: row.priority || null, deadline: d(row.deadline), status: row.status || null, projectId: project?.id, assigneeId: context?.user?.id, createdById: context?.user?.id, metadata: json(row) } });
    }
  }
  return readRows(entity, context);
}

export async function replaceRows(entity: DataEntityKey, rows: Record<string, string>[], context?: StoreContext) {
  const orgId = await organizationId(context);
  if (!orgId) return [];
  if (entity === "projects") await prisma.project.deleteMany({ where: { organizationId: orgId } });
  if (entity === "customers") await prisma.customer.deleteMany({ where: { organizationId: orgId } });
  if (entity === "employees") await prisma.employee.deleteMany({ where: { organizationId: orgId } });
  if (entity === "equipment") await prisma.equipment.deleteMany({ where: { organizationId: orgId } });
  if (entity === "documents") await prisma.document.deleteMany({ where: { organizationId: orgId } });
  if (entity === "ai_knowledge") await prisma.aiKnowledgeItem.deleteMany({ where: { organizationId: orgId } });
  if (entity === "warranty") await prisma.warrantyTicket.deleteMany({ where: { organizationId: orgId } });
  return appendRows(entity, rows, context);
}

export async function writeRows(entity: DataEntityKey, rows: StoredRow[], context?: StoreContext) {
  return replaceRows(entity, rows, context);
}

export async function deleteRows(entity: DataEntityKey, ids: string[], context?: StoreContext) {
  if (entity === "projects") await prisma.project.deleteMany({ where: { id: { in: ids } } });
  if (entity === "customers") await prisma.customer.deleteMany({ where: { id: { in: ids } } });
  if (entity === "employees") await prisma.employee.deleteMany({ where: { id: { in: ids } } });
  if (entity === "equipment") await prisma.equipment.deleteMany({ where: { id: { in: ids } } });
  if (entity === "documents") await prisma.document.deleteMany({ where: { id: { in: ids } } });
  if (entity === "ai_knowledge") await prisma.aiKnowledgeItem.deleteMany({ where: { id: { in: ids } } });
  if (entity === "warranty") await prisma.warrantyTicket.deleteMany({ where: { id: { in: ids } } });
  return readRows(entity, context);
}

export async function bulkUpdateRows(entity: DataEntityKey, ids: string[], patch: Record<string, string>, context?: StoreContext) {
  for (const id of ids) {
    const current = (await readRows(entity, context)).find((row) => row._id === id);
    if (!current) continue;
    await appendRows(entity, [{ ...current, ...patch }], context);
  }
  return readRows(entity, context);
}
