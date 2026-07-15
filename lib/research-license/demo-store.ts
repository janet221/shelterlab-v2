import {
  getAttemptResultWithExplanations,
  sanitizeAttemptQuestions,
  startQuizAttempt,
  submitQuizAttempt,
  type QuizAttemptRecord,
  type ResearchLicenseRecord
} from "./engine";
import { phase2LearningModules } from "./phase2-data";
import type { EngineUser } from "./engine";

const attempts = new Map<string, QuizAttemptRecord>();
let licenses: ResearchLicenseRecord[] = [];

export function listPublishedLearningModules() {
  return phase2LearningModules.filter((module) => module.status === "published");
}

export function getLearningModuleByCode(code: string) {
  return phase2LearningModules.find((module) => module.code === code);
}

export function startDemoAttempt(user: EngineUser, now = new Date(), randomSeed?: string) {
  const result = startQuizAttempt({
    user,
    now,
    previousAttempts: [...attempts.values()].filter((attempt) => attempt.studentId === user.id),
    randomSeed
  });
  attempts.set(result.attempt.id, result.attempt);

  return {
    attempt: result.attempt,
    questions: sanitizeAttemptQuestions(result.attempt),
    auditEvents: result.auditEvents
  };
}

export function getDemoAttempt(attemptId: string) {
  return attempts.get(attemptId);
}

export function submitDemoAttempt(
  user: EngineUser,
  attemptId: string,
  answers: Record<string, string[]>,
  now = new Date()
) {
  const attempt = attempts.get(attemptId);
  if (!attempt) {
    throw new Error("Attempt not found.");
  }

  const result = submitQuizAttempt({
    actor: user,
    attempt,
    selectedOptionIdsByAttemptQuestionId: answers,
    now,
    existingLicenses: licenses
  });
  attempts.set(attemptId, result.attempt);
  licenses = result.updatedLicenses;

  return {
    ...result,
    result: getAttemptResultWithExplanations(result.attempt)
  };
}

export function getActiveDemoLicense(studentId: string, now = new Date()) {
  return licenses.find(
    (license) =>
      license.studentId === studentId &&
      license.status === "active" &&
      license.expiresAt > now
  );
}

export function listDemoLicenses() {
  return [...licenses];
}
