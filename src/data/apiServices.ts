export type ApiService = {
  group: string;
  purpose: string;
  recommended: string[];
  envKeys: string[];
  whereToGet: string;
  notes: string;
};

export const apiServices: ApiService[] = [
  {
    group: "Bản đồ GIS / tọa độ",
    purpose: "Hiển thị bản đồ, marker dự án, geocoding địa chỉ, route đến công trường.",
    recommended: ["OpenStreetMap + Leaflet", "Mapbox", "Google Maps Platform", "HERE Maps"],
    envKeys: ["NEXT_PUBLIC_MAP_PROVIDER", "NEXT_PUBLIC_MAPBOX_TOKEN", "GOOGLE_MAPS_API_KEY"],
    whereToGet: "Tạo tài khoản nhà cung cấp bản đồ, tạo project/app, bật dịch vụ Maps/Geocoding, copy API key vào .env.local.",
    notes: "Hiện dùng OpenStreetMap/Leaflet miễn phí; production nên có Mapbox hoặc Google Maps để geocoding ổn định.",
  },
  {
    group: "AI / RAG / tạo hồ sơ năng lực (để sau)",
    purpose: "Nhóm dịch vụ để nối sau: hỏi đáp dữ liệu dự án, tạo profile đa ngôn ngữ và phân tích rủi ro.",
    recommended: ["OpenAI API", "Azure OpenAI", "Google Gemini API"],
    envKeys: ["OPENAI_API_KEY", "OPENAI_MODEL", "VECTOR_DATABASE_URL"],
    whereToGet: "Tạo API key trong trang nhà cung cấp AI, cấu hình model và giới hạn chi phí, sau đó nối vào route /api/ai.",
    notes: "Cần tách dữ liệu nội bộ, phân quyền và log prompt trước khi cho người dùng thật sử dụng.",
  },
  {
    group: "Dịch đa ngôn ngữ",
    purpose: "Dịch hồ sơ năng lực sang Anh, Trung, Nhật, Hàn cho khách FDI.",
    recommended: ["Google Cloud Translation", "Azure AI Translator", "DeepL API", "AWS Translate"],
    envKeys: ["TRANSLATION_PROVIDER", "GOOGLE_TRANSLATE_API_KEY", "DEEPL_API_KEY", "AZURE_TRANSLATOR_KEY"],
    whereToGet: "Tạo tài khoản cloud/DeepL, bật dịch vụ Translate, tạo API key, gắn region nếu dùng Azure/AWS.",
    notes: "Nên có bước người duyệt bản dịch với các hồ sơ pháp lý hoặc hồ sơ thầu quan trọng.",
  },
  {
    group: "Đăng nhập OTP / người dùng",
    purpose: "Đăng nhập bằng số điện thoại, OTP cho nhân sự, đại lý/chủ đầu tư, phân quyền.",
    recommended: ["Firebase Authentication", "Twilio Verify", "Zalo ZNS", "FPT SMS", "VietGuys"],
    envKeys: ["AUTH_SECRET", "OTP_PROVIDER", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "FIREBASE_API_KEY"],
    whereToGet: "Chọn nhà cung cấp SMS/OTP, đăng ký brandname nếu cần, lấy key/secret và cấu hình callback.",
    notes: "Với Việt Nam nên kiểm tra SMS brandname, Zalo ZNS và quy định xác thực số điện thoại.",
  },
  {
    group: "Lưu trữ ảnh/video/hồ sơ",
    purpose: "Lưu ảnh công trường, video flycam, bản vẽ, biên bản, hồ sơ hoàn công.",
    recommended: ["AWS S3", "Cloudflare R2", "Google Cloud Storage", "Azure Blob Storage"],
    envKeys: ["STORAGE_PROVIDER", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"],
    whereToGet: "Tạo bucket lưu trữ, tạo access key giới hạn quyền, cấu hình CORS và signed URL upload/download.",
    notes: "Không nên lưu file lớn trực tiếp trong database; chỉ lưu metadata và URL có thời hạn.",
  },
  {
    group: "Cơ sở dữ liệu / Data Lake",
    purpose: "Lưu dự án, tiến độ, người dùng, bảo hành, đối tác, nhật ký, quyền truy cập.",
    recommended: ["PostgreSQL", "Neon", "Supabase", "RDS", "SQL Server"],
    envKeys: ["DATABASE_URL", "DIRECT_URL", "REDIS_URL"],
    whereToGet: "Tạo database PostgreSQL/Supabase/Neon, copy connection string, chạy Prisma migration/seed.",
    notes: "Hệ thống hiện có API lưu JSON nội bộ; production nên chuyển sang PostgreSQL + backup định kỳ.",
  },
  {
    group: "Email / thông báo",
    purpose: "Gửi cảnh báo SLA, phê duyệt, báo cáo tuần, chia sẻ hồ sơ PDF.",
    recommended: ["SendGrid", "Amazon SES", "Resend", "Postmark"],
    envKeys: ["EMAIL_PROVIDER", "EMAIL_API_KEY", "EMAIL_FROM"],
    whereToGet: "Tạo domain gửi mail, xác thực DNS SPF/DKIM, lấy API key và cấu hình sender.",
    notes: "Thông báo nội bộ có thể dùng email trước, sau đó thêm Zalo/Slack/Teams webhook.",
  },
  {
    group: "BIM / bản vẽ / viewer",
    purpose: "Xem mô hình BIM, quản lý bản vẽ, version, liên kết RFI và nghiệm thu.",
    recommended: ["Autodesk Platform Services", "Autodesk BIM 360 / ACC", "Speckle"],
    envKeys: ["AUTODESK_CLIENT_ID", "AUTODESK_CLIENT_SECRET", "BIM_PROJECT_ID"],
    whereToGet: "Tạo app developer ở nhà cung cấp BIM, cấp quyền đọc model/document, lưu client id/secret.",
    notes: "Nên làm sau khi kho bản vẽ số đã có quy tắc mã hóa và version rõ ràng.",
  },
];
