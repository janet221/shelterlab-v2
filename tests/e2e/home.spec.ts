import { expect, test } from "@playwright/test";

test("landing presents the six-week curriculum and working entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="icon"][href="/icon?v=2"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ShelterLab:青少年科學實驗室");
  await expect(page.getByRole("table", { name: "六週學習地圖", exact: true }).getByRole("row")).toHaveCount(7);
  await expect(page.getByRole("table", { name: "連結高中探究與實作", exact: true }).getByRole("row")).toHaveCount(5);
  await expect(page.getByTestId("version2-hero")).toHaveCSS("height", /.+/);
  await expect(page.getByText("One Health Education Initiative", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "了解專案願景", exact: true }).click();
  await expect(page).toHaveURL(/#vision$/);
  await expect(page.getByRole("heading", { name: "專案願景｜讓關心有依據，讓行動有方向" })).toBeInViewport();
});

test("public navigation keeps authentication inside the start experience", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "主要導覽" });
  await expect(nav.getByRole("link")).toHaveCount(4);
  for (const [name, href] of [["首頁", "/"], ["專案願景", "/#vision"], ["如何運作", "/tour/welcome"], ["開始體驗", "/start"]]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  await expect(nav.getByRole("link", { name: "登入／註冊" })).toHaveCount(0);
});

test("footer mirrors the primary journey and keeps one resource link", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  const journey = footer.getByRole("navigation", { name: "核心功能" });
  await expect(journey.getByRole("link")).toHaveCount(3);
  await expect(journey.getByRole("link", { name: "專案願景", exact: true })).toHaveAttribute("href", "/#vision");
  await expect(journey.getByRole("link", { name: "如何運作", exact: true })).toHaveAttribute("href", "/tour/welcome");
  await expect(journey.getByRole("link", { name: "開始體驗", exact: true })).toHaveAttribute("href", "/start");
  const resources = footer.getByRole("navigation", { name: "補充資訊" });
  await expect(resources.getByRole("link")).toHaveCount(1);
  await expect(resources.getByRole("link", { name: "政府開放資料", exact: true })).toHaveAttribute("href", "/government-data");
  await expect(footer.getByRole("link", { name: "ShelterLab 首頁" })).toHaveAttribute("href", "/#top");
  await expect(footer).toContainText("© 2026 ShelterLab Education Initiative");
  await expect(footer).not.toContainText("本站僅供專案演示與科學教育交流使用");
});

test("government data page lists datasets and cited resources", async ({ page }) => {
  await page.goto("/government-data");
  await expect(page.getByRole("heading", { level: 1, name: "政府開放資料與引用資源" })).toBeVisible();
  await expect(page.getByText("以下為 Shelter Lab 課程進行中使用到的開放資料彙整，包含政府開放資料、官方資訊及教育民間資源三大分類。")).toBeVisible();
  await expect(page.getByRole("heading", { name: "政府開放資料來源清冊" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "教育與民間引用資源" })).toBeVisible();
  await expect(page.getByText("資料集用於建立閱讀欄位、比較案例與查證來源的學習情境。", { exact: false })).toHaveCount(0);
  await expect(page.getByText("這些來源支撐課程中的責任、政策、通報與行動安全內容。", { exact: false })).toHaveCount(0);
  await expect(page.getByText("影音與閱讀材料以原站外部連結提供。", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "研究文獻" })).toHaveCount(0);
  await expect(page.getByText("資料使用原則", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "前往來源 ↗" })).toHaveCount(35);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("landing and tables fit mobile, tablet, desktop and large monitors", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
