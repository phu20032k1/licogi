import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LICOGI 18.3 Industrial Construction OS",
    short_name: "LICOGI 18.3",
    description: "Nền tảng năng lực, dữ liệu dự án, GIS và vận hành số LICOGI 18.3.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    lang: "vi",
    icons: [
      {
        src: "/brand/licogi183-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
