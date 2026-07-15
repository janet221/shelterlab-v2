import { describe, expect, it } from "vitest";
import { calculateSha256Checksum } from "../../lib/media/checksum";

describe("calculateSha256Checksum", () => {
  it("calculates SHA-256 on the backend from uploaded content bytes", () => {
    expect(calculateSha256Checksum("hello")).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});
