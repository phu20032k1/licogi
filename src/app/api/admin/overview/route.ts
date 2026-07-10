/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { authorize } from "../../../../lib/authServer";
import { prisma } from "../../../../lib/prisma";

type RoleSummaryRow = { id: string; code: string; name: string; dataScope: string; _count: { users: number; rolePermissions: number } };
type OwnershipSummaryRow = { module: string; dataScope: string; ownerDepartment?: { name?: string | null } | null; ownerUser?: { name?: string | null } | null; description?: string | null };
type AuditSummaryRow = { id: string; createdAt: Date; user?: { name?: string | null } | null; module: string; action: string; message: string };
const db = prisma as any;

export async function GET() {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const organizationId = auth.user.organizationId;
  const [users, activeUsers, activeSessions, projects, customers, employees, equipment, documents, uploadedFiles, warranty, contracts, payments, debts, plans, bim, aiKnowledge, crmLeads, erpApprovals, roles, ownerships, latestLogs] = await Promise.all([
    prisma.user.count({ where: { organizationId } }),
    prisma.user.count({ where: { organizationId, status: "ACTIVE" } }),
    db.session.count({ where: { organizationId, revokedAt: null, expiresAt: { gt: new Date() } } }),
    prisma.project.count({ where: { organizationId } }),
    prisma.customer.count({ where: { organizationId } }),
    prisma.employee.aggregate({ where: { organizationId }, _sum: { quantity: true }, _count: true }),
    prisma.equipment.aggregate({ where: { organizationId }, _sum: { quantityNumber: true }, _count: true }),
    prisma.document.count({ where: { organizationId } }),
    db.uploadFile.count({ where: { organizationId } }),
    prisma.warrantyTicket.count({ where: { organizationId } }),
    db.contract.count({ where: { organizationId } }),
    db.paymentRequest.count({ where: { organizationId } }),
    db.debtLedger.count({ where: { organizationId, status: { not: "PAID" } } }),
    db.constructionPlan.count({ where: { organizationId } }),
    db.bimModel.count({ where: { organizationId } }),
    db.aiKnowledgeItem.count({ where: { organizationId } }),
    db.crmLead.count({ where: { organizationId } }),
    db.erpApproval.count({ where: { organizationId, status: "PENDING" } }),
    prisma.role.findMany({ where: { organizationId }, include: { _count: { select: { users: true, rolePermissions: true } } }, orderBy: { name: "asc" } }),
    prisma.moduleOwnership.findMany({ where: { organizationId }, include: { ownerDepartment: true, ownerUser: true }, orderBy: { module: "asc" } }),
    prisma.auditLog.findMany({ where: { organizationId }, include: { user: true }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return NextResponse.json({
    ok: true,
    summary: {
      users,
      activeUsers,
      activeSessions,
      projects,
      customers,
      employees: employees._sum.quantity ?? employees._count,
      employeeGroups: employees._count,
      equipment: equipment._sum.quantityNumber ?? equipment._count,
      equipmentGroups: equipment._count,
      documents,
      uploadedFiles,
      warranty,
      contracts,
      payments,
      openDebts: debts,
      plans,
      bim,
      aiKnowledge,
      crmLeads,
      pendingApprovals: erpApprovals,
    },
    roles: roles.map((role: RoleSummaryRow) => ({ id: role.id, code: role.code, name: role.name, dataScope: role.dataScope, users: role._count.users, permissions: role._count.rolePermissions })),
    ownerships: ownerships.map((item: OwnershipSummaryRow) => ({ module: item.module, dataScope: item.dataScope, ownerDepartment: item.ownerDepartment?.name ?? "", ownerUser: item.ownerUser?.name ?? "", description: item.description ?? "" })),
    latestLogs: latestLogs.map((log: AuditSummaryRow) => ({ id: log.id, at: log.createdAt.toISOString(), user: log.user?.name ?? "Hệ thống", module: log.module, action: log.action, message: log.message })),
  });
}
