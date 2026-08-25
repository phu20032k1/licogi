const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const mapboxToken = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "").trim();
const mapboxStyleInput = (process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox/streets-v12").trim();
const [mapboxStyleOwner = "mapbox", mapboxStyleId = "streets-v12"] = mapboxStyleInput.includes("/")
  ? mapboxStyleInput.split("/", 2)
  : ["mapbox", mapboxStyleInput];

const mapboxTileUrl = mapboxToken
  ? `https://api.mapbox.com/styles/v1/${encodeURIComponent(mapboxStyleOwner)}/${encodeURIComponent(mapboxStyleId)}/tiles/256/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(mapboxToken)}`
  : "";

const fallbackTileUrl = (process.env.NEXT_PUBLIC_MAP_TILE_URL || "").trim()
  || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const mapboxAttribution =
  '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> '
  + '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

export const siteConfig = {
  name: "LICOGI 18.3",
  productName: "LICOGI 18.3",
  description:
    "Hồ sơ năng lực số LICOGI 18.3: danh mục công trình, địa bàn triển khai, năng lực thi công và dữ liệu dự án trên một nền tảng thống nhất.",
  url: normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://licogi.vercel.app"),
  locale: "vi_VN",
  contact: {
    phone: "+842213942550",
    phoneLabel: "(+84) 221.3942.550 / 551",
    email: "jsclicogi18.3@gmail.com",
    address: "Số 98 Nguyễn Văn Linh, phường Mỹ Hào, tỉnh Hưng Yên",
  },
  map: {
    provider: mapboxToken ? "mapbox" : "osm",
    tileUrl: mapboxTileUrl || fallbackTileUrl,
    attribution: mapboxToken
      ? mapboxAttribution
      : process.env.NEXT_PUBLIC_MAP_ATTRIBUTION
        || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    mapboxStyle: `${mapboxStyleOwner}/${mapboxStyleId}`,
    hasMapboxToken: Boolean(mapboxToken),
  },
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
