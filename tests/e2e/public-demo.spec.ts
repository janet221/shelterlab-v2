import { expect, test } from "@playwright/test";

test("role selection restores exactly three interactive role cards", async ({ page }) => {
  await page.goto("/start");
  const roles = page.getByRole("region", { name: "角色選擇" });
  await expect(roles.getByRole("button")).toHaveCount(3);
  await expect(roles.getByRole("link")).toHaveCount(0);
  await expect(page.getByText("我是評審或合作夥伴")).toHaveCount(0);
  await expect(page.getByText(/角色導覽不代表正式登入或/)).toHaveCount(0);
});

for (const [name, destination, action] of [
  ["我是學生", "student", "進入學生登入／註冊"],
  ["我是教師", "teacher", "進入教師登入／註冊"],
  ["我是收容所人員", "shelter", "進入動保夥伴工作台"]
]) {
  test(`${name} reveals its details and correct entry`, async ({ page }) => {
    await page.goto("/start");
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(new RegExp(`/start\\?role=${destination}$`));
    await page.getByRole("link", { name: new RegExp(action) }).click();
    await expect(page).toHaveURL(destination === "shelter" ? /\/shelter$/ : new RegExp(`/auth\\?role=${destination}$`));
    if (destination !== "shelter") await expect(page.getByRole("heading", { name: "登入／註冊專區" })).toBeVisible();
  });
}

test("keyboard activation reveals the student entry", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("button", { name: /我是學生/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/start\?role=student$/);
  await page.getByRole("link", { name: /進入學生登入／註冊/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/auth\?role=student$/);
  await expect(page.getByRole("heading", { name: "登入／註冊專區" })).toBeVisible();
});

test("legacy demo URLs redirect and judge routes are removed", async ({ page, request }) => {
  await page.goto("/demo/shelter");
  await expect(page).toHaveURL(/\/shelter$/);
  for (const path of ["/competition/judge", "/competition/judge/overview", "/demo/judge"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "這條證據路徑不存在。" })).toBeVisible();
  }
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/competition/judge");
});

test("eight-step guide shows one active step and only step one has a setup action", async ({ page }) => {
  await page.goto("/tour");
  await expect(page).toHaveURL(/\/tour\/welcome$/);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article").getByRole("link", { name: "我是學生 →" })).toHaveAttribute("href", "/auth?role=student");
  await expect(page.getByRole("article").getByRole("link", { name: "我是老師 →" })).toHaveAttribute("href", "/auth?role=teacher&mode=signup");
  await expect(page.getByRole("article").getByRole("link", { name: "我是學生 →" })).toHaveCSS("background-color", "rgb(242, 219, 164)");
  await expect(page.getByRole("article").getByRole("link", { name: "我是老師 →" })).toHaveCSS("background-color", "rgb(240, 210, 189)");
  await page.getByRole("navigation", { name: "實作步驟清單" }).getByRole("link").nth(7).click();
  await expect(page).toHaveURL(/\/tour\/final-vision$/);
  await expect(page.getByRole("heading", { name: "第八步：學期結案與證據總覽" })).toBeVisible();
  await expect(page.getByRole("article").getByRole("link", { name: /我是學生|我是老師/ })).toHaveCount(0);
});

test("public surfaces use the gold and cream theme without green utility colors", async ({ page }) => {
  for (const path of ["/", "/start", "/tour/welcome", "/auth?role=student"]) {
    await page.goto(path);
    await expect(page.locator('[class*="teal"], [class*="emerald"], [class*="green"]')).toHaveCount(0);
  }
});

test("student and teacher authentication request the correct verification codes", async ({ page }) => {
  await page.goto("/auth?role=student");
  await expect(page.locator('div[style*="b.jpg"]')).toBeVisible();
  await expect(page.locator('input[name="classCode"]')).toHaveCount(0);
  await page.getByRole("tab", { name: "建立帳號" }).click();
  await expect(page.locator('input[name="classCode"]')).toBeVisible();
  await expect(page.getByText("請使用教師提供的班級代碼建立帳號，系統會將學習紀錄連結至正確班級。")).toHaveCount(0);
  await expect(page.getByText("請向授課教師索取；註冊時也會核對帳號所屬班級。")).toBeVisible();
  await expect(page.getByLabel("教師邀請碼")).toHaveCount(0);

  await page.goto("/auth?role=teacher");
  await expect(page.locator('input[name="classCode"]')).toHaveCount(0);
  await expect(page.getByLabel("教師邀請碼")).toHaveCount(0);
  await page.getByRole("tab", { name: "建立帳號" }).click();
  await expect(page.getByLabel("教師邀請碼")).toBeVisible();
  await expect(page.locator('input[name="classCode"]')).toHaveCount(0);

  await page.goto("/auth?role=teacher&mode=signup");
  await expect(page.getByRole("tab", { name: "建立帳號" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("教師邀請碼")).toBeVisible();
});

test("role and tour cards fit mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/start", "/tour/welcome"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
