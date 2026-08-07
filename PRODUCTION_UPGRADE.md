# LICOGI 18.3 — Production Upgrade

Nhánh triển khai: `agent/production-complete`

## Phạm vi

Mục tiêu của gói này là đưa dự án từ trạng thái demo/prototype lên cấu trúc gần production nhất có thể mà vẫn **giữ nguyên luồng đăng nhập demo** để truy cập nhanh theo yêu cầu.

## Các nâng cấp đã thực hiện

### Runtime & deploy

- Đồng bộ Node.js 24 + pnpm cho local, Docker và CI.
- Sửa Dockerfile cũ còn phụ thuộc `package-lock.json` đã bị xóa.
- Truyền `NEXT_PUBLIC_*` ngay tại Docker build để site URL/map không bị đóng cứng thành localhost.
- Bổ sung security headers cơ bản, tắt `X-Powered-By`, bật compression và strict mode.
- Nâng healthcheck để trả revision, database status, latency và uptime mà không làm lộ exception nội bộ.
- Tăng kiểm tra biến môi trường production: HTTPS, PostgreSQL, S3 và giới hạn upload.

### CI & chất lượng code

- Thêm `pnpm run typecheck` và `pnpm run check`.
- Thêm GitHub Actions kiểm tra Prisma schema, generate client, ESLint, TypeScript và production build.

### Website công khai

- Thêm metadata đầy đủ, canonical, OpenGraph, Twitter card, manifest, sitemap và robots.
- Thêm global loading, error recovery và 404 page.
- Bỏ các phần trăm năng lực hard-code ở hero; dashboard dùng dữ liệu dự án thật từ API.
- Bổ sung accessibility focus state, reduced-motion và polish responsive.

### GIS / Map

- Bản đồ public và admin dùng cấu hình tile chung.
- Tự fit bounds theo dữ liệu đang lọc.
- Focus/fly-to khi chọn dự án.
- Lọc theo từ khóa, ngành và trạng thái.
- Hiển thị thời điểm đồng bộ và giữ dữ liệu cũ nếu lần refresh mới lỗi.
- Link mở tọa độ thực tế trên Google Maps.
- Public API kiểm tra tọa độ, giới hạn trường public và trả cache header phù hợp CDN.

### Dữ liệu nghiệp vụ

- Module Đối tác đã bỏ persistence localStorage và chuyển sang API/Prisma phía server.
- Create/import đối tác có permission check và audit log.
- Các module dùng `EnterpriseModuleConsole` tiếp tục tạo/import qua endpoint API/database.

## Chủ đích giữ demo

Đăng nhập/seed demo **không được chuyển thành auth production cứng** trong gói này. Docker production vẫn chạy Prisma seed để tài khoản demo có thể dùng khi trình diễn.

Khi triển khai cho người dùng thật, có thể tách bước seed demo ra khỏi startup và thay bằng SSO/OIDC hoặc quy trình provisioning tài khoản riêng mà không phải đổi các module nghiệp vụ.

## Cấu hình bắt buộc khi deploy thật

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SITE_URL="https://your-domain.vn"
S3_ENDPOINT="https://..."
S3_BUCKET="licogi-os"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_BASE_URL="https://files.your-domain.vn"
```

Khuyến nghị cấu hình thêm tile provider có SLA:

```env
NEXT_PUBLIC_MAP_TILE_URL="https://.../{z}/{x}/{y}.png"
NEXT_PUBLIC_MAP_ATTRIBUTION="..."
```

## Kiểm tra

```bash
corepack enable
pnpm install --no-frozen-lockfile
pnpm exec prisma validate
pnpm run check
pnpm run build
```

Production env:

```bash
pnpm run prod:check
```

Docker:

```bash
pnpm run docker:prod
```

Health:

```text
GET /api/health
```

## Lưu ý lockfile

Repository hiện không có `pnpm-lock.yaml` sau khi `package-lock.json` cũ bị xóa. Vì vậy Vercel, Docker và CI đang dùng `pnpm install --no-frozen-lockfile` để bảo đảm build hoạt động với trạng thái repository hiện tại.

Để đạt reproducible build tuyệt đối, sau khi pull nhánh này trên máy có internet hãy chạy `pnpm install`, commit `pnpm-lock.yaml` được sinh ra, rồi đổi các bước install sang `pnpm install --frozen-lockfile`.
