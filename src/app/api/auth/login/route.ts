import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";

import { getRoleAccountProfile } from "../../../../data/roleAccounts";
import { prisma } from "../../../../lib/prisma";
import { getRoleAccountPassword, roleAccountProvisioningEnabled } from "../../../../lib/roleAccountCredentials";
import {
  buildSessionCookie,
  createPasswordHash,
  DEFAULT_MAX_AGE,
  randomToken,
  sessionCookieOptions,
  SESSION_COOKIE,
  sha256,
  verifyPassword,
} from "../../../../lib/security";
import { publicUser, type AuthUser } from "../../../../lib/authServer";
import { roleDefaultRoute } from "../../../../lib/rbac";

const accountInclude = {
  organization: true,
  department: true,
  customer: true,
  role: {
    include: {
      rolePermissions: { include: { permission: true } },
    },
  },
} as const;

async function findAccount(email: string) {
  return prisma.user.findUnique({ where: { email }, include: accountInclude });
}

async function provisionManagedRoleAccount(email: string, suppliedPassword: string) {
  const profile = getRoleAccountProfile(email);
  if (!profile || !roleAccountProvisioningEnabled()) return null;

  const expectedPassword = getRoleAccountPassword(profile);
  if (suppliedPassword !== expectedPassword) return null;

  const organization = await prisma.organization.findUnique({ where: { code: "LICOGI183" } })
    ?? await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!organization) return null;

  const role = await prisma.role.findFirst({
    where: { organizationId: organization.id, code: profile.roleCode as RoleCode },
  });
  if (!role) return null;

  const department = await prisma.department.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: profile.departmentCode,
      },
    },
    update: { name: profile.departmentName },
    create: {
      organizationId: organization.id,
      code: profile.departmentCode,
      name: profile.departmentName,
      description: `Đơn vị dùng cho tài khoản điều hành ${profile.position}.`,
    },
  });

  const passwordHash = createPasswordHash(expectedPassword);
  await prisma.user.upsert({
    where: { email: profile.email },
    update: {
      organizationId: organization.id,
      departmentId: department.id,
      roleId: role.id,
      name: profile.name,
      passwordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
    create: {
      organizationId: organization.id,
      departmentId: department.id,
      roleId: role.id,
      email: profile.email,
      name: profile.name,
      passwordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  return findAccount(profile.email);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Vui lòng nhập email và mật khẩu." }, { status: 400 });
  }

  let account = await findAccount(email);
  const validExisting = Boolean(account && account.status === "ACTIVE" && verifyPassword(password, account.passwordHash));

  if (!validExisting) {
    account = await provisionManagedRoleAccount(email, password);
  }

  if (!account || account.status !== "ACTIVE" || !verifyPassword(password, account.passwordHash)) {
    return NextResponse.json({ ok: false, message: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }

  const now = new Date();
  await prisma.session.deleteMany({ where: { userId: account.id, expiresAt: { lt: now } } }).catch(() => null);

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

  await prisma.user.update({ where: { id: account.id }, data: { lastLoginAt: now } });
  await prisma.auditLog.create({
    data: {
      organizationId: account.organizationId,
      userId: account.id,
      module: "USERS",
      action: "VIEW",
      message: "Đăng nhập hệ thống.",
      entity: "session",
      entityId: session.id,
    },
  }).catch(() => null);

  const authUser: AuthUser = {
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
    permissions: account.role.rolePermissions.map((item) => ({
      module: item.permission.module,
      action: item.permission.action,
    })),
  };

  const response = NextResponse.json({
    ok: true,
    user: publicUser(authUser),
    mustChangePassword: account.mustChangePassword,
    redirectTo: account.mustChangePassword ? "/change-password" : roleDefaultRoute(authUser),
  });

  response.cookies.set(SESSION_COOKIE, buildSessionCookie(session.id, secret), sessionCookieOptions);
  return response;
}
