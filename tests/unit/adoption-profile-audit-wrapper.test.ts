import { beforeEach, describe, expect, it, vi } from "vitest";

const { persistAuditEvents } = vi.hoisted(() => ({ persistAuditEvents: vi.fn() }));

vi.mock("@/lib/audit/persistent-audit", () => ({ persistAuditEvents }));

import { runAuditedAdoptionProfileMutation, sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import type { AuditEvent } from "@/lib/research-license/engine";

describe("Adoption profile persistent audit wrapper", () => {
  beforeEach(() => {
    persistAuditEvents.mockReset();
    persistAuditEvents.mockResolvedValue(undefined);
  });

  it("persists all privileged profile projection audit records", async () => {
    const events = sprint10ADemoService.state.auditEvents.slice(-3);
    await runAuditedAdoptionProfileMutation(() => ({ auditEvents: events }));
    expect(events.map((item) => item.action)).toEqual([
      "adoption_profile_published",
      "evidence_completeness_calculated",
      "profile_gaps_assessed"
    ]);
    expect(persistAuditEvents).toHaveBeenCalledWith(events);
  });

  it("restores profile state when persistent audit storage fails", async () => {
    const before = sprint10ADemoService.state.profiles.length;
    const event: AuditEvent = {
      actorId: "shelter_staff_demo_001",
      actorRole: "shelter_staff",
      entityType: "adoption_profile",
      entityId: "rollback-profile",
      action: "adoption_profile_published",
      timestamp: new Date("2026-07-13T06:00:00.000Z")
    };
    persistAuditEvents.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(runAuditedAdoptionProfileMutation(() => {
      sprint10ADemoService.state.profiles.push(structuredClone(sprint10ADemoService.state.profiles[0]));
      return { auditEvents: [event] };
    })).rejects.toThrow("database unavailable");

    expect(sprint10ADemoService.state.profiles).toHaveLength(before);
  });
});
