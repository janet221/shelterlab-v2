import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RequestError } from "./http";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ClassroomAccount = { role: "student" | "teacher" | "shelter"; email: string };

export function isEvaluatorDemoEnabled() {
  const setting = process.env.EVALUATOR_DEMO_ENABLED?.trim().toLowerCase();
  if (setting === "false") return false;
  if (setting === "true") return true;

  // A deployment with the complete evaluator account set is already
  // intentionally configured for judging. This fallback keeps that experience
  // visible if only the optional switch was omitted from Vercel.
  return Boolean(
    process.env.EVALUATOR_TEACHER_EMAIL
    && process.env.EVALUATOR_TEACHER_PASSWORD
    && process.env.EVALUATOR_STUDENT_EMAILS
    && process.env.EVALUATOR_STUDENT_PASSWORD
    && process.env.EVALUATOR_CLASS_CODE
    && process.env.EVALUATOR_SHELTER_EMAIL
    && process.env.EVALUATOR_SHELTER_PASSWORD
  );
}

function evaluatorEmails(role: "student" | "teacher") {
  const value = role === "teacher"
    ? process.env.EVALUATOR_TEACHER_EMAIL
    : process.env.EVALUATOR_STUDENT_EMAILS;
  return (value ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function isEvaluatorAccount(account: ClassroomAccount) {
  if (!isEvaluatorDemoEnabled() || account.role === "shelter") return false;
  return evaluatorEmails(account.role).includes(account.email.trim().toLowerCase());
}

export function evaluatorLoginAccounts(role: "student" | "teacher") {
  if (!isEvaluatorDemoEnabled()) throw new RequestError(404, "找不到功能。");
  const password = role === "teacher"
    ? process.env.EVALUATOR_TEACHER_PASSWORD
    : process.env.EVALUATOR_STUDENT_PASSWORD;
  if (!password) throw new RequestError(503, "評審體驗帳號尚未完成設定。");
  const labels = role === "teacher" ? ["教師帳號"] : ["學生 A", "學生 B", "學生 C"];
  const accounts = evaluatorEmails(role).map((email, index) => ({ label: labels[index] ?? `學生 ${index + 1}`, email, password }));
  if (accounts.length === 0) throw new RequestError(503, "評審體驗帳號尚未完成設定。");
  return { accounts, classCode: role === "student" ? (process.env.EVALUATOR_CLASS_CODE ?? "") : undefined };
}

export async function currentAccount(expectedRole?: "student" | "teacher" | "shelter") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = await createServerSupabaseClient(expectedRole);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (!profile || !["student", "teacher", "shelter"].includes(profile.role)) return null;
  return { id: user.id, role: profile.role as "student" | "teacher" | "shelter", displayName: profile.display_name || "", email: user.email || "" };
}
export async function requireAccount(role?: "student" | "teacher" | "shelter") {
  const account = await currentAccount(role);
  if (!account) throw new RequestError(401, "請先登入。");
  if (role && account.role !== role) throw new RequestError(403, "此功能不屬於您的角色。");
  return account;
}
export async function requirePageAccount(role: "student" | "teacher" | "shelter") {
  const account = await currentAccount(role);
  if (!account) redirect(`/auth?role=${role}`);
  if (account.role !== role) redirect(account.role === "teacher" ? "/teacher/dashboard" : account.role === "shelter" ? "/shelter" : "/student");
  return account;
}
export async function endSession() {
  // Expire the retired local session cookie; it no longer grants access.
  (await cookies()).delete("shelterlab_session");
}
