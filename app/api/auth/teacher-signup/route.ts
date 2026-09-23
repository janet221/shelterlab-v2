import { z } from "zod";
import { invitationCodeMatches } from "@/lib/auth/invitation";
import { assertSameOrigin, body, endpoint, RequestError } from "@/lib/classroom/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const requestSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  invitationCode: z.string().trim().min(1).max(128),
}).strict();

export async function POST(request: Request) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const input = await body(request, requestSchema);
    if (!invitationCodeMatches(process.env.TEACHER_INVITATION_CODE, input.invitationCode)) {
      throw new RequestError(422, "教師邀請碼不正確。");
    }
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      app_metadata: { shelterlab_role: "teacher" },
    });
    if (error) {
      const duplicate = error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered");
      if (duplicate) throw new RequestError(409, "此電子郵件已經註冊，請直接登入。");
      console.error("Teacher account creation failed", { status: error.status, code: error.code });
      throw new RequestError(503, "目前無法建立教師帳號，請稍後再試。");
    }
    return { userId: data.user.id };
  });
}
