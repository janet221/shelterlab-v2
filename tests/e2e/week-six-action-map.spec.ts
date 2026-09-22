import { expect, test, type Page } from "@playwright/test";

const organizations = [1, 2, 3].map((number) => ({
  id: `fixture-${number}`,
  name: `測試公立動物之家 ${number}`,
  county: "臺北市",
  latitude: 25.04 + number * 0.01,
  longitude: 121.55 + number * 0.01,
  address: `臺北市測試路 ${number} 號`,
  phone: `02-1234567${number}`,
  openingHours: "請先電話確認",
  officialUrl: "https://animal.moa.gov.tw/",
  organizationType: "public_shelter",
  managementMode: "platform_curated",
  verificationLevel: "government_official",
  sourceLayer: "government_open_data",
  officialSource: "農業部測試資料",
  sourceUrl: "https://animal.moa.gov.tw/",
  actionTags: ["visit", "adoption_promotion"],
  studentNotes: ["參與前需向單位確認。"],
  requiresAdult: true,
  ageLimitNote: "未成年學生請由教師或家長協助確認。",
  hasOfficialVolunteerInfo: false,
  minorPolicy: "contact_to_confirm",
  participationModes: [],
  actionTypes: ["詢問認養資訊協助", "詢問學生參與或合作方式"],
  commitmentTypes: [],
  officialServices: ["公立收容與認領養服務"],
  volunteerInformation: "not_published",
  verificationStatus: "official",
  verifiedAt: "2026-09-16",
  dataSource: "https://data.gov.tw/dataset/134284",
  openDogCount: number
}));

async function mockOpenData(page: Page, suppliedOrganizations = organizations) {
  await page.route("**/api/open-data/adoptions", (route) => route.fulfill({ json: {
    source: { mode: "live", updatedAt: "2026-09-16", datasetUrl: "https://data.gov.tw/dataset/85903", apiUrl: "https://data.moa.gov.tw/", message: "測試資料" },
    countyCounts: { 臺北市: 3 },
    shelterCounts: Object.fromEntries(suppliedOrganizations.map((organization) => [organization.name, organization.openDogCount])),
    organizations: suppliedOrganizations,
    sampleDogs: [{ animalId: 1, subId: "TEST-001", county: "臺北市", shelterName: organizations[0].name, sex: "M", bodyType: "MEDIUM", colour: "黑色", age: "ADULT", openDate: "2026-09-01", updatedAt: "2026-09-16", imageUrl: "" }]
  }}));
  await page.route("**/api/open-data/shelter-stats", (route) => route.fulfill({ json: {
    source: { mode: "live", updatedAt: "115 年 8 月", datasetUrl: "https://data.gov.tw/dataset/41236", apiUrl: "https://data.moa.gov.tw/", message: "測試資料" },
    latestByCounty: [{ county: "臺北市", year: 115, month: 8, acceptedCount: 12, adoptedCount: 8, adoptionRate: 66.7, adoptionTotal: 8, euthanizedCount: 0, euthanasiaRate: 0, diedCount: 0, deathRate: 0 }]
  }}));
  await page.route("**/api/open-data/shelter-needs", (route) => route.fulfill({ json: {
    source: { mode: "live", updatedAt: "114 年 12 月", datasetUrl: "https://data.nat.gov.tw/dataset/73396", apiUrl: "https://data.moa.gov.tw/", message: "測試資料" },
    latestByCounty: [{ county: "臺北市", year: 114, month: 12, maxCapacity: 50, currentShelter: 20, currentFoster: 3, currentTotal: 23, governmentCapture: 1, foundDelivered: 4, ownerSurrender: 2, rescue: 1, legalSeizure: 0, otherIntake: 0, totalIntake: 8, returned: 1, publicAdoption: 5, groupAdoption: 1, totalOutcome: 7 }]
  }}));
  await page.route("**/api/open-data/schools", (route) => route.fulfill({ json: {
    source: { mode: "live", updatedAt: "115 學年度", datasetUrl: "https://data.gov.tw/dataset/6089", apiUrl: "https://stats.moe.gov.tw/files/school/115/high.json", message: "測試資料" },
    schools: [{ id: "000001", name: "測試高中", county: "臺北市", address: "臺北市測試路1號", phone: "02-12345678", website: "https://example.edu.tw", schoolYear: "115" }]
  }}));
}

async function finishStageOne(page: Page) {
  await expect(page.getByRole("heading", { name: "測試公立動物之家 1", exact: true })).toBeVisible();
  await page.getByLabel("所在縣市").selectOption("臺北市");
  await page.getByRole("button", { name: "加入我的行動計畫" }).first().click();
  await page.getByRole("button", { name: /完成任務/ }).click();
  await expect(page.getByText("TEST-001")).toBeVisible();
}

test("stage one map and notice stay in document flow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockOpenData(page);
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("最近一期認領養率", { exact: true })).toHaveCount(0);

  const mapColumn = page.locator('[class*="mapColumn"]').first();
  const mapShell = page.locator(".week6-map-shell");
  await expect(mapShell).toBeVisible();
  await expect(page.getByRole("button", { name: "1959 安全通報" })).toHaveCount(0);
  expect(await mapColumn.evaluate((element) => getComputedStyle(element).position)).toBe("static");
  expect((await mapShell.boundingBox())?.height).toBeLessThanOrEqual(540);
  const mapBox = await mapShell.boundingBox();
  const resultsBox = await page.locator('section[class*="results"]').first().boundingBox();
  expect(resultsBox?.y).toBeGreaterThanOrEqual((mapBox?.y ?? 0) + (mapBox?.height ?? 0));

  const nextButton = page.locator('[class*="stageActions"] button').last();
  await nextButton.click();
  const notice = page.getByRole("status");
  await expect(notice).toBeVisible();
  expect(await notice.evaluate((element) => getComputedStyle(element).position)).toBe("static");
  await nextButton.scrollIntoViewIfNeeded();
  await expect(nextButton).toBeVisible();
});

test("stage one separates unit type, action method and student conditions", async ({ page }) => {
  const education = { ...organizations[0], id: "education-1", name: "測試動物保護教育園區", organizationType: "education_park", actionTags: ["visit", "school_outreach"] };
  const administration = { ...organizations[1], id: "office-1", name: "測試動物保護處", organizationType: "government_agency", actionTags: ["reporting", "volunteer"], hasOfficialVolunteerInfo: true };
  await mockOpenData(page, [organizations[2], education, administration]);
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: education.name, exact: true })).toBeVisible();
  await page.getByLabel("單位類型").selectOption("education_park");
  await expect(page.getByRole("heading", { name: education.name, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: administration.name, exact: true })).toHaveCount(0);
  await page.getByLabel("單位類型").selectOption("volunteer");
  await page.getByLabel("行動方式").selectOption("volunteer");
  await expect(page.getByRole("heading", { name: administration.name, exact: true })).toBeVisible();
  await expect(page.getByLabel("年齡")).toBeVisible();
  await expect(page.getByLabel("成人或教師協助")).toBeVisible();
  await expect(page.getByLabel("交通條件")).toBeVisible();
});

test("official shelter snapshot shows each location only once", async ({ page }) => {
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[class*="cardGrid"] article').first()).toBeVisible({ timeout: 20_000 });
  await page.getByLabel("所在縣市").selectOption("彰化縣");
  await expect(page.getByRole("heading", { name: "彰化縣流浪狗中途之家", exact: true })).toHaveCount(1, { timeout: 20_000 });
  const officialLink = page.getByRole("link", { name: "查看官方資料" });
  await expect(officialLink).toHaveCount(1);
  await expect(officialLink).toHaveAttribute("href", /PS00000032$/);
});

test("superseded Changhua shelter is removed before cards render", async ({ page }) => {
  const current = {
    ...organizations[0],
    id: "PS00000032",
    name: "\u5f70\u5316\u7e23\u6d41\u6d6a\u72d7\u4e2d\u9014\u4e4b\u5bb6",
    county: "\u5f70\u5316\u7e23",
    officialUrl: "https://animal.moa.gov.tw/Frontend/PublicShelter/Detail/PS00000032",
    sourceUrl: "https://animal.moa.gov.tw/Frontend/PublicShelter/Detail/PS00000032"
  };
  const superseded = {
    ...current,
    id: "PS00000017",
    officialUrl: "https://animal.moa.gov.tw/Frontend/PublicShelter/Detail/PS00000017"
  };

  await mockOpenData(page, [current, superseded]);
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "\u5f70\u5316\u7e23\u6d41\u6d6a\u72d7\u4e2d\u9014\u4e4b\u5bb6", exact: true })).toBeVisible();
  await page.getByLabel("所在縣市").selectOption("\u5f70\u5316\u7e23");

  await expect(page.getByRole("heading", {
    name: "\u5f70\u5316\u7e23\u6d41\u6d6a\u72d7\u4e2d\u9014\u4e4b\u5bb6",
    exact: true
  })).toHaveCount(1);
  const officialLink = page.getByRole("link", { name: "\u67e5\u770b\u5b98\u65b9\u8cc7\u6599" });
  await expect(officialLink).toHaveCount(1);
  await expect(officialLink).toHaveAttribute("href", /PS00000032$/);
});

test("a county with no local shelter does not present another county as nearby", async ({ page }) => {
  await mockOpenData(page, [organizations[0]]);
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "測試公立動物之家 1", exact: true })).toBeVisible();
  await page.getByLabel("所在縣市").selectOption("連江縣");
  await expect(page.getByText(/目前沒有符合這組條件的已查核資料/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "測試公立動物之家 1", exact: true })).toHaveCount(0);
  await expect(page.getByText(/其他縣市可用/)).toHaveCount(0);
});

test("Week 6 completes six stages and stores v2 without a sixth tool", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockOpenData(page);
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "動保行動資源地圖" })).toBeVisible();
  await finishStageOne(page);

  await page.getByText("測試公立動物之家 2", { exact: true }).click();
  await page.getByRole("button", { name: /完成任務/ }).click();
  await page.getByRole("button", { name: /完成任務/ }).click();

  for (const text of ["沒有防護就直接把犬隻抱上車", "等隔天再說", "寄一般詢問 Email", "把 1959 當作活動報名專線", "直接到現場請工作人員安排工作", "先大量募集家中用不到的物品再送去"]) {
    await page.getByText(text, { exact: false }).click();
  }
  await page.getByRole("button", { name: /完成任務/ }).click();
  await expect(page.getByRole("status")).toContainText("請先修正尚未答對的安全情境");

  for (const text of ["保持安全距離、記錄位置與狀況", "先到安全處，若危險正在發生", "撥 119 說明", "在開放時間用官方電話", "查看官方招募公告", "先詢問目前需要的品項"]) {
    await page.getByText(text, { exact: false }).click();
  }
    await page.getByRole("button", { name: /完成任務/ }).click();
    await expect(page.getByLabel("電話詢問稿")).toContainText("不會未經同意直接到場");
    await expect(page.getByLabel("電話詢問稿")).toContainText("正式志工、學生服務學習、參訪");
    await expect(page.getByRole("heading", { name: "產生聯絡草稿", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "產生聯絡草稿", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "複製目前草稿" }).click();
    await expect(page.getByRole("status")).toHaveText("訊息已複製，可前往 Email 寄信囉。");
    expect(await page.getByRole("status").evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
  await page.getByRole("button", { name: /完成任務/ }).click();

  await page.getByLabel("預計行動").selectOption("詢問認養資訊協助");
  await page.getByLabel("預計日期").fill("2026-09-20");
  await page.getByLabel("成人協助安排").fill("由導師協助聯絡與確認");
  await expect(page.getByLabel("行前預期成果")).toBeVisible();
  const textareas = page.locator("textarea");
  await textareas.nth(0).fill("確認年齡、時段與安全規定");
  await textareas.nth(1).fill("先由老師致電官方電話");
  await textareas.nth(2).fill("改做校園資料查證與宣導");
  await textareas.nth(3).fill("我會先查證真實需求，不把善意變成單位負擔，也會把自己與動物的安全放在前面。");
  await page.getByRole("button", { name: "完成第六週行動承諾" }).click();
  await expect(page.getByRole("heading", { name: "我的行動摘要" })).toBeVisible();
  await expect(page.getByText("沒有新增探究工具", { exact: false })).toHaveCount(0);

  const stored = await page.evaluate(() => ({
    draft: localStorage.getItem("shelterlab-week6-action-draft-v2"),
    progress: localStorage.getItem("shelterlab-learning-progress-v2")
  }));
  expect(stored.draft).toContain('"status":"completed"');
  expect(stored.draft).not.toContain("latitude");
  expect(stored.progress).toContain("6");
  expect(stored.progress).not.toContain("field-notebook");

  await page.getByRole("button", { name: "編輯這份行動計畫" }).click();
  await expect(page.getByRole("heading", { name: "建立一份可以執行的行動計畫" })).toBeVisible();
  await expect(page.getByLabel("預計行動")).toHaveValue("詢問認養資訊協助");
  await page.getByRole("button", { name: "完成第六週行動承諾" }).click();
  await expect(page.getByRole("heading", { name: "我的行動摘要" })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "重新尋找動保資源" }).click();
  await expect(page.getByRole("heading", { name: "看見附近資源", exact: true })).toBeVisible();
  await expect(page.getByLabel("所在縣市")).toHaveValue("臺北市");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("shelterlab-week6-action-draft-v2") || "{}").selectedOrganizationId)).toBe("");
  const restarted = await page.evaluate(() => JSON.parse(localStorage.getItem("shelterlab-week6-action-draft-v2") || "{}"));
  expect(restarted.actionRecord.actionType).toBe("");
  expect(restarted.status).toBe("draft");
});

test("Week 6 is usable at 390px and live API failure uses fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/open-data/**", (route) => route.abort());
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/已切換到有日期且標示來源的備援快照/)).toBeVisible();
  const size = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
  await expect(page.getByLabel("所在縣市")).toBeVisible();
});

test("migrates a v1 draft and refresh keeps it", async ({ page }) => {
  await mockOpenData(page);
  await page.addInitScript(() => localStorage.setItem("shelterlab-week6-action-draft-v1", JSON.stringify({
    version: 1,
    profile: { age: 16, county: "臺北市", weeklyTime: "1_2", participationModes: ["online"], travelAbility: "within_county", skills: ["recommend"], commitment: "both" },
    selectedOrganizationId: "fixture-1",
    selectedAt: "2026-09-16T00:00:00Z",
    status: "draft",
    openDataDate: "2026-09-16"
  })));
  await page.goto("/student/week/6", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => localStorage.getItem("shelterlab-week6-action-draft-v2"))).toContain('"version":2');
  await expect(page.getByText(/已恢復這台裝置/)).toHaveCount(0);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText(/已恢復這台裝置/)).toHaveCount(0);
});
