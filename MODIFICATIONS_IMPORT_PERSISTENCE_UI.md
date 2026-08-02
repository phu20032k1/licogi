# Các thay đổi đã thực hiện

## 1. Dữ liệu không còn “tạo xong F5 là mất” ở các màn đã sửa
- Công việc: tạo mới ghi qua `/api/tasks` vào Prisma `Task`.
- Bảo hành: tạo mới ghi qua Data Center API/Prisma `WarrantyTicket`.
- Dự án, tài liệu và Data Center: gộp dữ liệu server với bản fallback cục bộ khi API tạm lỗi.
- Data Center: các dòng mới đang nhập nhưng chưa bấm Lưu được lưu nháp theo từng bảng trong localStorage và tự khôi phục sau refresh.
- Hồ sơ/tài liệu: tải lại dữ liệu từ API sau khi tạo/import để bản ghi vừa lưu vẫn xuất hiện sau refresh.
- Đối tác: hiện chưa có model Partner trong Prisma; bản sửa lưu bền trong localStorage của trình duyệt thay vì state tạm.

## 2. Import hàng loạt
Đã thêm component dùng chung `BulkImportPanel`:
- Chọn CSV/TXT.
- Dán trực tiếp bảng copy từ Excel (tab/comma/semicolon).
- Tải file CSV mẫu.
- Kiểm tra trường bắt buộc.

Import được đặt ngay tại luồng tạo mới của:
- Dự án.
- Công việc.
- Bảo hành.
- Tài khoản.
- Đối tác.
- Hồ sơ/tài liệu.
- Các module dùng `EnterpriseModuleConsole` như hợp đồng, thanh toán, công nợ, CRM, ERP, tài chính, kế hoạch, BIM, AI Brain (tùy cấu hình createFields của từng trang).

## 3. Giao diện desktop gọn hơn
- Sidebar desktop: 290px -> 260px, collapsed 88px -> 76px.
- Topbar: 82px -> 72px.
- Giảm padding, font và chiều cao các control ở desktop.
- Mở rộng vùng nội dung tối đa lên 1820px.
- Bảng hiển thị dày hơn để nhìn được nhiều dữ liệu mà không cần zoom trình duyệt.

## 4. Node / Prisma
- `package.json`: Node `24.x`.
- `package-lock.json`: đồng bộ root engines sang Node `24.x`.
- Bỏ cấu hình seed Prisma cũ trong `package.json`.
- Thêm `prisma.config.ts` với `migrations.seed`.

## 5. Kiểm tra đã chạy
- Quét cú pháp toàn bộ 102 file `.ts/.tsx`: 0 lỗi parse.
- Kiểm tra các relative import của nhóm file sửa: resolve đầy đủ.
- Không chạy được `npm ci`/`next build` đầy đủ trong sandbox do bước cài dependencies bị timeout; cần chạy lại trên máy/Vercel có dependencies.

## Lệnh kiểm tra sau khi giải nén
```bash
npm install
npm run build
npm run dev
```
