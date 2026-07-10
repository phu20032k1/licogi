# Hướng dẫn phân quyền theo vai trò

## Nguyên tắc mới

- **Admin / System Admin / Super Admin**: xem và quản trị **toàn bộ chức năng** trong hệ thống.
- **Ban lãnh đạo**: xem dashboard, báo cáo, tài chính, CRM, ERP, hợp đồng, thanh toán, công nợ, AI.
- **Quản lý dự án**: quản lý dự án được phân công, kế hoạch thi công, hợp đồng, thanh toán, công nợ, BIM, AI, hồ sơ.
- **Kỹ sư công trường**: dùng các chức năng kỹ thuật như điều hành thi công, kế hoạch, công việc, tài liệu, BIM, GIS, bảo hành.
- **Data Steward**: nhập liệu, làm sạch dữ liệu, tài liệu, kho file, AI và nhật ký liên quan dữ liệu.
- **Chủ đầu tư**: chỉ xem portal, dự án/hồ sơ/bảo hành thuộc phạm vi của mình.

## Admin xem tất cả

Tài khoản:

```txt
admin@licogi183.vn / Licogi@2026!
iip.admin@licogi183.vn / IIP@2026!
```

Sau khi đăng nhập, Admin có thể vào tất cả menu:

```txt
/dashboard
/projects
/gis
/planning
/construction
/tasks
/contracts
/payments
/debt
/finance
/crm
/erp
/data
/documents
/storage
/bim
/ai-brain
/ai-profile
/warranty
/portal
/partners
/reports
/users
/activity
/admin
/settings
```

## Kiểm thử nhanh

1. Đăng nhập `admin@licogi183.vn`.
2. Kiểm tra sidebar phải hiện đầy đủ nhóm menu.
3. Mở thử `/contracts`, `/planning`, `/bim`, `/finance`, `/crm`, `/users`.
4. Không được bị đá về `/admin`.
5. Đăng nhập `engineer@licogi183.vn` để kiểm tra kỹ sư chỉ thấy nhóm chức năng kỹ thuật.

## Lưu ý khi đã có database cũ

Bản này đã cho Admin toàn quyền bằng code, nên không bắt buộc seed lại để Admin thấy menu.

Nếu muốn dữ liệu quyền trong database cũng đầy đủ lại từ đầu, chạy:

```bash
npm run setup:db
```

hoặc reset database local rồi seed lại:

```bash
npx prisma migrate reset
```
