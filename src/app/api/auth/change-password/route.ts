import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { audit, getCurrentUser } from "../../../../lib/authServer";
import { prisma } from "../../../../lib/prisma";
import { createPasswordHash, verifyPassword } from "../../../../lib/security";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
  const body = await request.json().catch(() => null) as { currentPassword?: string; newPassword?: string; confirmPassword?: string } | null;
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");
  if (!currentPassword || !newPassword) return NextResponse.json({ ok: false, message: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ ok: false, message: "Mật khẩu nhập lại chưa khớp." }, { status: 400 });
  if (newPassword.length < 10 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    return NextResponse.json({ ok: false, message: "Mật khẩu mới cần tối thiểu 10 ký tự, có chữ hoa, số và ký tự đặc biệt." }, { status: 400 });
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !verifyPassword(currentPassword, dbUser.passwordHash)) return NextResponse.json({ ok: false, message: "Mật khẩu hiện tại chưa đúng." }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: createPasswordHash(newPassword), mustChangePassword: false } });
  await audit(user, ModuleCode.USERS, PermissionAction.UPDATE, "Đổi mật khẩu tài khoản.", "user", user.id);
  return NextResponse.json({ ok: true, message: "Đã đổi mật khẩu. Bạn có thể dùng hệ thống." });
}
