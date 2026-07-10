# HƯỚNG DẪN IMPORT / NHẬP LIỆU

## 1. Nhập liệu ở đâu?

Đăng nhập bằng tài khoản có quyền nhập liệu, sau đó vào:

```text
/data
```

Trên menu bên trái, trang này có tên:

```text
Trung tâm dữ liệu
```

Tài khoản nên dùng để import:

```text
data@licogi183.vn / Data@2026!
admin@licogi183.vn / Licogi@2026!
```

## 2. Import bằng CSV

Quy trình chuẩn:

```text
/data
→ Chọn bảng cần nhập: Dự án / Chủ đầu tư / Nhân sự / Thiết bị / Hồ sơ / Bảo hành
→ Bấm “Tải CSV” hoặc “Tải cấu trúc CSV”
→ Mở file bằng Excel
→ Điền dữ liệu thật
→ Save As CSV UTF-8
→ Quay lại /data
→ Bấm “Chọn file”
→ Hệ thống preview dữ liệu
→ Nếu không lỗi, bấm “Xác nhận thêm”
```

## 3. Import bằng cách dán nhanh

Dùng khi có ít dữ liệu hoặc đang test:

```text
/data
→ Chọn bảng cần nhập
→ Dán dữ liệu CSV vào ô “Thêm hàng loạt”
→ Bấm “Kiểm tra dữ liệu dán”
→ Bấm “Xác nhận thêm”
```

Ví dụ dự án:

```csv
project_code,project_name,customer_code,type,province,status,progress,contract_value_vnd,lat,lng
DA-2026-001,Nhà máy ABC Bắc Ninh,CUS-ABC,Industrial Factory,Bắc Ninh,ongoing,35,500000000000,21.186,106.076
```

## 4. Chế độ nhập

Có 2 chế độ:

```text
Thêm vào dữ liệu hiện có
```

Dùng khi muốn thêm dữ liệu mới.

```text
Thay thế toàn bộ bảng
```

Dùng khi muốn xóa dữ liệu cũ của bảng đang chọn và nạp lại từ đầu.

## 5. Các bảng có thể import

```text
projects    Dự án
customers   Chủ đầu tư / khách hàng
employees   Nhân sự / nhóm năng lực
 equipment  Thiết bị / máy móc
documents   Hồ sơ / bản vẽ / tài liệu
warranty    Bảo hành / yêu cầu sau bàn giao
```

## 6. Sửa dữ liệu sau khi import

Trong `/data`, kéo xuống phần:

```text
Dữ liệu hiện có
```

Có thể:

```text
- Sửa trực tiếp từng ô
- Chọn nhiều dòng rồi sửa hàng loạt
- Xóa dòng đã chọn
- Xóa toàn bộ bảng đang chọn
```

## 7. Kiểm tra import đã vào database chưa

Chạy:

```bash
npx prisma studio
```

Mở:

```text
http://localhost:5555
```

Kiểm tra các bảng:

```text
Project
Customer
Employee
Equipment
Document
WarrantyTicket
```

---

## Ai được import?

- Admin: import được tất cả bảng dữ liệu.
- Data Steward: import dữ liệu theo phạm vi được giao.
- Các vai trò khác: chỉ xem hoặc nhập dữ liệu nghiệp vụ trong chức năng của họ, không import toàn hệ thống.
