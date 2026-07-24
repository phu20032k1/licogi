# Gói nâng cấp Trang chủ LICOGI 18.3

## Các thay đổi chính

- Tạo trang chủ công khai tại `/` với navbar: Trang chủ, Danh sách ngành hàng, Giới thiệu, Bản đồ, Video, Tin tức.
- Thêm nút đăng nhập ở góc trên bên phải và liên kết quay về website công khai trong sidebar quản trị.
- Thêm trợ lý AI dạng popup ở góc dưới bên phải.
- Tạo API công khai chỉ đọc `/api/public/projects` để trang chủ lấy dữ liệu dự án an toàn, không yêu cầu đăng nhập.
- Đồng bộ icon marker theo ngành hàng trên bản đồ công khai và bản đồ quản trị:
  - CN: Công nghiệp
  - DD: Dân dụng
  - HT: Hạ tầng
  - GT: Giao thông
  - ĐN: Điện năng
- Màu marker theo trạng thái:
  - Cam: Đang thi công
  - Xanh lá: Hoàn thành
  - Xanh dương: Bảo hành
- Khi dự án không có lat/lng, hệ thống tự lấy tọa độ mặc định theo tỉnh/thành.
- Thay trang `/gis` thành bản đồ dự án thực tế và bổ sung bản đồ trực tiếp trong `/admin`.
- Thêm logo SVG, ảnh minh họa SVG và video giới thiệu MP4 cục bộ.

## Cách chạy

```bash
npm install
npm run db:generate
npm run dev
```

Mở:

- Website công khai: `http://localhost:3000/`
- Đăng nhập: `http://localhost:3000/login`
- Import dữ liệu: `http://localhost:3000/data`
- Bản đồ quản trị: `http://localhost:3000/gis`
- Admin: `http://localhost:3000/admin`

## Luồng kiểm tra import → bản đồ

1. Đăng nhập tài khoản có quyền DATA_CENTER.
2. Vào **Trung tâm dữ liệu** → chọn **Dự án**.
3. Import Excel/CSV có các cột `project_code`, `project_name`, `type`, `status`, `province`, `lat`, `lng`, `progress`.
4. Nếu bỏ trống `lat`, `lng`, hệ thống định vị theo `province`.
5. Mở `/`, `/gis` hoặc `/admin`: dự án sẽ xuất hiện với cùng kiểu marker.

## Các file chính đã sửa/thêm

- `middleware.ts`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/gis/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/api/public/projects/route.ts`
- `src/components/AppShell.tsx`
- `src/components/Sidebar.tsx`
- `src/components/BrandLogo.tsx`
- `src/components/PublicAIAssistant.tsx`
- `src/components/PublicProjectMap.tsx`
- `src/components/ProjectMap.tsx`
- `src/lib/projectData.ts`
- `src/lib/projectMapVisuals.ts`
- `public/brand/licogi183-logo.svg`
- `public/media/*.svg`
- `public/videos/licogi183-digital-intro.mp4`
