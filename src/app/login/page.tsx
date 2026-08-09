"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import { systemAccounts } from "../../data/dataCenter";
import { refreshServerSession, saveSession, UserSession } from "../../lib/authSession";
import { roleDefaultRoute } from "../../lib/rbac";

const demoAccount = systemAccounts.find((account) => account.email === "admin@licogi183.vn") ?? systemAccounts[0];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function authenticate(loginEmail: string, loginPassword: string, demo = false) {
    demo ? setDemoLoading(true) : setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không đăng nhập được.");

      const user = data.user as UserSession;
      saveSession(user);

      // Confirm the HttpOnly server session before leaving the auth page. This avoids
      // a client navigation racing the Set-Cookie response and showing stale auth UI.
      const verifiedSession = await refreshServerSession();
      if (!verifiedSession) throw new Error("Phiên đăng nhập chưa sẵn sàng. Vui lòng thử lại.");

      const requested = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      const safeRequested = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : null;
      const target = data.mustChangePassword
        ? "/change-password"
        : safeRequested || data.redirectTo || roleDefaultRoute(verifiedSession);

      // A document navigation is intentional here: it gives protected Server
      // Components/middleware a fresh request carrying the new session cookie.
      window.location.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đăng nhập được.");
    } finally {
      setLoading(false);
      setDemoLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate(email, password);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8fb] px-4 py-8 text-slate-900">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-orange-200/35 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-7 flex justify-center"><BrandLogo /></div>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-8">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-bold">
            <span className="rounded-lg bg-white px-3 py-2 text-center text-slate-950 shadow-sm">Đăng nhập</span>
            <Link href="/register" className="rounded-lg px-3 py-2 text-center text-slate-500 transition hover:text-slate-900">Đăng ký</Link>
          </div>

          <div className="mt-7">
            <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Chào mừng trở lại</h1>
            <p className="mt-2 text-sm text-slate-500">Đăng nhập để tiếp tục vào hệ thống.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                placeholder="name@company.com"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">Mật khẩu
              <span className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-slate-400 transition hover:text-slate-700" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {error ? <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

            <button disabled={loading || demoLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading ? <Loader2 size={17} className="animate-spin" /> : null}
              {loading ? "Đang đăng nhập" : "Tiếp tục"}
              {!loading ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300"><span className="h-px flex-1 bg-slate-200" /> hoặc <span className="h-px flex-1 bg-slate-200" /></div>

          <button
            type="button"
            disabled={loading || demoLoading}
            onClick={() => void authenticate(demoAccount.email, demoAccount.defaultPassword, true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-extrabold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {demoLoading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
            {demoLoading ? "Đang mở bản demo" : "Vào bản demo"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">Chưa có tài khoản? <Link href="/register" className="font-extrabold text-orange-600 hover:text-orange-700">Tạo tài khoản</Link></p>
        </section>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <Link href="/" className="transition hover:text-slate-700">Trang chủ</Link>
          <span>•</span>
          <span>LICOGI 18.3</span>
        </div>
      </div>
    </main>
  );
}
