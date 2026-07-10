import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="Công nợ" subtitle="Sổ công nợ phải thu/phải trả theo hợp đồng, đề nghị thanh toán và hạn đến hạn/quá hạn." endpoint="/api/debt" primaryKey="debts" createFields={[{ name: "partnerName", label: "Đối tác", type: "text", placeholder: "Chủ đầu tư FDI" },{ name: "type", label: "Loại", type: "text", placeholder: "RECEIVABLE" },{ name: "amountVnd", label: "Số tiền VND", type: "number", placeholder: "25000000000" },{ name: "dueDate", label: "Hạn thanh toán", type: "date", placeholder: "" }]} />;
}
