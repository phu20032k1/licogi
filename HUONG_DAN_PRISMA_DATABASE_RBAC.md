# Hướng dẫn chạy bản Prisma Database + RBAC Ownership

## 1. Cài dependency mới
```bash
npm install
```

## 2. Chạy PostgreSQL local
```bash
docker compose up -d
copy .env.example .env.local
```

Nếu dùng Neon/Supabase/PostgreSQL thật thì sửa `DATABASE_URL` trong `.env.local`.

## 3. Tạo database, generate Prisma và nạp dữ liệu Licogi
```bash
npm run setup:db
```

Lệnh này chạy lần lượt:
- `prisma generate`
- `prisma db push`
- `prisma db seed`

## 4. Chạy hệ thống
```bash
npm run dev
```
Mở `http://localhost:3000`.

## 5. Tài khoản test sau khi seed
| Vai trò | Email | Mật khẩu |
|---|---|---|
| Super Admin IIP | iip.admin@licogi183.vn | IIP@2026! |
| System Admin Licogi | admin@licogi183.vn | Licogi@2026! |
| Ban lãnh đạo | executive@licogi183.vn | Executive@2026! |
| Quản lý dự án | project.manager@licogi183.vn | Project@2026! |
| Kỹ thuật công trường | engineer@licogi183.vn | Engineer@2026! |
| Data Steward | data@licogi183.vn | Data@2026! |
| Chủ đầu tư | customer@licogi183.vn | Customer@2026! |

## 6. Những phần đã nâng
- Prisma schema PostgreSQL cho Organization, Department, User, Role, Permission, RolePermission, Project, Customer, Employee, Equipment, Document, WarrantyTicket, Task, ModuleOwnership, AuditLog.
- Đăng nhập bằng database, hash mật khẩu PBKDF2, cookie httpOnly.
- Middleware bảo vệ trang và API.
- RBAC theo từng module và từng action: VIEW, CREATE, UPDATE, DELETE, APPROVE, IMPORT, EXPORT, MANAGE.
- Ownership/data scope: ALL, DEPARTMENT, ASSIGNED, OWN, CUSTOMER.
- Data Center không còn ghi `.licogi-data/*.json`; các API đã chuyển sang Prisma.
- Seed dữ liệu từ các file đã gửi: danh sách dự án Excel, nhân sự, thiết bị và hồ sơ đề án.
- API mới: `/api/auth/me`, `/api/auth/logout`, `/api/rbac`, `/api/users`, `/api/activity`.

## 7. Kiểm tra nhanh
```bash
npm run db:studio
```
Mở Prisma Studio để xem bảng dữ liệu, quyền và ownership.
