# Triển khai LICOGI OS lên Vercel

## 1. Yêu cầu

- Node.js 20.9 trở lên.
- PostgreSQL có thể truy cập từ Internet (ví dụ Neon, Supabase hoặc Railway).
- S3-compatible storage nếu sử dụng upload file. Không dùng ổ đĩa cục bộ của Vercel để lưu file lâu dài.

## 2. Biến môi trường trên Vercel

Sao chép các biến trong `.env.example` vào **Project Settings → Environment Variables**.

Biến bắt buộc cho cơ sở dữ liệu:

- `DATABASE_URL`

Biến cần có để upload file hoạt động:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`
- `S3_PUBLIC_BASE_URL`

Các biến OpenAI, Autodesk và Google Maps là tùy chọn.

## 3. Khởi tạo database lần đầu

Chạy trên máy local hoặc môi trường quản trị có `DATABASE_URL` production:

```bash
npm ci
npx prisma db push
npm run db:seed
```

Không nên đặt `prisma db push` hoặc seed vào lệnh build Vercel vì mỗi lần deploy có thể làm thay đổi dữ liệu production.

## 4. Build

Vercel dùng lệnh:

```bash
npm run build
```

Lệnh này tự chạy `prisma generate` trước `next build`.

## 5. Các kiểm tra đã hoàn tất

Bản này đã vượt qua:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Next.js đã build thành công 58 trang/API route production.
