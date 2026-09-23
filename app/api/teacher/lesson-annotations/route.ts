import { requireAccount } from "@/lib/classroom/auth";
import { body, endpoint, RequestError } from "@/lib/classroom/http";
import { annotationQuerySchema, annotationSaveSchema, getLessonAnnotation, saveLessonAnnotation } from "@/lib/classroom/lesson-annotations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return endpoint(async () => {
    const teacher = await requireAccount("teacher");
    const url = new URL(request.url);
    const parsed = annotationQuerySchema.safeParse({ classId: url.searchParams.get("classId"), lensKey: url.searchParams.get("lensKey") });
    if (!parsed.success) throw new RequestError(400, "標註識別資訊不正確。");
    return getLessonAnnotation(teacher.id, parsed.data);
  });
}

export async function POST(request: Request) {
  return endpoint(async () => {
    const teacher = await requireAccount("teacher");
    return saveLessonAnnotation(teacher.id, await body(request, annotationSaveSchema));
  });
}
