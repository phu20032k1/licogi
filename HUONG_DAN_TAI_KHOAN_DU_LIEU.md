# HƯỚNG DẪN TÀI KHOẢN, DỮ LIỆU VÀ IMPORT

## 1. Tài khoản seed

| Vai trò | Email | Mật khẩu mặc định |
|---|---|---|
| Super Admin IIP | iip.admin@licogi183.vn | IIP@2026! |
| System Admin Licogi | admin@licogi183.vn | Licogi@2026! |
| Ban lãnh đạo | executive@licogi183.vn | Executive@2026! |
| Quản lý dự án | project.manager@licogi183.vn | Project@2026! |
| Kỹ sư công trường | engineer@licogi183.vn | Engineer@2026! |
| Data Steward | data@licogi183.vn | Data@2026! |
| Chủ đầu tư | customer@licogi183.vn | Customer@2026! |

Hệ thống không bắt đổi mật khẩu lần đầu. Quản trị viên có thể đổi mật khẩu thủ công trong `/users`.

## 2. Nhập liệu

Vào:

```text
/data
```

Quy trình:

```text
Tải CSV mẫu → điền bằng Excel → lưu CSV UTF-8 → chọn file → hệ thống kiểm tra lỗi → xác nhận nhập
```

Các file mẫu nằm trong:

```text
public/templates/
```

Gồm:

- licogi_projects_template.csv
- licogi_customers_template.csv
- licogi_employees_template.csv
- licogi_equipment_template.csv
- licogi_warranty_template.csv
- licogi_documents_template.csv

## 3. Trạng thái dự án chuẩn

```text
ongoing
completed
warranty
planning
```
