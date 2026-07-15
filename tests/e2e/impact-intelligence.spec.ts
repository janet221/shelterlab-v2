import { expect, test } from "@playwright/test";

test("judge inspects deterministic impact formulas and evidence labels", async ({ page }) => {
  await page.goto("/competition/impact");
  await expect(page.getByRole("heading", { name: "競賽影響力儀表板" })).toBeVisible();
  await expect(page.getByText("沒有任何指標由 AI 生成", { exact: false })).toBeVisible();
  for (const label of ["已驗證（VERIFIED）", "示範（DEMO）", "合成示範資料（SYNTHETIC_DEMO）", "尚未驗證（UNVERIFIED）"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "教育", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Living Lab", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "政府開放資料", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One Health", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "InnoServe 評分面向證據涵蓋度" })).toBeVisible();
  await page.getByText("查看公式與來源").first().click();
  await expect(page.getByText("分子 / 分母").first()).toBeVisible();
  await expect(page.getByText("ShelterLab 內部證據涵蓋自評", { exact: false })).toBeVisible();
});

test("one-click Demo Mode completes without production mutation", async ({ page }) => {
  await page.goto("/competition/demo");
  await expect(page.getByRole("heading", { name: "一鍵播放完整證據旅程" })).toBeVisible();
  await expect(page.getByText("唯讀｜生產資料修改 0 次")).toBeVisible();
  await page.getByRole("button", { name: "播放完整旅程" }).click();
  await expect(page.getByText("完整證據旅程已播放", { exact: false })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("link", { name: "查看影響力儀表板", exact: true })).toBeVisible();
  await expect(page.getByText("證據已播放", { exact: true })).toHaveCount(10);
});
