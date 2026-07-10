# Bản nâng cấp A-Z

## Đã nâng trong bản này

1. Giao diện chuyên nghiệp hơn
- Đổi toàn bộ font sang Times New Roman.
- Làm lại nền, card, panel, shadow theo phong cách web doanh nghiệp.
- Giảm hiệu ứng kiểu demo/AI, giữ chuyển động mượt và hover vừa đủ.
- Đổi wording giao diện chính: Hồ sơ năng lực, Trung tâm dữ liệu, Tóm tắt năng lực.

2. Đăng nhập và tài khoản demo
- Thêm trang `/login`.
- Bắt buộc đăng nhập trước khi vào hệ thống.
- Thêm API mock `/api/auth/demo`.
- Mật khẩu có thể đổi trong `.env.local`.
- Trang `/users` hiển thị rõ tài khoản, mật khẩu mặc định và biến env tương ứng.

3. Trung tâm dữ liệu
- Thêm menu `/data` - Trung tâm dữ liệu & nhập liệu.
- Có 6 nhóm dữ liệu: dự án, khách hàng, nhân sự, thiết bị, bảo hành, hồ sơ/bản vẽ.
- Có cấu trúc cột bắt buộc, ví dụ dữ liệu, checklist nhập liệu.
- Có upload CSV, đọc file, preview, kiểm tra lỗi và chặn import nếu sai.
- Thêm file mẫu CSV trong `public/templates`.

4. Dữ liệu/API
- Thêm `/api/data` trả danh sách entity, checklist và tài khoản demo không lộ mật khẩu.
- Giữ `/api/projects`, `/api/dashboard`, `/api/services`.
- `.env.example` đã có đầy đủ biến cho demo login, database, auth/OTP, map, storage, dịch, email, BIM, AI/RAG để nối sau.

## Cách chạy

```bash
npm install
npm run dev
```

Mở:

```text
http://localhost:3000/login
```

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Super Admin IIP | iip.admin@licogi183.vn | IIP@2026! |
| System Admin Licogi | admin@licogi183.vn | Licogi@2026! |
| Ban lãnh đạo | executive@licogi183.vn | Executive@2026! |
| Quản lý dự án | project.manager@licogi183.vn | Project@2026! |
| Chủ đầu tư | customer@licogi183.vn | Customer@2026! |

## Đổi mật khẩu bằng env

```bash
cp .env.example .env.local
```

Sửa các biến:

```text
DEMO_SUPER_ADMIN_PASSWORD=
DEMO_ADMIN_PASSWORD=
DEMO_EXECUTIVE_PASSWORD=
DEMO_PM_PASSWORD=
DEMO_CUSTOMER_PASSWORD=
```

## Kiểm tra đã thực hiện

```bash
npm run lint
npm run build
```

Kết quả: build thành công.
