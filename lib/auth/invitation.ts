import { timingSafeEqual } from "node:crypto";

export function invitationCodeMatches(configuredCode: string | undefined, providedCode: string) {
  if (!configuredCode) return false;
  const configured = Buffer.from(configuredCode.trim(), "utf8");
  const provided = Buffer.from(providedCode.trim(), "utf8");
  return configured.length === provided.length && timingSafeEqual(configured, provided);
}
