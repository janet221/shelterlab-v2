import { endpoint, RequestError, assertSameOrigin } from "@/lib/classroom/http";
import { currentAccount, endSession } from "@/lib/classroom/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(async () => {
    if ((await context.params).action !== "me") throw new RequestError(404, "找不到功能。");
    return { account: await currentAccount() };
  });
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(async () => {
    const { action } = await context.params;
    if (action !== "logout") throw new RequestError(404, "找不到功能。");
    assertSameOrigin(request);
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    await endSession();
    return { ok: true };
  });
}
