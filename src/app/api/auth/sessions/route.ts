import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { audit, getCurrentUser } from "../../../../lib/authServer";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
  const sessions = await prisma.session.findMany({ where: { userId: user.id, revokedAt: null }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ ok: true, sessions: sessions.map((s) => ({ id: s.id, current: s.id === user.sessionId, ip: s.ip, userAgent: s.userAgent, deviceName: s.deviceName, createdAt: s.createdAt, lastSeenAt: s.lastSeenAt, expiresAt: s.expiresAt })) });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ ok: false, message: "Thiếu session id." }, { status: 400 });
  const target = await prisma.session.findFirst({ where: { id: body.id, userId: user.id } });
  if (!target) return NextResponse.json({ ok: false, message: "Không tìm thấy phiên đăng nhập." }, { status: 404 });
  await prisma.session.update({ where: { id: target.id }, data: { revokedAt: new Date() } });
  await audit(user, ModuleCode.USERS, PermissionAction.UPDATE, "Thu hồi một phiên đăng nhập.", "session", target.id);
  return NextResponse.json({ ok: true });
}
