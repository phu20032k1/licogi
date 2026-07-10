import { NextResponse } from "next/server";
import { systemAccounts } from "../../../../data/dataCenter";

const names: Record<string, string> = {
  "iip.admin@licogi183.vn": "IIP Super Admin",
  "admin@licogi183.vn": "Nguyễn Hoàng Nam",
  "executive@licogi183.vn": "Trần Quốc Minh",
  "project.manager@licogi183.vn": "Nguyễn Văn Hùng",
  "customer@licogi183.vn": "Yuki Tanaka",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const account = systemAccounts.find((item) => item.email.toLowerCase() === email);
  if (!account) return NextResponse.json({ ok: false, message: "Tài khoản không tồn tại trong bản demo." }, { status: 401 });

  const expectedPassword = process.env[account.passwordEnv] || account.defaultPassword;
  if (password !== expectedPassword) return NextResponse.json({ ok: false, message: "Mật khẩu chưa đúng." }, { status: 401 });

  return NextResponse.json({
    ok: true,
    user: {
      email: account.email,
      name: names[account.email] ?? account.role,
      role: account.role,
      scope: account.scope,
      signedAt: new Date().toISOString(),
    },
  });
}
