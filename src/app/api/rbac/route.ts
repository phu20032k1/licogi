import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { authorize } from "../../../lib/authServer";
import { prisma } from "../../../lib/prisma";

type RolePermissionRow = { permission: { module: string; action: string } };
type RoleRow = { id: string; code: string; name: string; dataScope: string; description?: string | null; rolePermissions: RolePermissionRow[] };
type PermissionRow = { id: string; module: string; action: string; name: string };
type OwnershipRow = { module: string; dataScope: string; ownerDepartment?: { name?: string | null } | null; ownerUser?: { name?: string | null } | null; description?: string | null };

export async function GET() {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const [roles, permissions, ownerships] = await Promise.all([
    prisma.role.findMany({ where: { organizationId: auth.user.organizationId }, include: { rolePermissions: { include: { permission: true } } }, orderBy: { name: "asc" } }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
    prisma.moduleOwnership.findMany({ where: { organizationId: auth.user.organizationId }, include: { ownerDepartment: true, ownerUser: true }, orderBy: { module: "asc" } }),
  ]);
  return NextResponse.json({
    ok: true,
    roles: roles.map((role: RoleRow) => ({ id: role.id, code: role.code, name: role.name, dataScope: role.dataScope, description: role.description, permissions: role.rolePermissions.map((item: RolePermissionRow) => ({ module: item.permission.module, action: item.permission.action })) })),
    permissions: permissions.map((item: PermissionRow) => ({ id: item.id, module: item.module, action: item.action, name: item.name })),
    ownerships: ownerships.map((item: OwnershipRow) => ({ module: item.module, dataScope: item.dataScope, ownerDepartment: item.ownerDepartment?.name ?? "", ownerUser: item.ownerUser?.name ?? "", description: item.description ?? "" })),
  });
}
