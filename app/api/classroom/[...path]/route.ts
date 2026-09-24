import { requireAccount } from "@/lib/classroom/auth";
import { body, endpoint, RequestError } from "@/lib/classroom/http";
import { gameAuditSubmissionSchema, localWorkbench, resetProgress, resetSchema, reviewSchema, reviewWeek, saveSettings, schoolChoices, settingsSchema, studentIdentitySchema, studentProgress, studentWeek, submissionSchema, submitGameAudit, submitWeek, teacherDashboard, teacherSubmission, updateStudentIdentity } from "@/lib/classroom/service";

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
    if (route === "join") throw new RequestError(409, "班級已於註冊時綁定，請聯絡教師確認。");
    if (route === "profile") {
      const student = await requireAccount("student");
      return updateStudentIdentity(student.id, await body(request, studentIdentitySchema));
    }
    if (path[0] === "weeks" && path.length === 3 && path[2] === "game-audit") {
      const student = await requireAccount("student"); return submitGameAudit(student.id, weekNumber(path[1]), await body(request, gameAuditSubmissionSchema));
    }
    if (path[0] === "weeks" && path.length === 2) {
      const student = await requireAccount("student"); return submitWeek(student.id, weekNumber(path[1]), await body(request, submissionSchema));
    }
    const teacher = await requireAccount("teacher");
    if (route === "settings") return saveSettings(teacher.id, await body(request, settingsSchema));
    if (route === "reset") {
      return resetProgress(teacher.id, await body(request, resetSchema));
    }
    if (path[0] === "reviews" && path.length === 2) return reviewWeek(teacher.id, path[1], await body(request, reviewSchema));
    throw new RequestError(404, "找不到功能。");
  });
}
