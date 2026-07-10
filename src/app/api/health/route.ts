import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "licogi-os", database: "up", latencyMs: Date.now() - started, time: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ ok: false, service: "licogi-os", database: "down", message: error instanceof Error ? error.message : "Database error", latencyMs: Date.now() - started, time: new Date().toISOString() }, { status: 503 });
  }
}
