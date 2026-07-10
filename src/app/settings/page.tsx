"use client";

import { useState } from "react";
import { BellRing, Building2, Copy, Database, Globe2, KeyRound, Save, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { apiServices } from "../../data/apiServices";

const sections = ["Thông tin doanh nghiệp", "API dịch vụ", "Thông báo", "Bảo mật", "Dữ liệu & sao lưu", "Ngôn ngữ"] as const;

export default function SettingsPage() {
  const [section, setSection] = useState<(typeof sections)[number]>("API dịch vụ");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState("");
  function save() { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return <div className="space-y-6 animate-fade-up"><PageHeader eyebrow="System Configuration" title="Cài đặt hệ thống & API dịch vụ" description="Cấu hình thông tin doanh nghiệp, bảo mật, dữ liệu và các API cần lấy để biến hệ thống thành hệ thống chạy thật." actions={<button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Save size={16} /> {saved ? "Đã lưu" : "Lưu thay đổi"}</button>} />
    <section className="grid gap-6 xl:grid-cols-[300px_1fr]"><aside className="h-fit rounded-[24px] border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">{sections.map((item, index) => { const Icon = [Building2, KeyRound, BellRing, ShieldCheck, Database, Globe2][index]; return <button key={item} onClick={() => setSection(item)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${section === item ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={18} />{item}</button>; })}</aside>
      <div className="rounded-[26px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-7">
        {section === "Thông tin doanh nghiệp" ? <><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600"><Building2 size={22} /></span><div><h2 className="text-lg font-black text-slate-900">Thông tin doanh nghiệp</h2><p className="mt-1 text-xs text-slate-500">Hiển thị trên hệ thống và hồ sơ năng lực</p></div></div><div className="mt-7 grid gap-5 md:grid-cols-2"><label className="text-xs font-bold text-slate-600 md:col-span-2">Tên doanh nghiệp<input defaultValue="Công ty Cổ phần Đầu tư và Xây dựng Licogi 18.3" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Tên viết tắt<input defaultValue="LICOGI 18.3" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Mã số thuế<input placeholder="Nhập mã số thuế" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600 md:col-span-2">Địa chỉ<input defaultValue="Hà Nội, Việt Nam" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Email hệ thống<input placeholder="Nhập email hệ thống" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Số điện thoại<input placeholder="Nhập số điện thoại" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm" /></label></div></> : null}
        {section === "API dịch vụ" ? <ApiServicePanel copied={copied} onCopy={copy} /> : null}
        {section === "Thông báo" ? <SettingsToggles icon={BellRing} title="Quy tắc thông báo" items={["Cảnh báo dự án chậm tiến độ", "Đề nghị phê duyệt mới", "Yêu cầu bảo hành sắp quá SLA", "Hồ sơ mới được phát hành", "Báo cáo điều hành hàng tuần"]} /> : null}
        {section === "Bảo mật" ? <SettingsToggles icon={ShieldCheck} title="Chính sách bảo mật" items={["Bắt buộc xác thực hai lớp cho quản trị viên", "Khóa tài khoản sau 5 lần đăng nhập sai", "Yêu cầu đổi mật khẩu sau 90 ngày", "Ghi nhật ký tải xuống tài liệu", "Giới hạn truy cập theo địa chỉ IP"]} /> : null}
        {section === "Dữ liệu & sao lưu" ? <><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600"><Database size={22} /></span><div><h2 className="text-lg font-black text-slate-900">Dữ liệu & sao lưu</h2><p className="mt-1 text-xs text-slate-500">Hệ thống hiện lưu dữ liệu qua API nội bộ; khi triển khai production có thể chuyển sang PostgreSQL/S3.</p></div></div><div className="mt-7 space-y-4">{[["Sao lưu tự động", "Hàng ngày lúc 02:00"], ["Thời gian lưu bản sao", "30 ngày"], ["Lưu nhật ký hệ thống", "365 ngày"], ["Khu vực dữ liệu", "Việt Nam / Singapore"]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"><div><p className="font-extrabold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{value}</p></div><button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Cấu hình</button></div>)}</div></> : null}
        {section === "Ngôn ngữ" ? <><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Globe2 size={22} /></span><div><h2 className="text-lg font-black text-slate-900">Ngôn ngữ & khu vực</h2><p className="mt-1 text-xs text-slate-500">Cấu hình hiển thị mặc định của hệ thống</p></div></div><div className="mt-7 grid gap-5 md:grid-cols-2"><label className="text-xs font-bold text-slate-600">Ngôn ngữ mặc định<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm"><option>Tiếng Việt</option><option>English</option><option>中文</option><option>日本語</option><option>한국어</option></select></label><label className="text-xs font-bold text-slate-600">Múi giờ<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm"><option>GMT+7 · Hà Nội</option><option>GMT+9 · Tokyo</option></select></label><label className="text-xs font-bold text-slate-600">Định dạng ngày<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm"><option>DD/MM/YYYY</option></select></label><label className="text-xs font-bold text-slate-600">Đơn vị tiền tệ<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm"><option>VND · Việt Nam đồng</option><option>USD</option></select></label></div></> : null}
      </div></section>
    {saved ? <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-xl">Đã lưu cấu hình hệ thống</div> : null}
  </div>;
}

function ApiServicePanel({ copied, onCopy }: { copied: string; onCopy: (text: string) => void }) {
  return <>
    <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600"><KeyRound size={22} /></span><div><h2 className="text-lg font-black text-slate-900">API dịch vụ cần lấy</h2><p className="mt-1 text-xs text-slate-500">Các nhóm API để chạy bản thật: database, đăng nhập/OTP, storage, map, dịch, email, BIM; AI/RAG để nối sau.</p></div></div>
    <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-orange-900"><b>Thứ tự làm:</b> Database → Auth/OTP → Storage → Map → Dịch → Email/SMS → BIM → AI/RAG sau. File `.env.example` và `HUONG_DAN_BAN_DATA_PRODUCTION.md` đã được thêm vào project.</div>
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {apiServices.map((service) => (
        <article key={service.group} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-950">{service.group}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{service.purpose}</p></div><button type="button" onClick={() => onCopy(service.envKeys.join("\n"))} className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Copy biến môi trường"><Copy size={16} /></button></div>
          <div className="mt-4 flex flex-wrap gap-2">{service.recommended.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-700">{item}</span>)}</div>
          <div className="mt-4 rounded-xl bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-200">{service.envKeys.map((key) => <p key={key}>{key}=<span className="text-orange-300">&quot;...&quot;</span></p>)}</div>
          <p className="mt-4 text-xs leading-5 text-slate-500"><b className="text-slate-700">Lấy ở đâu:</b> {service.whereToGet}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500"><b className="text-slate-700">Ghi chú:</b> {service.notes}</p>
          {copied === service.envKeys.join("\n") ? <p className="mt-3 text-xs font-extrabold text-emerald-600">Đã copy danh sách biến môi trường</p> : null}
        </article>
      ))}
    </div>
  </>;
}

function SettingsToggles({ icon: Icon, title, items }: { icon: typeof BellRing; title: string; items: string[] }) {
  const [enabled, setEnabled] = useState(() => items.map(() => true));
  return <><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600"><Icon size={22} /></span><div><h2 className="text-lg font-black text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">Bật hoặc tắt từng quy tắc áp dụng</p></div></div><div className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200">{items.map((item, index) => <div key={item} className="flex items-center justify-between gap-5 p-4"><div><p className="text-sm font-extrabold text-slate-800">{item}</p><p className="mt-1 text-xs text-slate-500">Áp dụng cho các tài khoản có quyền liên quan</p></div><button type="button" onClick={() => setEnabled((values) => values.map((value, i) => i === index ? !value : value))} className={`relative h-7 w-12 rounded-full transition ${enabled[index] ? "bg-orange-500" : "bg-slate-200"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled[index] ? "left-6" : "left-1"}`} /></button></div>)}</div></>;
}
