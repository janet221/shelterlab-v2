import { expect, test } from "@playwright/test";

test("student Research License smoke flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: /Student: STU-TEST-001/ }).click();

  await expect(page.getByRole("heading", { name: "研究觀察資格總覽" })).toBeVisible();
  await page.getByRole("link", { name: "開始測驗" }).click();
  await expect(page.getByRole("heading", { name: "Start Research License quiz" })).toBeVisible();

  await page.getByRole("link", { name: "Start quiz attempt" }).click();
  await expect(page.getByRole("heading", { name: "Quiz attempt" })).toBeVisible();
  await expect(page.getByText("Correct answers and explanations are hidden until final submission.")).toBeVisible();

  const fieldsets = page.locator("fieldset");
  await expect(fieldsets).toHaveCount(20);
  for (let index = 0; index < 20; index += 1) {
    await fieldsets.nth(index).locator("input[type='radio']").first().check();
  }

  await page.getByRole("button", { name: "Submit attempt" }).click();
  await expect(page.getByRole("heading", { name: "Quiz result" })).toBeVisible();
  await page.getByRole("link", { name: "View license status" }).click();
  await expect(page.getByRole("heading", { name: "License certificate and status" })).toBeVisible();
});
