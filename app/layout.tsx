import type { Metadata, Viewport } from "next";
import { getPublicSiteUrl, publicSiteDescription, publicSiteKeywords } from "@/lib/public-site/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getPublicSiteUrl(),
  applicationName: "ShelterLab",
  title: {
    default: "ShelterLab｜青少年動物科學探究實驗室",
    template: "%s｜ShelterLab"
  },
  description: publicSiteDescription,
  keywords: publicSiteKeywords,
  authors: [{ name: "ShelterLab 團隊" }],
  creator: "ShelterLab 團隊",
  publisher: "ShelterLab",
  category: "教育",
  icons: {
    icon: [{ url: "/icon?v=2", type: "image/png", sizes: "32x32" }],
    shortcut: "/icon?v=2"
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "ShelterLab",
    title: "ShelterLab｜證據驅動的 One Health 公民科學教育平台",
    description: publicSiteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ShelterLab 公開展示圖" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ShelterLab｜證據驅動的 One Health 公民科學教育平台",
    description: publicSiteDescription,
    images: ["/twitter-image"]
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf0" },
    { media: "(prefers-color-scheme: dark)", color: "#3c3024" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW">
      {/* 這裡不需要 font-custom class 了，因為我們在 globals.css 直接定義了 body */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
