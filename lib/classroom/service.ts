import { z } from "zod";
import { getSchoolDirectorySnapshot } from "@/lib/government-open-data";
import { FALLBACK_ACTION_ORGANIZATIONS } from "@/data/action-organizations";
import { RequestError } from "./http";
import { buildQuestionSet, countyData } from "./coa";
import type { QuestionSet, SubmittedAnswer, WeekGameAudit } from "./data-types";

export const settingsSchema = z.object({ classId: z.string().uuid().optional(), teacherName: z.string().trim().min(1, "請填寫教師姓名或稱謂。").max(100), classCode: z.string().trim().min(8).max(64).regex(/^[A-Za-z0-9][A-Za-z0-9-]*$/).transform(value => value.toUpperCase()), schoolId: z.string().min(1).max(40), county: z.string().min(1).max(10), grade: z.enum(["高一", "高二", "高三"]), studentCount: z.number().int().min(1).max(200), plannedWeeks: z.literal(6) }).strict();
export const studentIdentitySchema = z.object({
  realName: z.string().trim().min(2, "請填寫真實姓名。").max(100),
  studentNumber: z.string().trim().min(1, "請填寫學號。").max(40).regex(/^[A-Za-z0-9_-]+$/, "學號只能包含英文字母、數字、底線或連字號。")
}).strict();
export const submissionSchema = z.object({ version: z.number().int().nonnegative(), generation: z.number().int().nonnegative(), answers: z.array(z.object({ questionId: z.string().max(40), text: z.string().trim().min(10).max(3000), selectedAnimalIds: z.array(z.string().max(60)).min(1).max(4) }).strict()).length(3) }).strict();
const auditEntrySchema = z.object({
  id: z.string().min(1).max(700),
  section: z.string().min(1).max(500),
  prompt: z.string().min(1).max(500),
  kind: z.enum(["choice", "text", "checkbox", "select", "action"]),
  answers: z.array(z.string().min(1).max(3000)).max(30),
  answered: z.boolean(),
  updatedAt: z.string().datetime()
}).strict();
export const gameAuditSubmissionSchema = z.object({
  version: z.number().int().nonnegative(),
  generation: z.number().int().nonnegative(),
  audit: z.object({
    version: z.literal(1),
    week: z.number().int().min(1).max(6),
    completed: z.literal(true),
    completedAt: z.string().datetime(),
    entries: z.array(auditEntrySchema).min(1).max(500),
    gameState: z.record(z.string(), z.unknown())
  }).strict()
}).strict();
export const reviewSchema = z.object({ version: z.number().int().nonnegative(), generation: z.number().int().nonnegative(), decision: z.literal("approve"), feedback: z.string().trim().max(3000) }).strict();
export const resetSchema = z.object({ classId: z.string().uuid(), confirmation: z.literal("RESET"), targets: z.array(z.object({ studentId: z.string().uuid(), generation: z.number().int().nonnegative() }).strict()).min(1).max(200) }).strict();
const statuses = { Locked: "locked", "In Progress": "in_progress", Pending: "pending", Completed: "completed" } as const;
type DbStatus = keyof typeof statuses;
type Profile = { id: string; display_name: string; real_name: string; student_number: string; class_id: string | null; progress_generation: number; is_course_completed: boolean; course_completed_at: string | null };
type ClassRow = { id: string; name: string; teacher_id: string; class_code: string; school_id: string | null; school_name: string | null; county: string | null; grade: string | null; student_count: number };
type ProgressRow = { student_id: string; week_number: number; status: DbStatus; version: number; submitted_at: string | null; reviewed_at: string | null; feedback: string; question_set: QuestionSet | null; answers: SubmittedAnswer[] | null; game_audit: WeekGameAudit | null };
async function client() {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  return createServerSupabaseClient();
}
function checked<T>({ data, error }: { data: T; error: { code?: string; message?: string } | null }): T {
  if (error) {
    if (error.code === "42501") throw new RequestError(403, "您沒有此班級或學生的操作權限。");
    if (error.code === "40001") throw new RequestError(409, "進度已變更，請重新整理後再操作。");
    if (error.code === "23514" && error.message?.includes("Class capacity below enrollment")) throw new RequestError(409, "班級人數不可小於目前已加入的學生人數。");
    if (error.code === "23514") throw new RequestError(409, "目前狀態不允許此操作，請重新整理後再試。");
    if (error.code === "23505") throw new RequestError(409, "這個班級代碼已被使用，請設定另一組代碼。");
    if (error.code === "22023" || error.code === "22P02") throw new RequestError(400, "提交資料不完整，請重新確認。");
    throw new RequestError(503, "資料服務暫時無法使用，請確認 Step 4 資料庫遷移已套用。");
  }
  return data;
}
function mapWeek(row: ProgressRow) {
  return { id: `${row.student_id}_${row.week_number}`, week: row.week_number, status: statuses[row.status], version: row.version, submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, feedback: row.feedback, questionSet: row.question_set, answers: row.answers, gameAudit: row.game_audit };
}
async function profile(studentId: string) {
  const db = await client();
  const data = checked(await db.from("profiles").select("id,display_name,real_name,student_number,class_id,progress_generation,is_course_completed,course_completed_at").eq("id", studentId).eq("role", "student").maybeSingle()) as Profile | null;
  if (!data) throw new RequestError(404, "找不到您可存取的學生。");
  return data;
}
export async function schoolChoices() {
  const snapshot = await getSchoolDirectorySnapshot();
  return { source: snapshot.source, schools: snapshot.schools.map(({ id, name, county }) => ({ id, name, county })) };
}
export async function saveSettings(teacherId: string, input: z.infer<typeof settingsSchema>) {
  const { schools } = await schoolChoices();
  const school = schools.find(s => s.id === input.schoolId);
  if (!school || school.county !== input.county) throw new RequestError(400, "學校與縣市不符，請重新選擇學校。");
  const db = await client();
  checked(await db.from("profiles").update({ display_name: input.teacherName }).eq("id", teacherId).eq("role", "teacher"));
  const id = checked(await db.rpc("shelterlab_save_class", { p_class_id: input.classId ?? null, p_school_id: school.id, p_school_name: school.name, p_county: school.county, p_grade: input.grade, p_student_count: input.studentCount, p_class_code: input.classCode }));
  return { id };
}
export async function studentProgress(studentId: string) {
  const db = await client(), student = await profile(studentId);
  const classroom = checked(await db.from("classes").select("name,school_name,county,grade,class_code").eq("id", student.class_id).single());
  if (!classroom) throw new RequestError(404, "找不到學生所屬班級。");
  const weeks = checked(await db.from("student_progress").select("*").eq("student_id", studentId).order("week_number")) as ProgressRow[];
  return { enrolled: true as const, generation: student.progress_generation, isCourseCompleted: student.is_course_completed, courseCompletedAt: student.course_completed_at, realName: student.real_name || "", studentNumber: student.student_number || "", requiresIdentity: !student.real_name?.trim() || !student.student_number?.trim(), schoolName: classroom.school_name || classroom.name, classCode: classroom.class_code, county: classroom.county, grade: classroom.grade || "", plannedWeeks: 6, weeks: weeks.map(mapWeek) };
}
export async function updateStudentIdentity(studentId: string, input: z.infer<typeof studentIdentitySchema>) {
  const db = await client();
  const result = await db.from("profiles").update({ real_name: input.realName, student_number: input.studentNumber, display_name: input.realName }).eq("id", studentId).eq("role", "student").select("real_name,student_number").single();
  if (result.error?.code === "23505") throw new RequestError(409, "此學號已由同班其他學生使用，請確認後再試。");
  const data = checked(result) as { real_name: string; student_number: string } | null;
  if (!data) throw new RequestError(404, "找不到可更新的學生資料。");
  return { realName: data.real_name, studentNumber: data.student_number, requiresIdentity: false as const };
}
export async function studentWeek(studentId: string, week: number) {
  if (!Number.isInteger(week) || week < 1 || week > 6) throw new RequestError(404, "找不到週次。");
  const progress = await studentProgress(studentId);
  const record = progress.weeks.find(w => w.week === week);
  if (!record || record.status === "locked" || progress.weeks.filter(w => w.week < week && w.status === "completed").length !== week - 1) throw new RequestError(403, "前一週尚未經教師核准，此關卡未解鎖。");
  if (!record.questionSet && !progress.county) throw new RequestError(409, "請教師先至設定面板完成班級學校與縣市設定。");
  const questionSet = record.questionSet ?? buildQuestionSet(await countyData(progress.county!), week, progress.county!);
  return { ...record, generation: progress.generation, questionSet };
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
  const record = await studentWeek(studentId, week);
  if (record.status !== "in_progress" || record.version !== input.version || record.generation !== input.generation) throw new RequestError(409, "進度已變更或已送審，請重新載入。");
  validateAnswers(record.questionSet, input.answers);
  const db = await client();
  checked(await db.rpc("shelterlab_progress_action", { p_student_id: studentId, p_week: week, p_action: "submit", p_generation: input.generation, p_version: input.version, p_answers: input.answers, p_question_set: record.questionSet }));
  return { status: "pending" };
}
export async function submitGameAudit(studentId: string, week: number, input: z.infer<typeof gameAuditSubmissionSchema>) {
  const record = await studentWeek(studentId, week);
  if (record.status !== "in_progress" || record.version !== input.version || record.generation !== input.generation) throw new RequestError(409, "進度已變更或已送審，請重新載入。");
  if (input.audit.week !== week) throw new RequestError(400, "關卡稽核資料與週次不符。");
  const audit = input.audit as WeekGameAudit;
  const db = await client();
  checked(await db.rpc("shelterlab_submit_game_audit", { p_student_id: studentId, p_week: week, p_generation: input.generation, p_version: input.version, p_game_audit: audit }));
  return { status: "pending" };
}
export async function teacherDashboard(teacherId: string) {
  const db = await client();
  const teacher = checked(await db.from("profiles").select("display_name").eq("id", teacherId).eq("role", "teacher").maybeSingle()) as { display_name: string } | null;
  const classes = checked(await db.from("classes").select("*").eq("teacher_id", teacherId).order("created_at")) as ClassRow[];
  const students = classes.length ? checked(await db.from("profiles").select("id,display_name,real_name,student_number,class_id,progress_generation,is_course_completed,course_completed_at").eq("role", "student").in("class_id", classes.map(c => c.id)).order("created_at")) as Profile[] : [];
  const records = students.length ? checked(await db.from("student_progress").select("student_id,week_number,status,version,submitted_at,reviewed_at,feedback").in("student_id", students.map(s => s.id))) as ProgressRow[] : [];
  const classrooms = classes.map(c => ({ id: c.id, name: c.name, schoolId: c.school_id || "", schoolName: c.school_name || c.name, county: c.county || "", grade: c.grade || "", studentCount: c.student_count, plannedWeeks: 6, joinCode: c.class_code,
    enrollments: students.filter(s => s.class_id === c.id).map(s => ({ student: { id: s.id, displayName: s.real_name || s.display_name || "未填姓名", realName: s.real_name || "", studentNumber: s.student_number || "" }, generation: s.progress_generation, isCourseCompleted: s.is_course_completed, weeks: records.filter(w => w.student_id === s.id).map(mapWeek) })) }));
  const pending = classrooms.flatMap(c => c.enrollments.flatMap(e => e.weeks.filter(w => w.status === "pending").map(w => ({ ...w, student: e.student, generation: e.generation, classId: c.id, className: c.name })))).sort((a, b) => (a.submittedAt || "").localeCompare(b.submittedAt || ""));
  return { teacherName: teacher?.display_name?.trim() || "授課教師", classroom: classrooms[0] ?? null, classrooms, pending };
}
export async function teacherSubmission(teacherId: string, id: string) {
  const match = /^([0-9a-f-]{36})_([1-6])$/i.exec(id);
  if (!match) throw new RequestError(404, "找不到作業。");
  const db = await client(), student = await profile(match[1]);
  const classroom = checked(await db.from("classes").select("id").eq("id", student.class_id).eq("teacher_id", teacherId).maybeSingle());
  if (!classroom) throw new RequestError(404, "找不到您可審核的作業。");
  const record = checked(await db.from("student_progress").select("*").eq("student_id", student.id).eq("week_number", Number(match[2])).single()) as ProgressRow;
  return { ...mapWeek(record), studentId: student.id, generation: student.progress_generation, enrollment: { student: { displayName: student.real_name || student.display_name || "未填姓名", realName: student.real_name || "", studentNumber: student.student_number || "", id: student.id } } };
}
export async function reviewWeek(teacherId: string, id: string, input: z.infer<typeof reviewSchema>) {
  const record = await teacherSubmission(teacherId, id), db = await client();
  checked(await db.rpc("shelterlab_progress_action", { p_student_id: record.studentId, p_week: record.week, p_action: "approve", p_generation: input.generation, p_version: input.version, p_feedback: input.feedback }));
  return { ok: true };
}
export async function resetProgress(_teacherId: string, input: z.infer<typeof resetSchema>) {
  const db = await client();
  const resetCount = checked(await db.rpc("shelterlab_reset_class_progress", { p_class_id: input.classId, p_targets: input.targets })) as number;
  return { resetCount };
}
export async function localWorkbench(county: string) {
  const data = await countyData(county);
  const shelters = FALLBACK_ACTION_ORGANIZATIONS.filter(o => o.county === county && ["public_shelter", "animal_home", "education_park", "animal_welfare_education_park"].includes(o.organizationType));
  return { ...data, comparison: buildQuestionSet(data, 1, county), shelters: shelters.map(o => ({ id: o.id, name: o.name, url: o.officialUrl, phone: o.phone, metadata: { name: "公立收容所公開資料", agency: "農業部／地方政府", url: o.sourceUrl, updatedAt: o.verifiedAt, snapshotDate: o.verifiedAt, fields: ["name", "county", "phone", "officialUrl"], rowCount: 1, missingValues: { phone: o.phone ? 0 : 1 }, formulas: ["以學校縣市篩選公立收容所；不以學生住址或精確座標排序"], scope: county, canExplain: "同縣市可聯絡的公立收容服務。", cannotInfer: "不是依通勤距離排序；參訪及學生參與資格須向單位確認。" } })),
    learning_resources: [{ title: "愛學網：生物多樣性", url: "https://stv.naer.edu.tw/watch/1735", reason: "對照個體差異、棲地與未記錄的環境變項；適用各縣市。", metadata: { name: "愛學網影音教材中繼資料", agency: "國家教育研究院", url: "https://data.gov.tw/dataset/6318", updatedAt: "專案既有教材索引；最新更新日期未提供", snapshotDate: "未提供", fields: ["title", "sourceUrl", "moduleCode"], rowCount: 1, missingValues: { updatedAt: 1 }, formulas: ["依生物多樣性與資料推論教學主題推薦，不是地理距離排名"], scope: "高中資料判讀補充教材", canExplain: "提供生物多樣性教學的官方外連。", cannotInfer: "教材不是該縣市動物的實證資料，不能用來證明個案因果關係。" } }] };
}
