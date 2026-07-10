# Kiểm tra bản nâng cấp

## Kết quả kiểm tra

- `npm install`: thành công.
- `npm run lint`: thành công, không còn lỗi ESLint.
- `npm run build`: thành công, Next.js build được toàn bộ route.

## Route đã build được

- `/dashboard`
- `/projects`
- `/projects/[id]`
- `/map`
- `/construction`
- `/documents`
- `/ai-profile`
- `/portal`
- `/warranty`
- `/partners`
- `/reports`
- `/tasks`
- `/users`
- `/activity`
- `/settings`
- `/api/projects`
- `/api/dashboard`
- `/api/services`

## Cách test nhanh sau khi giải nén

```bash
npm install
npm run dev
```

Sau đó mở `http://localhost:3000`.

### Nên test theo thứ tự

1. Vào Dashboard kiểm tra hero, KPI, AI Insight, Data Lake, 10 module lõi.
2. Vào Bản đồ GIS, thử lọc theo loại công trình, trạng thái, từ khóa FDI/Nhật/Hàn.
3. Vào Danh mục dự án, thử thêm/sửa/xóa/reset dữ liệu.
4. Vào Hồ sơ năng lực số, đổi loại công trình, ngôn ngữ, khoảng giá trị rồi bấm In/Lưu PDF.
5. Vào Cài đặt & API dịch vụ, xem danh sách API cần lấy và copy biến môi trường.
6. Test API demo:

```bash
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/dashboard
curl http://localhost:3000/api/services
```
