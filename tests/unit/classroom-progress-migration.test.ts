import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const foundation = readFileSync("supabase/migrations/202609230001_foundation.sql", "utf8");
const workflow = readFileSync("supabase/migrations/202609230002_progress_workflow.sql", "utf8");
const annotations = readFileSync("supabase/migrations/202609230003_step5_local_lesson_annotations.sql", "utf8");
const reviewCycle = readFileSync("supabase/migrations/202609240005_review_revision_cycle.sql", "utf8");
const completionLoop = readFileSync("supabase/migrations/202609260001_review_completion_loop.sql", "utf8");

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

  it("archives approvals, emits one reward and clears obsolete revision feedback", () => {
    expect(completionLoop).toContain("create table if not exists public.student_review_history");
    expect(completionLoop).toContain("create table if not exists public.student_reward_claims");
    expect(completionLoop).toContain("insert into public.student_review_history");
    expect(completionLoop).toContain("insert into public.student_reward_claims");
    expect(completionLoop).toContain("action = 'return'");
    expect(completionLoop).toContain("generation = v_generation");
    expect(completionLoop).toContain("delete from public.progress_audit");
    expect(completionLoop).toContain("create or replace function public.shelterlab_claim_reward");
  });

  it("preserves submitted game state on revision and unlocks only the immediate next week", () => {
    expect(completionLoop).toContain("and new.feedback = ''");
    expect(completionLoop).toContain("and new.reviewed_by is null");
    expect(completionLoop).toContain("return new;");
    expect(completionLoop).toContain("week_number = p_week + 1");
    expect(completionLoop).toContain("and status = 'Locked'");
    expect(completionLoop).toContain("jsonb_array_elements(p_audit->'entries')");
    expect(completionLoop).toContain("coalesce(entry->>'kind', '') = 'text'");
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
