import { expect, test } from "@playwright/test";

test("/start renders four roles without creating a fake authenticated session", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("heading", { name: "先選擇你的角色，再進入對應的 ShelterLab 導覽。" })).toBeVisible();
  await expect(page.getByRole("button", { name: /我是學生/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /我是教師/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /我是收容所人員/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /我是評審或合作夥伴/ })).toBeVisible();
  await expect(page.getByText("不代表正式登入或權限授予").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("session granted");
});

test("selecting a role changes content and CTA routes to each demo perspective", async ({ page }) => {
  await page.goto("/start");

  await page.getByRole("button", { name: /我是學生/ }).click();
  await expect(page).toHaveURL(/\/start\?role=student$/);
  await expect(page.getByTestId("role-detail-panel")).toContainText("完成研究觀察資格");
  await expect(page.getByRole("link", { name: "以學生身分開始體驗" })).toHaveAttribute("href", "/demo/student");

  await page.getByRole("button", { name: /我是教師/ }).click();
  await expect(page).toHaveURL(/\/start\?role=teacher$/);
  await expect(page.getByTestId("role-detail-panel")).toContainText("審核學生觀察");
  await expect(page.getByRole("link", { name: "查看教師工作流程" })).toHaveAttribute("href", "/demo/teacher");

  await page.getByRole("button", { name: /我是收容所人員/ }).click();
  await expect(page).toHaveURL(/\/start\?role=shelter$/);
  await expect(page.getByTestId("role-detail-panel")).toContainText("管理證據時間軸");
  await expect(page.getByRole("link", { name: "查看收容所工作流程" })).toHaveAttribute("href", "/demo/shelter");

  await page.getByRole("button", { name: /我是評審或合作夥伴/ }).click();
  await expect(page).toHaveURL(/\/start\?role=judge_partner$/);
  await expect(page.getByTestId("role-detail-panel")).toContainText("查看完整證據鏈");
  await expect(page.getByRole("link", { name: "進入七分鐘評審導覽" })).toHaveAttribute("href", "/competition/judge");
});

test("query parameter restores selected role and keyboard selection works", async ({ page }) => {
  await page.goto("/start?role=teacher");
  await expect(page.getByRole("button", { name: /我是教師/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("role-detail-panel")).toContainText("課程設計");

  await page.getByRole("button", { name: /我是學生/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/start\?role=student$/);
  await expect(page.getByRole("button", { name: /我是學生/ })).toHaveAttribute("aria-pressed", "true");
});

test("mobile role cards do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/start");
  await expect(page.getByRole("button", { name: /我是學生/ })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test("first-time visitor journey goes from homepage to student demo and can switch to teacher", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "開始體驗", exact: true }).first().click();
  await page.getByRole("button", { name: /我是學生/ }).click();
  await page.getByRole("link", { name: "以學生身分開始體驗" }).click();
  await expect(page).toHaveURL(/\/demo\/student$/);
  await expect(page.getByRole("heading", { name: "學生" })).toBeVisible();
  await page.getByRole("link", { name: "切換身分" }).click();
  await page.getByRole("button", { name: /我是教師/ }).click();
  await expect(page.getByRole("link", { name: "查看教師工作流程" })).toBeVisible();
});

test("shelter reviewer opens the shelter read-only workflow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "開始體驗", exact: true }).first().click();
  await page.getByRole("button", { name: /我是收容所人員/ }).click();
  await page.getByRole("link", { name: "查看收容所工作流程" }).click();
  await expect(page).toHaveURL(/\/demo\/shelter$/);
  await expect(page.getByText("收容所保有犬隻資料與公開資訊的最後權限")).toBeVisible();
  await expect(page.getByRole("link", { name: "查看犬隻證據檔案" })).toHaveAttribute("href", "/adoption-profile/DOG-TPE-001");
});

test("judge enters seven-minute judge mode from role selection", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("button", { name: /我是評審或合作夥伴/ }).click();
  await page.getByRole("link", { name: "進入七分鐘評審導覽" }).click();
  await expect(page).toHaveURL(/\/competition\/judge/);
  await expect(page.getByRole("heading", { name: "ShelterLab 七分鐘評審導覽" })).toBeVisible();
});

test("guided tour and trust pages remain reachable", async ({ page, request }) => {
  await page.goto("/tour");
  await expect(page).toHaveURL(/\/tour\/welcome$/);
  await expect(page.getByRole("heading", { name: "認識 ShelterLab" })).toBeVisible();
  await expect(page.getByLabel("導覽進度").locator("span")).toHaveCount(8);
  await page.getByRole("link", { name: "下一步" }).click();
  await expect(page.getByRole("heading", { name: "研究觀察資格" })).toBeVisible();

  await page.goto("/about");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.goto("/research-notice");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByText("hello@shelterlab.example", { exact: true })).toBeVisible();

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap:");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/competition/judge/overview");
  const manifest = await request.get("/manifest.webmanifest");
  expect(await manifest.json()).toMatchObject({ display: "standalone" });
});

test("unknown public path renders the evidence-aware 404 page", async ({ page }) => {
  const response = await page.goto("/this-public-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading").first()).toBeVisible();
});
