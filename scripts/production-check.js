const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Thiếu biến môi trường production: ${missing.join(", ")}`);
  process.exit(1);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
if (!siteUrl.startsWith("https://")) {
  console.error("NEXT_PUBLIC_SITE_URL production phải dùng HTTPS.");
  process.exit(1);
}

if (!/^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL || "")) {
  console.error("DATABASE_URL phải là PostgreSQL URL hợp lệ.");
  process.exit(1);
}

if ((process.env.S3_SECRET_ACCESS_KEY || "").length < 16) {
  console.error("S3_SECRET_ACCESS_KEY nên dài tối thiểu 16 ký tự.");
  process.exit(1);
}

const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || "50000000");
if (!Number.isFinite(maxUploadBytes) || maxUploadBytes < 1_000_000 || maxUploadBytes > 250_000_000) {
  console.error("MAX_UPLOAD_BYTES nên nằm trong khoảng 1MB - 250MB.");
  process.exit(1);
}

if (!process.env.PRISMA_SEED_PASSWORD || process.env.PRISMA_SEED_PASSWORD.includes("CHANGE_ME")) {
  console.warn("Cảnh báo: PRISMA_SEED_PASSWORD vẫn là mật khẩu demo/mặc định. Chỉ giữ như vậy nếu môi trường này chủ đích dùng demo login.");
}

if (!process.env.NEXT_PUBLIC_MAP_TILE_URL) {
  console.warn("Cảnh báo: đang dùng OpenStreetMap public tile mặc định. Production lưu lượng lớn nên cấu hình tile provider có SLA.");
}

console.log("Production env OK: HTTPS, PostgreSQL và S3 đã được cấu hình.");
