import { expect, test, type Page } from "@playwright/test";

const learningProgress = (completedWeeks: number[], unlockedTools: string[]) => ({
  schemaVersion: 2,
  completedWeeks,
  unlockedTools,
  weekOne: {
    stage: completedWeeks.includes(1) ? 6 : 0,
    currentClue: 0,
    firstImpression: "",
    sealedFirstImpression: "",
    classificationAnswers: {},
    datasetChoice: null,
    boundaryChoice: null,
    mediaChoice: null,
    sourceTags: [],
    responsibleRewrite: "",
    rewriteChecks: [],
    completed: completedWeeks.includes(1),
    completedAt: completedWeeks.includes(1) ? "2026-09-17T00:00:00.000Z" : null
  }
});

async function seedLearningProgress(page: Page, completedWeeks: number[], unlockedTools: string[]) {
  await page.addInitScript((payload) => {
    localStorage.setItem("shelterlab-learning-progress-v2", JSON.stringify(payload));
  }, learningProgress(completedWeeks, unlockedTools));
}

test("Week 2 uses the evidence lens once and persists completion", async ({ page }) => {
  await seedLearningProgress(page, [1], ["data-lens"]);
  await page.goto("/student/week/2");

  await expect(page.getByRole("heading", { name: "證據放大鏡" })).toBeVisible();
  await page.getByRole("button", { name: "取出放大鏡" }).click();

  const firstClaim = page.locator("fieldset").filter({ hasText: "飼主必須提供適當食物與乾淨飲水。" });
  await firstClaim.getByRole("button", { name: "還需要進一步查證", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(firstClaim.getByText("《動物保護法》第 5 條", { exact: false })).toBeVisible();

  const answers = [
    ["飼主必須提供適當食物與乾淨飲水。", "法律或正式資料明確支持"],
    ["只要喜歡動物，就代表已具備領養條件。", "不能只靠這項資料判定"],
    ["動物受傷或生病時，飼主應提供必要醫療。", "法律或正式資料明確支持"],
    ["未成年人可以完全自行承擔所有法律責任。", "不能只靠這項資料判定"],
    ["飼主應提供安全、通風且溫度適當的生活環境。", "課程根據法律整理出的責任"]
  ] as const;

  for (const [item, answer] of answers) {
    await page.locator("fieldset").filter({ hasText: item }).getByRole("button", { name: answer, exact: true }).click();
  }

  await expect(page.getByText("本週指定寶物任務已完成", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText("本週指定寶物任務已完成", { exact: false })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("shelterlab-week2-v3") || "{}").treasureCompleted)).toBe(true);
});

test("direct entry without the previous reward shows a safe lock message", async ({ page }) => {
  await page.goto("/student/week/2");
  await expect(page.getByRole("button", { name: "尚未解鎖" })).toBeDisabled();
  await expect(page.getByText("完成第 1 週後才能取得", { exact: false })).toBeVisible();
});

test("the assigned tools appear only at Week 3 stage 3, Week 4 stage 3 and Week 5 stage 4", async ({ page }) => {
  await seedLearningProgress(page, [1, 2, 3, 4], ["data-lens", "care-planner", "label-folder", "hypothesis-notes"]);

  await page.addInitScript(() => localStorage.setItem("shelterlab-week3-v2", JSON.stringify({ foundationsVersion: 3, stage: 2, furthest: 2 })));
  await page.goto("/student/week/3");
  await expect(page.getByRole("heading", { name: "責任盤點表" })).toBeVisible();

  await page.addInitScript(() => localStorage.setItem("shelterlab-week4-v1", JSON.stringify({ contentVersion: 1, stage: 2, furthest: 2 })));
  await page.goto("/student/week/4");
  await expect(page.getByRole("heading", { name: "分類解碼夾" })).toBeVisible();

  await page.addInitScript(() => localStorage.setItem("shelterlab-week5-v1", JSON.stringify({ contentVersion: 1, stage: 3, furthest: 3 })));
  await page.goto("/student/week/5");
  await expect(page.getByRole("heading", { name: "源頭追蹤卡" })).toBeVisible();
});

test("treasure workspace has no horizontal overflow on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedLearningProgress(page, [1], ["data-lens"]);
  await page.goto("/student/week/2");
  await page.getByRole("button", { name: "取出放大鏡" }).click();

  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("button", { name: "法律或正式資料明確支持", exact: true }).first()).toBeVisible();
});

test("Week 6 remains free of treasure tasks", async ({ page }) => {
  await seedLearningProgress(page, [1, 2, 3, 4, 5], ["data-lens", "care-planner", "label-folder", "hypothesis-notes", "observation-lens"]);
  await page.goto("/student/week/6");
  await expect(page.getByText("本週指定工具", { exact: true })).toHaveCount(0);
  await expect(page.getByText("取出", { exact: false })).toHaveCount(0);
});
