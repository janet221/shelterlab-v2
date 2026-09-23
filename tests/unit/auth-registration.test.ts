import { describe, expect, it } from "vitest";
import { invitationCodeMatches, TEACHER_INVITATION_CODE } from "@/lib/auth/invitation";

describe("teacher invitation verification", () => {
  it("accepts only the exact configured invitation code", () => {
    expect(TEACHER_INVITATION_CODE).toBe("shelter2026");
    expect(invitationCodeMatches("shelter2026")).toBe(true);
    expect(invitationCodeMatches("SHELTER2026")).toBe(false);
    expect(invitationCodeMatches("WRONG-CODE")).toBe(false);
  });
});
