# HƯỚNG DẪN CHẠY SẢN PHẨM THẬT + LẤY API KEY

Bản này có: Session table, phân quyền theo vai trò, upload file S3/MinIO, hợp đồng, thanh toán, công nợ, kế hoạch thi công, BIM, AI, GIS, tài chính, CRM và ERP workflow. Hệ thống không bắt đổi mật khẩu ở lần đăng nhập đầu tiên.

## 1. Chạy local

```bash
npm install
copy .env.example .env.local
# mac/linux: cp .env.example .env.local

docker compose up -d
npm run setup:db
npm run dev
```

Mở:

```text
http://localhost:3000/login
```

MinIO local:

```text
http://localhost:9001
user: licogi-minio
password: licogi-minio-secret
bucket: licogi-os
```

## 2. Tài khoản seed

```text
iip.admin@licogi183.vn / IIP@2026!
admin@licogi183.vn / Licogi@2026!
executive@licogi183.vn / Executive@2026!
project.manager@licogi183.vn / Project@2026!
engineer@licogi183.vn / Engineer@2026!
data@licogi183.vn / Data@2026!
customer@licogi183.vn / Customer@2026!
```

Sau khi đăng nhập, hệ thống tự đưa từng vai trò vào đúng trang mặc định:

```text
Admin          /admin
Ban lãnh đạo   /dashboard
Quản lý dự án  /projects
Kỹ sư          /construction
Data Steward   /data
Chủ đầu tư     /portal
```

## 3. Session table

Bảng:

```text
Session
- userId
- tokenHash
- ip
- userAgent
- deviceName
- expiresAt
- revokedAt
- lastSeenAt
```

API:

```http
GET /api/auth/me
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/change-password
GET /api/auth/sessions
DELETE /api/auth/sessions
```

## 4. Import dữ liệu

Vào:

```text
/data
```

Quy trình:

```text
Chọn bảng → Tải CSV → điền bằng Excel → Save CSV UTF-8 → Chọn file → Preview → Xác nhận thêm
```

Xem thêm:

```text
HUONG_DAN_IMPORT_NHAP_LIEU.md
```

## 5. Upload file S3/MinIO

Env:

```env
S3_ENDPOINT="http://localhost:9000"
S3_PUBLIC_BASE_URL="http://localhost:9000/licogi-os"
S3_REGION="us-east-1"
S3_BUCKET="licogi-os"
S3_ACCESS_KEY_ID="licogi-minio"
S3_SECRET_ACCESS_KEY="licogi-minio-secret"
S3_FORCE_PATH_STYLE="true"
MAX_UPLOAD_BYTES="50000000"
```

Upload bằng curl:

```bash
curl -X POST http://localhost:3000/api/uploads \
  -b "licogi_session=COOKIE_CUA_BAN" \
  -F "file=@./hop-dong.pdf" \
  -F "module=contracts"
```

## 6. Module API

| Module | Trang | API |
|---|---|---|
| Hợp đồng | `/contracts` | `/api/contracts` |
| Thanh toán | `/payments` | `/api/payments` |
| Công nợ | `/debt` | `/api/debt` |
| Kế hoạch thi công | `/planning` | `/api/planning` |
| BIM | `/bim` | `/api/bim` |
| AI Construction Brain | `/ai-brain` | `/api/ai-brain` |
| GIS | `/gis` | `/api/gis` |
| Tài chính kế toán | `/finance` | `/api/finance` |
| CRM | `/crm` | `/api/crm` |
| ERP Workflow | `/erp` | `/api/erp` |
| Kho file | `/storage` | `/api/uploads` |

API dùng RBAC. Role không có quyền sẽ trả 403.

## 7. Lấy API key ở đâu

### AWS S3

```text
AWS Console → S3 → Create bucket
AWS Console → IAM → Users/Roles → cấp quyền bucket
Security credentials → Create access key
```

### MinIO

```text
MinIO Console → Buckets → Create bucket
MinIO Console → Access Keys → Create access key
```

### OpenAI API cho AI Brain

```text
platform.openai.com → Project → API keys → Create new secret key
```

Env:

```env
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-5.5-thinking"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
```

### Google Maps API cho GIS

```text
Google Cloud Console → APIs & Services → Enable Maps JavaScript API
Credentials → Create credentials → API key
Restrict key theo domain app
```

Env:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

### Autodesk APS cho BIM

```text
Autodesk Platform Services → Create App
Lấy Client ID và Client Secret
```

Env:

```env
AUTODESK_CLIENT_ID="..."
AUTODESK_CLIENT_SECRET="..."
AUTODESK_BUCKET_KEY="licogi-os-bim"
```

## 8. Deploy production bằng Docker

```bash
copy .env.production.example .env.production
# sửa mật khẩu và API key trong .env.production

docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

Kiểm tra:

```bash
curl http://localhost:3000/api/health
```
