import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { currentVietnamProvinces, normalizeProvinceName, normalizeProvinceNames } from "../data/projects";
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

function validVietnamCoordinatePair(lat: number | null | undefined, lng: number | null | undefined) {
  return typeof lat === "number" && typeof lng === "number"
    && Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= 8 && lat <= 24.5 && lng >= 102 && lng <= 110.8;
}

function hasKnownPostMergerProvince(value?: string | null) {
  const current = new Set<string>(currentVietnamProvinces);
  return normalizeProvinceNames(value).some((name) => current.has(name));
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
    const legacyProvince = row.province || metadataValue(row.metadata, "province") || "Đang cập nhật";
    const province = normalizeProvinceName(legacyProvince);
    const fallback = hasKnownPostMergerProvince(legacyProvince) ? resolveProvinceCoordinates(legacyProvince) : null;
    const metadataLat = Number(metadataValue(row.metadata, "lat"));
    const metadataLng = Number(metadataValue(row.metadata, "lng"));

    let lat = 0;
    let lng = 0;
    if (validVietnamCoordinatePair(row.lat, row.lng)) {
      lat = row.lat as number;
      lng = row.lng as number;
    } else if (validVietnamCoordinatePair(metadataLat, metadataLng)) {
      lat = metadataLat;
      lng = metadataLng;
    } else if (fallback) {
      lat = fallback.lat;
      lng = fallback.lng;
    }

    const projectCountry = firstMetadataValue(row.metadata, ["project_country", "projectCountry", "country"]) || "Việt Nam";
    const metadataContractValue = Number(firstMetadataValue(row.metadata, ["contract_value_vnd", "contractValueVnd", "contract_value"]));
    const contractValueVnd = row.contractValueVnd ?? (Number.isFinite(metadataContractValue) && metadataContractValue > 0 ? metadataContractValue : null);
    const publicFields = [row.code, row.name, row.type, row.status, province, row.customer?.name, contractValueVnd, row.valueRange, row.constructionArea, row.floorArea, row.scale, row.progress, lat || null, lng || null];
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
  ["licogi-public-map-projects-v2"],
  { revalidate: 60 },
);
