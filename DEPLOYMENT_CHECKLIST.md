# Deployment Checklist

- [ ] `NEXT_PUBLIC_SITE_URL` trỏ đúng domain HTTPS.
- [ ] PostgreSQL có backup/retention phù hợp.
- [ ] S3/MinIO bucket và public file domain đã cấu hình.
- [ ] Tile provider GIS phù hợp chính sách sử dụng và lưu lượng thực tế.
- [ ] Chạy `pnpm run prod:check`.
- [ ] Chạy `pnpm exec prisma validate`.
- [ ] Chạy `pnpm run check`.
- [ ] Production build thành công.
- [ ] `GET /api/health` trả database `up`.
- [ ] `GET /api/ready` trả `ready: true`.
- [ ] Test tạo/sửa/xóa dự án và kiểm tra lại sau refresh.
- [ ] Test import Data Center và kiểm tra GIS public/admin.
- [ ] Test upload file qua S3-compatible storage.
- [ ] Test quyền của ít nhất một role không phải Admin.
- [ ] Xác nhận đăng nhập demo vẫn được giữ nếu môi trường này dùng để trình diễn.
- [ ] Khi chuyển sang người dùng thật, tách demo seed khỏi startup và dùng quy trình cấp tài khoản phù hợp.
