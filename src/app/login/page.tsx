"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Eye, EyeOff, Loader2, Sparkles, UsersRound } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import { systemAccounts } from "../../data/dataCenter";
import { roleAccountProfiles, type RoleAccountProfile } from "../../data/roleAccounts";
import { refreshServerSession, saveSession, UserSession } from "../../lib/authSession";
import { roleDefaultRoute } from "../../lib/rbac";

const executiveDemoPasswords: Record<string, string> = {
  CHAIRMAN: "L183.Chairman@2026!",
  CONTROL_BOARD: "L183.Control@2026!",
  GENERAL_DIRECTOR: "L183.CEO@2026!",
  DEPUTY_FINANCE: "L183.PGD.Fin@2026!",
  DEPUTY_BUSINESS: "L183.PGD.Biz@2026!",
  DEPUTY_CONSTRUCTION: "L183.PGD.Const@2026!",
  DEPUTY_WARRANTY: "L183.PGD.Warranty@2026!",
  DEPUTY_SAFETY: "L183.PGD.Safety@2026!",
};

function managedRoleDefaultPassword(profile: RoleAccountProfile) {
  const fixed = executiveDemoPasswords[profile.code];
  if (fixed) return fixed;
  if (profile.code.startsWith("DEPUTY_HEAD_")) return `L183.Deputy.${profile.code.slice("DEPUTY_HEAD_".length)}@2026!`;
  if (profile.code.startsWith("HEAD_")) return `L183.Head.${profile.code.slice("HEAD_".length)}@2026!`;
  if (profile.code.startsWith("STAFF_")) return `L183.Staff.${profile.code.slice("STAFF_".length)}@2026!`;
  return `L183.${profile.code}@2026!`;
}

type DemoLoginAccount = {
  email: string;
  password: string;
  title: string;
  subtitle: string;
  group: "system" | "organization";
};

const demoLoginAccounts: DemoLoginAccount[] = [
  ...systemAccounts.map((account) => ({
    email: account.email,
    password: account.defaultPassword,
    title: account.role,
    subtitle: account.scope,
    group: "system" as const,
  })),
  ...roleAccountProfiles.map((profile) => ({
    email: profile.email,
    password: managedRoleDefaultPassword(profile),
    title: profile.position,
    subtitle: `${profile.departmentName} · ${profile.levelLabel}`,
    group: "organization" as const,
  })),
].filter((account, index, all) => all.findIndex((item) => item.email.toLowerCase() === account.email.toLowerCase()) === index);

const defaultDemoAccount = demoLoginAccounts.find((account) => account.email === "admin@licogi183.vn") ?? demoLoginAccounts[0];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [selectedDemoEmail, setSelectedDemoEmail] = useState(defaultDemoAccount?.email ?? "");

  const selectedDemoAccount = useMemo(
    () => demoLoginAccounts.find((account) => account.email === selectedDemoEmail) ?? null,
    [selectedDemoEmail],
  );

  const systemDemoAccounts = useMemo(() => demoLoginAccounts.filter((account) => account.group === "system"), []);
  const organizationDemoAccounts = useMemo(() => demoLoginAccounts.filter((account) => account.group === "organization"), []);

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

  function chooseDemoAccount(nextEmail: string) {
    setSelectedDemoEmail(nextEmail);
    const account = demoLoginAccounts.find((item) => item.email === nextEmail);
    if (!account) return;
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  async function loginSelectedDemoAccount() {
    if (!selectedDemoAccount) {
      setError("Vui lòng chọn một tài khoản demo.");
      return;
    }
    setEmail(selectedDemoAccount.email);
    setPassword(selectedDemoAccount.password);
    await authenticate(selectedDemoAccount.email, selectedDemoAccount.password, true);
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

          <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300"><span className="h-px flex-1 bg-slate-200" /> tài khoản demo <span className="h-px flex-1 bg-slate-200" /></div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700"><UsersRound size={18} /></span>
              <div>
                <p className="text-sm font-black text-slate-900">Chọn nhanh tài khoản demo</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Có {demoLoginAccounts.length} tài khoản trong danh sách. Chọn tài khoản sẽ tự điền email + mật khẩu; bấm nút bên dưới để đăng nhập ngay.</p>
              </div>
            </div>

            <label className="mt-4 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">Tài khoản
              <span className="relative mt-1.5 block">
                <select
                  value={selectedDemoEmail}
                  onChange={(event) => chooseDemoAccount(event.target.value)}
                  disabled={loading || demoLoading}
                  className="w-full appearance-none rounded-xl border border-orange-200 bg-white px-3.5 py-3 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                >
                  <optgroup label="Tài khoản hệ thống">
                    {systemDemoAccounts.map((account) => <option key={account.email} value={account.email}>{account.title} · {account.email}</option>)}
                  </optgroup>
                  <optgroup label="Tài khoản theo cơ cấu tổ chức">
                    {organizationDemoAccounts.map((account) => <option key={account.email} value={account.email}>{account.title} · {account.email}</option>)}
                  </optgroup>
                </select>
                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </span>
            </label>

            {selectedDemoAccount ? <div className="mt-3 rounded-xl border border-orange-100 bg-white/80 px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{selectedDemoAccount.title}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-orange-700">{selectedDemoAccount.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">Demo</span>
              </div>
              <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">{selectedDemoAccount.subtitle}</p>
            </div> : null}

            <button
              type="button"
              disabled={loading || demoLoading || !selectedDemoAccount}
              onClick={() => void loginSelectedDemoAccount()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {demoLoading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
              {demoLoading ? "Đang đăng nhập tài khoản demo" : "Tự điền & đăng nhập ngay"}
            </button>
          </div>

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