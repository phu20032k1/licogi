"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import { saveSession, UserSession } from "../../lib/authSession";
import { roleDefaultRoute } from "../../lib/rbac";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setLoading(true);
    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const registerData = await registerResponse.json();
      if (!registerResponse.ok || !registerData.ok) throw new Error(registerData.message || "Không tạo được tài khoản.");

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginResponse.json();
      if (!loginResponse.ok || !loginData.ok) throw new Error(loginData.message || "Tài khoản đã tạo nhưng chưa đăng nhập được.");

      const user = loginData.user as UserSession;
      saveSession(user);
      router.replace(loginData.redirectTo || roleDefaultRoute(user));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được tài khoản.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8fb] px-4 py-8 text-slate-900">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-orange-200/35 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-7 flex justify-center"><BrandLogo /></div>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-8">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-bold">
            <Link href="/login" className="rounded-lg px-3 py-2 text-center text-slate-500 transition hover:text-slate-900">Đăng nhập</Link>
            <span className="rounded-lg bg-white px-3 py-2 text-center text-slate-950 shadow-sm">Đăng ký</span>
          </div>

          <div className="mt-7">
            <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Tạo tài khoản</h1>
            <p className="mt-2 text-sm text-slate-500">Dành cho khách hàng và đối tác truy cập cổng thông tin.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">Họ và tên
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} placeholder="Nguyễn Văn A" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
            </label>

            <label className="block text-sm font-bold text-slate-700">Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="name@company.com" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
            </label>

            <label className="block text-sm font-bold text-slate-700">Mật khẩu
              <span className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="Tối thiểu 8 ký tự" className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-slate-400 transition hover:text-slate-700" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>

            <label className="block text-sm font-bold text-slate-700">Xác nhận mật khẩu
              <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="Nhập lại mật khẩu" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
            </label>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" /> Tài khoản đăng ký mới chỉ được cấp quyền khách hàng, không có quyền quản trị nội bộ.</div>

            {error ? <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading ? <Loader2 size={17} className="animate-spin" /> : null}
              {loading ? "Đang tạo tài khoản" : "Tạo tài khoản"}
              {!loading ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">Đã có tài khoản? <Link href="/login" className="font-extrabold text-orange-600 hover:text-orange-700">Đăng nhập</Link></p>
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
