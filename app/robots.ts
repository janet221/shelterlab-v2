import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/public-site/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/student/", "/teacher/", "/shelter/"]
    },
    sitemap: new URL("/sitemap.xml", getPublicSiteUrl()).toString()
  };
}
