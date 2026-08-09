import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { normalizeProjectStatus, normalizeProjectType, resolveProvinceCoordinates } from "../../../../lib/projectMapVisuals";

const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=300";

function metadataValue(metadata: Prisma.JsonValue | null, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const value = (metadata as Record<string, unknown>)[key];
  return value === null || value === undefined ? "" : String(value);
}

function firstMetadataValue(metadata: Prisma.JsonValue | null, keys: string[]) {
  for (const key of keys) {
    const value = metadataValue(metadata, key);
    if (value) return value;
  }
  return "";
}

function validCoordinate(value: number | null | undefined, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export async function GET() {
  try {
    const organization = await prisma.organization.findFirst({
      where: { code: "LICOGI183" },
      select: { id: true },
    }) ?? await prisma.organization.findFirst({ select: { id: true } });

    if (!organization) {
      return NextResponse.json(
        { ok: true, total: 0, projects: [], generatedAt: new Date().toISOString() },
        { headers: { "Cache-Control": PUBLIC_CACHE } },
      );
    }

    const rows = await prisma.project.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        status: true,
        province: true,
        contractValueVnd: true,
        valueRange: true,
        constructionArea: true,
        floorArea: true,
        scale: true,
        progress: true,
        lat: true,
        lng: true,
        mapsUrl: true,
        metadata: true,
        updatedAt: true,
        customer: { select: { name: true, country: true } },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 1000,
    });

    const projects = rows.map((row, index) => {
      const province = row.province || metadataValue(row.metadata, "province") || "Hà Nội";
      const fallback = resolveProvinceCoordinates(province);
      const metadataLat = Number(metadataValue(row.metadata, "lat"));
      const metadataLng = Number(metadataValue(row.metadata, "lng"));
      const lat = validCoordinate(row.lat, -90, 90)
        ? row.lat as number
        : validCoordinate(metadataLat, -90, 90) ? metadataLat : fallback.lat;
      const lng = validCoordinate(row.lng, -180, 180)
        ? row.lng as number
        : validCoordinate(metadataLng, -180, 180) ? metadataLng : fallback.lng;
      const projectCountry = firstMetadataValue(row.metadata, ["project_country", "projectCountry", "country"]) || "Việt Nam";
      const metadataContractValue = Number(firstMetadataValue(row.metadata, ["contract_value_vnd", "contractValueVnd", "contract_value"]));
      const contractValueVnd = row.contractValueVnd ?? (Number.isFinite(metadataContractValue) && metadataContractValue > 0 ? metadataContractValue : null);

      return {
        id: row.id,
        numericId: index + 1,
        code: row.code,
        name: row.name,
        type: normalizeProjectType(row.type),
        status: normalizeProjectStatus(row.status),
        investor: row.customer?.name || metadataValue(row.metadata, "investor") || "Chưa cập nhật",
        investorCountry: row.customer?.country || firstMetadataValue(row.metadata, ["investor_country", "investorCountry"]) || "",
        projectCountry,
        province,
        contractValueVnd,
        valueRange: row.valueRange || firstMetadataValue(row.metadata, ["value_range", "valueRange"]) || "Chưa cập nhật",
        constructionArea: row.constructionArea || firstMetadataValue(row.metadata, ["construction_area", "constructionArea"]),
        floorArea: row.floorArea || firstMetadataValue(row.metadata, ["floor_area", "floorArea"]),
        scale: row.scale || metadataValue(row.metadata, "scale") || "",
        contractorRole: firstMetadataValue(row.metadata, ["role", "contractor_role", "contractorRole"]),
        startDate: firstMetadataValue(row.metadata, ["start_date", "startDate"]),
        endDate: firstMetadataValue(row.metadata, ["end_date", "endDate"]),
        mapsUrl: row.mapsUrl || firstMetadataValue(row.metadata, ["maps_url", "mapsUrl"]),
        progress: Math.max(0, Math.min(100, Number.isFinite(row.progress) ? row.progress : 0)),
        lat,
        lng,
        description: metadataValue(row.metadata, "description"),
        updatedAt: row.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { ok: true, total: projects.length, projects, generatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": PUBLIC_CACHE,
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("public projects query failed", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, message: "Dịch vụ dữ liệu dự án đang tạm gián đoạn." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
