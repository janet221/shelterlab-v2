import type { UserRole } from "../auth/roles";

export const observationStatuses = [
  "draft",
  "submitted",
  "teacher_approved",
  "teacher_revision_required",
  "shelter_confirmed",
  "shelter_revision_required",
  "published"
] as const;

export type ObservationStatus = (typeof observationStatuses)[number];

type Transition = {
  from: ObservationStatus;
  to: ObservationStatus;
  roles: UserRole[];
};

const transitions: Transition[] = [
  { from: "draft", to: "submitted", roles: ["student", "admin"] },
  { from: "submitted", to: "teacher_approved", roles: ["teacher", "admin"] },
  { from: "submitted", to: "teacher_revision_required", roles: ["teacher", "admin"] },
  { from: "teacher_revision_required", to: "draft", roles: ["student", "admin"] },
  { from: "teacher_approved", to: "shelter_confirmed", roles: ["shelter_staff", "admin"] },
  { from: "teacher_approved", to: "shelter_revision_required", roles: ["shelter_staff", "admin"] },
  { from: "shelter_revision_required", to: "draft", roles: ["student", "admin"] },
  { from: "shelter_confirmed", to: "published", roles: ["shelter_staff", "admin"] }
];

export function canTransitionObservationStatus(
  role: UserRole,
  from: ObservationStatus,
  to: ObservationStatus
): boolean {
  return transitions.some((transition) => transition.from === from && transition.to === to && transition.roles.includes(role));
}

export function canManuallyPublishObservation(role: UserRole, from: ObservationStatus): boolean {
  return canTransitionObservationStatus(role, from, "published");
}
