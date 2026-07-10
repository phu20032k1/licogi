# LICOGI 18.3 OS - Bản nâng cấp dữ liệu thật

## 1. Điểm đã nâng

- Font toàn hệ thống ép về **Times New Roman** cho tiếng Việt.
- Bỏ dữ liệu dự án minh họa mặc định trong `src/data/projects.ts`.
- Bỏ dòng dữ liệu minh họa trong các file CSV template; template chỉ còn header để nhập dữ liệu thật.
- Thêm API dữ liệu thật mức nền:
  - `GET /api/data/[entity]`
  - `POST /api/data/[entity]`
  - `PATCH /api/data/[entity]`
  - `DELETE /api/data/[entity]`
- Dữ liệu được lưu vào thư mục `.licogi-data` theo từng bảng JSON khi chạy local/server riêng.
- Trung tâm dữ liệu `/data` đã có:
  - import CSV hàng loạt
  - dán CSV hàng loạt
  - chọn chế độ thêm vào bảng hiện có hoặc thay thế toàn bộ bảng
  - preview dữ liệu
  - kiểm tra lỗi cột bắt buộc
  - sửa từng ô trực tiếp
  - chọn nhiều dòng
  - sửa hàng loạt một trường
  - xóa hàng loạt
  - xóa toàn bộ bảng đang chọn
- Danh mục dự án `/projects`, Dashboard, GIS và Hồ sơ năng lực lấy dữ liệu từ Data Center thay vì dữ liệu minh họa.
- Tài khoản đăng nhập chuyển sang `/api/auth/login` và mật khẩu nằm trong `.env.local`.
- AI/RAG chưa nối, để sau đúng yêu cầu.

## 2. Cách chạy

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở:

```text
http://localhost:3000/login
```

## 3. Tài khoản/mật khẩu

| Vai trò | Email | Mật khẩu mặc định | Biến env |
|---|---|---|---|
| Super Admin IIP | iip.admin@licogi183.vn | IIP@2026! | LICOGI_SUPER_ADMIN_PASSWORD |
| System Admin Licogi | admin@licogi183.vn | Licogi@2026! | LICOGI_ADMIN_PASSWORD |
| Ban lãnh đạo | executive@licogi183.vn | Executive@2026! | LICOGI_EXECUTIVE_PASSWORD |
| Quản lý dự án | project.manager@licogi183.vn | Project@2026! | LICOGI_PM_PASSWORD |
| Chủ đầu tư | customer@licogi183.vn | Customer@2026! | LICOGI_CUSTOMER_PASSWORD |

## 4. Nhập dữ liệu thật

Vào:

```text
Trung tâm dữ liệu /data
```

Chọn bảng:

- Dự án
- Chủ đầu tư / khách hàng
- Nhân sự công trường
- Thiết bị thi công
- Bảo hành công trình
- Hồ sơ / bản vẽ

Sau đó:

1. Tải CSV cấu trúc.
2. Điền dữ liệu thật bằng Excel.
3. Lưu CSV UTF-8.
4. Upload file hoặc dán CSV vào ô “Thêm hàng loạt”.
5. Kiểm tra preview/lỗi.
6. Chọn “Thêm vào dữ liệu hiện có” hoặc “Thay thế toàn bộ bảng”.
7. Bấm xác nhận.

## 5. Sửa/xóa hàng loạt

Trong bảng dữ liệu hiện có:

- Tick chọn nhiều dòng.
- Chọn trường cần sửa.
- Nhập giá trị mới.
- Bấm “Sửa”.

Xóa hàng loạt:

- Tick chọn nhiều dòng.
- Bấm “Xóa”.

Xóa toàn bộ bảng:

- Bấm “Xóa toàn bộ bảng đang chọn”.

## 6. Lưu ý production

Bản này đã có API và storage JSON để chạy local/server riêng. Nếu deploy lên Vercel/serverless, file JSON có thể không bền vững sau mỗi lần deploy. Khi đưa khách dùng thật lâu dài, nên đổi storage sang PostgreSQL/Neon/Supabase bằng cùng các route API hiện có.
