import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
loadEnvConfig(process.cwd());
let db: PrismaClient, admin: PrismaClient;
const schema = `shelterlab_test_${randomBytes(8).toString("hex")}`;
vi.mock("@/lib/db/prisma", () => ({ get prisma() { return db; } }));
vi.mock("@/lib/government-open-data", () => ({ getSchoolDirectorySnapshot: async () => ({ source: { mode: "fixture" }, schools: [{ id: "test-school", name: "測試學校", county: "高雄市" }] }) }));
import { joinClass, resetProgress, reviewWeek, saveSettings, studentProgress, studentWeek, submitWeek, teacherSubmission } from "@/lib/classroom/service";

beforeAll(async () => {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before integration tests");
  admin = new PrismaClient(); await admin.$queryRaw`SELECT 1`;
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  const url = new URL(process.env.DATABASE_URL); url.searchParams.set("schema", schema);
  db = new PrismaClient({ datasourceUrl: url.toString() });
  const sql = readFileSync("prisma/migrations/20260922000100_authenticated_classroom/migration.sql", "utf8");
  for (const statement of sql.split(";").map(s => s.trim()).filter(Boolean)) await db.$executeRawUnsafe(statement);
}, 30000);
afterAll(async () => {
  await db?.$disconnect();
  if (admin) { if (/^shelterlab_test_[a-f0-9]{16}$/.test(schema)) await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(() => undefined); await admin.$disconnect(); }
});
describe("PostgreSQL classroom lifecycle and ownership", () => {
  it("enforces assignment ownership, pending review, approval, reset and stale-page rejection", async () => {
    const teacher = await db.learningAccount.create({ data: { email: "teacher@test.invalid", role: "teacher", displayName: "教師", passwordHash: "test-only" } });
    const other = await db.learningAccount.create({ data: { email: "other@test.invalid", role: "teacher", displayName: "他班教師", passwordHash: "test-only" } });
    const student = await db.learningAccount.create({ data: { email: "student@test.invalid", role: "student", displayName: "學生", passwordHash: "test-only" } });
    await expect(saveSettings(teacher.id, { schoolId: "test-school", county: "臺北市", grade: "高一", studentCount: 30, plannedWeeks: 6 })).rejects.toThrow("縣市不符");
    const classroom = await saveSettings(teacher.id, { schoolId: "test-school", county: "高雄市", grade: "高一", studentCount: 30, plannedWeeks: 6 });
    await joinClass(student.id, classroom.joinCode);
    expect((await studentProgress(student.id)).weeks.map(w => w.status)).toEqual(["in_progress", "locked", "locked", "locked", "locked", "locked"]);
    await expect(studentWeek(student.id, 2)).rejects.toThrow("未解鎖");
    const week = await studentWeek(student.id, 1), input = { version: week.version, generation: week.generation, answers: week.questionSet.questions.map(q => ({ questionId: q.id, text: "資料無法單獨證明毛色與天數的因果關係。", selectedAnimalIds: week.questionSet.cases.slice(0, 2).map(a => a.id) })) };
    await submitWeek(student.id, 1, input);
    expect((await studentProgress(student.id)).weeks[1].status).toBe("locked");
    await expect(teacherSubmission(other.id, week.id)).rejects.toThrow();
    await expect(reviewWeek(other.id, week.id, { version: 1, decision: "approve", feedback: "" })).rejects.toThrow();
    const pending = await studentWeek(student.id, 1);
    await reviewWeek(teacher.id, week.id, { version: pending.version, decision: "return", feedback: "請補上日期代理值的限制。" });
    const returned = await studentWeek(student.id, 1); expect(returned.status).toBe("in_progress");
    await submitWeek(student.id, 1, { ...input, version: returned.version });
    const resubmitted = await studentWeek(student.id, 1);
    const simultaneous = await Promise.allSettled([reviewWeek(teacher.id, week.id, { version: resubmitted.version, decision: "approve", feedback: "通過" }), reviewWeek(teacher.id, week.id, { version: resubmitted.version, decision: "approve", feedback: "通過" })]);
    expect(simultaneous.filter(r => r.status === "fulfilled")).toHaveLength(1);
    expect((await studentProgress(student.id)).weeks.slice(0, 2).map(w => w.status)).toEqual(["completed", "in_progress"]);
    await expect(resetProgress(other.id, student.id)).rejects.toThrow();
    await resetProgress(teacher.id, student.id);
    await expect(submitWeek(student.id, 1, input)).rejects.toThrow("進度已變更");
    expect((await studentProgress(student.id)).weeks.slice(0, 2).map(w => w.status)).toEqual(["in_progress", "locked"]);
    const audit = await db.learningAudit.findFirst({ where: { action: "reset" } }); expect(JSON.stringify(audit?.details)).toContain("資料無法單獨證明");
  }, 30000);
});
