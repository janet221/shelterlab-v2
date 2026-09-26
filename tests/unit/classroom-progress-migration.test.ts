import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const foundation = readFileSync("supabase/migrations/202609230001_foundation.sql", "utf8");
const workflow = readFileSync("supabase/migrations/202609230002_progress_workflow.sql", "utf8");
const annotations = readFileSync("supabase/migrations/202609230003_step5_local_lesson_annotations.sql", "utf8");
const reviewCycle = readFileSync("supabase/migrations/202609240005_review_revision_cycle.sql", "utf8");
const feedbackHistory = readFileSync("supabase/migrations/202609260001_review_feedback_history.sql", "utf8");

describe("six-week Supabase progress workflow", () => {
  it("creates exactly six rows with only week one unlocked", () => {
    expect(foundation).toContain("from generate_series(1, 6) w");
    expect(foundation).toContain("case when w = 1 then 'In Progress'");
    expect(foundation).toContain("else 'Locked'");
  });

  it("guards locked submissions and atomically unlocks the next week", () => {
    expect(workflow).toContain("Previous weeks are not completed");
    expect(workflow).toContain("if w.status <> 'In Progress'");
    expect(workflow).toContain("week_number = p_week + 1 and status = 'Locked'");
    expect(workflow).toContain("if not found then raise exception 'Next week is not locked'");
  });

  it("marks week six complete and resets completion in the same transaction", () => {
    expect(workflow).toContain("is_course_completed = true, course_completed_at = now()");
    expect(workflow).toContain("is_course_completed = false, course_completed_at = null");
    expect(workflow).toContain("create function public.shelterlab_reset_class_progress");
  });

  it("keeps progress writes behind guarded RPCs and RLS", () => {
    expect(foundation).toContain("alter table public.student_progress enable row level security");
    expect(foundation).toContain("create policy progress_read");
    expect(workflow).toContain("revoke insert, update, delete on public.student_progress");
    expect(workflow).toContain("grant execute on function public.shelterlab_progress_action");
  });

  it("supports approve and return-for-revision without unlocking on rejection", () => {
    expect(reviewCycle).toContain("p_decision not in ('approve', 'reject')");
    expect(reviewCycle).toContain("status = 'In Progress'");
    expect(reviewCycle).toContain("case when p_decision = 'reject' then 'return'");
    expect(reviewCycle).toContain("p_week + 1 and status = 'Locked'");
    expect(reviewCycle).toContain("grant execute on function public.shelterlab_review_progress");
  });

  it("archives approved feedback, clears the live revision message, and unlocks only on approval", () => {
    expect(feedbackHistory).toContain("add column if not exists feedback_history jsonb");
    expect(feedbackHistory).toContain("feedback_history = feedback_history || jsonb_build_array");
    expect(feedbackHistory).toContain("feedback = '', version = version + 1");
    expect(feedbackHistory).toContain("if p_decision = 'reject' then");
    expect(feedbackHistory).toContain("p_week + 1 and status = 'Locked'");
    expect(feedbackHistory.indexOf("if p_decision = 'reject' then")).toBeLessThan(feedbackHistory.indexOf("p_week + 1 and status = 'Locked'"));
  });
});

describe("lesson annotation persistence", () => {
  it("uses RLS and a teacher-guarded RPC while keeping direct writes closed", () => {
    expect(annotations).toContain("alter table public.lesson_annotations enable row level security");
    expect(annotations).toContain("create policy lesson_annotations_read");
    expect(annotations).toContain("if not public.shelterlab_teaches(p_class_id)");
    expect(annotations).toContain("revoke all on public.lesson_annotations from public, anon, authenticated");
    expect(annotations).toContain("grant execute on function public.shelterlab_save_lesson_annotation");
  });
});
