import { describe, expect, it } from "vitest";
import { canManageDog, canManageGovernmentDatasets, hasPermission } from "../../lib/auth/roles";

describe("role permissions", () => {
  it("allows only shelter staff and admins to manage dog profile data", () => {
    expect(canManageDog("student")).toBe(false);
    expect(canManageDog("teacher")).toBe(false);
    expect(canManageDog("shelter_staff")).toBe(true);
    expect(canManageDog("admin")).toBe(true);
  });

  it("keeps dataset writes admin-only for the MVP", () => {
    expect(canManageGovernmentDatasets("student")).toBe(false);
    expect(canManageGovernmentDatasets("teacher")).toBe(false);
    expect(canManageGovernmentDatasets("shelter_staff")).toBe(false);
    expect(canManageGovernmentDatasets("admin")).toBe(true);
  });

  it("allows students to submit but not teacher-approve observations", () => {
    expect(hasPermission("student", "observation:submit")).toBe(true);
    expect(hasPermission("student", "observation:teacher_review")).toBe(false);
  });

  it("restricts observation publishing to shelter staff and admins", () => {
    expect(hasPermission("student", "observation:publish")).toBe(false);
    expect(hasPermission("teacher", "observation:publish")).toBe(false);
    expect(hasPermission("shelter_staff", "observation:publish")).toBe(true);
    expect(hasPermission("admin", "observation:publish")).toBe(true);
  });
});
