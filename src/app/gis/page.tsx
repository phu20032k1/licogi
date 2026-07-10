import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="GIS Map Data" subtitle="Layer/feature GIS, dữ liệu tọa độ dự án và cấu hình Google Maps/Leaflet." endpoint="/api/gis" primaryKey="layers" createFields={[{ name: "kind", label: "Loại tạo", type: "text", placeholder: "layer" },{ name: "name", label: "Tên layer", type: "text", placeholder: "Khu công nghiệp miền Bắc" },{ name: "layerType", label: "Kiểu layer", type: "text", placeholder: "PROJECT" }]} />;
}
