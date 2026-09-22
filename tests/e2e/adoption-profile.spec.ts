import { expect, test } from "@playwright/test";

test("judge traces a dog profile through evidence cards, timeline, and completeness", async ({ page }) => {
  await page.goto("/adoption-profile/DOG-TPE-001");
  await expect(page.getByRole("heading", { name: "Biscuit 的認養資訊檔案" })).toBeVisible();
  await expect(page.getByText("SYNTHETIC_DEMO", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("不預測認養機率", { exact: false })).toBeVisible();
  await expect(page.getByText("SL-ADOPTION-COMPLETE-1", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("尚無資料（UNKNOWN）：目前已發布證據無法建立健康資料", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: "證據卡片" }).click();
  await expect(page.getByRole("heading", { name: "已發布證據卡片" })).toBeVisible();
  await expect(page.getByText("observation_publication:", { exact: false }).first()).toBeVisible();
  await page.getByRole("link", { name: "查看時間軸中的證據" }).first().click();
  await expect(page.getByRole("heading", { name: "認養資訊證據時間軸" })).toBeVisible();
  await expect(page.getByText("中途照護：未來規劃", { exact: false })).toBeVisible();
  await expect(page.getByText("健康檢查：尚無紀錄", { exact: false })).toBeVisible();
});

test("shelter readiness dashboard describes evidence coverage only", async ({ page }) => {
  await page.goto("/shelter/adoption-readiness");
  await expect(page.getByRole("heading", { name: "Adoption Readiness" })).toBeVisible();
  await expect(page.getByText("It is not adoption probability", { exact: false })).toBeVisible();
  await expect(page.getByRole("cell", { name: /Biscuit/ })).toBeVisible();
  await expect(page.getByText("COLLECT MORE EVIDENCE", { exact: false })).toBeVisible();
});
