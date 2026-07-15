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
  it("defines four deterministic read-only public accounts", () => {
    expect(publicDemoAccounts.map((account) => account.role)).toEqual(publicDemoRoleIds);
    expect(new Set(publicDemoAccounts.map((account) => account.testCode)).size).toBe(4);
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
      "認識 ShelterLab",
      "研究觀察資格",
      "300 秒非接觸觀察",
      "證據時間軸",
      "犬隻證據檔案",
      "One Health 探究",
      "影響力儀表板",
      "競賽展示重點"
    ]);
    expect(publicTourSteps.map((step) => step.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(getRemainingTourSeconds(8)).toBe(0);
    expect(getRemainingTourSeconds(1)).toBeGreaterThan(0);
  });

  it("publishes a public-safe zero-mutation manifest", () => {
    const manifest = getPublicDemoManifest();
    expect(manifest.accounts).toHaveLength(4);
    expect(manifest.tour).toHaveLength(8);
    expect(manifest.productionMutationCount).toBe(0);
    expect(JSON.stringify(manifest)).not.toContain("password");
    expect(JSON.stringify(manifest)).not.toContain("studentId");
  });
});
