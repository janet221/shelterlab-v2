import { describe, expect, it } from "vitest";
import { toAuditLogCreateInput } from "../../lib/audit/persistent-audit";

describe("persistent curriculum audit mapping", () => {
  it("maps actor, action, state diff, timestamp, and reason to the audit table", () => {
    const timestamp = new Date("2026-07-10T02:00:00.000Z");
    const input = toAuditLogCreateInput({
      actorId: "teacher_demo_001",
      entityType: "question_draft",
      entityId: "draft_1",
      action: "question_draft_rejected",
      fromStatus: "pending_review",
      toStatus: "rejected",
      changes: { reason: "Incorrect classification" },
      previousState: { status: "pending_review" },
      newState: { status: "rejected" },
      reason: "Incorrect classification",
      timestamp
    });

    expect(input).toMatchObject({
      actorId: "teacher_demo_001",
      action: "question_draft_rejected",
      previousState: { status: "pending_review" },
      newState: { status: "rejected" },
      reason: "Incorrect classification",
      createdAt: timestamp
    });
  });

  it("maps Sprint 6 role, scope, and correlation evidence to persistent audit fields", () => {
    const input = toAuditLogCreateInput({
      actorId: "teacher_demo_001",
      actorRole: "teacher",
      organizationScope: "school_synthetic_001",
      courseScope: "course_plan_shelterlab_16w_v1",
      correlationId: "corr-sprint6-001",
      entityType: "question_draft",
      entityId: "qd_demo",
      action: "question_draft_approved",
      previousState: { status: "pending_review" },
      newState: { status: "approved" }
    });

    expect(input.actorRole).toBe("teacher");
    expect(input.courseScope).toBe("course_plan_shelterlab_16w_v1");
    expect(input.correlationId).toBe("corr-sprint6-001");
  });
});
