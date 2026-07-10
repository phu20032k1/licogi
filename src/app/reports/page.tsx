import { BarChart3, Download, FileText, PieChart, TrendingUp } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";

const businessData = [
  { label: "Công nghiệp", value: 0, amount: "0" },
  { label: "Hạ tầng", value: 0, amount: "0" },
  { label: "Giao thông", value: 0, amount: "0" },
  { label: "Dân dụng", value: 0, amount: "0" },
  { label: "Điện năng", value: 0, amount: "0" },
];

function EmptyBox({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center"><p className="text-sm font-black text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader eyebrow="Management Analytics" title="Báo cáo quản trị" description="Tổng hợp chỉ số kinh doanh, dự án, dòng tiền và hiệu quả vận hành. Các chỉ số không dùng dữ liệu giả; sẽ chạy sau khi nhập dữ liệu thật." actions={<><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm"><FileText size={16} /> Lịch báo cáo</button><button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-200"><Download size={16} /> Xuất báo cáo</button></>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Doanh thu" value="0" note="chờ dữ liệu hợp đồng" icon={TrendingUp} tone="orange" />
        <StatCard title="Giá trị backlog" value="0" note="chờ dữ liệu dự án" icon={BarChart3} tone="blue" />
        <StatCard title="Biên lợi nhuận gộp" value="0%" note="chờ dữ liệu tài chính" icon={PieChart} tone="green" />
        <StatCard title="Tỷ lệ trúng thầu" value="0%" note="chờ dữ liệu chào thầu" icon={TrendingUp} tone="violet" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Financial performance</p><h2 className="mt-1 text-lg font-black text-slate-900">Doanh thu & lợi nhuận theo quý</h2></div><select className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"><option>Năm hiện tại</option></select></div><div className="mt-8"><EmptyBox title="Chưa có dữ liệu tài chính" description="Nhập dữ liệu hợp đồng, doanh thu, chi phí hoặc nối hệ thống kế toán để biểu đồ tự động hiển thị." /></div></article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Revenue mix</p><h2 className="mt-1 text-lg font-black text-slate-900">Cơ cấu doanh thu</h2><div className="mt-6 space-y-5">{businessData.map((item,index)=><div key={item.label}><div className="mb-2 flex justify-between text-sm"><span className="font-bold text-slate-700">{item.label}</span><span className="font-extrabold text-slate-900">{item.amount}</span></div><ProgressBar value={item.value} tone={index===0?"orange":index===1?"blue":index===2?"green":"slate"} /><p className="mt-1.5 text-right text-[10px] font-bold text-slate-400">{item.value}%</p></div>)}</div></article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {["Hiệu suất đấu thầu", "Dòng tiền dự án", "Rủi ro vận hành"].map((title) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">{title}</h3><div className="mt-5"><EmptyBox title="Chưa có dữ liệu" description="Khu vực này sẽ tự tổng hợp khi đã nhập đủ dữ liệu nghiệp vụ liên quan." /></div></article>)}
      </section>
    </div>
  );
}
