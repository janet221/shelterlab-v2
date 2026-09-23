import { describe, expect, it } from "vitest";
import { invitationCodeMatches } from "@/lib/auth/invitation";

describe("teacher invitation verification", () => {
  it("accepts only the exact configured invitation code", () => {
    expect(invitationCodeMatches("PRIVATE-TEACHER-2026", "PRIVATE-TEACHER-2026")).toBe(true);
    expect(invitationCodeMatches("PRIVATE-TEACHER-2026", "private-teacher-2026")).toBe(false);
    expect(invitationCodeMatches("PRIVATE-TEACHER-2026", "WRONG-CODE")).toBe(false);
    expect(invitationCodeMatches(undefined, "PRIVATE-TEACHER-2026")).toBe(false);
  });
});
