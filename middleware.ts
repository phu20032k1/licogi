import { NextRequest, NextResponse } from "next/server";
const SESSION_COOKIE = "licogi_session";

const PUBLIC_PREFIXES = ["/_next", "/favicon.ico", "/file.svg", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg", "/templates"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname === "/api/health") return NextResponse.next();
  if (pathname === "/login" || pathname === "/change-password") return NextResponse.next();
  if (pathname.startsWith("/api") && !request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.json({ ok: false, message: "Chưa đăng nhập." }, { status: 401 });
  }
  if (!pathname.startsWith("/api") && !request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
