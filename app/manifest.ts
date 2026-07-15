import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShelterLab｜One Health 公民科學教育平台",
    short_name: "ShelterLab 教育平台",
    description: "以證據驅動的 One Health 公民科學教育平台",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f766e",
    categories: ["education", "science"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icon", sizes: "any", type: "image/png" }
    ]
  };
}
