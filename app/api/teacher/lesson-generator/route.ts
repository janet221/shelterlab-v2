import { requireAccount } from "@/lib/classroom/auth";
import { endpoint, RequestError } from "@/lib/classroom/http";
import { generateLocalLessonPlan } from "@/lib/classroom/lesson-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return endpoint(async () => {
    await requireAccount("teacher");
    const county = new URL(request.url).searchParams.get("county")?.trim();
    if (!county) throw new RequestError(400, "請選擇縣市。");
    try {
      return await generateLocalLessonPlan(county);
    } catch (error) {
      if (error instanceof Error && error.message === "Unsupported county") throw new RequestError(400, "縣市條件不正確。");
      console.error("Local lesson source unavailable", error instanceof Error ? error.name : "UnknownError");
      return { available: false, county, message: "該區間無可用資料，請重新設定條件" };
    }
  });
}
