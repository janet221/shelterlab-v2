import { timingSafeEqual } from "node:crypto";

export const TEACHER_INVITATION_CODE = "shelter2026";

export function invitationCodeMatches(providedCode: string) {
  const configured = Buffer.from(TEACHER_INVITATION_CODE, "utf8");
  const provided = Buffer.from(providedCode.trim(), "utf8");
  return configured.length === provided.length && timingSafeEqual(configured, provided);
}
