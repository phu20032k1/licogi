import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="BIM" subtitle="Quản lý mô hình BIM, version, discipline, URN Autodesk APS hoặc link viewer nội bộ." endpoint="/api/bim" primaryKey="models" createFields={[{ name: "name", label: "Tên model", type: "text", placeholder: "BIM tổng thể" },{ name: "version", label: "Phiên bản", type: "text", placeholder: "v1" },{ name: "discipline", label: "Bộ môn", type: "text", placeholder: "STRUCT/MEP" },{ name: "modelUrl", label: "URL model", type: "text", placeholder: "" }]} />;
}
