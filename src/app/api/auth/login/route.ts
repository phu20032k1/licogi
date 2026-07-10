import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { buildSessionCookie, DEFAULT_MAX_AGE, randomToken, sessionCookieOptions, SESSION_COOKIE, sha256, verifyPassword } from "../../../../lib/security";
import { publicUser } from "../../../../lib/authServer";
import { roleDefaultRoute } from "../../../../lib/rbac";

type RolePermissionWithPermission = { permission: { module: string; action: string } };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) return NextResponse.json({ ok: false, message: "Thiếu email hoặc mật khẩu." }, { status: 400 });

  const account = await prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
      department: true,
      customer: true,
      role: { include: { rolePermissions: { include: { permission: true } } } },
    },
  });

  if (!account || account.status !== "ACTIVE") return NextResponse.json({ ok: false, message: "Tài khoản không tồn tại hoặc đã bị khóa." }, { status: 401 });
  if (!verifyPassword(password, account.passwordHash)) return NextResponse.json({ ok: false, message: "Mật khẩu chưa đúng." }, { status: 401 });

  const headerStore = await headers();
  const secret = randomToken(32);
  const expiresAt = new Date(Date.now() + DEFAULT_MAX_AGE * 1000);
  const session = await prisma.session.create({
    data: {
      organizationId: account.organizationId,
      userId: account.id,
      tokenHash: sha256(secret),
      expiresAt,
      userAgent: headerStore.get("user-agent"),
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim(),
      deviceName: headerStore.get("sec-ch-ua-platform") ?? null,
    },
  });

  await prisma.user.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  await prisma.auditLog.create({ data: { organizationId: account.organizationId, userId: account.id, module: "USERS", action: "VIEW", message: "Đăng nhập hệ thống.", entity: "session", entityId: session.id } }).catch(() => null);

  const authUser = {
    id: account.id,
    email: account.email,
    name: account.name,
    organizationId: account.organizationId,
    organizationCode: account.organization.code,
    departmentId: account.departmentId,
    departmentCode: account.department?.code ?? null,
    customerId: account.customerId,
    roleId: account.roleId,
    roleCode: account.role.code,
    roleName: account.role.name,
    dataScope: account.role.dataScope,
    mustChangePassword: account.mustChangePassword,
    sessionId: session.id,
    permissions: account.role.rolePermissions.map((item: RolePermissionWithPermission) => ({ module: item.permission.module, action: item.permission.action })),
  };

  const response = NextResponse.json({ ok: true, user: publicUser(authUser), mustChangePassword: false, redirectTo: roleDefaultRoute(authUser) });
  response.cookies.set(SESSION_COOKIE, buildSessionCookie(session.id, secret), sessionCookieOptions);
  return response;
}
