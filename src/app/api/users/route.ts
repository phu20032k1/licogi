import { NextResponse } from "next/server";
import { AccountStatus, ModuleCode, PermissionAction, Prisma, RoleCode } from "@prisma/client";
import { audit, authorize } from "../../../lib/authServer";
import { prisma } from "../../../lib/prisma";
import { createPasswordHash } from "../../../lib/security";

type UserListRow = { id: string; email: string; name: string; phone?: string | null; status: string; mustChangePassword: boolean; roleId: string; departmentId?: string | null; customerId?: string | null; lastLoginAt?: Date | null; createdAt: Date; role: { name: string; code: string; dataScope: string }; department?: { name: string } | null; customer?: { name: string } | null };
type RoleListRow = { id: string; code: string; name: string; dataScope: string };
type DepartmentListRow = { id: string; code: string; name: string };
type CustomerListRow = { id: string; code: string; name: string };

type UserWriteBody = {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  password?: string;
  roleCode?: string;
  departmentId?: string | null;
  customerId?: string | null;
  status?: string;
  mustChangePassword?: boolean;
};

function normalizeEmail(value?: string) {
  return String(value ?? "").trim().toLowerCase();
}

function safeStatus(value?: string) {
  if (value === AccountStatus.ACTIVE || value === AccountStatus.SUSPENDED || value === AccountStatus.PENDING) return value;
  return AccountStatus.ACTIVE;
}

async function lookupRole(organizationId: string, roleCode?: string) {
  if (!roleCode || !(roleCode in RoleCode)) return null;
  return prisma.role.findFirst({ where: { organizationId, code: roleCode as RoleCode } });
}

export async function GET() {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;

  const [users, roles, departments, customers] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: auth.user.organizationId },
      include: { role: true, department: true, customer: true },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    }),
    prisma.role.findMany({ where: { organizationId: auth.user.organizationId }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { organizationId: auth.user.organizationId }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { organizationId: auth.user.organizationId }, orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({
    ok: true,
    users: users.map((user: UserListRow) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone ?? "",
      status: user.status,
      mustChangePassword: user.mustChangePassword,
      roleId: user.roleId,
      role: user.role.name,
      roleCode: user.role.code,
      dataScope: user.role.dataScope,
      departmentId: user.departmentId,
      department: user.department?.name ?? "",
      customerId: user.customerId,
      customer: user.customer?.name ?? "",
      lastLoginAt: user.lastLoginAt?.toISOString() ?? "",
      createdAt: user.createdAt.toISOString(),
    })),
    roles: roles.map((role: RoleListRow) => ({ id: role.id, code: role.code, name: role.name, dataScope: role.dataScope })),
    departments: departments.map((department: DepartmentListRow) => ({ id: department.id, code: department.code, name: department.name })),
    customers: customers.map((customer: CustomerListRow) => ({ id: customer.id, code: customer.code, name: customer.name })),
  });
}

export async function POST(request: Request) {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.MANAGE);
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null) as UserWriteBody | null;
  const email = normalizeEmail(body?.email);
  if (!email || !body?.name || !body?.password || !body?.roleCode) {
    return NextResponse.json({ ok: false, message: "Thiếu tên, email, mật khẩu hoặc vai trò." }, { status: 400 });
  }
  const role = await lookupRole(auth.user.organizationId, body.roleCode);
  if (!role) return NextResponse.json({ ok: false, message: "Vai trò không hợp lệ." }, { status: 400 });
  const existed = await prisma.user.findUnique({ where: { email } });
  if (existed) return NextResponse.json({ ok: false, message: "Email đã tồn tại." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      organizationId: auth.user.organizationId,
      email,
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      passwordHash: createPasswordHash(body.password),
      roleId: role.id,
      departmentId: body.departmentId || null,
      customerId: body.customerId || null,
      status: safeStatus(body.status),
      mustChangePassword: false,
    },
  });
  await audit(auth.user, ModuleCode.USERS, PermissionAction.MANAGE, `Tạo tài khoản ${email}.`, "user", user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.MANAGE);
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null) as UserWriteBody | null;
  if (!body?.id) return NextResponse.json({ ok: false, message: "Thiếu ID tài khoản." }, { status: 400 });
  if (body.id === auth.user.id && body.status === AccountStatus.SUSPENDED) {
    return NextResponse.json({ ok: false, message: "Không thể tự khóa tài khoản đang đăng nhập." }, { status: 400 });
  }

  const target = await prisma.user.findFirst({ where: { id: body.id, organizationId: auth.user.organizationId } });
  if (!target) return NextResponse.json({ ok: false, message: "Không tìm thấy tài khoản." }, { status: 404 });

  const role = body.roleCode ? await lookupRole(auth.user.organizationId, body.roleCode) : null;
  if (body.roleCode && !role) return NextResponse.json({ ok: false, message: "Vai trò không hợp lệ." }, { status: 400 });

  const data: Prisma.UserUpdateInput = {};
  if (body.email !== undefined) data.email = normalizeEmail(body.email);
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.phone !== undefined) data.phone = body.phone.trim() || null;
  if (body.departmentId !== undefined) data.departmentId = body.departmentId || null;
  if (body.customerId !== undefined) data.customerId = body.customerId || null;
  if (body.status !== undefined) data.status = safeStatus(body.status);
  if (body.mustChangePassword !== undefined) data.mustChangePassword = Boolean(body.mustChangePassword);
  if (role) data.roleId = role.id;
  if (body.password) data.passwordHash = createPasswordHash(body.password);

  const user = await prisma.user.update({ where: { id: body.id }, data });
  await audit(auth.user, ModuleCode.USERS, PermissionAction.MANAGE, `Cập nhật tài khoản ${user.email}.`, "user", user.id, { fields: Object.keys(data) });
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}

export async function DELETE(request: Request) {
  const auth = await authorize(ModuleCode.USERS, PermissionAction.DELETE);
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ ok: false, message: "Thiếu ID tài khoản." }, { status: 400 });
  if (body.id === auth.user.id) return NextResponse.json({ ok: false, message: "Không thể xóa tài khoản đang đăng nhập." }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { id: body.id, organizationId: auth.user.organizationId } });
  if (!user) return NextResponse.json({ ok: false, message: "Không tìm thấy tài khoản." }, { status: 404 });
  await prisma.user.delete({ where: { id: body.id } });
  await audit(auth.user, ModuleCode.USERS, PermissionAction.DELETE, `Xóa tài khoản ${user.email}.`, "user", user.id);
  return NextResponse.json({ ok: true });
}
