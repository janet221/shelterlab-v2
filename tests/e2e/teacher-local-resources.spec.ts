import { expect, test, type Page } from "@playwright/test";

async function mockTeacherOpenData(page: Page) {
  await page.route("**/api/open-data/adoptions", (route) => route.fulfill({ json: {
    source: { mode: "live", updatedAt: "2026-09-17", datasetUrl: "https://data.moa.gov.tw/open_detail.aspx?id=QcbUEzN6E6DL", apiUrl: "https://data.moa.gov.tw/", message: "測試資料" },
    countyCounts: { 臺北市: 1 }, shelterCounts: { 測試動物之家: 1 }, sampleDogs: [],
    organizations: [{ id: "teacher-fixture-1", name: "測試動物之家", county: "臺北市", latitude: 25.04, longitude: 121.55, address: "臺北市測試路1號", phone: "02-12345678", officialUrl: "https://animal.moa.gov.tw/", organizationType: "animal_home", managementMode: "platform_curated", verificationLevel: "government_official", sourceLayer: "government_open_data", officialSource: "農業部公立收容所資料", sourceUrl: "https://animal.moa.gov.tw/", actionTags: ["visit", "adoption_promotion"], studentNotes: ["參與前請確認。"], requiresAdult: true, ageLimitNote: "請由教師或家長協助確認。", hasOfficialVolunteerInfo: false, minorPolicy: "contact_to_confirm", participationModes: [], actionTypes: ["詢問"], commitmentTypes: [], officialServices: ["認領養"], volunteerInformation: "not_published", verificationStatus: "official", verifiedAt: "2026-09-17", dataSource: "https://data.moa.gov.tw/", openDogCount: 1 }]
  }}));
  await page.route("**/api/open-data/shelter-stats", (route) => route.fulfill({ json: { source: { mode: "live", updatedAt: "115 年 8 月", datasetUrl: "https://data.gov.tw/dataset/41236", apiUrl: "https://data.moa.gov.tw/", message: "測試資料" }, latestByCounty: [{ county: "臺北市", year: 115, month: 8, acceptedCount: 12, adoptedCount: 8, adoptionRate: 66.7, adoptionTotal: 8, euthanizedCount: 0, euthanasiaRate: 0, diedCount: 0, deathRate: 0 }] } }));
  await page.route("**/api/open-data/shelter-needs", (route) => route.fulfill({ json: { source: { mode: "live", updatedAt: "114 年 12 月", datasetUrl: "https://data.nat.gov.tw/dataset/73396", apiUrl: "https://data.moa.gov.tw/", message: "測試資料" }, latestByCounty: [{ county: "臺北市", year: 114, month: 12, maxCapacity: 50, currentShelter: 20, currentFoster: 3, currentTotal: 23, governmentCapture: 1, foundDelivered: 4, ownerSurrender: 2, rescue: 1, legalSeizure: 0, otherIntake: 0, totalIntake: 8, returned: 1, publicAdoption: 5, groupAdoption: 1, totalOutcome: 7 }] } }));
  await page.route("**/api/open-data/schools", (route) => route.fulfill({ json: { source: { mode: "live", updatedAt: "115 學年度", datasetUrl: "https://data.gov.tw/dataset/6089", apiUrl: "https://stats.moe.gov.tw/files/school/115/high.json", message: "測試資料" }, schools: [{ id: "000001", name: "測試高中", county: "臺北市", address: "臺北市測試路2號", phone: "02-87654321", website: "https://example.edu.tw", schoolYear: "115" }] } }));
}

test("teacher map selects a school and labels official data without fake distance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockTeacherOpenData(page);
  await page.goto("/teacher/local-resources", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "從學校所在縣市規劃動保行動" })).toBeVisible();
  await page.getByLabel("學校").selectOption("000001");
  await expect(page.locator('[class*="sourceMeta"]').getByText("提供機關：教育部統計處", { exact: true })).toBeVisible();
  await expect(page.locator("section").filter({ has: page.getByLabel("學校") }).locator("strong", { hasText: "測試高中" })).toBeVisible();
  await expect(page.getByText(/學校名錄未提供座標，因此未計算距離/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "測試動物之家", exact: true })).toBeVisible();
  await expect(page.getByText("政府開放資料", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "臺北市收容需求摘要" })).toBeVisible();
});

test("teacher map remains usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockTeacherOpenData(page);
  await page.goto("/teacher/local-resources", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".week6-map-shell")).toBeVisible();
  const size = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
  await expect(page.getByLabel("搜尋層級")).toBeVisible();
});
