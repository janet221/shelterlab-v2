import { expect, test } from "@playwright/test";

test("student follows the guided inquiry journey through submission", async ({ page }) => {
  await page.goto("/student/inquiries");
  await expect(page.getByRole("heading", { name: "One Health Inquiry Projects" })).toBeVisible();
  await page.getByRole("link", { name: "Create inquiry project" }).click();
  await expect(page.getByRole("heading", { name: "Create One Health Inquiry" })).toBeVisible();
  await expect(page.getByText("One Health dimensions (minimum two)")).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/student\/inquiries\/inquiry_synthetic_41236_complete$/, { timeout: 15000 }),
    page.getByRole("link", { name: "Create SYNTHETIC_DEMO project" }).click()
  ]);
  await expect(page.getByRole("heading", { name: "區域收容犬入所與認養率比較" })).toBeVisible({ timeout: 15000 });
  for (let index = 0; index < 8; index += 1) {
    await page.locator("section").getByRole("button", { name: /Save question|Link approved evidence|Continue|Record cleaning|Run deterministic analysis|Save CER/ }).click();
  }
  await expect(page.getByRole("link", { name: "Submit for teacher review" })).toBeVisible();
});

test("teacher can request revision and approve the reviewed version", async ({ page }) => {
  await page.goto("/teacher/inquiries/inquiry_synthetic_41236_complete");
  await expect(page.getByRole("heading", { name: "Inquiry Final Review" })).toBeVisible();
  await page.getByRole("button", { name: "Request revision" }).click();
  await expect(page.getByText("REVISION REQUESTED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Approve final report" }).click();
  await expect(page.getByText("TEACHER APPROVED", { exact: true })).toBeVisible();
});

test("judge inspects a complete traceable One Health inquiry report", async ({ page }) => {
  await page.goto("/inquiries/demo");
  await expect(page.getByRole("heading", { name: "區域收容犬入所與認養率比較" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "已驗證來源與資料來源紀錄" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "分析圖表" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "主張－證據－推理" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One Health 系統圖" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "建議" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "證據鏈附錄" })).toBeVisible();
  await expect(page.getByText("SYNTHETIC_DEMO", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("已驗證資料快照（VERIFIED_FIXTURE）", { exact: true })).toBeVisible();
});
