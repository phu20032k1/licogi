import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="AI Construction Brain" subtitle="Kho tri thức cho RAG: hồ sơ dự án, thiết bị, nhân sự, hợp đồng, nhật ký, BIM và tài liệu thi công." endpoint="/api/ai-brain" primaryKey="knowledge" createFields={[{ name: "title", label: "Tiêu đề tri thức", type: "text", placeholder: "Quy trình nghiệm thu móng" },{ name: "sourceType", label: "Nguồn", type: "text", placeholder: "DOCUMENT" },{ name: "summary", label: "Tóm tắt", type: "textarea", placeholder: "" },{ name: "contentText", label: "Nội dung", type: "textarea", placeholder: "" }]} />;
}
