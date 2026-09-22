import { NextResponse } from "next/server";
import { z } from "zod";

export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
  if (!origin || origin !== expected) throw new RequestError(403, "請從本站頁面送出操作。");
}
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new RequestError(415, "請使用 JSON 資料。");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "缺少資料。");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 100_000) { await reader.cancel(); throw new RequestError(413, "作答內容過長。"); } chunks.push(part.value); }
  try { return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
  catch { throw new RequestError(400, "欄位格式不正確，請確認必填資料與字數。"); }
}
export async function endpoint(action: () => Promise<unknown>) {
  try { return NextResponse.json(await action(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    const code = (error as { code?: string }).code;
    if (code === "P2002") return NextResponse.json({ error: "帳號已存在，或操作已完成。請重新載入。" }, { status: 409 });
    if (code === "P2034") return NextResponse.json({ error: "資料同時被更新，請重新載入後重試。" }, { status: 409 });
    // Never expose SQL, credentials, answer contents or database connection strings.
    console.error("Classroom request failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "服務暫時無法使用，請確認資料庫連線及資料表已初始化。" }, { status: 503 });
  }
}
