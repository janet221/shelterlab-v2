import type { MetadataRoute } from "next";
import { publicTourSteps } from "@/lib/public-demo/engine";
import { getPublicSiteUrl } from "@/lib/public-site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const routes = [
    "/",
    "/auth",
    "/start",
    "/contact",
    "/privacy",
    "/research-notice",
    "/government-data"
  ];
  routes.push(...publicTourSteps.map((step) => `/tour/${step.slug}`));

  return Array.from(new Set(routes)).map((route) => ({
    url: new URL(route, base).toString(),
    lastModified: new Date("2026-07-14T00:00:00.000Z"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7
  }));
}
