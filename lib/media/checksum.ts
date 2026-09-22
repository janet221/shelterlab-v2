import { createHash } from "node:crypto";

export function calculateSha256Checksum(content: Buffer | Uint8Array | string): string {
  return createHash("sha256").update(content).digest("hex");
}
