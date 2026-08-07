const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const siteConfig = {
  name: "LICOGI 18.3",
  productName: "LICOGI 18.3 Industrial Construction OS",
  description:
    "Nền tảng năng lực và hệ điều hành quản trị số LICOGI 18.3: dự án, GIS, dữ liệu, hồ sơ, vận hành và báo cáo trên một hệ thống thống nhất.",
  url: normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  locale: "vi_VN",
  contact: {
    phone: "+842213942550",
    phoneLabel: "(+84) 221.3942.550 / 551",
    email: "jsclicogi18.3@gmail.com",
    address: "Số 98 Nguyễn Văn Linh, phường Mỹ Hào, tỉnh Hưng Yên",
  },
  map: {
    tileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
