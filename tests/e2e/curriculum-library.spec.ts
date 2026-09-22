import { expect, test } from "@playwright/test";

test("teacher curriculum workflow pages expose resource, blueprint, draft, and published question governance", async ({ page }) => {
  await page.goto("/teacher/curriculum/resources");
  await expect(page.getByRole("heading", { name: "Curriculum resource library" })).toBeVisible();
  await expect(page.getByText("UNVERIFIED_DEMO iLearn Resource Placeholder 001")).toBeVisible();

  await page.getByRole("link", { name: /ShelterLab Teacher-Authored Behavior Primer/ }).click();
  await expect(page.getByRole("heading", { name: "ShelterLab Teacher-Authored Behavior Primer" })).toBeVisible();
  await expect(page.getByText("Traceability")).toBeVisible();

  await page.goto("/teacher/curriculum/blueprints");
  await expect(page.getByRole("heading", { name: "Question generation blueprints" })).toBeVisible();
  await expect(page.getByText("No LLM is connected.")).toBeVisible();

  await page.goto("/teacher/curriculum/drafts");
  await expect(page.getByRole("heading", { name: "AI draft review queue" })).toBeVisible();
  await expect(page.getByText("DEMO_AI_DRAFT").first()).toBeVisible();

  await page.goto("/teacher/curriculum/questions");
  await expect(page.getByRole("heading", { name: "Published question bank" })).toBeVisible();

  await page.goto("/teacher/curriculum/standards");
  await expect(page.getByRole("heading", { name: "Learning standard references" })).toBeVisible();
  await expect(page.getByText("OFFICIAL_VERIFIED", { exact: true })).toBeVisible();
  await expect(page.getByText("DEMO_REFERENCE", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("UNVERIFIED", { exact: true })).toBeVisible();
});

test("student failed quiz path shows approved remediation resources only", async ({ page }) => {
  await page.goto("/research-license/quiz/result");
  await page.getByRole("link", { name: "Review remediation resources" }).click();

  await expect(page.getByRole("heading", { name: "Approved learning resources" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ShelterLab Teacher-Authored Behavior Primer" })).toBeVisible();
  await expect(page.getByText("Remediation recommendations")).toBeVisible();
  await expect(page.getByText("UNVERIFIED_DEMO iLearn Resource Placeholder 001")).toHaveCount(0);
});
