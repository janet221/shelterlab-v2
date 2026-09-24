import { describe, it, expect } from "vitest";
import { analyzeCoa, buildQuestionSet, chooseContrasts, COA_FIELDS, countyData, elapsedDays, median, parseCsv, parseDate } from "@/lib/classroom/coa";
import { applyTranslationChoices } from "@/lib/classroom/translator";
import { hashPassword, newToken, tokenHash, verifyPassword } from "@/lib/classroom/security";
import { gameAuditSubmissionSchema, settingsSchema, studentIdentitySchema, submissionSchema, validateAnswers } from "@/lib/classroom/service";
import { courseWeekLabel } from "@/lib/classroom/course";
import { assertSameOrigin, body } from "@/lib/classroom/http";
import { z } from "zod";

const row = (id: string, extra: Record<string, string> = {}) => ({ animal_id: id, animal_status: "OPEN", animal_createtime: "2026/9/1", animal_colour: "黑色", animal_bodytype: "MEDIUM", animal_age: "ADULT", animal_sex: "M", animal_Variety: "混種犬", shelter_name: "臺北市動物之家", shelter_address: "臺北市公開收容設施", animal_update: "2026/9/5", ...extra });
describe("authoritative COA classroom evidence", () => {
  it("parses quoted commas, escaped quotes, newlines and BOM without losing records", () => {
    const values = COA_FIELDS.map(f => f === "shelter_name" ? '"收容所,甲\n""乙"""' : row("a")[f as keyof ReturnType<typeof row>] || "");
    const parsed = parseCsv("\uFEFF" + COA_FIELDS.join(",") + "\r\n" + values.join(",") + "\r\n");
    expect(parsed).toHaveLength(1); expect(parsed[0].shelter_name).toBe('收容所,甲\n"乙"');
    expect(() => parseCsv("x,y\n1,2")).toThrow();
  });
  it("rejects calendar rollover, future dates and missing dates", () => {
    expect(parseDate("2026/2/30")).toBeNull(); expect(parseDate("2024/2/29")).toBe("2024-02-29");
    expect(elapsedDays("2026/9/1")).toBe(4); expect(elapsedDays("2026/9/6")).toBeNull(); expect(elapsedDays("")).toBeNull();
  });
  it("computes odd and even medians without treating unknown as zero", () => {
    expect(median([])).toBeNull(); expect(median([9, 1, 3])).toBe(3); expect(median([9, 1, 3, 7])).toBe(5);
  });
  it("uses only local OPEN unique records and reports invalid/missing values", () => {
    const result = analyzeCoa([row("a"), row("a"), row("b", { animal_createtime: "", animal_colour: "" }), row("c", { animal_status: "ADOPTED" }), row("d", { shelter_address: "新北市公開設施" })], "臺北市");
    expect(result.count).toBe(2); expect(result.validDays).toBe(1); expect(result.medianDays).toBe(4);
    expect(result.metadata.rowCount).toBe(4); expect(result.metadata.excludedCount).toBe(2); expect(result.metadata.missingValues.animal_createtime).toBe(1);
    expect(result.metadata.cannotInfer).toContain("不能證明"); expect(result.metadata.formulas[0]).toContain("animal_createtime");
  });
  it("selects two to four distinct contrasting cases reproducibly", () => {
    const result = analyzeCoa([row("a"), row("b", { animal_colour: "白色", animal_createtime: "2020/1/1" }), row("c", { shelter_name: "臺北市其他收容所", animal_createtime: "2025/1/1" }), row("d", { animal_bodytype: "SMALL" })], "臺北市");
    const selected = chooseContrasts(result.animals); expect(selected.length).toBeGreaterThanOrEqual(2); expect(selected.length).toBeLessThanOrEqual(4); expect(new Set(selected.map(a => a.id)).size).toBe(selected.length);
    expect(selected).toEqual(chooseContrasts([...result.animals].reverse()));
  });
  it("does not invent replacement animals when a county has insufficient data", () => {
    const result = analyzeCoa([], "連江縣"), set = buildQuestionSet(result, 1, "連江縣");
    expect(set.cases).toEqual([]); expect(set.medianDays).toBeNull(); expect(set.comparisonNote).toContain("不足");
  });
  it("reads the actual project CSV and keeps question facts tied to its checksum", async () => {
    const data = await countyData("高雄市"), set = buildQuestionSet(data, 1, "高雄市");
    expect(data.count).toBeGreaterThan(0); expect(set.cases.length).toBeGreaterThanOrEqual(2);
    expect(set.metadata.checksum).toMatch(/^[a-f0-9]{64}$/); expect(set.questions[0].fact).toContain(String(data.medianDays));
    expect(set.medianDays).toBe(median(data.animals.flatMap(a => a.days === null ? [] : [a.days])));
  });
  it("allows AI only to select approved language, never inject prose or numbers", () => {
    const set = buildQuestionSet(analyzeCoa([row("a"), row("b", { animal_colour: "白色" })], "臺北市"), 1, "臺北市");
    expect(applyTranslationChoices(set, { compare: 0, limits: 1, causality: 0, medianDays: 999 })).toBe(set);
    expect(applyTranslationChoices(set, { compare: "造成認養困難", limits: 1, causality: 0 })).toBe(set);
    const result = applyTranslationChoices(set, { compare: 0, limits: 1, causality: 0 });
    expect(result.wordingSource).toBe("constrained_ai"); expect(result.questions.map(q => q.fact)).toEqual(set.questions.map(q => q.fact)); expect(result.metadata).toEqual(set.metadata);
  });
  it("rejects missing answers, forged case IDs and duplicate selections", () => {
    const set = buildQuestionSet(analyzeCoa([row("a"), row("b", { animal_colour: "白色" })], "臺北市"), 1, "臺北市");
    const answers = set.questions.map(q => ({ questionId: q.id, text: "這些紀錄不能單獨證明因果關係。", selectedAnimalIds: ["a", "b"] }));
    expect(() => validateAnswers(set, answers)).not.toThrow();
    expect(() => validateAnswers(set, answers.slice(1))).toThrow();
    expect(() => validateAnswers(set, answers.map(a => ({ ...a, selectedAnimalIds: ["fake"] })))).toThrow();
    expect(() => validateAnswers(set, answers.map(a => ({ ...a, selectedAnimalIds: ["a", "a"] })))).toThrow();
  });
  it("accepts the teacher class code settings and rejects address or privilege fields", () => {
    const data = { classCode: "SHELTER-2026", schoolId: "120303", county: "高雄市", grade: "高一", studentCount: 30, plannedWeeks: 6 };
    expect(settingsSchema.safeParse(data).success).toBe(true); expect(settingsSchema.safeParse({ ...data, address: "不應收集" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...data, classCode: "短碼" }).success).toBe(false);
    expect(submissionSchema.safeParse({ version: 0, generation: 0, status: "completed", answers: [] }).success).toBe(false);
  });
  it("accepts only completed, non-empty full-game audit submissions", () => {
    const input = {
      version: 2,
      generation: 1,
      audit: {
        version: 1,
        week: 3,
        completed: true,
        completedAt: "2026-09-24T08:00:00.000Z",
        entries: [{ id: "choice:責任配套挑戰:情境題", section: "責任配套挑戰", prompt: "情境題", kind: "choice", answers: ["安排備援照顧者"], answered: true, updatedAt: "2026-09-24T07:59:00.000Z" }],
        gameState: { selectedPlan: "backup-carer" }
      }
    } as const;
    expect(gameAuditSubmissionSchema.safeParse(input).success).toBe(true);
    expect(gameAuditSubmissionSchema.safeParse({ ...input, audit: { ...input.audit, completed: false } }).success).toBe(false);
    expect(gameAuditSubmissionSchema.safeParse({ ...input, audit: { ...input.audit, entries: [] } }).success).toBe(false);
  });
  it("requires a real name and a classroom-safe student number", () => {
    expect(studentIdentitySchema.safeParse({ realName: "王小明", studentNumber: "CK-1024" }).success).toBe(true);
    expect(studentIdentitySchema.safeParse({ realName: "", studentNumber: "CK-1024" }).success).toBe(false);
    expect(studentIdentitySchema.safeParse({ realName: "王小明", studentNumber: "含 空白" }).success).toBe(false);
  });
  it("uses the approved six-week labels and rejects shortened courses", () => {
    expect(courseWeekLabel(1)).toBe("第一週｜角色與處境");
    expect(courseWeekLabel(6)).toBe("第六週｜現場與行動");
    expect(settingsSchema.safeParse({ classCode: "SHELTER-2026", schoolId: "120303", county: "高雄市", grade: "高一", studentCount: 30, plannedWeeks: 5 }).success).toBe(false);
  });
});
describe("account security boundaries", () => {
  it("salts password hashes and uses one-way random session tokens", async () => {
    const password = "a long classroom password"; const a = await hashPassword(password), b = await hashPassword(password);
    expect(a).not.toBe(b); expect(a).not.toContain(password); expect(await verifyPassword(password, a)).toBe(true); expect(await verifyPassword("incorrect", a)).toBe(false); expect(await verifyPassword(password, "bad")).toBe(false);
    const token = newToken(); expect(token).toHaveLength(43); expect(tokenHash(token)).toHaveLength(64); expect(tokenHash(token)).not.toContain(token);
  });
  it("blocks cross-origin and absent-origin mutations", () => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    expect(() => assertSameOrigin(new Request(url))).toThrow(); expect(() => assertSameOrigin(new Request(url, { headers: { origin: "https://attacker.invalid" } }))).toThrow();
    expect(() => assertSameOrigin(new Request(url, { headers: { origin: new URL(url).origin } }))).not.toThrow();
  });
  it("enforces request body size before parsing", async () => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const request = new Request(url, { method: "POST", headers: { origin: new URL(url).origin, "content-type": "application/json" }, body: JSON.stringify({ text: "a".repeat(100001) }) });
    await expect(body(request, z.object({ text: z.string() }))).rejects.toThrow("過長");
  });
});
