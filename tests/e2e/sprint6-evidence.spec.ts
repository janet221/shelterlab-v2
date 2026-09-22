import { expect, test } from "@playwright/test";

test("teacher follows source to independently governed publication evidence", async ({ page }) => {
  await page.goto("/teacher/curriculum/studio");
  await expect(page.getByRole("heading", { name: "Research License question studio" })).toBeVisible();
  await expect(page.getByText("AI_DRAFT", { exact: true })).toBeVisible();
  await expect(page.getByText("PENDING_REVIEW", { exact: true })).toBeVisible();
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await expect(page.getByText("PUBLISHED", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Source browser", exact: true }).click();
  await expect(page.getByRole("heading", { name: "政府開放資料來源清冊" })).toBeVisible();
  await expect(page.getByText("合成示範資料（SYNTHETIC_DEMO）", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("尚未驗證（UNVERIFIED）", { exact: true }).first()).toBeVisible();

  await page.goto("/teacher/curriculum/coverage");
  await expect(page.getByRole("heading", { name: "Competency coverage matrix" })).toBeVisible();
  await expect(page.getByText("std_demo_data_interpretation")).toBeVisible();
});

test("student sees competency result and deterministic targeted remediation after submission", async ({ page }) => {
  await page.goto("/research-license/quiz/result");
  await expect(page.getByRole("heading", { name: "Quiz result" })).toBeVisible();
  await expect(page.getByText("85%", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Targeted remediation", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("std_demo_data_interpretation")).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/student\/resources$/, { timeout: 15000 }),
    page.getByRole("link", { name: "Review remediation resources" }).click()
  ]);
  await expect(page.getByRole("heading", { name: "Approved learning resources" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("URBAN_ECOLOGY: ShelterLab Teacher-Authored Urban Ecology Data Primer")).toBeVisible();
  await expect(page.getByText("UNVERIFIED_DEMO iLearn Resource Placeholder 001")).toHaveCount(0);
});

test("judge inspects the complete synthetic evidence chain", async ({ page }) => {
  await page.goto("/competition/evidence");
  await expect(page.getByRole("heading", { name: "競賽證據儀表板" })).toBeVisible();
  await expect(page.getByText("所有指標：合成示範資料（SYNTHETIC_DEMO）")).toBeVisible();
  await expect(page.getByRole("heading", { name: "完整證據鏈" })).toBeVisible();
  await expect(page.getByText("完整", { exact: true })).toBeVisible();
  await expect(page.getByText("政府資料集", { exact: true })).toBeVisible();
  await expect(page.getByText("已發布題目", { exact: true })).toBeVisible();
  await expect(page.getByText("指定學習補強", { exact: true })).toBeVisible();
  await expect(page.getByText(/未宣稱具有真實的學習、學校、收容所、學生、犬隻或認養成效/)).toBeVisible();
});

test("judge distinguishes verified official fixtures from synthetic impact metrics", async ({ page }) => {
  await page.goto("/competition/evidence");
  await expect(page.getByText("開放資料：已驗證快照（VERIFIED_FIXTURE）")).toBeVisible();
  await expect(page.getByText("所有指標：合成示範資料（SYNTHETIC_DEMO）")).toBeVisible();
  await expect(page.getByRole("heading", { name: "政府開放資料如何改變 ShelterLab 功能" })).toBeVisible();
  await expect(page.getByText("全國公立動物收容所收容處理情形統計表").first()).toBeVisible();
  await expect(page.getByText("各級學校縣市別學生人數").first()).toBeVisible();
  await expect(page.getByText("非個別犬隻資料", { exact: false })).toBeVisible();
});
