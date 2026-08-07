import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/public/"],
        disallow: ["/admin", "/api/", "/data", "/users", "/settings", "/activity", "/change-password"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
