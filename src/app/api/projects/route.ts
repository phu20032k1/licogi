import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { audit, authorize } from "../../../lib/authServer";
import { prisma } from "../../../lib/prisma";
import { cleanString, numberValue } from "../../../lib/apiUtils";

export async function GET() {
  const auth = await authorize(ModuleCode.PROJECTS, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const projects = await prisma.project.findMany({
    where: { organizationId: auth.user.organizationId },
    include: { customer: true, department: true, owner: true, _count: { select: { documents: true, tasks: true, warranties: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ ok: true, data: projects, total: projects.length });
}

export async function POST(request: Request) {
  const auth = await authorize(ModuleCode.PROJECTS, PermissionAction.CREATE);
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.name && !body?.project_name) return NextResponse.json({ ok: false, message: "Thiếu tên dự án." }, { status: 400 });
  const count = await prisma.project.count({ where: { organizationId: auth.user.organizationId } });
  const code = cleanString(body.code || body.project_code) || `PRJ-${String(count + 1).padStart(5, "0")}`;
  const project = await prisma.project.upsert({
    where: { organizationId_code: { organizationId: auth.user.organizationId, code } },
    update: {
      name: cleanString(body.name || body.project_name),
      type: cleanString(body.type) || "Industrial",
      province: cleanString(body.province) || null,
      progress: numberValue(body.progress),
      contractValueVnd: numberValue(body.contractValueVnd || body.contract_value_vnd),
      updatedById: auth.user.id,
      metadata: body,
    },
    create: {
      organizationId: auth.user.organizationId,
      code,
      name: cleanString(body.name || body.project_name),
      type: cleanString(body.type) || "Industrial",
      province: cleanString(body.province) || null,
      progress: numberValue(body.progress),
      contractValueVnd: numberValue(body.contractValueVnd || body.contract_value_vnd),
      departmentId: auth.user.departmentId,
      ownerId: auth.user.id,
      createdById: auth.user.id,
      updatedById: auth.user.id,
      metadata: body,
    },
  });
  await audit(auth.user, ModuleCode.PROJECTS, PermissionAction.CREATE, `Tạo/cập nhật dự án ${project.code}.`, "project", project.id);
  return NextResponse.json({ ok: true, data: project }, { status: 201 });
}
