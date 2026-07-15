export const userRoles = ["student", "teacher", "shelter_staff", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export type Permission =
  | "dog:read"
  | "dog:write"
  | "observation:create"
  | "observation:submit"
  | "observation:teacher_review"
  | "observation:shelter_confirm"
  | "observation:publish"
  | "dataset:read"
  | "dataset:write"
  | "audit:read";

const permissionsByRole: Record<UserRole, Permission[]> = {
  student: ["dog:read", "observation:create", "observation:submit", "dataset:read"],
  teacher: ["dog:read", "observation:teacher_review", "dataset:read", "audit:read"],
  shelter_staff: ["dog:read", "dog:write", "observation:shelter_confirm", "observation:publish", "dataset:read", "audit:read"],
  admin: [
    "dog:read",
    "dog:write",
    "observation:create",
    "observation:submit",
    "observation:teacher_review",
    "observation:shelter_confirm",
    "observation:publish",
    "dataset:read",
    "dataset:write",
    "audit:read"
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return permissionsByRole[role].includes(permission);
}

export function canManageDog(role: UserRole): boolean {
  return hasPermission(role, "dog:write");
}

export function canManageGovernmentDatasets(role: UserRole): boolean {
  return hasPermission(role, "dataset:write");
}
