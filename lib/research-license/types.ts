export type UserRole = "student" | "teacher" | "shelter_staff" | "admin";
export type ModuleStatus = "draft" | "published" | "archived";
export type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "scenario_choice";
export type QuestionDifficulty = "basic" | "intermediate" | "advanced";
export type QuestionStatus = "draft" | "pending_review" | "approved" | "published" | "rejected" | "archived";
export type QuestionSourceType = "government_reference" | "teacher_authored" | "ai_draft" | "project_seed";
export type QuizAttemptStatus = "in_progress" | "submitted" | "passed" | "failed" | "expired" | "cancelled";
export type ResearchLicenseStatus = "active" | "expired" | "revoked" | "suspended" | "superseded";
