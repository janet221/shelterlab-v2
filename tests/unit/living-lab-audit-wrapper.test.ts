import { beforeEach, describe, expect, it, vi } from "vitest";

const { persistAuditEvents } = vi.hoisted(() => ({ persistAuditEvents: vi.fn() }));

vi.mock("@/lib/audit/persistent-audit", () => ({ persistAuditEvents }));

import { runAuditedLivingLabMutation, sprint7DemoService } from "@/lib/living-lab/demo-store";
import type { AuditEvent } from "@/lib/research-license/engine";

describe("Living Lab persistent audit wrapper", () => {
  beforeEach(() => {
    persistAuditEvents.mockReset();
    persistAuditEvents.mockResolvedValue(undefined);
  });

  it("persists an expected conflict audit before returning the conflict", async () => {
    const conflict: AuditEvent = {
      actorId: "student_demo_001",
      actorRole: "student",
      entityType: "observation_session",
      entityId: "session_conflict_test",
      action: "autosave_conflict",
      changes: { expectedRowVersion: 1, actualRowVersion: 2 },
      timestamp: new Date("2026-07-12T01:00:00.000Z")
    };
    const error = Object.assign(new Error("Autosave row version conflict."), { auditEvents: [conflict] });

    await expect(runAuditedLivingLabMutation(() => {
      sprint7DemoService.state.auditEvents.push(conflict);
      throw error;
    })).rejects.toThrow("Autosave row version conflict");

    expect(persistAuditEvents).toHaveBeenCalledWith([conflict]);
    expect(sprint7DemoService.state.auditEvents).toContainEqual(conflict);
  });

  it("restores demo state when persistence of a successful mutation fails", async () => {
    const before = sprint7DemoService.state.auditEvents.length;
    const event: AuditEvent = {
      actorId: "teacher_demo_001",
      actorRole: "teacher",
      entityType: "observation_mission",
      entityId: "mission_rollback_test",
      action: "mission_updated",
      timestamp: new Date("2026-07-12T01:00:00.000Z")
    };
    persistAuditEvents.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(runAuditedLivingLabMutation(() => {
      sprint7DemoService.state.auditEvents.push(event);
      return { auditEvents: [event] };
    })).rejects.toThrow("database unavailable");

    expect(sprint7DemoService.state.auditEvents).toHaveLength(before);
  });
});
