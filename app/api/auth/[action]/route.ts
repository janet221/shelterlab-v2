import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { body, endpoint, RequestError, assertSameOrigin } from "@/lib/classroom/http";
import { createSession, currentAccount, endSession, throttle } from "@/lib/classroom/auth";
import { hashPassword, verifyPassword } from "@/lib/classroom/security";

export const runtime = "nodejs";
const credentials = z.object({ email: z.string().trim().email().max(254).transform(s => s.toLowerCase()), password: z.string().min(12).max(128) });
const registration = credentials.extend({ displayName: z.string().trim().min(1).max(60), role: z.enum(["student", "teacher"]) }).strict();
export async function GET(_request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(async () => { if ((await context.params).action !== "me") throw new RequestError(404, "找不到功能。"); return { account: await currentAccount() }; });
}
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(async () => {
    const { action } = await context.params;
    if (action === "logout") { assertSameOrigin(request); await endSession(); return { ok: true }; }
    if (action !== "login" && action !== "register") throw new RequestError(404, "找不到功能。");
    const input = await body(request, action === "register" ? registration : credentials.strict());
    await throttle(`credentials:${input.email}`);
    // A second shared budget prevents bypass by rotating account names.
    await throttle("credentials:global", 500);
    if (action === "register") {
      const data = registration.parse(input);
      const account = await prisma.learningAccount.create({ data: { email: data.email, displayName: data.displayName, role: data.role, passwordHash: await hashPassword(data.password) }, select: { id: true, role: true } });
      await createSession(account.id);
      return { destination: account.role === "teacher" ? "/teacher/settings" : "/student" };
    }
    const account = await prisma.learningAccount.findUnique({ where: { email: input.email } });
    const valid = await verifyPassword(input.password, account?.passwordHash || `scrypt-v1$${"0".repeat(32)}$${"0".repeat(128)}`);
    if (!account || !valid) throw new RequestError(401, "帳號或密碼不正確。");
    await createSession(account.id);
    return { destination: account.role === "teacher" ? "/teacher" : "/student" };
  });
}
