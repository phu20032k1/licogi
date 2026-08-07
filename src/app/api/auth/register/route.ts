import { AccountStatus, ModuleCode, PermissionAction, RoleCode } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createPasswordHash, randomToken } from "../../../../lib/security";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;

  const name = String(body?.name ?? "").trim().replace(/\s+/g, " ");
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (name.length < 2) {
    return NextResponse.json({ ok: false, message: "Vui lòng nhập họ tên." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ ok: false, message: "Email chưa đúng định dạng." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, message: "Mật khẩu cần ít nhất 8 ký tự." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ ok: false, message: "Email này đã có tài khoản." }, { status: 409 });
  }

  const organization = await prisma.organization.findFirst({
    where: { code: "LICOGI183" },
    select: { id: true },
  }) ?? await prisma.organization.findFirst({ select: { id: true } });

  if (!organization) {
    return NextResponse.json({ ok: false, message: "Hệ thống chưa được khởi tạo." }, { status: 503 });
  }

  const customerRole = await prisma.role.findFirst({
    where: { organizationId: organization.id, code: RoleCode.CUSTOMER },
    select: { id: true },
  });

  if (!customerRole) {
    return NextResponse.json({ ok: false, message: "Chưa cấu hình quyền khách hàng." }, { status: 503 });
  }

  const customerCode = `WEB-${Date.now().toString(36).toUpperCase()}-${randomToken(3).replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()}`;
  const passwordHash = createPasswordHash(password);

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        organizationId: organization.id,
        code: customerCode,
        name,
        country: "Việt Nam",
        industry: "Khách hàng website",
        contactName: name,
        contactEmail: email,
        metadata: { source: "SELF_SERVICE_SIGNUP" },
      },
      select: { id: true },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        roleId: customerRole.id,
        customerId: customer.id,
        email,
        name,
        passwordHash,
        status: AccountStatus.ACTIVE,
        mustChangePassword: false,
      },
      select: { id: true, email: true, name: true },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        module: ModuleCode.USERS,
        action: PermissionAction.CREATE,
        entity: "user",
        entityId: user.id,
        message: "Tạo tài khoản khách hàng từ trang đăng ký.",
        metadata: { source: "SELF_SERVICE_SIGNUP" },
      },
    });

    return user;
  });

  return NextResponse.json({ ok: true, user: result }, { status: 201 });
}
