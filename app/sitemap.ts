import type { MetadataRoute } from "next";
import { competitionExperienceSteps } from "@/lib/competition-experience/engine";
import { publicDemoRoleIds, publicTourSteps } from "@/lib/public-demo/engine";
import { getPublicSiteUrl } from "@/lib/public-site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const routes = [
    "/",
    "/about",
    "/contact",
    "/demo",
    "/watch-demo",
    "/privacy",
    "/research-notice",
    "/competition/judge",
    "/competition/impact",
    "/competition/evidence",
    "/living-lab",
    "/inquiries/demo",
    "/adoption-profile/DOG-TPE-001"
  ];
  routes.push(...publicTourSteps.map((step) => `/tour/${step.slug}`));
  routes.push(...publicDemoRoleIds.map((role) => `/demo/${role}`));
  routes.push(...competitionExperienceSteps.map((step) => step.deepLink));

  return Array.from(new Set(routes)).map((route) => ({
    url: new URL(route, base).toString(),
    lastModified: new Date("2026-07-14T00:00:00.000Z"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/competition/judge") ? 0.9 : 0.7
  }));
}
