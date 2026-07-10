import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="Hợp đồng" subtitle="Quản lý hợp đồng EPC, phụ lục, giá trị, VAT, giữ lại bảo hành và liên kết dự án/chủ đầu tư." endpoint="/api/contracts" primaryKey="contracts" createFields={[{ name: "title", label: "Tên hợp đồng", type: "text", placeholder: "Hợp đồng EPC nhà máy FDI" },{ name: "contractNo", label: "Số hợp đồng", type: "text", placeholder: "18.3/EPC/2026/002" },{ name: "valueVnd", label: "Giá trị VND", type: "number", placeholder: "150000000000" },{ name: "status", label: "Trạng thái", type: "text", placeholder: "SIGNED" }]} />;
}
