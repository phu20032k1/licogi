import { NextResponse } from "next/server";
import { PermissionAction, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { bad, cleanString, dateValue, numberValue, requireModule, writeAudit } from "../../../lib/apiUtils";

const MODULE = "TASKS";

function metadataNumber(metadata: Prisma.JsonValue | null, key: string, fallback = 0) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return fallback;
  return numberValue((metadata as Record<string, unknown>)[key], fallback);
}

export async function GET() {
  const auth = await requireModule(MODULE, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const organizationId = auth.user.organizationId;
  const [tasks, projects, users] = await Promise.all([
    prisma.task.findMany({
      where: { organizationId },
      include: { project: true, assignee: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    prisma.project.findMany({ where: { organizationId }, select: { id: true, code: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
    prisma.user.findMany({ where: { organizationId, status: "ACTIVE" }, select: { id: true, email: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
  ]);

  return NextResponse.json({
    ok: true,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      project: task.project?.name || "Chưa gán dự án",
      projectId: task.projectId || "",
      projectCode: task.project?.code || "",
      assignee: task.assignee?.name || "Chưa phân công",
      assigneeId: task.assigneeId || "",
      assigneeEmail: task.assignee?.email || "",
      due: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "",
      status: task.status || "Chưa làm",
      priority: task.priority || "Trung bình",
      progress: metadataNumber(task.metadata, "progress", task.status === "Hoàn thành" ? 100 : 0),
    })),
    projects,
    users,
  });
}

export async function POST(request: Request) {
  const auth = await requireModule(MODULE, PermissionAction.CREATE);
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !cleanString(body.title)) return bad("Thiếu tên công việc.");

  let projectId = cleanString(body.projectId) || null;
  if (!projectId && cleanString(body.projectCode)) {
    const project = await prisma.project.findFirst({ where: { organizationId: auth.user.organizationId, code: cleanString(body.projectCode) }, select: { id: true } });
    projectId = project?.id || null;
  }

  let assigneeId = cleanString(body.assigneeId) || null;
  if (!assigneeId && cleanString(body.assigneeEmail)) {
    const assignee = await prisma.user.findFirst({ where: { organizationId: auth.user.organizationId, email: cleanString(body.assigneeEmail) }, select: { id: true } });
    assigneeId = assignee?.id || null;
  }

  const status = cleanString(body.status) || "Chưa làm";
  const progress = Math.max(0, Math.min(100, numberValue(body.progress, status === "Hoàn thành" ? 100 : 0)));
  const metadata: Prisma.InputJsonObject = {
    progress,
    source: cleanString(body.source) || "TASKS_UI",
    projectCode: cleanString(body.projectCode),
    assigneeEmail: cleanString(body.assigneeEmail),
  };

  const task = await prisma.task.create({
    data: {
      organizationId: auth.user.organizationId,
      departmentId: auth.user.departmentId,
      projectId,
      assigneeId,
      createdById: auth.user.id,
      title: cleanString(body.title),
      status,
      priority: cleanString(body.priority) || "Trung bình",
      dueDate: dateValue(body.dueDate || body.due),
      metadata,
    },
  });
  await writeAudit(auth.user, MODULE, PermissionAction.CREATE, `Tạo công việc ${task.title}.`, "task", task.id, metadata);
  return NextResponse.json({ ok: true, task }, { status: 201 });
}
