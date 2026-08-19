import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeProvinceName } from "../data/projects";
import { normalizeProjectStatus, normalizeProjectType, resolveProvinceCoordinates } from "./projectMapVisuals";
import type { PublicProjectRecord } from "./publicProject";

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

async function queryPublicMapProjects(): Promise<PublicProjectRecord[]> {
  const organization = await prisma.organization.findFirst({
    where: { code: "LICOGI183" },
    select: { id: true },
  }) ?? await prisma.organization.findFirst({ select: { id: true } });

  if (!organization) return [];

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
      risk: true,
      healthScore: true,
      lat: true,
      lng: true,
      mapsUrl: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { code: true, name: true, country: true, industry: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 1000,
  });

  return rows.map((row, index) => {
    const legacyProvince = row.province || metadataValue(row.metadata, "province") || "Hà Nội";
    const province = normalizeProvinceName(legacyProvince);
    const fallback = resolveProvinceCoordinates(legacyProvince);
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
    const publicFields = [row.code, row.name, row.type, row.status, province, row.customer?.name, contractValueVnd, row.valueRange, row.constructionArea, row.floorArea, row.scale, row.progress, row.lat, row.lng];
    const dataCompleteness = Math.round((publicFields.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").length / publicFields.length) * 100);

    return {
      id: row.id,
      numericId: index + 1,
      code: row.code,
      name: row.name,
      type: normalizeProjectType(row.type),
      rawType: row.type,
      status: normalizeProjectStatus(row.status),
      investor: row.customer?.name || metadataValue(row.metadata, "investor") || "Chưa cập nhật",
      customerCode: row.customer?.code || metadataValue(row.metadata, "customer_code") || "",
      customerIndustry: row.customer?.industry || firstMetadataValue(row.metadata, ["customer_industry", "investor_industry"]) || "",
      investorCountry: row.customer?.country || firstMetadataValue(row.metadata, ["investor_country", "investorCountry"]) || "",
      projectCountry,
      province,
      legacyProvince: province !== legacyProvince ? legacyProvince : "",
      contractValueVnd,
      valueRange: row.valueRange || firstMetadataValue(row.metadata, ["value_range", "valueRange"]) || "Chưa cập nhật",
      constructionArea: row.constructionArea || firstMetadataValue(row.metadata, ["construction_area", "constructionArea"]),
      floorArea: row.floorArea || firstMetadataValue(row.metadata, ["floor_area", "floorArea"]),
      scale: row.scale || metadataValue(row.metadata, "scale") || "",
      contractorRole: firstMetadataValue(row.metadata, ["role", "contractor_role", "contractorRole"]),
      contractNumber: firstMetadataValue(row.metadata, ["contract_number", "contract_no", "contractNumber"]),
      packageName: firstMetadataValue(row.metadata, ["package", "package_name", "packageName"]),
      startDate: firstMetadataValue(row.metadata, ["start_date", "startDate"]),
      endDate: firstMetadataValue(row.metadata, ["end_date", "endDate"]),
      mapsUrl: row.mapsUrl || firstMetadataValue(row.metadata, ["maps_url", "mapsUrl"]),
      progress: Math.max(0, Math.min(100, Number.isFinite(row.progress) ? row.progress : 0)),
      risk: String(row.risk || "LOW").toLowerCase(),
      healthScore: Math.max(0, Math.min(100, row.healthScore ?? 80)),
      source: metadataValue(row.metadata, "source"),
      lat,
      lng,
      description: firstMetadataValue(row.metadata, ["description", "project_description", "scope_description"]),
      dataCompleteness,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    } satisfies PublicProjectRecord;
  });
}

export const getPublicMapProjects = unstable_cache(
  queryPublicMapProjects,
  ["licogi-public-map-projects-v1"],
  { revalidate: 60 },
);
