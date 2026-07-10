# HƯỚNG DẪN CHẠY LICOGI 18.3 OS

Bản này tập trung vào vận hành thật:

- Đăng nhập bằng PostgreSQL + Prisma.
- User / Role / Permission / ModuleOwnership nằm trong database.
- Mỗi vai trò chỉ thấy đúng nhóm chức năng của mình.
- Không bắt đổi mật khẩu ở lần đăng nhập đầu tiên.
- `/data` dùng để import/nhập dữ liệu nghiệp vụ.
- `/admin` dùng cho quản trị hệ thống nội bộ.

## 1. Chạy local

```bash
npm install
copy .env.example .env.local
```

Sửa `.env.local` tối thiểu:

```env
DATABASE_URL="postgresql://licogi:licogi123@localhost:5432/licogi_os?schema=public"
JWT_SECRET="doi_chuoi_nay_that_dai_toi_thieu_32_ky_tu"
```

Bật database:

```bash
docker compose up -d
npm run setup:db
npm run dev
```

Mở:

```text
http://localhost:3000/login
```

## 2. Tài khoản seed

```text
admin@licogi183.vn / Licogi@2026!
iip.admin@licogi183.vn / IIP@2026!
executive@licogi183.vn / Executive@2026!
project.manager@licogi183.vn / Project@2026!
engineer@licogi183.vn / Engineer@2026!
data@licogi183.vn / Data@2026!
customer@licogi183.vn / Customer@2026!
```

## 3. Test theo vai trò

```text
Admin          → /admin, /users, /data, /storage, /activity, /settings
Kỹ sư          → /construction, /planning, /tasks, /documents, /storage, /bim
Quản lý dự án  → /projects, /planning, /construction, /contracts, /payments, /debt
Data Steward   → /data, /documents, /storage, /ai-brain
Ban lãnh đạo   → /dashboard, /reports, /finance, /crm, /erp
Chủ đầu tư     → /portal, /projects, /documents, /warranty
```

## 4. Nhập liệu ở đâu?

Vào:

```text
/data
```

Làm theo quy trình:

```text
Chọn bảng → Tải CSV → điền dữ liệu → Chọn file → Preview → Xác nhận thêm
```

Chi tiết nằm ở:

```text
HUONG_DAN_IMPORT_NHAP_LIEU.md
```

## 5. Kiểm tra database

```bash
npx prisma studio
```

Mở:

```text
http://localhost:5555
```

## 6. Chạy production bằng Docker

```bash
copy .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

Kiểm tra:

```bash
curl http://localhost:3000/api/health
```
