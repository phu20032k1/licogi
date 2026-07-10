import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { authorize } from "../../../lib/authServer";
import { prisma } from "../../../lib/prisma";

type AuditLogRow = { id: string; createdAt: Date; user?: { name?: string | null; email?: string | null } | null; module: string; action: string; entity?: string | null; message: string };

export async function GET() {
  const auth = await authorize(ModuleCode.ACTIVITY, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const logs = await prisma.auditLog.findMany({ where: { organizationId: auth.user.organizationId }, include: { user: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, logs: logs.map((log: AuditLogRow) => ({ id: log.id, at: log.createdAt.toISOString(), user: log.user?.name ?? "Hệ thống", email: log.user?.email ?? "", module: log.module, action: log.action, entity: log.entity ?? "", message: log.message })) });
}
