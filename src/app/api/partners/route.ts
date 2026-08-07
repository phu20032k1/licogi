import { NextResponse } from "next/server";
import { PermissionAction, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { bad, cleanString, numberValue, requireModule, writeAudit } from "../../../lib/apiUtils";

const MODULE = "PARTNERS";

type PartnerInput = Record<string, unknown>;

function metaObject(value: Prisma.JsonValue | null) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function metaString(value: Prisma.JsonValue | null, key: string, fallback = "") {
  const raw = metaObject(value)[key];
  return raw === undefined || raw === null ? fallback : String(raw);
}

function metaNumber(value: Prisma.JsonValue | null, key: string, fallback = 0) {
  return numberValue(metaObject(value)[key], fallback);
}

function toPartner(row: { code: string; name: string; industry: string | null; metadata: Prisma.JsonValue | null }) {
  return {
    code: row.code,
    name: row.name,
    category: metaString(row.metadata, "category", row.industry || "Nhà cung cấp"),
    region: metaString(row.metadata, "region", "Toàn quốc"),
    rating: Math.max(0, Math.min(5, metaNumber(row.metadata, "rating", 0))),
    projects: Math.max(0, Math.round(metaNumber(row.metadata, "projects", 0))),
    safety: Math.max(0, Math.min(100, metaNumber(row.metadata, "safety", 0))),
    status: metaString(row.metadata, "status", "Đạt chuẩn"),
  };
}

function normalizeInput(input: PartnerInput, index = 0) {
  const code = cleanString(input.partner_code || input.code) || `DT-${Date.now()}-${index + 1}`;
  const name = cleanString(input.partner_name || input.name);
  if (!name) throw new Error(`Dòng ${index + 1}: thiếu tên đối tác.`);
  const category = cleanString(input.category) || "Nhà cung cấp";
  const region = cleanString(input.region) || "Toàn quốc";
  const rating = Math.max(0, Math.min(5, numberValue(input.rating, 0)));
  const projects = Math.max(0, Math.round(numberValue(input.projects, 0)));
  const safety = Math.max(0, Math.min(100, numberValue(input.safety, 100)));
  const status = cleanString(input.status) || "Đạt chuẩn";
  const metadata: Prisma.InputJsonObject = { kind: "partner", category, region, rating, projects, safety, status };
  return { code, name, category, metadata };
}

export async function GET() {
  const auth = await requireModule(MODULE, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;

  const rows = await prisma.customer.findMany({
    where: { organizationId: auth.user.organizationId },
    select: { code: true, name: true, industry: true, metadata: true },
    orderBy: { updatedAt: "desc" },
    take: 1500,
  });

  const partners = rows.filter((row) => metaString(row.metadata, "kind") === "partner").map(toPartner);
  return NextResponse.json({ ok: true, partners });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as (PartnerInput & { rows?: PartnerInput[] }) | null;
  if (!body) return bad("Dữ liệu đối tác không hợp lệ.");

  const rows = Array.isArray(body.rows) ? body.rows : [body];
  if (!rows.length) return bad("Không có dữ liệu đối tác để lưu.");
  if (rows.length > 500) return bad("Mỗi lần chỉ import tối đa 500 đối tác.", 413);

  const action = rows.length > 1 ? PermissionAction.IMPORT : PermissionAction.CREATE;
  const auth = await requireModule(MODULE, action);
  if ("response" in auth) return auth.response;

  let normalized: ReturnType<typeof normalizeInput>[];
  try {
    normalized = rows.map(normalizeInput);
  } catch (error) {
    return bad(error instanceof Error ? error.message : "Dữ liệu đối tác không hợp lệ.");
  }

  await prisma.$transaction(normalized.map((partner) => prisma.customer.upsert({
    where: { organizationId_code: { organizationId: auth.user.organizationId, code: partner.code } },
    update: { name: partner.name, industry: partner.category, metadata: partner.metadata },
    create: {
      organizationId: auth.user.organizationId,
      code: partner.code,
      name: partner.name,
      industry: partner.category,
      metadata: partner.metadata,
    },
  })));

  await writeAudit(
    auth.user,
    MODULE,
    action,
    rows.length > 1 ? `Import ${rows.length} đối tác.` : `Tạo/cập nhật đối tác ${normalized[0].name}.`,
    "partner",
    normalized[0].code,
    { count: rows.length },
  );

  const saved = await prisma.customer.findMany({
    where: { organizationId: auth.user.organizationId },
    select: { code: true, name: true, industry: true, metadata: true },
    orderBy: { updatedAt: "desc" },
    take: 1500,
  });

  return NextResponse.json({ ok: true, partners: saved.filter((row) => metaString(row.metadata, "kind") === "partner").map(toPartner) }, { status: 201 });
}
