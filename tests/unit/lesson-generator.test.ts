import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLocalLessonPlan } from "@/lib/classroom/lesson-generator";

const animal = (id: string, shelter: string, county = "臺北市", extra: Record<string, string> = {}) => ({
  animal_id: id,
  animal_status: "OPEN",
  animal_createtime: "2026/08/01",
  animal_colour: "黑色",
  animal_bodytype: "MEDIUM",
  animal_Variety: "混種犬",
  animal_age: "ADULT",
  animal_sex: "M",
  shelter_name: shelter,
  shelter_address: `${county}公開收容設施`,
  animal_update: "2026/09/05",
  ...extra,
});

const rows = [
  animal("t1", "甲動物之家"), animal("t2", "甲動物之家", "臺北市", { animal_bodytype: "SMALL" }), animal("t3", "甲動物之家"),
  animal("t4", "乙動物之家", "臺北市", { animal_createtime: "2026/07/01" }), animal("t5", "乙動物之家", "臺北市", { animal_bodytype: "" }),
  animal("t6", "丙動物之家", "臺北市", { animal_createtime: "2026/06/01" }),
  animal("n1", "新北動物之家", "新北市"), animal("n2", "新北動物之家", "新北市"), animal("n3", "新北動物之家", "新北市"), animal("n4", "新北動物之家", "新北市"),
];

describe("zero-hallucination local lesson generator", () => {
  it("derives every count and percentage from source rows", () => {
    const result = buildLocalLessonPlan(rows, "checksum", "臺北市");
    expect(result.available).toBe(true);
    if (!result.available) return;
    expect(result.localOpenCount).toBe(6);
    expect(result.nationalOpenCount).toBe(10);
    expect(result.localShare).toBe(60);
    expect(result.shelterCounts.map(item => [item.shelter, item.count])).toEqual([["甲動物之家", 3], ["乙動物之家", 2], ["丙動物之家", 1]]);
    expect(result.bodyDistribution.find(item => item.label === "未提供")?.count).toBe(1);
  });

  it("selects two to four real cases deterministically without random numbers", () => {
    const first = buildLocalLessonPlan(rows, "checksum", "臺北市");
    const reversed = buildLocalLessonPlan([...rows].reverse(), "checksum", "臺北市");
    expect(first.available && first.selectedCases.length).toBeGreaterThanOrEqual(2);
    expect(first.available && first.selectedCases.length).toBeLessThanOrEqual(4);
    expect(first.available && first.selectedCases.map(item => item.id)).toEqual(reversed.available && reversed.selectedCases.map(item => item.id));
    expect(readFileSync("lib/classroom/lesson-generator.ts", "utf8")).not.toContain("Math.random");
  });

  it("fails closed instead of inventing a fallback dataset", () => {
    expect(buildLocalLessonPlan(rows, "checksum", "連江縣")).toEqual({ available: false, county: "連江縣", message: "該區間無可用資料，請重新設定條件" });
  });
});
