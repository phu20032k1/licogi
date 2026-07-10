import EnterpriseModuleConsole from "../../components/EnterpriseModuleConsole";

export default function Page() {
  return <EnterpriseModuleConsole title="Kho file S3/MinIO" subtitle="Danh sách file đã upload thật lên S3-compatible storage. Upload file bằng form ở dưới hoặc API multipart." endpoint="/api/uploads" primaryKey="files" createFields={[]} note={'Muốn upload: dùng Postman/cURL gửi multipart POST /api/uploads với field file, module, projectId. Trang này hiển thị file đã upload.'} />;
}
