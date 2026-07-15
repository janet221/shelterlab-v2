import { expect, test } from "@playwright/test";

test("public landing explains ShelterLab and routes primary CTA to role selection", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "讓每一筆犬隻資訊，都有證據可以追溯" })).toBeVisible();
  await expect(page.getByText("ShelterLab 結合政府開放資料、One Health、公民科學與收容所實境探究", { exact: false })).toBeVisible();
  await expect(page.getByText("競賽原型｜合成示範資料｜尚未宣稱正式合作或實證認養成效").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "開始體驗", exact: true }).first()).toHaveAttribute("href", "/start");
  await expect(page.getByRole("link", { name: "觀看產品介紹", exact: true }).first()).toHaveAttribute("href", "/watch-demo");
  await expect(page.getByRole("link", { name: "評審快速導覽", exact: true }).first()).toHaveAttribute("href", "/competition/judge");
});

test("public navigation contains no more than five primary items", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "主要導覽" }).first();
  await expect(nav.getByRole("link")).toHaveCount(5);
  await expect(nav.getByRole("link", { name: "首頁" })).toHaveAttribute("href", "/");
  await expect(nav.getByRole("link", { name: "如何運作" })).toHaveAttribute("href", "/tour/welcome");
  await expect(nav.getByRole("link", { name: "開始體驗" })).toHaveAttribute("href", "/start");
  await expect(nav.getByRole("link", { name: "評審導覽" })).toHaveAttribute("href", "/competition/judge");
  await expect(nav.getByRole("link", { name: "關於我們" })).toHaveAttribute("href", "/about");
});

test("landing remains usable across mobile, tablet, desktop, and large monitor", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "讓每一筆犬隻資訊，都有證據可以追溯" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  }
});
