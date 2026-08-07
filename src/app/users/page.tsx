"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, LockKeyhole, MoreHorizontal, Plus, RefreshCcw, Save, Search, ShieldCheck, Trash2, UserCheck, UsersRound } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import BulkImportPanel from "../../components/BulkImportPanel";
import { hasPermission } from "../../lib/rbac";
import { readSession } from "../../lib/authSession";

type Option = { id: string; code: string; name: string; dataScope?: string };
type UserRow = { id: string; email: string; name: string; phone: string; status: "ACTIVE" | "SUSPENDED" | "PENDING"; role: string; roleCode: string; dataScope: string; departmentId: string | null; department: string; customerId: string | null; customer: string; lastLoginAt: string; createdAt: string; mustChangePassword: boolean };
type UsersResponse = { ok: boolean; message?: string; users: UserRow[]; roles: Option[]; departments: Option[]; customers: Option[] };
type FormState = { id?: string; name: string; email: string; phone: string; password: string; roleCode: string; departmentId: string; customerId: string; status: "ACTIVE" | "SUSPENDED" | "PENDING"; mustChangePassword: boolean };

const emptyForm: FormState = { name: "", email: "", phone: "", password: "", roleCode: "PROJECT_MANAGER", departmentId: "", customerId: "", status: "ACTIVE", mustChangePassword: false };
const statusLabels = { ACTIVE: "Đang hoạt động", SUSPENDED: "Tạm khóa", PENDING: "Chờ kích hoạt" };
const statusClass = { ACTIVE: "bg-emerald-50 text-emerald-700", SUSPENDED: "bg-red-50 text-red-700", PENDING: "bg-amber-50 text-amber-700" };

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(-2).map((word) => word[0]?.toUpperCase()).join("") || "U"; }
function formatDate(value: string) { if (!value) return "Chưa đăng nhập"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN"); }

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      setSelectedIds([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được tài khoản.");
    } finally { setLoading(false); }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return (!keyword || `${user.name} ${user.email} ${user.department} ${user.role}`.toLocaleLowerCase("vi").includes(keyword)) && (role === "all" || user.roleCode === role) && (status === "all" || user.status === status);
  }), [role, search, status, users]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected = Boolean(filtered.length) && filtered.every((user) => selectedSet.has(user.id));

  function openCreate() { setForm({ ...emptyForm, roleCode: roles[0]?.code ?? "PROJECT_MANAGER", departmentId: departments[0]?.id ?? "" }); setShowForm(true); }
  function openEdit(user: UserRow) { setForm({ id: user.id, name: user.name, email: user.email, phone: user.phone, password: "", roleCode: user.roleCode, departmentId: user.departmentId ?? "", customerId: user.customerId ?? "", status: user.status, mustChangePassword: user.mustChangePassword }); setShowForm(true); }

  async function importUsers(rows: Record<string, string>[]) {
    let success = 0; const failed: string[] = [];
    for (let index = 0; index < rows.length; index += 1) {
      try {
        const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...rows[index], status: rows[index].status || "ACTIVE", mustChangePassword: false }) });
        const data = await response.json().catch(() => ({})); if (!response.ok || !data.ok) throw new Error(data.message || "Không tạo được tài khoản"); success += 1;
      } catch (error) { failed.push(`Dòng ${index + 1}: ${error instanceof Error ? error.message : "lỗi"}`); }
    }
    await load();
    if (failed.length) throw new Error(`Đã tạo ${success}/${rows.length}. ${failed.slice(0, 3).join(" · ")}`);
    setMessage(`Đã import ${success} tài khoản và lưu vào database.`); setShowForm(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!canManage) return; setSaving(true); setMessage("");
    try {
      const isEdit = Boolean(form.id);
      const response = await fetch("/api/users", { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok || !data.ok) throw new Error(data.message ?? "Không lưu được tài khoản.");
      setMessage(isEdit ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản mới."); setShowForm(false); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không lưu được tài khoản."); } finally { setSaving(false); }
  }

  async function changeStatus(user: UserRow, nextStatus: UserRow["status"]) {
    if (!canManage) return;
    const response = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, status: nextStatus }) });
    const data = await response.json(); if (!response.ok || !data.ok) setMessage(data.message ?? "Không cập nhật được trạng thái."); else { setMessage("Đã cập nhật trạng thái."); await load(); }
  }

  function toggleUser(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleAllFiltered() {
    const visible = filtered.map((user) => user.id);
    setSelectedIds((current) => allFilteredSelected ? current.filter((id) => !visible.includes(id)) : Array.from(new Set([...current, ...visible])));
  }

  async function removeUsers(ids: string[]) {
    if (!canDelete || !ids.length || deleting) return;
    if (!window.confirm(`Xóa ${ids.length} tài khoản đã chọn? Hành động này không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Không xóa được tài khoản.");
      setMessage(`Đã xóa ${data.deleted ?? ids.length} tài khoản.`); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không xóa được tài khoản."); } finally { setDeleting(false); }
  }

  return <div className="space-y-5 animate-fade-up">
    <PageHeader eyebrow="Identity & Access" title="Tài khoản & phân quyền" description="Quản lý người dùng, vai trò, đơn vị và trạng thái truy cập." actions={<div className="flex flex-wrap gap-2"><button onClick={load} className="licogi-btn licogi-btn-secondary"><RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Tải lại</button>{canManage ? <button onClick={openCreate} className="licogi-btn licogi-btn-primary"><Plus size={16} /> Thêm tài khoản</button> : null}</div>} />
    {message ? <div className="rounded-[16px] border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800">{message}</div> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Tổng tài khoản" value={String(users.length)} note="đọc từ bảng User" icon={UsersRound} tone="orange" />
      <StatCard title="Đang hoạt động" value={String(users.filter((item) => item.status === "ACTIVE").length)} note="có thể đăng nhập" icon={UserCheck} tone="green" />
      <StatCard title="Vai trò hệ thống" value={String(roles.length)} note="Role + Permission" icon={ShieldCheck} tone="blue" />
      <StatCard title="Tạm khóa / Chờ" value={String(users.filter((item) => item.status !== "ACTIVE").length)} note="cần xử lý" icon={LockKeyhole} tone="violet" />
    </section>

    <section className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_200px_auto]">
        <label className="flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-2.5"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Tìm tên, email, phòng ban, vai trò..." /></label>
        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-[12px] border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả vai trò</option>{roles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-[12px] border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600"><option value="all">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="PENDING">Chờ kích hoạt</option><option value="SUSPENDED">Tạm khóa</option></select>
        {canDelete ? <button type="button" onClick={toggleAllFiltered} className="licogi-btn licogi-btn-secondary">{allFilteredSelected ? "Bỏ chọn" : "Chọn tất cả"}</button> : null}
      </div>
      {canDelete && selectedIds.length ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"><p className="text-xs font-bold text-slate-600">Đã chọn <span className="text-orange-700">{selectedIds.length}</span> tài khoản</p><button type="button" onClick={() => void removeUsers(selectedIds)} disabled={deleting} className="licogi-btn licogi-btn-danger"><Trash2 size={15} /> {deleting ? "Đang xóa..." : `Xóa ${selectedIds.length}`}</button></div> : null}
    </section>

    <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <div className="licogi-table-scroll max-h-[720px] overflow-auto">
        <table className="w-full min-w-[1230px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500 backdrop-blur"><tr>{canDelete ? <th className="w-12 px-4 py-3"><input aria-label="Chọn tất cả tài khoản đang hiển thị" type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></th> : null}<th className="px-5 py-3">Người dùng</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Scope</th><th className="px-4 py-3">Đơn vị</th><th className="px-4 py-3">Chủ đầu tư</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Đăng nhập gần nhất</th><th className="sticky right-0 bg-slate-50/95 px-5 py-3 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={canDelete ? 9 : 8} className="px-5 py-10 text-center text-sm font-bold text-slate-500">Đang tải dữ liệu tài khoản...</td></tr> : null}
            {!loading && filtered.map((user) => {
              const selected = selectedSet.has(user.id);
              return <tr key={user.id} className={selected ? "bg-orange-50/60" : "hover:bg-slate-50/70"}>
                {canDelete ? <td className="px-4 py-3"><input aria-label={`Chọn ${user.email}`} type="checkbox" checked={selected} onChange={() => toggleUser(user.id)} className="h-4 w-4 rounded border-slate-300 accent-orange-600" /></td> : null}
                <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[11px] bg-slate-900 text-xs font-black text-white">{initials(user.name)}</span><div><p className="font-extrabold text-slate-900">{user.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{user.email}</p>{user.phone ? <p className="mt-1 text-[11px] text-slate-400">{user.phone}</p> : null}</div></div></td>
                <td className="px-4 py-3"><span className="rounded-[9px] bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold text-violet-700">{user.role}</span></td>
                <td className="px-4 py-3"><code className="rounded-[8px] bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{user.dataScope}</code></td>
                <td className="max-w-[220px] px-4 py-3 font-semibold text-slate-600">{user.department || "—"}</td><td className="max-w-[220px] px-4 py-3 font-semibold text-slate-600">{user.customer || "—"}</td>
                <td className="px-4 py-3"><span className={`rounded-[9px] px-2.5 py-1 text-[10px] font-extrabold ${statusClass[user.status]}`}>{statusLabels[user.status]}</span></td><td className="px-4 py-3 text-slate-500">{formatDate(user.lastLoginAt)}</td>
                <td className={`sticky right-0 px-5 py-3 ${selected ? "bg-orange-50" : "bg-white"}`}><div className="flex justify-end gap-2">{canManage ? <button onClick={() => openEdit(user)} className="licogi-icon-btn" title="Sửa"><KeyRound size={16} /></button> : null}{canManage ? <button onClick={() => changeStatus(user, user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")} className="licogi-icon-btn" title="Khóa/mở"><MoreHorizontal size={16} /></button> : null}{canDelete ? <button onClick={() => void removeUsers([user.id])} className="licogi-icon-btn licogi-icon-btn-danger" title="Xóa"><Trash2 size={16} /></button> : null}</div></td>
              </tr>;
            })}
            {!loading && !filtered.length ? <tr><td colSpan={canDelete ? 9 : 8} className="px-5 py-10 text-center text-sm font-bold text-slate-500">Không có tài khoản phù hợp bộ lọc.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>

    <section className="grid gap-3 md:grid-cols-3">{roles.slice(0, 6).map((item) => <article key={item.code} className="rounded-[18px] border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-[12px] bg-orange-50 text-orange-600"><ShieldCheck size={20} /></span><span className="text-2xl font-black text-slate-900">{users.filter((user) => user.roleCode === item.code).length}</span></div><h3 className="mt-4 font-black text-slate-900">{item.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">Scope: {item.dataScope}</p></article>)}</section>

    {showForm ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><button className="absolute inset-0" onClick={() => setShowForm(false)} aria-label="Đóng" /><form onSubmit={submit} className="modal-panel licogi-scroll relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-[22px] bg-white p-6 shadow-2xl sm:rounded-[20px]"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">{form.id ? "Sửa tài khoản" : "Tài khoản mới"}</p><h2 className="mt-1 text-xl font-black text-slate-900">{form.id ? form.email : "Thêm tài khoản"}</h2></div><button type="button" onClick={() => setShowForm(false)} className="licogi-btn licogi-btn-secondary">Đóng</button></div>{!form.id ? <BulkImportPanel className="mt-4" compact fields={[{ name: "name", label: "Họ và tên", placeholder: "Nguyễn Văn A", required: true },{ name: "email", label: "Email", placeholder: "user@company.vn", required: true },{ name: "phone", label: "Số điện thoại", placeholder: "0900000000" },{ name: "password", label: "Mật khẩu", placeholder: "MatKhau123!", required: true },{ name: "roleCode", label: "Mã vai trò", placeholder: "PROJECT_MANAGER" },{ name: "departmentId", label: "Department ID", placeholder: "" },{ name: "customerId", label: "Customer ID", placeholder: "" },{ name: "status", label: "Trạng thái", placeholder: "ACTIVE" }]} onImport={importUsers} description="Import nhiều tài khoản từ CSV/Excel; mỗi dòng được ghi trực tiếp vào database." /> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-600">Họ và tên<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Email<input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Số điện thoại<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Mật khẩu {form.id ? "mới nếu đổi" : ""}<input required={!form.id} type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm" placeholder={form.id ? "Để trống nếu không đổi" : "Nhập mật khẩu"} /></label><label className="text-xs font-bold text-slate-600">Vai trò<select value={form.roleCode} onChange={(event) => setForm((current) => ({ ...current, roleCode: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm">{roles.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Trạng thái<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FormState["status"] }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option value="ACTIVE">Đang hoạt động</option><option value="PENDING">Chờ kích hoạt</option><option value="SUSPENDED">Tạm khóa</option></select></label><label className="text-xs font-bold text-slate-600">Phòng ban<select value={form.departmentId} onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option value="">Không gán</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Chủ đầu tư liên kết<select value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))} className="input-field mt-1.5 w-full rounded-[12px] px-3.5 py-2.5 text-sm"><option value="">Không phải tài khoản chủ đầu tư</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="licogi-btn licogi-btn-secondary">Hủy</button><button disabled={saving} className="licogi-btn licogi-btn-primary"><Save size={16} /> {saving ? "Đang lưu..." : "Lưu tài khoản"}</button></div></form></div> : null}
  </div>;
}
