import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RequestError } from "./http";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function currentAccount() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (!profile || !["student", "teacher", "shelter"].includes(profile.role)) return null;
  return { id: user.id, role: profile.role as "student" | "teacher" | "shelter", displayName: profile.display_name || "", email: user.email || "" };
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
  if (account.role !== role) redirect(account.role === "teacher" ? "/teacher/dashboard" : account.role === "shelter" ? "/shelter" : "/student");
  return account;
}
export async function endSession() {
  // Expire the retired local session cookie; it no longer grants access.
  (await cookies()).delete("shelterlab_session");
}
