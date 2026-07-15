import { expect, test } from "@playwright/test";

test("student observation flow smoke test", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "Today's Tasks" })).toBeVisible();
  await page.getByRole("link", { name: "Start Observation" }).click();

  await expect(page.getByRole("heading", { name: "Observation Timer" })).toBeVisible();
  await expect(page.getByLabel("Observation timer")).toContainText("05:00");
  await page.getByRole("button", { name: "Record LOOK_AT_HUMAN" }).click();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();

  await page.getByRole("link", { name: "Review Before Submit" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Submit" })).toBeVisible();
  await page.getByRole("link", { name: "Submit Observation" }).click();
  await expect(page.getByRole("heading", { name: "Submission Result" })).toBeVisible();
});
