import "server-only";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestError } from "./http";

const lensKey = z.string().regex(/^[a-z0-9:_-]{1,160}$/);
export const annotationQuerySchema = z.object({
  classId: z.string().uuid(),
  lensKey,
}).strict();
export const annotationSaveSchema = z.object({
  classId: z.string().uuid(),
  lensKey,
  county: z.string().min(2).max(10),
  annotation: z.string().max(2000),
}).strict();

async function teacherClass(teacherId: string, classId: string) {
  const db = await createServerSupabaseClient();
  const { data, error } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", teacherId).maybeSingle();
  if (error) throw new RequestError(503, "暫時無法確認班級權限。");
  if (!data) throw new RequestError(403, "您沒有此班級的標註權限。");
  return db;
}

export async function getLessonAnnotation(teacherId: string, input: z.infer<typeof annotationQuerySchema>) {
  const db = await teacherClass(teacherId, input.classId);
  const { data, error } = await db.from("lesson_annotations")
    .select("annotation,updated_at")
    .eq("class_id", input.classId)
    .eq("lens_key", input.lensKey)
    .maybeSingle();
  if (error) throw new RequestError(503, "暫時無法讀取教學標註，請確認 Step 5 資料庫遷移已套用。");
  return { annotation: data?.annotation || "", updatedAt: data?.updated_at || null };
}

export async function saveLessonAnnotation(teacherId: string, input: z.infer<typeof annotationSaveSchema>) {
  const db = await teacherClass(teacherId, input.classId);
  const { data, error } = await db.rpc("shelterlab_save_lesson_annotation", {
    p_class_id: input.classId,
    p_lens_key: input.lensKey,
    p_county: input.county,
    p_annotation: input.annotation,
  });
  if (error?.code === "42501") throw new RequestError(403, "您沒有此班級的標註權限。");
  if (error?.code === "22023") throw new RequestError(400, "標註格式不正確或超過 2000 字。");
  if (error) throw new RequestError(503, "暫時無法儲存教學標註，請確認 Step 5 資料庫遷移已套用。");
  const raw = data as { annotation?: string; updated_at?: string } | Array<{ annotation?: string; updated_at?: string }> | null;
  const saved = Array.isArray(raw) ? raw[0] : raw;
  return { annotation: saved?.annotation ?? input.annotation, updatedAt: saved?.updated_at || null };
}
