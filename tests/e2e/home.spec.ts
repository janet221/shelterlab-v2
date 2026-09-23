import { expect, test } from "@playwright/test";

test("landing presents the six-week curriculum and working entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ShelterLab｜青少年動物科學探究實驗室");
  await expect(page.getByRole("table", { name: "六週學習地圖", exact: true }).getByRole("row")).toHaveCount(7);
  await expect(page.getByRole("table", { name: "連結高中探究與實作", exact: true }).getByRole("row")).toHaveCount(5);
  await page.getByRole("link", { name: "了解專案願景", exact: true }).click();
  await expect(page).toHaveURL(/#vision$/);
  await expect(page.getByRole("heading", { name: "專案願景｜讓關心有依據，讓行動有方向" })).toBeInViewport();
  await page.getByRole("link", { name: "開始六週探索", exact: true }).click();
  await expect(page).toHaveURL(/\/start$/);
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

test("landing and tables fit mobile, tablet, desktop and large monitors", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
