import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { normalizeProjectStatus, normalizeProjectType, resolveProvinceCoordinates } from "../../../../lib/projectMapVisuals";

function metadataValue(metadata: Prisma.JsonValue | null, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const value = (metadata as Record<string, unknown>)[key];
  return value === null || value === undefined ? "" : String(value);
}

export async function GET() {
  try {
    const organization = await prisma.organization.findFirst({
      where: { code: "LICOGI183" },
      select: { id: true },
    }) ?? await prisma.organization.findFirst({ select: { id: true } });

    if (!organization) return NextResponse.json({ ok: true, total: 0, projects: [] });

    const rows = await prisma.project.findMany({
      where: { organizationId: organization.id },
      include: { customer: { select: { name: true, country: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 500,
    });

    const projects = rows.map((row, index) => {
      const province = row.province || metadataValue(row.metadata, "province") || "Hà Nội";
      const fallback = resolveProvinceCoordinates(province);
      const metadataLat = metadataValue(row.metadata, "lat").trim();
      const metadataLng = metadataValue(row.metadata, "lng").trim();
      const rawLat = row.lat ?? (metadataLat ? Number(metadataLat) : Number.NaN);
      const rawLng = row.lng ?? (metadataLng ? Number(metadataLng) : Number.NaN);
      return {
        id: row.id,
        numericId: index + 1,
        code: row.code,
        name: row.name,
        type: normalizeProjectType(row.type),
        status: normalizeProjectStatus(row.status),
        investor: row.customer?.name || metadataValue(row.metadata, "investor") || "Chưa cập nhật",
        investorCountry: row.customer?.country || metadataValue(row.metadata, "investor_country") || "",
        province,
        valueRange: row.valueRange || metadataValue(row.metadata, "value_range") || "Chưa cập nhật",
        scale: row.scale || metadataValue(row.metadata, "scale") || "",
        progress: Math.max(0, Math.min(100, row.progress || 0)),
        lat: Number.isFinite(rawLat) ? rawLat : fallback.lat,
        lng: Number.isFinite(rawLng) ? rawLng : fallback.lng,
        description: metadataValue(row.metadata, "description"),
        updatedAt: row.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { ok: true, total: projects.length, projects },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("public projects", error);
    return NextResponse.json({ ok: false, message: "Không tải được dữ liệu bản đồ công khai." }, { status: 500 });
  }
}
