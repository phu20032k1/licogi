import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="CRM" subtitle="Lead, cơ hội, pipeline chủ đầu tư FDI, nguồn khách hàng và xác suất trúng thầu." endpoint="/api/crm" primaryKey="leads" createFields={[{ name: "companyName", label: "Công ty lead", type: "text", placeholder: "Nhà đầu tư FDI" },{ name: "contactName", label: "Người liên hệ", type: "text", placeholder: "Mr. Lee" },{ name: "country", label: "Quốc gia", type: "text", placeholder: "Korea" },{ name: "estimatedValueVnd", label: "Giá trị dự kiến", type: "number", placeholder: "200000000000" }]} />;
}
