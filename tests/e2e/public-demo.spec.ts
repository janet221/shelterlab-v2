import { expect, test } from "@playwright/test";

test("role selection contains exactly three direct workspace links", async ({ page }) => {
  await page.goto("/start");
  const roles = page.getByRole("region", { name: "角色選擇" });
  await expect(roles.getByRole("link")).toHaveCount(3);
  for (const [name, href] of [["我是學生", "/student"], ["我是教師", "/teacher"], ["我是收容所人員", "/shelter"]]) {
    await expect(roles.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
  }
  await expect(page.getByText("我是評審或合作夥伴")).toHaveCount(0);
  await expect(page.getByText(/角色導覽不代表正式登入或/)).toHaveCount(0);
});

for (const [name, destination] of [["我是學生", "student"], ["我是教師", "teacher"], ["我是收容所人員", "shelter"]]) {
  test(`${name} enters its workspace or login with one click`, async ({ page }) => {
    await page.goto("/start");
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(destination === "shelter" ? /\/shelter$/ : new RegExp(`/auth\\?role=${destination}$`));
    if (destination !== "shelter") await expect(page.getByRole("heading", { name: "登入／註冊專區" })).toBeVisible();
  });
}

test("keyboard activation directly enters the student login", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("link", { name: /我是學生/ }).focus();
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

test("eight-step guide only offers a setup action on step one", async ({ page }) => {
  await page.goto("/tour");
  await expect(page).toHaveURL(/\/tour\/welcome$/);
  const cards = page.getByRole("region", { name: "八步驟學習流程" }).getByRole("article");
  await expect(cards).toHaveCount(8);
  await expect(cards.first().getByRole("link")).toHaveText("進入系統設置 →");
  await expect(cards.first().getByRole("link")).toHaveAttribute("href", "/auth");
  for (let index = 1; index < 8; index++) {
    await expect(cards.nth(index).getByRole("link")).toHaveCount(0);
    await expect(cards.nth(index).getByRole("button")).toHaveCount(0);
  }
  await page.getByRole("navigation", { name: "實作步驟清單" }).getByRole("link").nth(7).click();
  await expect(page.locator("#step-8")).toBeInViewport();
  await page.goto("/tour/welcome");
  await cards.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/auth$/);
});

test("role and tour cards fit mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/start", "/tour/welcome"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
