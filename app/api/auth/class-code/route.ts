import { z } from "zod";
import { assertSameOrigin, body, endpoint, RequestError } from "@/lib/classroom/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const requestSchema = z.object({
  classCode: z.string().trim().min(1).max(64).transform((value) => value.toUpperCase()),
}).strict();

export async function POST(request: Request) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const { classCode } = await body(request, requestSchema);
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("classes")
      .select("id, registration_open, registration_expires_at")
      .eq("class_code", classCode)
      .maybeSingle();
    if (error) {
      console.error("Class code validation failed", { code: error.code });
      throw new RequestError(503, "暫時無法驗證班級代碼，請稍後再試。");
    }
    const expired = data?.registration_expires_at
      ? new Date(data.registration_expires_at).getTime() <= Date.now()
      : false;
    if (!data || !data.registration_open || expired) {
      throw new RequestError(422, "班級代碼無效或已過期");
    }
    return { classId: data.id, classCode };
  });
}
