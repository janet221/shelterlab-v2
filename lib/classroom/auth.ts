import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { newToken, tokenHash } from "./security";
import { RequestError } from "./http";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const COOKIE = "shelterlab_session";
export async function currentAccount() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
    if (profile && (profile.role === "student" || profile.role === "teacher" || profile.role === "shelter")) {
      return { id: user.id, role: profile.role, displayName: profile.display_name || "", email: user.email || "" };
    }
  }
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const session = await prisma.learningSession.findUnique({ where: { tokenHash: tokenHash(token) }, include: { account: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  const { id, role, displayName, email } = session.account;
  return { id, role, displayName, email };
}
export async function requireAccount(role?: "student" | "teacher") {
  const account = await currentAccount();
  if (!account) throw new RequestError(401, "請先登入。");
  if (role && account.role !== role) throw new RequestError(403, "此功能不屬於您的角色。");
  return account;
}
export async function requirePageAccount(role: "student" | "teacher") {
  const account = await currentAccount();
  if (!account) redirect(`/auth?role=${role}`);
  if (account.role !== role) redirect(account.role === "teacher" ? "/teacher" : "/student");
  return account;
}
export async function createSession(accountId: string) {
  const jar = await cookies();
  const previous = jar.get(COOKIE)?.value;
  if (previous) await prisma.learningSession.deleteMany({ where: { tokenHash: tokenHash(previous) } });
  const token = newToken(); const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.learningSession.create({ data: { accountId, tokenHash: tokenHash(token), expiresAt } });
  jar.set(COOKIE, token, { httpOnly: true, secure: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").protocol === "https:", sameSite: "lax", path: "/", expires: expiresAt });
}
export async function endSession() {
  const jar = await cookies(); const token = jar.get(COOKIE)?.value;
  if (token) await prisma.learningSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
  jar.delete(COOKIE);
}
export async function throttle(key: string, limit = 15) {
  const bucket = `${tokenHash(key)}:${Math.floor(Date.now() / 900_000)}`;
  const attempt = await prisma.learningAuthAttempt.upsert({ where: { key: bucket }, create: { key: bucket, count: 1, expiresAt: new Date(Date.now() + 900_000) }, update: { count: { increment: 1 } } });
  if (attempt.count > limit) throw new RequestError(429, "嘗試次數過多，請於十五分鐘後再試。");
}
