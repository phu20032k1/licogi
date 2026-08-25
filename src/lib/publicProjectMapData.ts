import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import seedData from "../prisma/seed-data/licogi.seed.json";
import { prisma } from "./prisma";
import { currentVietnamProvinces, normalizeProvinceName, normalizeProvinceNames } from "../data/projects";
import { normalizeProjectStatus, normalizeProjectType, resolveProvinceCoordinates } from "./projectMapVisuals";
import type { PublicProjectRecord } from "./publicProject";

const PUBLIC_DB_TIMEOUT_MS = 2200;
const SNAPSHOT_DATE = "2026-08-01T00:00:00.000Z";

type SeedProject = {
  project_code?: string;
  project_name?: string;
  type?: string;
  status?: string;
  investor?: string;
  customer_code?: string;
  customer_industry?: string;
  investor_country?: string;
  project_country?: string;
  province?: string;
  value_range?: string;
  contract_value_vnd?: number | string | null;
  construction_area?: string;
  floor_area?: string;
  scale?: string;
  role?: string;
  contract_number?: string;
  package_name?: string;
  start_date?: string;
  end_date?: string;
  progress?: number | string;
  risk?: string;
  health_score?: number | string;
  lat?: number | string;
  lng?: number | string;
  maps_url?: string;
  description?: string;
  source?: string;
};

type SeedData = { projects?: SeedProject[] };

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

function numeric(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

function publicProvince(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw || raw.toLocaleLowerCase("vi").includes("đang cập nhật")) return "Đang cập nhật";
  return hasKnownPostMergerProvince(raw) ? normalizeProvinceName(raw) : raw;
}

function resolveCoordinates(provinceValue: string, rawLat: unknown, rawLng: unknown) {
  const lat = numeric(rawLat);
  const lng = numeric(rawLng);
  if (validVietnamCoordinatePair(lat, lng)) return { lat, lng };
  if (hasKnownPostMergerProvince(provinceValue)) return resolveProvinceCoordinates(provinceValue);
  return { lat: 0, lng: 0 };
}

function completeness(values: unknown[]) {
  return Math.round((values.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").length / values.length) * 100);
}

function snapshotProjects(): PublicProjectRecord[] {
  const rows = ((seedData as SeedData).projects || []).filter((row) => row.project_name || row.project_code);

  return rows.map((row, index) => {
    const code = String(row.project_code || `LCG-PROJ-${String(index + 1).padStart(3, "0")}`).trim();
    const legacyProvince = String(row.province || "Đang cập nhật").trim();
    const province = publicProvince(legacyProvince);
    const position = resolveCoordinates(legacyProvince, row.lat, row.lng);
    const contractValueVnd = numeric(row.contract_value_vnd) || null;
    const progress = Math.max(0, Math.min(100, numeric(row.progress)));
    const healthScore = Math.max(0, Math.min(100, numeric(row.health_score) || 80));
    const fields = [
      code, row.project_name, row.type, row.status, province, row.investor,
      contractValueVnd, row.value_range, row.construction_area, row.floor_area,
      row.scale, progress, position.lat || null, position.lng || null,
    ];

    return {
      // Use the public project code as the fallback ID so links remain resolvable
      // even if the database recovers between list and detail navigation.
      id: code,
      numericId: index + 1,
      code,
      name: String(row.project_name || code),
      type: normalizeProjectType(String(row.type || "Công nghiệp")),
      rawType: String(row.type || ""),
      status: normalizeProjectStatus(String(row.status || "ongoing")),
      investor: String(row.investor || "Chưa cập nhật"),
      customerCode: String(row.customer_code || ""),
      customerIndustry: String(row.customer_industry || ""),
      investorCountry: String(row.investor_country || ""),
      projectCountry: String(row.project_country || "Việt Nam"),
      province,
      legacyProvince: province !== legacyProvince ? legacyProvince : "",
      contractValueVnd,
      valueRange: String(row.value_range || "Chưa cập nhật"),
      constructionArea: String(row.construction_area || ""),
      floorArea: String(row.floor_area || ""),
      scale: String(row.scale || ""),
      contractorRole: String(row.role || ""),
      contractNumber: String(row.contract_number || ""),
      packageName: String(row.package_name || ""),
      startDate: String(row.start_date || ""),
      endDate: String(row.end_date || ""),
      mapsUrl: String(row.maps_url || ""),
      progress,
      risk: String(row.risk || "low").toLocaleLowerCase("vi"),
      healthScore,
      source: String(row.source || "Dữ liệu hệ thống"),
      lat: position.lat,
      lng: position.lng,
      description: String(row.description || ""),
      dataCompleteness: completeness(fields),
      createdAt: SNAPSHOT_DATE,
      updatedAt: SNAPSHOT_DATE,
    } satisfies PublicProjectRecord;
  });
}

async function queryDatabaseProjects(): Promise<PublicProjectRecord[]> {
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
    const province = publicProvince(legacyProvince);
    const metadataLat = numeric(metadataValue(row.metadata, "lat"));
    const metadataLng = numeric(metadataValue(row.metadata, "lng"));
    const directLat = validVietnamCoordinatePair(row.lat, row.lng) ? row.lat : metadataLat;
    const directLng = validVietnamCoordinatePair(row.lat, row.lng) ? row.lng : metadataLng;
    const position = resolveCoordinates(legacyProvince, directLat, directLng);
    const projectCountry = firstMetadataValue(row.metadata, ["project_country", "projectCountry", "country"]) || "Việt Nam";
    const metadataContractValue = numeric(firstMetadataValue(row.metadata, ["contract_value_vnd", "contractValueVnd", "contract_value"]));
    const contractValueVnd = row.contractValueVnd ?? (metadataContractValue > 0 ? metadataContractValue : null);
    const publicFields = [row.code, row.name, row.type, row.status, province, row.customer?.name, contractValueVnd, row.valueRange, row.constructionArea, row.floorArea, row.scale, row.progress, position.lat || null, position.lng || null];

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
      lat: position.lat,
      lng: position.lng,
      description: firstMetadataValue(row.metadata, ["description", "project_description", "scope_description"]),
      dataCompleteness: completeness(publicFields),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    } satisfies PublicProjectRecord;
  });
}

async function resilientPublicProjects(): Promise<PublicProjectRecord[]> {
  const fallback = snapshotProjects();
  if (!process.env.DATABASE_URL) return fallback;

  const databaseAttempt = queryDatabaseProjects().catch((error) => {
    console.error("public project database unavailable; using bundled snapshot", error instanceof Error ? error.message : error);
    return [] as PublicProjectRecord[];
  });

  const databaseProjects = await Promise.race([
    databaseAttempt,
    new Promise<PublicProjectRecord[]>((resolve) => {
      setTimeout(() => resolve([]), PUBLIC_DB_TIMEOUT_MS);
    }),
  ]);

  return databaseProjects.length > 0 ? databaseProjects : fallback;
}

export const getPublicMapProjects = unstable_cache(
  resilientPublicProjects,
  ["licogi-public-map-projects-v3"],
  { revalidate: 60 },
);
