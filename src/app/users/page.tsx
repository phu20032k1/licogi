"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, LockKeyhole, MoreHorizontal, Plus, RefreshCcw, Save, Search, ShieldCheck, Trash2, UserCheck, UsersRound } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import { hasPermission } from "../../lib/rbac";
import { readSession } from "../../lib/authSession";

type Option = { id: string; code: string; name: string; dataScope?: string };
type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  role: string;
  roleCode: string;
  dataScope: string;
  departmentId: string | null;
  department: string;
  customerId: string | null;
  customer: string;
  lastLoginAt: string;
  createdAt: string;
  mustChangePassword: boolean;
};

type UsersResponse = { ok: boolean; message?: string; users: UserRow[]; roles: Option[]; departments: Option[]; customers: Option[] };

type FormState = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  roleCode: string;
  departmentId: string;
  customerId: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  mustChangePassword: boolean;
};

const emptyForm: FormState = { name: "", email: "", phone: "", password: "", roleCode: "PROJECT_MANAGER", departmentId: "", customerId: "", status: "ACTIVE", mustChangePassword: false };

const statusLabels = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm khóa",
  PENDING: "Chờ kích hoạt",
};

const statusClass = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  SUSPENDED: "bg-red-50 text-red-700",
  PENDING: "bg-amber-50 text-amber-700",
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(-2).map((word) => word[0]?.toUpperCase()).join("") || "U";
}

function formatDate(value: string) {
  if (!value) return "Chưa đăng nhập";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const session = readSession();
  const canManage = hasPermission(session, "USERS", "MANAGE");
  const canDelete = hasPermission(session, "USERS", "DELETE");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json() as UsersResponse;
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không tải được tài khoản.");
      setUsers(data.users);
      setRoles(data.roles);
      setDepartments(data.departments);
      setCustomers(data.customers);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được tài khoản.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    const matchesSearch = !keyword || `${user.name} ${user.email} ${user.department} ${user.role}`.toLocaleLowerCase("vi").includes(keyword);
    const matchesRole = role === "all" || user.roleCode === role;
    const matchesStatus = status === "all" || user.status === status;
    return matchesSearch && matchesRole && matchesStatus;
  }), [role, search, status, users]);

  function openCreate() {
    setForm({ ...emptyForm, roleCode: roles[0]?.code ?? "PROJECT_MANAGER", departmentId: departments[0]?.id ?? "" });
    setShowForm(true);
  }

  function openEdit(user: UserRow) {
    setForm({ id: user.id, name: user.name, email: user.email, phone: user.phone, password: "", roleCode: user.roleCode, departmentId: user.departmentId ?? "", customerId: user.customerId ?? "", status: user.status, mustChangePassword: user.mustChangePassword });
    setShowForm(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setMessage("");
    try {
      const isEdit = Boolean(form.id);
      const response = await fetch("/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không lưu được tài khoản.");
      setMessage(isEdit ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản mới.");
      setShowForm(false);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không lưu được tài khoản.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(user: UserRow, nextStatus: UserRow["status"]) {
    if (!canManage) return;
    const response = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, status: nextStatus }) });
    const data = await response.json();
    if (!response.ok || !data.ok) setMessage(data.message ?? "Không cập nhật được trạng thái.");
    else { setMessage("Đã cập nhật trạng thái."); await load(); }
  }

  async function removeUser(user: UserRow) {
    if (!canDelete || !window.confirm(`Xóa tài khoản ${user.email}?`)) return;
    const response = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    const data = await response.json();
    if (!response.ok || !data.ok) setMessage(data.message ?? "Không xóa được tài khoản.");
    else { setMessage("Đã xóa tài khoản."); await load(); }
  }

  return <div className="space-y-6 animate-fade-up">
    <PageHeader eyebrow="Identity & Access" title="Tài khoản & phân quyền thật" description="Quản lý user, vai trò, phòng ban, trạng thái và phạm vi dữ liệu trực tiếp trong PostgreSQL qua Prisma. Tài khoản mới dùng được ngay, không bắt đổi mật khẩu lần đầu." actions={<div className="flex flex-wrap gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700"><RefreshCcw size={16} /> Tải lại</button>{canManage ? <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Plus size={16} /> Thêm tài khoản</button> : null}</div>} />

    {message ? <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800">{message}</div> : null}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Tổng tài khoản" value={String(users.length)} note="đọc từ bảng User" icon={UsersRound} tone="orange" />
      <StatCard title="Đang hoạt động" value={String(users.filter((item) => item.status === "ACTIVE").length)} note="có thể đăng nhập" icon={UserCheck} tone="green" />
      <StatCard title="Vai trò hệ thống" value={String(roles.length)} note="Role + Permission" icon={ShieldCheck} tone="blue" />
      <StatCard title="Tạm khóa / Chờ" value={String(users.filter((item) => item.status !== "ACTIVE").length)} note="không vào hệ thống hoặc chờ duyệt" icon={LockKeyhole} tone="violet" />
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_240px_220px]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm tên, email, phòng ban, vai trò..." /></label>
        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả vai trò</option>{roles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="PENDING">Chờ kích hoạt</option><option value="SUSPENDED">Tạm khóa</option></select>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Người dùng</th><th className="px-4 py-4">Vai trò</th><th className="px-4 py-4">Scope</th><th className="px-4 py-4">Đơn vị</th><th className="px-4 py-4">Chủ đầu tư</th><th className="px-4 py-4">Trạng thái</th><th className="px-4 py-4">Đăng nhập gần nhất</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-sm font-bold text-slate-500">Đang tải dữ liệu tài khoản...</td></tr> : null}
            {!loading && filtered.map((user) => <tr key={user.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">{initials(user.name)}</span><div><p className="font-extrabold text-slate-900">{user.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{user.email}</p>{user.phone ? <p className="mt-1 text-[11px] text-slate-400">{user.phone}</p> : null}</div></div></td>
              <td className="px-4 py-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold text-violet-700">{user.role}</span></td>
              <td className="px-4 py-4"><code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{user.dataScope}</code></td>
              <td className="max-w-[220px] px-4 py-4 font-semibold text-slate-600">{user.department || "—"}</td>
              <td className="max-w-[220px] px-4 py-4 font-semibold text-slate-600">{user.customer || "—"}</td>
              <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusClass[user.status]}`}>{statusLabels[user.status]}</span></td>
              <td className="px-4 py-4 text-slate-500">{formatDate(user.lastLoginAt)}</td>
              <td className="px-5 py-4"><div className="flex justify-end gap-2">{canManage ? <button onClick={() => openEdit(user)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Sửa"><KeyRound size={16} /></button> : null}{canManage ? <button onClick={() => changeStatus(user, user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Khóa/mở"><MoreHorizontal size={16} /></button> : null}{canDelete ? <button onClick={() => removeUser(user)} className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50" title="Xóa"><Trash2 size={16} /></button> : null}</div></td>
            </tr>)}
            {!loading && !filtered.length ? <tr><td colSpan={8} className="px-5 py-10 text-center text-sm font-bold text-slate-500">Không có tài khoản phù hợp bộ lọc.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">{roles.slice(0, 6).map((item) => <article key={item.code} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><ShieldCheck size={20} /></span><span className="text-2xl font-black text-slate-900">{users.filter((user) => user.roleCode === item.code).length}</span></div><h3 className="mt-4 font-black text-slate-900">{item.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">Scope: {item.dataScope}</p></article>)}</section>

    {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={() => setShowForm(false)} /><form onSubmit={submit} className="modal-panel relative w-full max-w-3xl rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">{form.id ? "Sửa tài khoản" : "Tài khoản mới"}</p><h2 className="mt-1 text-xl font-black text-slate-900">{form.id ? form.email : "Thêm tài khoản"}</h2></div><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">Đóng</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-600">Họ và tên<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Email<input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Số điện thoại<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Mật khẩu {form.id ? "mới nếu đổi" : ""}<input required={!form.id} type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" placeholder={form.id ? "Để trống nếu không đổi" : "Nhập mật khẩu"} /></label><label className="text-xs font-bold text-slate-600">Vai trò<select value={form.roleCode} onChange={(event) => setForm((current) => ({ ...current, roleCode: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm">{roles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Trạng thái<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FormState["status"] }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option value="ACTIVE">Đang hoạt động</option><option value="PENDING">Chờ kích hoạt</option><option value="SUSPENDED">Tạm khóa</option></select></label><label className="text-xs font-bold text-slate-600">Phòng ban<select value={form.departmentId} onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option value="">Không gán</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Chủ đầu tư liên kết<select value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"><option value="">Không phải tài khoản chủ đầu tư</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label></div><p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Tài khoản mới không bị bắt đổi mật khẩu lần đầu; quản trị viên có thể đổi lại mật khẩu khi cần.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white disabled:bg-slate-300"><Save size={16} /> {saving ? "Đang lưu..." : "Lưu tài khoản"}</button></div></form></div> : null}
  </div>;
}
