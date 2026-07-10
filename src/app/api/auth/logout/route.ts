import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/authServer";
import { prisma } from "../../../../lib/prisma";
import { SESSION_COOKIE } from "../../../../lib/security";

export async function POST() {
  const user = await getCurrentUser();
  if (user?.sessionId) {
    await prisma.session.update({ where: { id: user.sessionId }, data: { revokedAt: new Date() } }).catch(() => null);
    await prisma.auditLog.create({ data: { organizationId: user.organizationId, userId: user.id, module: "USERS", action: "VIEW", message: "Đăng xuất hệ thống.", entity: "session", entityId: user.sessionId } }).catch(() => null);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
