# LICOGI 18.3 Industrial Construction OS

Bản này đã nâng lên nền tảng Prisma Database + PostgreSQL, có đăng nhập bằng database, RBAC theo module/action và ownership theo dữ liệu.

## Chạy nhanh

```bash
npm install
docker compose up -d
copy .env.example .env.local
npm run setup:db
npm run dev
```

Xem chi tiết trong `HUONG_DAN_PRISMA_DATABASE_RBAC.md`.

## Cập nhật phân quyền Admin

Admin/System Admin/Super Admin có toàn quyền xem và thao tác tất cả module. Các vai trò còn lại vẫn được tách menu và chức năng theo đúng nghiệp vụ.
