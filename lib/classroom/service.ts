import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSchoolDirectorySnapshot } from "@/lib/government-open-data";
import { FALLBACK_ACTION_ORGANIZATIONS } from "@/data/action-organizations";
import { RequestError } from "./http";
import { buildQuestionSet, countyData } from "./coa";
import { translateQuestions } from "./translator";
import type { QuestionSet, SubmittedAnswer } from "./data-types";

export const settingsSchema = z.object({ schoolId: z.string().min(1).max(40), county: z.string().min(1).max(10), grade: z.enum(["高一", "高二", "高三"]), studentCount: z.number().int().min(1).max(200), plannedWeeks: z.number().int().min(1).max(6) }).strict();
export const submissionSchema = z.object({ version: z.number().int().nonnegative(), generation: z.number().int().nonnegative(), answers: z.array(z.object({ questionId: z.string().max(40), text: z.string().trim().min(10).max(3000), selectedAnimalIds: z.array(z.string().max(60)).min(1).max(4) }).strict()).length(3) }).strict();
export const reviewSchema = z.object({ version: z.number().int().nonnegative(), decision: z.enum(["approve", "return"]), feedback: z.string().trim().max(3000) }).strict();
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
const atomic = <T>(action: (tx: Prisma.TransactionClient) => Promise<T>) => prisma.$transaction(action, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 });

export async function schoolChoices() {
  const snapshot = await getSchoolDirectorySnapshot();
  return { source: snapshot.source, schools: snapshot.schools.map(({ id, name, county }) => ({ id, name, county })) };
}
export async function saveSettings(teacherId: string, input: z.infer<typeof settingsSchema>) {
  const { schools } = await schoolChoices(); const school = schools.find(s => s.id === input.schoolId);
  if (!school || school.county !== input.county) throw new RequestError(400, "學校與縣市不符，請重新選擇學校。");
  return atomic(async tx => {
    const existing = await tx.learningClass.findUnique({ where: { teacherId }, include: { _count: { select: { enrollments: true } } } });
    if (existing && existing._count.enrollments > 0 && (existing.schoolId !== input.schoolId || existing.plannedWeeks !== input.plannedWeeks)) throw new RequestError(409, "已有學生加入，無法更換學校或課程週數；其餘設定仍可更新。");
    if (existing && existing._count.enrollments > input.studentCount) throw new RequestError(409, "班級人數不可少於已加入人數。");
    const data = { ...input, schoolName: school.name, county: school.county };
    const classroom = await tx.learningClass.upsert({ where: { teacherId }, create: { ...data, teacherId, joinCode: randomBytes(6).toString("hex").toUpperCase() }, update: { ...data, revision: { increment: 1 } } });
    await tx.learningAudit.create({ data: { actorId: teacherId, classId: classroom.id, action: "settings_saved", details: json(data) } });
    return classroom;
  });
}
export async function joinClass(studentId: string, joinCode: string) {
  return atomic(async tx => {
    if (await tx.learningEnrollment.findUnique({ where: { studentId } })) throw new RequestError(409, "您已加入班級。");
    const classroom = await tx.learningClass.findUnique({ where: { joinCode }, include: { _count: { select: { enrollments: true } } } });
    if (!classroom) throw new RequestError(404, "找不到此班級代碼。");
    if (classroom._count.enrollments >= classroom.studentCount) throw new RequestError(409, "班級名額已滿，請聯絡教師。");
    await tx.learningClass.update({ where: { id: classroom.id }, data: { revision: { increment: 1 } } });
    const enrollment = await tx.learningEnrollment.create({ data: { classId: classroom.id, studentId, weeks: { create: Array.from({ length: classroom.plannedWeeks }, (_, i) => ({ week: i + 1, status: i === 0 ? "in_progress" as const : "locked" as const })) } } });
    await tx.learningAudit.create({ data: { actorId: studentId, classId: classroom.id, studentId, action: "joined", details: {} } });
    return enrollment;
  });
}
export async function studentProgress(studentId: string) {
  const enrollment = await prisma.learningEnrollment.findUnique({ where: { studentId }, include: { classroom: true, weeks: { orderBy: { week: "asc" }, select: { week: true, status: true, submittedAt: true, reviewedAt: true } } } });
  if (!enrollment) return { enrolled: false as const, weeks: [] };
  return { enrolled: true as const, generation: enrollment.generation, schoolName: enrollment.classroom.schoolName, county: enrollment.classroom.county, plannedWeeks: enrollment.classroom.plannedWeeks, weeks: enrollment.weeks };
}
export async function studentWeek(studentId: string, week: number) {
  const enrollment = await prisma.learningEnrollment.findUnique({ where: { studentId }, include: { classroom: true } });
  if (!enrollment) throw new RequestError(403, "請先加入教師提供的班級。");
  const record = await prisma.learningWeek.findUnique({ where: { enrollmentId_week: { enrollmentId: enrollment.id, week } } });
  if (!record || record.status === "locked") throw new RequestError(403, "前一週尚未經教師核准，此關卡未解鎖。");
  if (!record.questionSet) {
    const questionSet = await translateQuestions(buildQuestionSet(await countyData(enrollment.classroom.county), week, enrollment.classroom.county));
    await atomic(async tx => {
      const fresh = await tx.learningEnrollment.findUniqueOrThrow({ where: { id: enrollment.id } });
      if (fresh.generation !== enrollment.generation) throw new RequestError(409, "教師已重設進度，請重新載入。");
      await tx.learningWeek.updateMany({ where: { id: record.id, version: record.version, status: "in_progress", questionSet: { equals: Prisma.DbNull } }, data: { questionSet: json(questionSet) } });
    });
  }
  const fresh = await prisma.learningWeek.findUniqueOrThrow({ where: { id: record.id } });
  if (fresh.status === "locked") throw new RequestError(403, "關卡已重新鎖定。");
  return { ...fresh, generation: enrollment.generation, questionSet: fresh.questionSet as unknown as QuestionSet, answers: fresh.answers as unknown as SubmittedAnswer[] | null };
}
export function validateAnswers(set: QuestionSet, answers: SubmittedAnswer[]) {
  const ids = new Set(set.cases.map(a => a.id));
  if (set.cases.length < 2) throw new RequestError(409, "來源個案不足，無法送出對照作業；請聯絡教師確認資料。");
  if (new Set(answers.map(a => a.questionId)).size !== set.questions.length || set.questions.some(q => !answers.some(a => a.questionId === q.id))) throw new RequestError(400, "請回答完整題目。");
  for (const answer of answers) {
    if (new Set(answer.selectedAnimalIds).size !== answer.selectedAnimalIds.length || answer.selectedAnimalIds.some(id => !ids.has(id))) throw new RequestError(400, "所選個案不屬於這份作業。");
    if (answer.questionId === "compare" && answer.selectedAnimalIds.length < 2) throw new RequestError(400, "比較題至少選擇兩個個案。");
  }
}
export async function submitWeek(studentId: string, week: number, input: z.infer<typeof submissionSchema>) {
  return atomic(async tx => {
    const enrollment = await tx.learningEnrollment.findUnique({ where: { studentId } });
    if (!enrollment || enrollment.generation !== input.generation) throw new RequestError(409, "進度已變更，請重新載入。");
    const record = await tx.learningWeek.findUnique({ where: { enrollmentId_week: { enrollmentId: enrollment.id, week } } });
    if (!record || record.status !== "in_progress" || record.version !== input.version || !record.questionSet) throw new RequestError(409, "作業不可送出，可能已送審、尚未解鎖或已被重設。");
    if (week > 1 && (await tx.learningWeek.findUnique({ where: { enrollmentId_week: { enrollmentId: enrollment.id, week: week - 1 } } }))?.status !== "completed") throw new RequestError(403, "前一週尚未核准。");
    validateAnswers(record.questionSet as unknown as QuestionSet, input.answers);
    const updated = await tx.learningWeek.update({ where: { id: record.id }, data: { answers: json(input.answers), status: "pending", submittedAt: new Date(), feedback: "", version: { increment: 1 } } });
    await tx.learningAudit.create({ data: { actorId: studentId, classId: enrollment.classId, studentId, action: "submitted", details: json({ week, generation: enrollment.generation, answers: input.answers, questionSet: record.questionSet }) } });
    return { status: updated.status };
  });
}
export async function reviewWeek(teacherId: string, id: string, input: z.infer<typeof reviewSchema>) {
  if (input.decision === "return" && input.feedback.length < 2) throw new RequestError(400, "退回時請提供修改建議。");
  return atomic(async tx => {
    const record = await tx.learningWeek.findUnique({ where: { id }, include: { enrollment: { include: { classroom: true } } } });
    if (!record || record.enrollment.classroom.teacherId !== teacherId) throw new RequestError(404, "找不到您可審核的作業。");
    if (record.status !== "pending" || record.version !== input.version) throw new RequestError(409, "此作業狀態已變更，請重新載入。");
    await tx.learningWeek.update({ where: { id }, data: { status: input.decision === "approve" ? "completed" : "in_progress", reviewedAt: new Date(), reviewedBy: teacherId, feedback: input.feedback, version: { increment: 1 } } });
    if (input.decision === "approve") await tx.learningWeek.updateMany({ where: { enrollmentId: record.enrollmentId, week: record.week + 1, status: "locked" }, data: { status: "in_progress", version: { increment: 1 } } });
    await tx.learningAudit.create({ data: { actorId: teacherId, classId: record.enrollment.classId, studentId: record.enrollment.studentId, action: input.decision, details: json({ week: record.week, generation: record.enrollment.generation, feedback: input.feedback, previousVersion: record.version }) } });
    return { ok: true };
  });
}
export async function resetProgress(teacherId: string, studentId?: string) {
  return atomic(async tx => {
    const classroom = await tx.learningClass.findUnique({ where: { teacherId } });
    if (!classroom) throw new RequestError(404, "尚未建立班級。");
    const enrollments = await tx.learningEnrollment.findMany({ where: { classId: classroom.id, ...(studentId ? { studentId } : {}) }, include: { weeks: true } });
    if (studentId && !enrollments.length) throw new RequestError(404, "找不到本班學生。");
    for (const enrollment of enrollments) {
      await tx.learningAudit.create({ data: { actorId: teacherId, classId: classroom.id, studentId: enrollment.studentId, action: "reset", details: json({ previousGeneration: enrollment.generation, previousWeeks: enrollment.weeks }) } });
      await tx.learningEnrollment.update({ where: { id: enrollment.id }, data: { generation: { increment: 1 } } });
      await tx.learningWeek.updateMany({ where: { enrollmentId: enrollment.id }, data: { status: "locked", questionSet: Prisma.DbNull, answers: Prisma.DbNull, submittedAt: null, reviewedAt: null, reviewedBy: null, feedback: "", version: { increment: 1 } } });
      await tx.learningWeek.update({ where: { enrollmentId_week: { enrollmentId: enrollment.id, week: 1 } }, data: { status: "in_progress" } });
    }
    return { resetCount: enrollments.length };
  });
}
export async function teacherDashboard(teacherId: string) {
  const classroom = await prisma.learningClass.findUnique({ where: { teacherId }, include: { enrollments: { include: { student: { select: { id: true, displayName: true } }, weeks: { select: { id: true, week: true, status: true, submittedAt: true } } }, orderBy: { createdAt: "asc" } } } });
  if (!classroom) return { classroom: null, pending: [] };
  return { classroom, pending: classroom.enrollments.flatMap(e => e.weeks.filter(w => w.status === "pending").map(w => ({ ...w, student: e.student }))).sort((a, b) => (a.submittedAt?.getTime() || 0) - (b.submittedAt?.getTime() || 0)) };
}
export async function teacherSubmission(teacherId: string, id: string) {
  const record = await prisma.learningWeek.findFirst({ where: { id, enrollment: { classroom: { teacherId } } }, include: { enrollment: { include: { student: { select: { displayName: true } } } } } });
  if (!record) throw new RequestError(404, "找不到作業。");
  return record;
}
export async function localWorkbench(county: string) {
  const data = await countyData(county);
  const shelters = FALLBACK_ACTION_ORGANIZATIONS.filter(o => o.county === county && ["public_shelter", "animal_home", "education_park", "animal_welfare_education_park"].includes(o.organizationType));
  return { ...data, comparison: buildQuestionSet(data, 1, county), shelters: shelters.map(o => ({ id: o.id, name: o.name, url: o.officialUrl, phone: o.phone, metadata: { name: "公立收容所公開資料", agency: "農業部／地方政府", url: o.sourceUrl, updatedAt: o.verifiedAt, snapshotDate: o.verifiedAt, fields: ["name", "county", "phone", "officialUrl"], rowCount: 1, missingValues: { phone: o.phone ? 0 : 1 }, formulas: ["以學校縣市篩選公立收容所；不以學生住址或精確座標排序"], scope: county, canExplain: "同縣市可聯絡的公立收容服務。", cannotInfer: "不是依通勤距離排序；參訪及學生參與資格須向單位確認。" } })),
    learning_resources: [{ title: "愛學網：生物多樣性", url: "https://stv.naer.edu.tw/watch/1735", reason: "對照個體差異、棲地與未記錄的環境變項；適用各縣市。", metadata: { name: "愛學網影音教材中繼資料", agency: "國家教育研究院", url: "https://data.gov.tw/dataset/6318", updatedAt: "專案既有教材索引；最新更新日期未提供", snapshotDate: "未提供", fields: ["title", "sourceUrl", "moduleCode"], rowCount: 1, missingValues: { updatedAt: 1 }, formulas: ["依生物多樣性與資料推論教學主題推薦，不是地理距離排名"], scope: "高中資料判讀補充教材", canExplain: "提供生物多樣性教學的官方外連。", cannotInfer: "教材不是該縣市動物的實證資料，不能用來證明個案因果關係。" } }] };
}
