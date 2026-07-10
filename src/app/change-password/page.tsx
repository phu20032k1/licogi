"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Không đổi được mật khẩu");
      setMessage("Đã đổi mật khẩu thành công. Đang vào hệ thống...");
      setTimeout(() => router.replace("/admin"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đổi được mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-600 text-white"><KeyRound size={26} /></span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">Bảo mật tài khoản</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Đổi mật khẩu</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Dùng khi quản trị viên muốn thay mật khẩu tài khoản. Hệ thống không còn bắt đổi mật khẩu ở lần đăng nhập đầu tiên.</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Mật khẩu hiện tại
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="input-field mt-1.5 w-full rounded-xl px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm font-bold text-slate-700">Mật khẩu mới
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="input-field mt-1.5 w-full rounded-xl px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm font-bold text-slate-700">Nhập lại mật khẩu mới
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="input-field mt-1.5 w-full rounded-xl px-4 py-3 text-sm" />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <div className="flex items-center gap-2 font-black text-slate-900"><ShieldCheck size={18} /> Quy tắc mật khẩu</div>
            <p className="mt-2">Tối thiểu 10 ký tự, có chữ hoa, số và ký tự đặc biệt. Không dùng lại mật khẩu seed khi đưa vào sản phẩm thật.</p>
          </div>
          {error ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
          {message ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
          <button disabled={loading} className="w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:bg-slate-300">{loading ? "Đang đổi..." : "Đổi mật khẩu"}</button>
        </form>
      </section>
    </main>
  );
}
