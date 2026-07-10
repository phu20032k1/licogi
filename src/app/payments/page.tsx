import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="Thanh toán" subtitle="Đề nghị thanh toán, nghiệm thu, hóa đơn, phê duyệt và theo dõi đã thanh toán/chưa thanh toán." endpoint="/api/payments" primaryKey="payments" createFields={[{ name: "title", label: "Tiêu đề", type: "text", placeholder: "Đề nghị thanh toán đợt 2" },{ name: "phase", label: "Giai đoạn", type: "text", placeholder: "Nghiệm thu móng" },{ name: "amountVnd", label: "Số tiền VND", type: "number", placeholder: "25000000000" },{ name: "status", label: "Trạng thái", type: "text", placeholder: "REQUESTED" }]} />;
}
