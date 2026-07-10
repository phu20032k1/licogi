"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { systemAccounts } from "../../data/dataCenter";
import { saveSession, UserSession } from "../../lib/authSession";
import { roleDefaultRoute } from "../../lib/rbac";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@licogi183.vn");
  const [password, setPassword] = useState("Licogi@2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không đăng nhập được");
      saveSession(data.user as UserSession);
      router.push(data.redirectTo || roleDefaultRoute(data.user as UserSession));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đăng nhập được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="relative overflow-hidden rounded-[34px] bg-[#071426] p-8 text-white shadow-2xl sm:p-10 lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-600 shadow-lg shadow-orange-950/20"><Building2 size={28} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Industrial Construction OS</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight">LICOGI 18.3</h1>
              </div>
            </div>
            <h2 className="mt-12 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">Hệ điều hành quản trị tổng thầu EPC</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">Hệ thống dùng PostgreSQL/Prisma, phân quyền theo vai trò và chỉ mở đúng các chức năng được cấp cho từng bộ phận.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Dữ liệu chuẩn", "Phân quyền rõ", "Giao diện chuyên nghiệp"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><CheckCircle2 className="text-orange-300" size={20} /><p className="mt-3 text-sm font-bold text-white">{item}</p></div>)}
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-300">Luồng vận hành</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Đăng nhập → kiểm quyền từ database → mở đúng menu theo vai trò → dữ liệu nghiệp vụ ghi trực tiếp vào PostgreSQL.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-xl sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">Đăng nhập hệ thống</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Tài khoản hệ thống</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Chọn tài khoản bên dưới để tự điền email và mật khẩu.</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white"><LockKeyhole size={22} /></span>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block text-sm font-bold text-slate-700">Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="input-field mt-1.5 w-full rounded-xl px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm font-bold text-slate-700">Mật khẩu
              <span className="mt-1.5 flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
                <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            {error ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
            <button disabled={loading} className="w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:bg-slate-300">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-orange-600" /><p className="text-sm font-black text-slate-900">Tài khoản seed trong Prisma</p></div>
            <div className="mt-4 space-y-2">
              {systemAccounts.map((account) => (
                <button key={account.email} type="button" onClick={() => { setEmail(account.email); setPassword(account.defaultPassword); }} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-orange-200 hover:bg-orange-50/40">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-slate-900">{account.role}</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{account.passwordEnv}</span></div>
                  <p className="mt-1 text-xs text-slate-500">{account.email}</p>
                  <p className="mt-1 text-xs font-bold text-orange-700">Mật khẩu mặc định: {account.defaultPassword}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
