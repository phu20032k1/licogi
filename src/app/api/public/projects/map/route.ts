import { NextResponse } from "next/server";
import { getPublicMapProjects } from "../../../../../lib/publicProjectMapData";

const MAP_CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=1800";

export async function GET() {
  try {
    const projects = await getPublicMapProjects();
    return NextResponse.json(
      { ok: true, total: projects.length, projects, generatedAt: new Date().toISOString(), view: "map" },
      {
        headers: {
          "Cache-Control": MAP_CACHE,
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("public map projects query failed", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, message: "Dịch vụ bản đồ dự án đang tạm gián đoạn." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
