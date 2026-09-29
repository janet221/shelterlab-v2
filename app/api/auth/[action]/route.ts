import { z } from "zod";
import { body, endpoint, RequestError, assertSameOrigin } from "@/lib/classroom/http";
import { currentAccount, endSession, evaluatorLoginAccounts } from "@/lib/classroom/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) }).strict();
const requestRole = (request: Request) => { const role=new URL(request.url).searchParams.get("role"); return role === "teacher" ? "teacher" as const : role === "shelter" ? "shelter" as const : "student" as const };

export async function GET(request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(async () => {
    const { action } = await context.params;
    if (action === "evaluator-accounts") { const role=requestRole(request); if(role==="shelter"){const email=process.env.EVALUATOR_SHELTER_EMAIL,password=process.env.EVALUATOR_SHELTER_PASSWORD;if(!email||!password)throw new RequestError(503,"收容所評審體驗帳號尚未完成設定。");return{accounts:[{label:"臺中市動物之家",email,password}]}} return evaluatorLoginAccounts(role); }
    if (!["me", "session"].includes(action)) throw new RequestError(404, "找不到功能。");
    const role = requestRole(request);
    const account = await currentAccount(role);
    if (!account) throw new RequestError(401, "請先登入。");
    if (account.role !== role) throw new RequestError(403, "此功能不屬於您的角色。");
    return { account };
  });
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(async () => {
    const { action } = await context.params;
    const role = requestRole(request);
    if (action === "login") {
      const credentials = await body(request, loginSchema);
      const supabase = await createServerSupabaseClient(role);
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error || !data.user) throw new RequestError(401, "電子郵件或密碼不正確。");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role,display_name").eq("id", data.user.id).single();
      if (profileError || !profile) {
        await supabase.auth.signOut({ scope: "local" });
        throw new RequestError(403, "無法讀取帳號資料，請聯絡系統管理員。");
      }
      if (profile.role !== role) {
        await supabase.auth.signOut({ scope: "local" });
        throw new RequestError(403, `這不是${role === "teacher" ? "教師" : role === "shelter" ? "收容所" : "學生"}帳號，請從正確的角色入口登入。`);
      }
      return { account: { id: data.user.id, role, displayName: profile.display_name || "", email: data.user.email || "" } };
    }
    if (action !== "logout") throw new RequestError(404, "找不到功能。");
    assertSameOrigin(request);
    const supabase = await createServerSupabaseClient(role);
    await supabase.auth.signOut({ scope: "local" });
    await endSession();
    return { ok: true };
  });
}
