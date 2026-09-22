import { expect, test } from "@playwright/test";

test("student completes the synthetic Living Lab observation journey", async ({ page }) => {
  await page.goto("/student/living-lab");
  await expect(page.getByRole("heading", { name: "Living Lab Student Dashboard" })).toBeVisible();
  await expect(page.getByText("ACTIVE")).toBeVisible();
  await page.getByRole("link", { name: "Open available mission" }).click();
  await page.getByRole("link", { name: "Start Observation" }).click();
  await expect(page.getByLabel("Observation timer")).toContainText("05:00");
  await page.getByRole("button", { name: "Record LOOK_AT_HUMAN" }).click();
  await expect(page.getByText("LOOK_AT_HUMAN · confidence required")).toBeVisible();
  await page.getByRole("link", { name: "Review Before Submit" }).click();
  await page.getByRole("link", { name: "Submit Observation" }).click();
  await expect(page.getByRole("heading", { name: "Submission Result" })).toBeVisible();
  await expect(page.getByText("Teacher Review")).toBeVisible();
});

test("teacher reviews an immutable session before shelter authority", async ({ page }) => {
  await page.goto("/teacher/living-lab");
  await page.getByRole("link", { name: "Review evidence" }).click();
  await expect(page.getByRole("heading", { name: "Session Replay" })).toBeVisible();
  await expect(page.getByText("SL-OQS-1")).toBeVisible();
  await page.getByRole("link", { name: "Approve for shelter review" }).click();
  await expect(page.getByRole("heading", { name: "Pending Shelter Confirmation" })).toBeVisible();
});

test("shelter confirmation remains separate from manual publication", async ({ page }) => {
  await page.goto("/shelter/living-lab");
  await page.getByRole("link", { name: "Review shelter confirmation" }).click();
  await expect(page.getByText("Confirmation does not publish.")).toBeVisible();
  await page.getByRole("link", { name: "Confirm evidence" }).click();
  await expect(page.getByRole("heading", { name: "Manual Publication Queue" })).toBeVisible();
  await page.getByRole("link", { name: "Publish manually" }).click();
  await expect(page.getByRole("heading", { name: "Biscuit 犬隻證據檔案" })).toBeVisible();
  await expect(page.getByText("不作犬隻性格或氣質診斷", { exact: false })).toBeVisible();
});

test("judge view presents a complete synthetic evidence trace", async ({ page }) => {
  await page.goto("/living-lab");
  await expect(page.getByRole("heading", { name: "收容所實境探究證據" })).toBeVisible();
  await expect(page.getByText("未宣稱真實學生或犬隻成效")).toBeVisible();
  await expect(page.getByText("完整", { exact: true })).toBeVisible();
  await expect(page.getByText("人工發布", { exact: true })).toBeVisible();
  await expect(page.getByText("犬隻證據檔案", { exact: true })).toBeVisible();
});
