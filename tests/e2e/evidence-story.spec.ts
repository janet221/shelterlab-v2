import { expect, test } from "@playwright/test";

test("public profile expands a statement into evidence through publication", async ({ page }) => {
  await page.goto("/adoption-profile/DOG-TPE-001");
  await expect(page.getByRole("heading", { name: "檔案中的證據脈絡" })).toBeVisible();
  await page.getByText("Biscuit：性別", { exact: false }).click();
  for (const stage of ["1. 證據", "2. 觀察紀錄", "3. 證據時間軸", "4. 審核者", "5. 發布"]) {
    await expect(page.getByText(stage, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("不適用", { exact: true }).first()).toBeVisible();
});

test("unknown and gap views explain missing evidence without invention", async ({ page }) => {
  await page.goto("/adoption-profile/DOG-TPE-001/story");
  await expect(page.getByRole("heading", { name: "Biscuit 的證據脈絡" })).toBeVisible();
  await page.getByText("尚無資料（UNKNOWN）：目前已發布證據無法建立健康資料", { exact: false }).click();
  await expect(page.getByText("原因：目前沒有經收容所核准並發布的健康資料可建立此項資訊。", { exact: true })).toBeVisible();
  await expect(page.getByText("缺少的證據：一筆涵蓋此欄位、經收容所核准並發布的健康檢查資料。", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "證據缺口" }).click();
  await expect(page.getByRole("heading", { name: "缺少的證據類別" })).toBeVisible();
  await expect(page.getByText("步行情境觀察", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("補充更多證據", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("ShelterLab 絕不以虛構資訊填補缺口。", { exact: false })).toBeVisible();
});

test("judge runs the complete read-only evidence story in one click", async ({ page }) => {
  await page.goto("/competition/story");
  await expect(page.getByRole("heading", { name: "一鍵查看認養資訊的證據脈絡" })).toBeVisible();
  await page.getByRole("button", { name: "播放證據脈絡" }).click();
  await expect(page.getByText("證據脈絡已完成。", { exact: false })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("脈絡已就緒", { exact: true })).toHaveCount(6);
  for (const step of ["犬隻", "證據脈絡", "證據時間軸", "已發布證據", "認養資訊檔案", "影響力"]) {
    await expect(page.getByRole("link", { name: step, exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("唯讀 · 正式資料異動 0 筆")).toBeVisible();
});
