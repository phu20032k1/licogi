import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "../../../../lib/authServer";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: "Chưa đăng nhập." }, { status: 401 });
  return NextResponse.json({ ok: true, user: publicUser(user), mustChangePassword: user.mustChangePassword });
}
