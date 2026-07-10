import { NextResponse } from "next/server";
import { DataScope, ModuleCode, PermissionAction } from "@prisma/client";
import { audit, authorize } from "../../../../../lib/authServer";
import { prisma } from "../../../../../lib/prisma";

type Context = { params: Promise<{ module: string }> };
type Body = { ownerDepartmentId?: string | null; ownerUserId?: string | null; dataScope?: string; description?: string | null };

function safeModule(value: string) {
  return value in ModuleCode ? value as ModuleCode : null;
}

function safeScope(value?: string) {
  if (value === DataScope.ALL || value === DataScope.DEPARTMENT || value === DataScope.ASSIGNED || value === DataScope.OWN || value === DataScope.CUSTOMER) return value;
  return DataScope.ASSIGNED;
}

export async function PATCH(request: Request, context: Context) {
  const auth = await authorize(ModuleCode.SETTINGS, PermissionAction.MANAGE);
  if ("response" in auth) return auth.response;
  const { module: moduleParam } = await context.params;
  const moduleCode = safeModule(moduleParam);
  if (!moduleCode) return NextResponse.json({ ok: false, message: "Module không hợp lệ." }, { status: 400 });
  const body = await request.json().catch(() => null) as Body | null;

  const ownership = await prisma.moduleOwnership.upsert({
    where: { organizationId_module: { organizationId: auth.user.organizationId, module: moduleCode } },
    update: {
      ownerDepartmentId: body?.ownerDepartmentId || null,
      ownerUserId: body?.ownerUserId || null,
      dataScope: safeScope(body?.dataScope),
      description: body?.description || null,
    },
    create: {
      organizationId: auth.user.organizationId,
      module: moduleCode,
      ownerDepartmentId: body?.ownerDepartmentId || null,
      ownerUserId: body?.ownerUserId || null,
      dataScope: safeScope(body?.dataScope),
      description: body?.description || null,
    },
  });

  await audit(auth.user, ModuleCode.SETTINGS, PermissionAction.MANAGE, `Cập nhật ownership module ${moduleCode}.`, "moduleOwnership", ownership.id);
  return NextResponse.json({ ok: true });
}
