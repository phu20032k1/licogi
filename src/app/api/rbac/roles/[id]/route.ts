import { NextResponse } from "next/server";
import { DataScope, ModuleCode, PermissionAction, Prisma } from "@prisma/client";
import { audit, authorize } from "../../../../../lib/authServer";
import { prisma } from "../../../../../lib/prisma";

type Context = { params: Promise<{ id: string }> };
type Body = { name?: string; description?: string | null; dataScope?: string; permissionIds?: string[] };
type PermissionIdRow = { id: string };

function safeScope(value?: string) {
  if (value === DataScope.ALL || value === DataScope.DEPARTMENT || value === DataScope.ASSIGNED || value === DataScope.OWN || value === DataScope.CUSTOMER) return value;
  return undefined;
}

export async function PATCH(request: Request, context: Context) {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.MANAGE);
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as Body | null;
  const role = await prisma.role.findFirst({ where: { id, organizationId: auth.user.organizationId } });
  if (!role) return NextResponse.json({ ok: false, message: "Không tìm thấy vai trò." }, { status: 404 });

  const updateData: { name?: string; description?: string | null; dataScope?: DataScope } = {};
  if (body?.name !== undefined && body.name.trim()) updateData.name = body.name.trim();
  if (body?.description !== undefined) updateData.description = body.description || null;
  const scope = safeScope(body?.dataScope);
  if (scope) updateData.dataScope = scope;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (Object.keys(updateData).length) await tx.role.update({ where: { id }, data: updateData });
    if (Array.isArray(body?.permissionIds)) {
      const permissions = await tx.permission.findMany({ where: { id: { in: body.permissionIds } }, select: { id: true } });
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.rolePermission.createMany({ data: permissions.map((permission: PermissionIdRow) => ({ roleId: id, permissionId: permission.id })), skipDuplicates: true });
    }
  });

  await audit(auth.user, ModuleCode.USERS, PermissionAction.MANAGE, `Cập nhật vai trò ${role.code}.`, "role", role.id, { permissionIds: body?.permissionIds?.length ?? null });
  return NextResponse.json({ ok: true });
}
