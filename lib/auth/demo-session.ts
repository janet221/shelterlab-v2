import type { EngineUser } from "@/lib/research-license/engine";
import type { UserRole } from "@/lib/research-license/types";

const demoUsers: Record<string, EngineUser> = {
  "STU-TEST-001": { id: "student_demo_001", role: "student" },
  "TEA-TEST-001": {
    id: "teacher_demo_001",
    role: "teacher",
    authorizedCoursePlanIds: ["course_plan_shelterlab_16w_v1"]
  },
  "SHF-TEST-001": { id: "shelter_staff_demo_001", role: "shelter_staff" },
  "ADM-TEST-001": { id: "admin_demo_001", role: "admin" }
};

export function getDemoUserByTestCode(testCode: string | null): EngineUser | undefined {
  if (!testCode) {
    return undefined;
  }

  return demoUsers[testCode];
}

export function requireDemoUser(testCode: string | null, allowedRoles?: UserRole[]): EngineUser {
  const user = getDemoUserByTestCode(testCode);

  if (!user) {
    throw new Error("Unauthorized demo user.");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden demo role.");
  }

  return user;
}
