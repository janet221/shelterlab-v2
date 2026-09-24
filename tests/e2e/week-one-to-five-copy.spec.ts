import { expect, test, type Page } from "@playwright/test";

async function openWeek(page: Page, week: number) {
  await page.goto(`/student/week/${week}`);
  if (week !== 1) return;
  await expect(page.getByText("正在展開筆記本…")).toBeHidden();
  for (let pageNumber = 0; pageNumber < 3; pageNumber += 1) {
    await page.getByRole("button", { name: "下一頁 →" }).click();
  }
  await page.getByRole("button", { name: "進入第一週" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("shelterlab-learning-progress-v2")) localStorage.setItem("shelterlab-learning-progress-v2", JSON.stringify({
      schemaVersion: 2,
      completedWeeks: [1, 2, 3, 4, 5],
      unlockedTools: ["data-lens", "hypothesis-notes", "care-planner", "label-folder", "observation-lens"],
      weekOne: { stage: 5, completed: true }
    }));
    if (!localStorage.getItem("shelterlab-week2-v3")) localStorage.setItem("shelterlab-week2-v3", JSON.stringify({ contentVersion: 1, stage: 5, furthest: 5 }));
    if (!localStorage.getItem("shelterlab-week3-v2")) localStorage.setItem("shelterlab-week3-v2", JSON.stringify({ foundationsVersion: 3, stage: 5, furthest: 5 }));
    if (!localStorage.getItem("shelterlab-week4-v1")) localStorage.setItem("shelterlab-week4-v1", JSON.stringify({ contentVersion: 1, stage: 5, furthest: 5 }));
    if (!localStorage.getItem("shelterlab-week5-v1")) localStorage.setItem("shelterlab-week5-v1", JSON.stringify({ contentVersion: 1, stage: 5, furthest: 5 }));
  });
});

test("Week 1–5 final stages use the shared inquiry title and real-data summaries", async ({ page }) => {
  const expected = [
    [1, "資料深思｜毛色", "灰黑色", "1,186 天"],
    [2, "資料深思｜體型", "中型犬｜公開待認養占比 61.8%", "906 天"],
    [3, "資料深思｜品種", "比特犬", "1,098.5 天"],
    [4, "資料深思｜性別與絕育", "母犬", "603 天"],
    [5, "資料深思｜年齡", "幼年犬", "276 天"]
  ] as const;

  for (const [week, label, group, statistic] of expected) {
    await openWeek(page, week);
    await expect(page.getByRole("heading", { name: "想想看牠們被貼上了什麼標籤" })).toBeVisible();
    await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(page.getByText(group, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(statistic, { exact: false }).first()).toBeVisible();
    await expect(page.getByText("不限字數；完成後即可繼續。", { exact: true })).toBeVisible();
    const caseImage = page.locator('img[alt*="公開資料"], img[alt*="開放資料"], img[alt*="Open Data"]').last();
    await expect(caseImage).toBeVisible();
    await expect.poll(() => caseImage.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  }
});

test("final-stage data cards remain within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const week of [1, 2, 3, 4, 5]) {
    await openWeek(page, week);
    await expect(page.getByRole("heading", { name: "想想看牠們被貼上了什麼標籤" })).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasOverflow).toBe(false);
  }
});

test("replaying Week 1 keeps its completion and unlocked reward", async ({ page }) => {
  await openWeek(page, 1);
  await page.getByRole("textbox").fill("我會先區分資料呈現的差異與仍需查證的原因。");
  await page.getByRole("button", { name: "完成第一週" }).click();
  await expect(page.getByRole("dialog", { name: "取得新的探究工具" })).toBeVisible();
  await page.getByRole("button", { name: "收下工具" }).click();
  await expect(page.getByRole("button", { name: "帶著工具返回地圖" })).toBeVisible();
  await expect(page.getByRole("button", { name: "重新體驗第一週" })).toBeVisible();
  await page.getByRole("button", { name: "帶著工具返回地圖" }).click();
  await expect(page).toHaveURL(/\/student$/);
  await openWeek(page, 1);
  await page.getByRole("button", { name: "重新體驗第一週" }).click();
  await expect(page.getByRole("heading", { name: "四種犬隻，如何出現在不同生活環境？" })).toBeVisible();

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("shelterlab-learning-progress-v2") ?? "{}"));
  expect(persisted.completedWeeks).toContain(1);
  expect(persisted.unlockedTools).toContain("data-lens");
  expect(persisted.weekOne.completed).toBe(true);
  expect(persisted.weekOne.stage).toBe(0);
});

test("Week 1 resets the challenge with a clear alert after three wrong choices", async ({ page }) => {
  await page.goto("/student");
  await page.evaluate(() => localStorage.setItem("shelterlab-learning-progress-v2", JSON.stringify({
    schemaVersion: 2,
    completedWeeks: [],
    unlockedTools: [],
    weekOne: { stage: 1, completed: false, sourceTags: [] }
  })));
  await openWeek(page, 1);

  await page.getByRole("button", { name: /成為家庭犬/ }).click();
  await page.getByRole("button", { name: "下一步，進入這項挑戰" }).click();
  const wrongCard = page.getByRole("button", { name: "平日長時間關籠，週末再一次補足活動" });

  await expect(page.getByLabel("剩餘 3 顆心")).toBeVisible();
  await wrongCard.click();
  await expect(page.getByLabel("剩餘 2 顆心")).toBeVisible();
  await wrongCard.click();
  await expect(page.getByLabel("剩餘 1 顆心")).toBeVisible();
  await wrongCard.click();

  const resetAlert = page.getByRole("alert").filter({ hasText: "三顆愛心已用完" });
  await expect(resetAlert).toContainText("三顆愛心已用完，本關重新開始");
  await expect(resetAlert).toContainText("愛心也恢復為三顆");
  await expect(page.getByLabel("剩餘 3 顆心")).toBeVisible();
});

test("student map keeps only the action opportunity shortcut and no bulletin preview", async ({ page }) => {
  await page.goto("/student?preview=all-open");
  await expect(page.getByRole("link", { name: "行動機會", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "行動信箱", exact: true })).toHaveCount(0);
  await expect(page.getByText("動保活動佈告欄", { exact: true })).toHaveCount(0);
});

test("Week 3 stage six accepts a meaningful short response consistently", async ({ page }) => {
  await page.goto("/student");
  await page.evaluate(() => localStorage.setItem("shelterlab-week3-v2", JSON.stringify({
    foundationsVersion: 3,
    stage: 5,
    furthest: 5,
    dataChecks: ["records", "health", "behavior"],
    reflection: "我會先查證個體需求。",
    boundaryConfirmed: true
  })));
  await page.goto("/student/week/3");

  const finish = page.getByRole("button", { name: "完成第三週並解鎖工具" });
  await expect(finish).toBeEnabled();
  await expect(page.getByText(/深思回答還差/)).toHaveCount(0);
});
