const required = ["DATABASE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Thiếu biến môi trường production: ${missing.join(", ")}`);
  process.exit(1);
}
if ((process.env.S3_SECRET_ACCESS_KEY || "").length < 16) {
  console.error("S3_SECRET_ACCESS_KEY nên dài tối thiểu 16 ký tự.");
  process.exit(1);
}
console.log("Production env OK: DATABASE_URL và S3/MinIO đã có.");
