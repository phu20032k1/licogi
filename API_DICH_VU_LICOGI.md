# Hướng dẫn lấy API dịch vụ cho LICOGI 18.3 OS

## 1. Bản đồ GIS
- Demo hiện dùng OpenStreetMap + Leaflet, chưa cần key.
- Khi lên production nên chọn Mapbox hoặc Google Maps Platform để có geocoding, routing và quota ổn định.
- Việc cần làm: tạo tài khoản nhà cung cấp, tạo project/app, bật Maps/Geocoding, copy key vào `.env.local`.

Biến môi trường:
```env
NEXT_PUBLIC_MAP_PROVIDER="mapbox"
NEXT_PUBLIC_MAPBOX_TOKEN="..."
GOOGLE_MAPS_API_KEY="..."
```

## 2. AI / RAG / hồ sơ năng lực
- Dùng OpenAI API hoặc Azure OpenAI để làm AI Construction Brain, hỏi đáp dữ liệu dự án và tạo hồ sơ năng lực.
- Cần thêm vector database nếu muốn RAG thật: Supabase Vector, pgvector, Pinecone, Qdrant hoặc Weaviate.

```env
OPENAI_API_KEY="..."
OPENAI_MODEL="gpt-4.1-mini"
VECTOR_DATABASE_URL="..."
```

## 3. Dịch đa ngôn ngữ
- Nên dùng Google Cloud Translation, Azure AI Translator, DeepL API hoặc AWS Translate.
- Hồ sơ thầu quan trọng nên có bước người duyệt bản dịch trước khi xuất PDF.

```env
TRANSLATION_PROVIDER="google"
GOOGLE_TRANSLATE_API_KEY="..."
DEEPL_API_KEY="..."
AZURE_TRANSLATOR_KEY="..."
```

## 4. OTP / đăng nhập bằng số điện thoại
- Có thể dùng Firebase Authentication, Twilio Verify, Zalo ZNS hoặc nhà cung cấp SMS Việt Nam.
- Nếu dùng SMS brandname ở Việt Nam, cần đăng ký brandname và mẫu tin nhắn.

```env
OTP_PROVIDER="firebase"
FIREBASE_API_KEY="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
```

## 5. Lưu trữ ảnh/video/hồ sơ
- Dùng AWS S3, Cloudflare R2, Google Cloud Storage hoặc Azure Blob Storage.
- Không lưu file lớn trực tiếp trong database; chỉ lưu metadata + signed URL.

```env
STORAGE_PROVIDER="s3"
S3_BUCKET="licogi183-data"
S3_REGION="ap-southeast-1"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
```

## 6. Database / Data Lake
- Bản demo dùng localStorage để chạy nhanh.
- Production nên dùng PostgreSQL + Prisma, có backup tự động và phân quyền.

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
REDIS_URL="..."
```

## 7. Email / thông báo
- Dùng Resend, SendGrid, Postmark hoặc Amazon SES.
- Cần xác thực DNS SPF/DKIM để tránh vào spam.

```env
EMAIL_PROVIDER="resend"
EMAIL_API_KEY="..."
EMAIL_FROM="LICOGI 18.3 <no-reply@licogi183.vn>"
```

## 8. BIM / bản vẽ
- Dùng Autodesk Platform Services hoặc ACC/BIM 360 khi cần xem model BIM trên web.
- Nên triển khai sau khi mã hóa bản vẽ, revision và quyền truy cập đã ổn.

```env
AUTODESK_CLIENT_ID="..."
AUTODESK_CLIENT_SECRET="..."
BIM_PROJECT_ID="..."
```

## Thứ tự ưu tiên triển khai thật
1. Database PostgreSQL + Prisma
2. Auth/OTP + phân quyền
3. Storage ảnh/video/hồ sơ
4. Map geocoding
5. AI/RAG
6. Translation
7. Email/SMS/Zalo notification
8. BIM viewer
