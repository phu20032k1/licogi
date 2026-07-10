import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="ERP Workflow" subtitle="Quy trình phê duyệt liên phòng ban: thanh toán, hợp đồng, mua sắm, nghiệm thu, thay đổi thiết kế." endpoint="/api/erp" primaryKey="processes" createFields={[{ name: "kind", label: "Loại tạo", type: "text", placeholder: "process" },{ name: "name", label: "Tên quy trình", type: "text", placeholder: "Duyệt mua vật tư" },{ name: "module", label: "Module", type: "text", placeholder: "FINANCE" }]} />;
}
