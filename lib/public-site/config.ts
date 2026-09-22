export const publicSiteDescription =
  "ShelterLab 結合政府開放資料、One Health、公民科學與收容所實境探究，協助學生學習科學方法並整理可追溯的犬隻證據。";

export const publicSiteKeywords = [
  "ShelterLab",
  "One Health",
  "公民科學",
  "收容所教育",
  "政府開放資料",
  "研究觀察資格",
  "犬隻行為觀察",
  "InnoServe"
];

export function getPublicSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
