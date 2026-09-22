import { describe, expect, it } from "vitest";
import {
  createPublicDemoState,
  getPublicDemoManifest,
  getRemainingTourSeconds,
  publicDemoAccounts,
  publicDemoRoleIds,
  publicTourSteps,
  resetPublicDemoState,
  selectPublicDemoRole
} from "@/lib/public-demo/engine";

describe("Sprint 11C public demo engine", () => {
  it("defines three deterministic read-only public accounts", () => {
    expect(publicDemoAccounts.map((account) => account.role)).toEqual(publicDemoRoleIds);
    expect(new Set(publicDemoAccounts.map((account) => account.testCode)).size).toBe(3);
    expect(publicDemoAccounts.every((account) => account.readOnly && account.syntheticDemo)).toBe(true);
    expect(publicDemoAccounts.every((account) => account.testCode.startsWith("DEMO-"))).toBe(true);
  });

  it("restores the exact canonical public fixture state", () => {
    const canonical = createPublicDemoState();
    const selected = selectPublicDemoRole(canonical, "teacher");
    expect(selected).not.toEqual(canonical);
    expect(resetPublicDemoState()).toEqual(canonical);
    expect(canonical).toMatchObject({ readOnly: true, syntheticDemo: true, productionMutationCount: 0 });
  });

  it("defines the approved eight-step tour in order", () => {
    expect(publicTourSteps.map((step) => step.title)).toEqual([
      "第一步：課程與帳號啟動",
      "第二步：第一週｜角色與處境",
      "第三步：第二週｜承諾與責任",
      "第四步：第三週｜品種與標籤",
      "第五步：第四週｜數量與源頭",
      "第六步：第五週｜政策與兩難",
      "第七步：第六週｜現場與行動",
      "第八步：學期結案與證據總覽"
    ]);
    expect(publicTourSteps.map((step) => step.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(getRemainingTourSeconds(8)).toBe(0);
    expect(getRemainingTourSeconds(1)).toBeGreaterThan(0);
  });

  it("publishes a public-safe zero-mutation manifest", () => {
    const manifest = getPublicDemoManifest();
    expect(manifest.accounts).toHaveLength(3);
    expect(manifest.tour).toHaveLength(8);
    expect(manifest.productionMutationCount).toBe(0);
    expect(JSON.stringify(manifest)).not.toContain("password");
    expect(JSON.stringify(manifest)).not.toContain("studentId");
  });
});
