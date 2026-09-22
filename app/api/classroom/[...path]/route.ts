import { z } from "zod";
import { requireAccount, throttle } from "@/lib/classroom/auth";
import { body, endpoint, RequestError } from "@/lib/classroom/http";
import { joinClass, localWorkbench, resetProgress, reviewSchema, reviewWeek, saveSettings, schoolChoices, settingsSchema, studentProgress, studentWeek, submissionSchema, submitWeek, teacherDashboard, teacherSubmission } from "@/lib/classroom/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const weekNumber = (value: string) => { const n = Number(value); if (!Number.isInteger(n) || n < 1 || n > 6) throw new RequestError(404, "找不到週次。"); return n; };
export async function GET(_request: Request, context: Context) {
  return endpoint(async () => {
    const path = (await context.params).path, route = path.join("/");
    if (route === "progress") return studentProgress((await requireAccount("student")).id);
    if (path[0] === "weeks" && path.length === 2) return studentWeek((await requireAccount("student")).id, weekNumber(path[1]));
    const teacher = await requireAccount("teacher");
    if (route === "schools") return schoolChoices();
    if (route === "dashboard") return teacherDashboard(teacher.id);
    if (route === "local") {
      const { classroom } = await teacherDashboard(teacher.id);
      if (!classroom) throw new RequestError(409, "請先完成班級設定。");
      return localWorkbench(classroom.county);
    }
    if (path[0] === "reviews" && path.length === 2) return teacherSubmission(teacher.id, path[1]);
    throw new RequestError(404, "找不到功能。");
  });
}
export async function POST(request: Request, context: Context) {
  return endpoint(async () => {
    const path = (await context.params).path, route = path.join("/");
    if (route === "join") {
      const student = await requireAccount("student"); await throttle(`join:${student.id}`, 20);
      const input = await body(request, z.object({ joinCode: z.string().trim().regex(/^[a-fA-F0-9]{12}$/).transform(s => s.toUpperCase()) }).strict());
      return joinClass(student.id, input.joinCode);
    }
    if (path[0] === "weeks" && path.length === 2) {
      const student = await requireAccount("student"); return submitWeek(student.id, weekNumber(path[1]), await body(request, submissionSchema));
    }
    const teacher = await requireAccount("teacher");
    if (route === "settings") return saveSettings(teacher.id, await body(request, settingsSchema));
    if (route === "reset") {
      const input = await body(request, z.object({ studentId: z.string().min(1).max(100).optional(), confirmation: z.literal("RESET") }).strict());
      return resetProgress(teacher.id, input.studentId);
    }
    if (path[0] === "reviews" && path.length === 2) return reviewWeek(teacher.id, path[1], await body(request, reviewSchema));
    throw new RequestError(404, "找不到功能。");
  });
}
