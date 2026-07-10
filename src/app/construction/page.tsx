"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Clock3, HardHat, PackageCheck, ShieldAlert, Truck, UsersRound } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import StatCard from "../../components/StatCard";
import { constructionTasks, incidents, resourceData } from "../../data/operations";

const tabs = ["Tiến độ", "Nguồn lực", "QA/QC & HSE"] as const;

function EmptyBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
      <p className="text-sm font-black text-slate-800">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default function ConstructionPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Tiến độ");
  const summary = useMemo(() => {
    const total = constructionTasks.length;
    const normal = constructionTasks.filter((task) => task.status === "normal").length;
    const warning = constructionTasks.filter((task) => task.status === "warning").length;
    const late = constructionTasks.filter((task) => task.status === "late").length;
    const onScheduleRate = total ? Math.round((normal / total) * 100) : 0;
    const averageVariance = total ? Math.round(constructionTasks.reduce((sum, task) => sum + task.actual - task.planned, 0) / total) : 0;
    return { total, normal, warning, late, onScheduleRate, averageVariance };
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Construction Operation"
        title="Điều hành thi công"
        description="Theo dõi tiến độ, công suất nguồn lực, chất lượng và an toàn. Dữ liệu ban đầu để trống và sẽ hiển thị sau khi nhập tại Trung tâm dữ liệu."
        actions={<button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><ClipboardCheck size={16} /> Tạo báo cáo ngày</button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Gói công việc" value={String(summary.total)} note="đang quản lý" icon={HardHat} tone="orange" />
        <StatCard title="Đúng kế hoạch" value={String(summary.normal)} note={`${summary.onScheduleRate}% tổng số gói`} icon={CheckCircle2} tone="green" />
        <StatCard title="Cần chú ý" value={String(summary.warning)} note="chờ dữ liệu cảnh báo" icon={Clock3} tone="blue" />
        <StatCard title="Chậm nghiêm trọng" value={String(summary.late)} note="cần can thiệp" icon={AlertTriangle} tone="violet" />
      </section>

      <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${tab === item ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === "Tiến độ" ? (
        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Work packages</p>
              <h2 className="mt-1 text-lg font-black text-slate-900">Tiến độ các gói công việc</h2>
            </div>
            {constructionTasks.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-3.5">Gói công việc</th><th className="px-4 py-3.5">Đơn vị thực hiện</th><th className="px-4 py-3.5">Kế hoạch</th><th className="px-4 py-3.5">Thực tế</th><th className="px-4 py-3.5">Hạn hoàn thành</th><th className="px-5 py-3.5">Trạng thái</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {constructionTasks.map((task) => {
                      const variance = task.actual - task.planned;
                      return <tr key={task.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4"><p className="font-extrabold text-slate-900">{task.package}</p><p className="mt-1 text-xs text-slate-500">{task.id} · {task.project}</p></td>
                        <td className="px-4 py-4 font-semibold text-slate-600">{task.owner}</td>
                        <td className="px-4 py-4 font-bold text-slate-600">{task.planned}%</td>
                        <td className="px-4 py-4"><div className="w-32"><div className="mb-1 flex justify-between text-[11px]"><span className="font-extrabold text-slate-800">{task.actual}%</span><span className={variance < -5 ? "font-bold text-red-600" : "font-bold text-emerald-600"}>{variance >= 0 ? "+" : ""}{variance}%</span></div><ProgressBar value={task.actual} tone={task.status === "late" ? "red" : task.status === "warning" ? "orange" : "green"} /></div></td>
                        <td className="px-4 py-4 text-slate-600">{task.deadline}</td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${task.status === "late" ? "bg-red-50 text-red-700" : task.status === "warning" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{task.status === "late" ? "Chậm tiến độ" : task.status === "warning" ? "Cần chú ý" : "Đúng kế hoạch"}</span></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-6"><EmptyBox title="Chưa có dữ liệu tiến độ" description="Nhập file tiến độ hoặc tạo gói công việc trong Trung tâm dữ liệu để bảng điều hành thi công bắt đầu hoạt động." /></div>}
          </article>

          <aside className="space-y-5">
            <article className="rounded-2xl border border-slate-200 bg-[#071426] p-5 text-white shadow-xl shadow-slate-900/10">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-300">Dự báo hoàn thành</p>
              <h3 className="mt-2 text-xl font-black">Tổng quan công trường</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] text-slate-400">Đúng hạn</p><p className="mt-1 text-2xl font-black">{summary.onScheduleRate}%</p></div>
                <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] text-slate-400">Sai lệch TB</p><p className="mt-1 text-2xl font-black">{summary.averageVariance}%</p></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-300">Chưa có cảnh báo tự động. Sau khi nhập dữ liệu tiến độ, hệ thống sẽ tính tỷ lệ đúng hạn và sai lệch trung bình.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Mốc sắp tới</h3><div className="mt-4"><EmptyBox title="Chưa nhập mốc thi công" description="Các mốc nghiệm thu, bàn giao và cảnh báo sẽ hiển thị tại đây sau khi có dữ liệu." /></div></article>
          </aside>
        </section>
      ) : null}

      {tab === "Nguồn lực" ? (
        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><UsersRound size={21} /></span><div><h2 className="font-black text-slate-900">Mức sử dụng nguồn lực</h2><p className="mt-1 text-xs text-slate-500">Cập nhật theo toàn bộ công trường</p></div></div><div className="mt-7 space-y-6">{resourceData.length ? resourceData.map((resource)=>{const rate=resource.total ? Math.round(resource.used/resource.total*100) : 0;return <div key={resource.label}><div className="mb-2 flex justify-between text-sm"><span className="font-bold text-slate-700">{resource.label}</span><span className="font-extrabold text-slate-900">{resource.used}/{resource.total} · {rate}%</span></div><ProgressBar value={rate} tone={rate>85?"orange":"blue"} height="h-2.5" /></div>}) : <EmptyBox title="Chưa có dữ liệu nguồn lực" description="Nhập nhân sự, thiết bị và vật tư để theo dõi mức sử dụng thực tế." />}</div></article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-600"><Truck size={21} /></span><div><h2 className="font-black text-slate-900">Thiết bị cần điều phối</h2><p className="mt-1 text-xs text-slate-500">Đề xuất điều chuyển sau khi có dữ liệu thiết bị</p></div></div><div className="mt-5"><EmptyBox title="Chưa có điều phối thiết bị" description="Khi nhập thiết bị và vị trí, hệ thống sẽ hiển thị danh sách cần điều chuyển hoặc bảo dưỡng." /></div></article>
          <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-4 md:grid-cols-3">{[{icon:UsersRound,title:"Nhu cầu nhân sự",value:"0",note:"chưa dự báo",tone:"orange"},{icon:PackageCheck,title:"Vật tư sắp thiếu",value:"0",note:"chưa có cảnh báo",tone:"blue"},{icon:Truck,title:"Thiết bị thuê ngoài",value:"0",note:"chưa ghi nhận",tone:"green"}].map(({icon:Icon,title,value,note,tone})=><div key={title} className="rounded-xl bg-slate-50 p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone==="orange"?"bg-orange-100 text-orange-600":tone==="blue"?"bg-sky-100 text-sky-600":"bg-emerald-100 text-emerald-600"}`}><Icon size={19}/></span><p className="mt-4 text-xs font-bold text-slate-500">{title}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>)}</div></article>
        </section>
      ) : null}

      {tab === "QA/QC & HSE" ? (
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h2 className="font-black text-slate-900">Sự cố và điểm kiểm tra</h2><p className="mt-1 text-xs text-slate-500">Theo dõi QA/QC, HSE, NCR và biện pháp khắc phục</p></div>{incidents.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Mã</th><th className="px-4 py-4">Dự án</th><th className="px-4 py-4">Nhóm</th><th className="px-4 py-4">Mức độ</th><th className="px-4 py-4">Ngày</th><th className="px-5 py-4">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{incidents.map((item)=><tr key={item.code}><td className="px-5 py-4 font-black text-slate-900">{item.code}</td><td className="px-4 py-4 text-slate-600">{item.project}</td><td className="px-4 py-4 text-slate-600">{item.category}</td><td className="px-4 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700">{item.severity}</span></td><td className="px-4 py-4 text-slate-500">{item.date}</td><td className="px-5 py-4 font-semibold text-slate-600">{item.status}</td></tr>)}</tbody></table></div> : <div className="p-6"><EmptyBox title="Chưa có dữ liệu QA/QC & HSE" description="Nhập biên bản kiểm tra, NCR, sự cố an toàn và checklist để quản lý chất lượng công trường." /></div>}</article>
          <aside className="space-y-5"><article className="rounded-2xl bg-emerald-600 p-6 text-white shadow-lg"><ShieldAlert size={25}/><p className="mt-4 text-sm font-bold text-emerald-100">Số giờ an toàn</p><p className="mt-1 text-4xl font-black">0</p><p className="mt-2 text-xs text-emerald-100">Chưa nhập dữ liệu HSE</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Chỉ số chất lượng</h3><div className="mt-5 space-y-4">{["Nghiệm thu lần đầu","NCR đóng đúng hạn","Checklist hoàn thành"].map((label)=><div key={label}><div className="mb-2 flex justify-between text-xs"><span className="font-bold text-slate-600">{label}</span><span className="font-black text-slate-800">0%</span></div><ProgressBar value={0} tone="green" /></div>)}</div></article></aside>
        </section>
      ) : null}
    </div>
  );
}
