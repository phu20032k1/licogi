"use client";

import { Factory, ShieldCheck } from "lucide-react";
import type { RoleAccountProfile } from "../data/roleAccounts";
import { organizationDepartments, organizationExecutives } from "../data/roleAccounts";

export default function OrganizationCommandChart({ active }: { active?: RoleAccountProfile }) {
  const chairman = organizationExecutives.find((item) => item.code === "CHAIRMAN");
  const control = organizationExecutives.find((item) => item.code === "CONTROL_BOARD");
  const ceo = organizationExecutives.find((item) => item.code === "GENERAL_DIRECTOR");
  const deputies = organizationExecutives.filter((item) => item.audience === "DEPUTY_GENERAL_DIRECTOR");

  const activeClass = (code?: string, departmentCode?: string) => {
    if (!active) return "";
    if (code && active.code === code) return " ring-4 ring-yellow-300/80 ring-offset-2 ring-offset-white";
    if (departmentCode && active.departmentCode === departmentCode) return " ring-4 ring-yellow-300/70 ring-offset-2 ring-offset-white";
    return "";
  };

  return (
    <section className="overflow-hidden rounded-[14px] border border-slate-300 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[58px] grid-cols-[72px_1fr_auto] items-center border-b border-slate-300 bg-[#b8b8b8]">
        <div className="grid h-full place-items-center border-r border-white/40 bg-white px-2">
          <div className="text-center">
            <Factory className="mx-auto text-[#ba1821]" size={25} />
            <p className="mt-1 text-[8px] font-black text-[#ba1821]">LICOGI 18.3</p>
          </div>
        </div>
        <div className="flex h-full items-stretch">
          <div className="flex min-w-[390px] items-center bg-[#07596a] px-8 text-sm font-black text-white [clip-path:polygon(7%_0,100%_0,93%_100%,0_100%)]">
            I. CÔNG TY · CƠ CẤU ĐIỀU HÀNH
          </div>
          <div className="flex flex-1 items-center px-7 text-[24px] font-semibold tracking-tight text-white">Công ty tổ chức / Organization</div>
        </div>
        <div className="mr-4 hidden items-center gap-2 rounded-full border border-amber-500/50 bg-amber-50 px-3 py-2 text-[9px] font-black text-amber-800 lg:flex">
          <ShieldCheck size={14} /> ROLE-BASED COMMAND CENTER
        </div>
      </div>

      <div className="overflow-x-auto px-3 py-3">
        <div className="mx-auto min-w-[1180px] max-w-[1500px] text-[10px] font-bold text-slate-800">
          <div className="flex justify-center">
            <OrgBox label="ĐẠI HỘI ĐỒNG CỔ ĐÔNG" tone="red" width="260px" />
          </div>
          <Stem />
          <div className="relative mx-auto grid w-[820px] grid-cols-2 gap-[410px] border-t-2 border-[#c91f28] pt-4 before:absolute before:left-0 before:top-0 before:h-4 before:border-l-2 before:border-[#c91f28] after:absolute after:right-0 after:top-0 after:h-4 after:border-r-2 after:border-[#c91f28]">
            <OrgBox label={chairman?.position || "Chủ tịch HĐQT"} sub="HĐQT" tone="green" className={activeClass(chairman?.code)} />
            <OrgBox label={control?.position || "Ban Kiểm soát"} sub="Giám sát" tone="green" className={activeClass(control?.code)} />
          </div>
          <div className="mx-auto mt-1 h-4 w-[820px] border-b-2 border-x-2 border-[#c91f28]" />
          <Stem />
          <div className="flex justify-center"><OrgBox label={ceo?.position || "Tổng Giám đốc"} sub="Điều hành toàn công ty" tone="blue" width="250px" className={activeClass(ceo?.code)} /></div>
          <Stem />

          <div className="relative border-t-2 border-[#c91f28] pt-4">
            <div className="grid grid-cols-5 gap-3">
              {deputies.map((item) => (
                <div key={item.code} className="relative before:absolute before:left-1/2 before:top-[-16px] before:h-4 before:border-l-2 before:border-[#c91f28]">
                  <OrgBox label={item.shortPosition} sub={item.departmentName.replace("Khối ", "")} tone="navy" className={activeClass(item.code)} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t-2 border-[#c91f28] pt-4">
            <div className="grid grid-cols-9 gap-2">
              {organizationDepartments.map((item) => (
                <div key={item.code} className="relative before:absolute before:left-1/2 before:top-[-16px] before:h-4 before:border-l-2 before:border-[#c91f28]">
                  <OrgBox label={item.short} sub={item.name.replace("Phòng ", "").replace("Trạm ", "")} tone="orange" compact className={activeClass(undefined, item.code)} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t-2 border-[#c91f28] pt-4">
            <div className="mx-auto flex max-w-[760px] flex-col items-center">
              <OrgBox label="BAN ĐIỀU HÀNH CÁC DỰ ÁN" sub="Project Management Board" tone="gray" width="320px" />
              <Stem />
              <OrgBox label="CÁC ĐỘI XÂY DỰNG" sub="Construction Teams" tone="navy" width="340px" />
              <Stem />
              <OrgBox label="CÔNG TRÌNH / CÔNG TRƯỜNG XÂY DỰNG" sub="Project / Construction Site" tone="sky" width="420px" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[9px] font-semibold text-slate-500">
            <span>Cùng một nguồn dữ liệu → nhiều góc nhìn theo trách nhiệm.</span>
            <span className="font-black text-slate-700">Đang xem: {active?.position || "tự động theo tài khoản"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stem() {
  return <div className="mx-auto h-4 w-px border-l-2 border-[#c91f28]" />;
}

function OrgBox({
  label,
  sub,
  tone,
  width,
  compact = false,
  className = "",
}: {
  label: string;
  sub?: string;
  tone: "red" | "green" | "blue" | "navy" | "orange" | "gray" | "sky";
  width?: string;
  compact?: boolean;
  className?: string;
}) {
  const styles = {
    red: "border-red-600 bg-[#ef120d] text-white",
    green: "border-emerald-700 bg-[#119879] text-white",
    blue: "border-sky-800 bg-[#126c9b] text-white",
    navy: "border-[#00183e] bg-[#073069] text-white",
    orange: "border-orange-500 bg-[#ed8035] text-white",
    gray: "border-slate-600 bg-[#5b5b5b] text-white",
    sky: "border-blue-700 bg-[#0785dd] text-white",
  }[tone];
  return (
    <div style={width ? { width } : undefined} className={`mx-auto min-w-0 rounded-[2px] border-2 px-2 shadow-[3px_4px_4px_rgba(15,23,42,0.22)] ${compact ? "min-h-[66px] py-2" : "min-h-[45px] py-2.5"} ${styles}${className}`}>
      <p className={`${compact ? "text-[10px]" : "text-[11px]"} text-center font-black leading-[1.2]`}>{label}</p>
      {sub ? <p className={`${compact ? "mt-1 line-clamp-2 text-[8px]" : "mt-0.5 text-[9px]"} text-center font-semibold opacity-90`}>{sub}</p> : null}
    </div>
  );
}
