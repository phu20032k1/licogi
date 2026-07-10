import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="Tài chính kế toán" subtitle="Hệ thống tài khoản, bút toán, liên kết hợp đồng/thanh toán/công nợ để tiến tới ERP kế toán." endpoint="/api/finance" primaryKey="accounts" createFields={[{ name: "kind", label: "Loại tạo", type: "text", placeholder: "account" },{ name: "code", label: "Mã tài khoản", type: "text", placeholder: "131" },{ name: "name", label: "Tên tài khoản", type: "text", placeholder: "Phải thu khách hàng" },{ name: "type", label: "Nhóm", type: "text", placeholder: "ASSET" }]} />;
}
