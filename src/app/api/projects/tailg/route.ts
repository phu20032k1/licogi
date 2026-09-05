import { NextResponse } from "next/server";
import { PermissionAction, Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";
import { bad, cleanString, dateValue, numberValue, requireModule, writeAudit } from "../../../../lib/apiUtils";

const MODULE = "CONSTRUCTION";

function clampPercent(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function cleanProgressMap(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const result: Record<string, number> = {};
  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    result[key] = Math.max(0, Math.min(100, Math.round(parsed * 10) / 10));
  });
  return result;
}

async function findTailgProject(organizationId: string) {
  return prisma.project.findFirst({
    where: {
      organizationId,
      OR: [
        { code: { contains: "TAILG", mode: "insensitive" } },
        { name: { contains: "TAILG", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      code: true,
      name: true,
      progress: true,
      status: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function GET() {
  const auth = await requireModule(MODULE, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;

  const project = await findTailgProject(auth.user.organizationId);
  if (!project) {
    return NextResponse.json({ ok: true, project: null, reports: [], plans: [], tasks: [] });
  }

  const [reports, plans, tasks] = await Promise.all([
    prisma.dailyReport.findMany({
      where: { organizationId: auth.user.organizationId, projectId: project.id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
      take: 45,
    }),
    prisma.constructionPlan.findMany({
      where: { organizationId: auth.user.organizationId, projectId: project.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.planTask.findMany({
      where: { organizationId: auth.user.organizationId, projectId: project.id },
      orderBy: [{ startDate: "asc" }, { code: "asc" }],
      take: 300,
    }),
  ]);

  return NextResponse.json({ ok: true, project, reports, plans, tasks });
}

export async function POST(request: Request) {
  const auth = await requireModule(MODULE, PermissionAction.CREATE);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return bad("Dữ liệu nhật ký không hợp lệ.");

  const project = await findTailgProject(auth.user.organizationId);
  if (!project) return bad("Chưa có dự án TAILG trong danh mục. Hãy tạo dự án có mã hoặc tên chứa TAILG trước khi nhập nhật ký.");

  const workDone = cleanString(body.workDone);
  if (!workDone) return bad("Thiếu nội dung công việc đã thực hiện.");

  const teamProgress = cleanProgressMap(body.teamProgress);
  const overallProgressConfirmed = Boolean(body.overallProgressConfirmed);
  const overallProgress = overallProgressConfirmed ? clampPercent(body.progress) : 0;
  const reportDate = dateValue(body.reportDate) || new Date();

  const metadata: Prisma.InputJsonValue = {
    source: "TAILG Command Center",
    teamProgress,
    overallProgressConfirmed,
    tomorrowPlan: cleanString(body.tomorrowPlan),
    coordinationNeeds: cleanString(body.coordinationNeeds),
    sourceNote: cleanString(body.sourceNote),
  };

  const report = await prisma.dailyReport.create({
    data: {
      organizationId: auth.user.organizationId,
      projectId: project.id,
      createdById: auth.user.id,
      reportDate,
      weather: cleanString(body.weather) || null,
      manpowerCount: numberValue(body.manpowerCount),
      equipmentCount: numberValue(body.equipmentCount),
      workDone,
      issues: cleanString(body.issues) || null,
      safetyNotes: cleanString(body.safetyNotes) || null,
      progress: overallProgress,
      metadata,
    },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });

  if (overallProgressConfirmed && overallProgress !== project.progress) {
    await prisma.project.update({
      where: { id: project.id },
      data: { progress: overallProgress, updatedById: auth.user.id },
    });
  }

  await writeAudit(
    auth.user,
    MODULE,
    PermissionAction.CREATE,
    `Cập nhật nhật ký hiện trường TAILG ngày ${reportDate.toISOString().slice(0, 10)}.`,
    "dailyReport",
    report.id,
  );

  return NextResponse.json({ ok: true, project, report }, { status: 201 });
}
