import { describe, expect, it } from "vitest";
import { canManageDog, canManageGovernmentDatasets, hasPermission } from "../../lib/auth/roles";
import { canManuallyPublishObservation, canTransitionObservationStatus } from "../../lib/observations/workflow";

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
    expect(canTransitionObservationStatus("student", "submitted", "teacher_approved")).toBe(false);
  });

  it("prevents teachers from completing shelter confirmation", () => {
    expect(canTransitionObservationStatus("teacher", "submitted", "teacher_approved")).toBe(true);
    expect(canTransitionObservationStatus("teacher", "teacher_approved", "shelter_confirmed")).toBe(false);
  });

  it("prevents skipping teacher review before shelter confirmation", () => {
    expect(canTransitionObservationStatus("shelter_staff", "submitted", "shelter_confirmed")).toBe(false);
    expect(canTransitionObservationStatus("shelter_staff", "teacher_approved", "shelter_confirmed")).toBe(true);
  });

  it("requires a manual publish step after shelter confirmation", () => {
    expect(hasPermission("student", "observation:publish")).toBe(false);
    expect(hasPermission("teacher", "observation:publish")).toBe(false);
    expect(hasPermission("shelter_staff", "observation:publish")).toBe(true);
    expect(hasPermission("admin", "observation:publish")).toBe(true);
    expect(canManuallyPublishObservation("student", "shelter_confirmed")).toBe(false);
    expect(canManuallyPublishObservation("teacher", "shelter_confirmed")).toBe(false);
    expect(canManuallyPublishObservation("shelter_staff", "teacher_approved")).toBe(false);
    expect(canManuallyPublishObservation("shelter_staff", "shelter_confirmed")).toBe(true);
    expect(canManuallyPublishObservation("admin", "shelter_confirmed")).toBe(true);
  });
});
