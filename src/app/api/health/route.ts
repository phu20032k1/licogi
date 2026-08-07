import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const started = Date.now();
  const revision = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || process.env.RENDER_GIT_COMMIT?.slice(0, 7) || "local";

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        service: "licogi-os",
        database: "up",
        revision,
        latencyMs: Date.now() - started,
        uptimeSeconds: Math.round(process.uptime()),
        time: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("healthcheck database failed", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        ok: false,
        service: "licogi-os",
        database: "down",
        revision,
        latencyMs: Date.now() - started,
        time: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
