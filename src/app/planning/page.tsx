import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="Kế hoạch thi công" subtitle="WBS, tiến độ baseline/forecast, nhật ký công trường, nhân lực/thiết bị theo ngày." endpoint="/api/planning" primaryKey="plans" createFields={[{ name: "projectId", label: "Project ID", type: "text", placeholder: "Dán projectId từ JSON" },{ name: "name", label: "Tên kế hoạch", type: "text", placeholder: "Kế hoạch thi công tổng thể" },{ name: "baselineStart", label: "Ngày bắt đầu", type: "date", placeholder: "" },{ name: "baselineFinish", label: "Ngày kết thúc", type: "date", placeholder: "" }]} />;
}
