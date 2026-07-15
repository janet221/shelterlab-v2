import { expect, test } from "@playwright/test";

test("judge runs the approved seven-step experience in one click", async ({ page }) => {
  await page.goto("/competition/judge");
  await expect(page.getByRole("heading", { name: "ShelterLab 七分鐘評審導覽" })).toBeVisible();
  await expect(page.getByText("合成示範資料（SYNTHETIC_DEMO）｜唯讀｜生產資料修改 0 次")).toBeVisible();
  await expect(page.getByLabel("導覽章節進度").getByRole("button")).toHaveCount(7);

  await page.getByRole("button", { name: "開始一鍵導覽" }).click();
  await expect(page.getByText("一鍵導覽已完成", { exact: false })).toBeVisible({ timeout: 7000 });
  await expect(page).toHaveURL(/\/competition\/judge\/impact-dashboard$/);
  await expect(page.getByRole("heading", { name: "影響力儀表板", exact: true })).toBeVisible();
});

test("presentation timer starts, pauses, and resets to seven minutes", async ({ page }) => {
  await page.goto("/competition/judge/overview");
  await expect(page.getByTestId("remaining-time")).toHaveText("07:00");
  await page.getByRole("button", { name: "開始計時" }).click();
  await expect(page.getByTestId("elapsed-time")).not.toContainText("00:00", { timeout: 3000 });
  await page.getByRole("button", { name: "暫停計時" }).click();
  await page.getByRole("button", { name: "重設計時" }).click();
  await expect(page.getByTestId("remaining-time")).toHaveText("07:00");
  await expect(page.getByTestId("elapsed-time")).toContainText("已經過 00:00");
});

test("presentation deep link opens the synchronized One Health scene", async ({ page }) => {
  await page.goto("/competition/judge/one-health-inquiry");
  await expect(page.getByRole("heading", { name: "One Health 探究", exact: true })).toBeVisible();
  await expect(page.getByLabel("導覽章節進度").getByRole("button", { name: /06 One Health.*目前章節/ })).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("link", { name: "開啟證據頁" })).toHaveAttribute("href", "/inquiries/demo");
});

test("demo reset restores canonical synthetic state without production mutation", async ({ page }) => {
  await page.goto("/competition/judge");
  await page.getByRole("button", { name: "開始一鍵導覽" }).click();
  await expect(page.getByText("一鍵導覽已完成", { exact: false })).toBeVisible({ timeout: 7000 });
  await page.getByRole("button", { name: "重設示範狀態" }).click();
  await expect(page.getByText("未呼叫 Prisma、seed、migration 或生產 mutation API")).toBeVisible();
  await expect(page).toHaveURL(/\/competition\/judge\/overview$/);
  await expect(page.getByRole("heading", { name: "ShelterLab 總覽", exact: true })).toBeVisible();
  await expect(page.getByTestId("remaining-time")).toHaveText("07:00");
});

test("judge controls remain usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/competition/judge/overview");
  await expect(page.getByRole("button", { name: "開始一鍵導覽" })).toBeVisible();
  await expect(page.getByTestId("remaining-time")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});
