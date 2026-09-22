import type { MetadataRoute } from "next";
import { publicDemoRoleIds, publicTourSteps } from "@/lib/public-demo/engine";
import { getPublicSiteUrl } from "@/lib/public-site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const routes = [
    "/",
    "/about",
    "/auth",
    "/start",
    "/contact",
    "/demo",
    "/watch-demo",
    "/privacy",
    "/research-notice",
    "/competition/impact",
    "/competition/evidence",
    "/living-lab",
    "/inquiries/demo",
    "/adoption-profile/DOG-TPE-001"
  ];
  routes.push(...publicTourSteps.map((step) => `/tour/${step.slug}`));
  routes.push(...publicDemoRoleIds.map((role) => `/demo/${role}`));

  return Array.from(new Set(routes)).map((route) => ({
    url: new URL(route, base).toString(),
    lastModified: new Date("2026-07-14T00:00:00.000Z"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7
  }));
}
