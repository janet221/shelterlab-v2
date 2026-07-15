import { z } from "zod";
import {
  defaultQuizBlueprint,
  learningModuleCodes,
  phase2LearningModules,
  phase2LearningStandards,
  phase2Questions,
  type LearningModuleCode,
  type QuestionSeed
} from "./phase2-data";
import type { QuestionStatus, ResearchLicenseStatus, UserRole } from "./types";

export const licenseValidityDays = 180;

export type EngineUser = {
  id: string;
  role: UserRole;
  authorizedCoursePlanIds?: string[];
};

export type AuditEvent = {
  actorId: string;
  actorRole?: UserRole | "system";
  organizationScope?: string;
  courseScope?: string;
  correlationId?: string;
  entityType: string;
  entityId: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  changes?: Record<string, unknown>;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  reason?: string;
  timestamp?: Date;
};

export type SanitizedQuestionOption = {
  id: string;
  optionKey: string;
  optionText: string;
  optionOrder: number;
};

export type SanitizedAttemptQuestion = {
  id: string;
  questionId: string;
  moduleCode: LearningModuleCode;
  prompt: string;
  questionType: QuestionSeed["questionType"];
  options: SanitizedQuestionOption[];
};

export type AttemptQuestionSnapshot = SanitizedAttemptQuestion & {
  questionVersion: number;
  explanation: string;
  correctOptionIds: string[];
  resourceIds: string[];
  learningStandardIds: string[];
  governmentDatasetIds: string[];
  verificationStates: string[];
  providerName?: string;
  providerVersion?: string;
  promptVersion?: string;
  bloomLevel: string;
  difficulty: string;
};

export type RemediationRecommendationRecord = {
  moduleCode: LearningModuleCode;
  standardIds: string[];
  competencyTags: string[];
  resourceId: string;
  priority: number;
  provenance: {
    attemptId: string;
    questionIds: string[];
    sourceType: "DETERMINISTIC_MODULE_SCORE";
  };
};

export type QuizAttemptRecord = {
  id: string;
  studentId: string;
  blueprintId: string;
  blueprintVersion: number;
  startedAt: Date;
  submittedAt?: Date;
  expiresAt: Date;
  status: "in_progress" | "passed" | "failed" | "expired" | "cancelled";
  totalScore?: number;
  moduleScores: Record<LearningModuleCode, number>;
  attemptNumber: number;
  questions: AttemptQuestionSnapshot[];
  answers: Record<string, string[]>;
  integrityFlags: string[];
  competencyScores: Record<string, number>;
  evidenceSnapshot: {
    questionVersions: Record<string, number>;
    resourceIds: string[];
    learningStandardIds: string[];
    governmentDatasetIds: string[];
  };
  remediationRecommendations: RemediationRecommendationRecord[];
};

export type ResearchLicenseRecord = {
  id: string;
  studentId: string;
  licenseLevel: "level_1";
  blueprintId: string;
  blueprintVersion: number;
  qualifyingAttemptId: string;
  status: ResearchLicenseStatus;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revocationReason?: string;
  certificateCode: string;
  certificateVersion: number;
};

export type StartAttemptInput = {
  user: EngineUser;
  now: Date;
  previousAttempts: QuizAttemptRecord[];
  randomSeed?: string;
};

export type SubmitAttemptInput = {
  actor: EngineUser;
  attempt: QuizAttemptRecord;
  selectedOptionIdsByAttemptQuestionId: Record<string, string[]>;
  now: Date;
  existingLicenses: ResearchLicenseRecord[];
};

export type SubmitAttemptResult = {
  attempt: QuizAttemptRecord;
  license?: ResearchLicenseRecord;
  updatedLicenses: ResearchLicenseRecord[];
  auditEvents: AuditEvent[];
  remediationRecommendations: RemediationRecommendationRecord[];
};

const reviewQuestionSchema = z.object({
  actor: z.object({ id: z.string(), role: z.enum(["student", "teacher", "shelter_staff", "admin"]) }),
  question: z.object({
    id: z.string(),
    createdById: z.string().optional(),
    status: z.enum(["draft", "pending_review", "approved", "rejected", "archived"])
  }),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().optional()
});

export function canViewUnpublishedModule(role: UserRole): boolean {
  return role === "teacher" || role === "shelter_staff" || role === "admin";
}

export function canArchiveModule(role: UserRole): boolean {
  return role === "admin";
}

export function canPublishEducationalContent(role: UserRole): boolean {
  return role === "teacher" || role === "admin";
}

export function listModulesForRole(role: UserRole) {
  return phase2LearningModules.filter((module) => module.status === "published" || canViewUnpublishedModule(role));
}

export function getPublishedStudentQuestions(allQuestions: QuestionSeed[] = phase2Questions): QuestionSeed[] {
  return allQuestions.filter((question) => question.status === "published");
}

export const getApprovedStudentQuestions = getPublishedStudentQuestions;

export function sanitizeAttemptQuestions(attempt: QuizAttemptRecord): SanitizedAttemptQuestion[] {
  return attempt.questions.map((question) => ({
    id: question.id,
    questionId: question.questionId,
    moduleCode: question.moduleCode,
    prompt: question.prompt,
    questionType: question.questionType,
    options: question.options.map((option) => ({ ...option }))
  }));
}

export function getAttemptResultWithExplanations(attempt: QuizAttemptRecord) {
  return {
    id: attempt.id,
    status: attempt.status,
    totalScore: attempt.totalScore,
    moduleScores: attempt.moduleScores,
    competencyScores: attempt.competencyScores,
    remediationRecommendations: attempt.remediationRecommendations,
    explanations: attempt.questions.map((question) => ({
      attemptQuestionId: question.id,
      questionId: question.questionId,
      explanation: question.explanation,
      correctOptionIds: [...question.correctOptionIds],
      learningStandardIds: [...question.learningStandardIds],
      resourceIds: [...question.resourceIds],
      governmentDatasetIds: [...question.governmentDatasetIds],
      curriculumReason: `This item measures ${question.moduleCode} through ${question.learningStandardIds.join(", ")}.`
    }))
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  let state = hashSeed(seed) || 1;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (1664525 * state + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function minutesAfter(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function daysAfter(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildAttemptQuestion(question: QuestionSeed, order: number, seed: string): AttemptQuestionSnapshot {
  const orderedOptions = seededShuffle(question.options, `${seed}:options:${question.id}`).map((option, index) => ({
    id: option.id,
    optionKey: option.optionKey,
    optionText: option.optionText,
    optionOrder: index + 1
  }));

  return {
    id: `aq_${question.id}_${order}`,
    questionId: question.id,
    questionVersion: question.version,
    moduleCode: question.moduleCode,
    prompt: question.prompt,
    questionType: question.questionType,
    explanation: question.explanation,
    options: orderedOptions,
    correctOptionIds: question.options.filter((option) => option.isCorrect).map((option) => option.id),
    resourceIds: [...question.resourceIds],
    learningStandardIds: [...question.standardIds],
    governmentDatasetIds: [...question.datasetIds],
    verificationStates: ["SYNTHETIC_DEMO", "DEMO_REFERENCE"],
    providerName: question.providerName,
    providerVersion: question.providerVersion,
    promptVersion: question.promptVersion,
    bloomLevel: question.bloomLevel,
    difficulty: question.difficulty
  };
}

function nextAttemptNumber(previousAttempts: QuizAttemptRecord[], studentId: string): number {
  return previousAttempts.filter((attempt) => attempt.studentId === studentId).length + 1;
}

export function canStartQuizAttempt(user: EngineUser, previousAttempts: QuizAttemptRecord[], now: Date): {
  allowed: boolean;
  reason?: string;
} {
  if (user.role !== "student") {
    return { allowed: false, reason: "Only students can start a quiz attempt." };
  }

  const studentAttempts = previousAttempts.filter((attempt) => attempt.studentId === user.id);
  if (studentAttempts.length >= defaultQuizBlueprint.maxAttempts) {
    return { allowed: false, reason: "Maximum attempts reached." };
  }

  const latestFailed = [...studentAttempts].reverse().find((attempt) => attempt.status === "failed" && attempt.submittedAt);
  if (latestFailed?.submittedAt && now < minutesAfter(latestFailed.submittedAt, defaultQuizBlueprint.cooldownMinutes)) {
    return { allowed: false, reason: "Cooldown period has not elapsed." };
  }

  return { allowed: true };
}

export function startQuizAttempt(input: StartAttemptInput): { attempt: QuizAttemptRecord; auditEvents: AuditEvent[] } {
  const eligibility = canStartQuizAttempt(input.user, input.previousAttempts, input.now);
  if (!eligibility.allowed) {
    throw new Error(eligibility.reason);
  }

  const seed = input.randomSeed ?? `${input.user.id}:${input.now.toISOString()}`;
  const selectedQuestions = learningModuleCodes.flatMap((moduleCode) => {
    const moduleQuestions = getPublishedStudentQuestions().filter((question) => question.moduleCode === moduleCode);
    return seededShuffle(moduleQuestions, `${seed}:${moduleCode}`).slice(0, defaultQuizBlueprint.requiredPerModule);
  });
  const randomizedQuestions = seededShuffle(selectedQuestions, `${seed}:questions`);

  const attempt: QuizAttemptRecord = {
    id: `attempt_${input.user.id}_${nextAttemptNumber(input.previousAttempts, input.user.id)}`,
    studentId: input.user.id,
    blueprintId: defaultQuizBlueprint.id,
    blueprintVersion: defaultQuizBlueprint.version,
    startedAt: input.now,
    expiresAt: minutesAfter(input.now, defaultQuizBlueprint.timeLimitMinutes),
    status: "in_progress",
    moduleScores: {
      DOG_BEHAVIOR: 0,
      ONE_HEALTH: 0,
      URBAN_ECOLOGY: 0,
      SHELTER_SAFETY: 0,
      RESEARCH_ETHICS: 0
    },
    attemptNumber: nextAttemptNumber(input.previousAttempts, input.user.id),
    questions: randomizedQuestions.map((question, index) => buildAttemptQuestion(question, index + 1, seed)),
    answers: {},
    integrityFlags: [],
    competencyScores: {},
    evidenceSnapshot: {
      questionVersions: Object.fromEntries(randomizedQuestions.map((question) => [question.id, question.version])),
      resourceIds: [...new Set(randomizedQuestions.flatMap((question) => question.resourceIds))],
      learningStandardIds: [...new Set(randomizedQuestions.flatMap((question) => question.standardIds))],
      governmentDatasetIds: [...new Set(randomizedQuestions.flatMap((question) => question.datasetIds))]
    },
    remediationRecommendations: []
  };

  return {
    attempt,
    auditEvents: [
      {
        actorId: input.user.id,
        actorRole: input.user.role,
        entityType: "quiz_attempt",
        entityId: attempt.id,
        action: "quiz_started",
        toStatus: "in_progress"
      }
    ]
  };
}

function scoreAttempt(
  attempt: QuizAttemptRecord,
  selectedOptionIdsByAttemptQuestionId: Record<string, string[]>
): { answers: Record<string, string[]>; moduleScores: Record<LearningModuleCode, number>; totalScore: number } {
  const answers: Record<string, string[]> = {};
  const moduleCorrectCounts: Record<LearningModuleCode, number> = {
    DOG_BEHAVIOR: 0,
    ONE_HEALTH: 0,
    URBAN_ECOLOGY: 0,
    SHELTER_SAFETY: 0,
    RESEARCH_ETHICS: 0
  };
  const moduleQuestionCounts: Record<LearningModuleCode, number> = {
    DOG_BEHAVIOR: 0,
    ONE_HEALTH: 0,
    URBAN_ECOLOGY: 0,
    SHELTER_SAFETY: 0,
    RESEARCH_ETHICS: 0
  };

  for (const question of attempt.questions) {
    const selected = [...(selectedOptionIdsByAttemptQuestionId[question.id] ?? [])].sort();
    const correct = [...question.correctOptionIds].sort();
    const isCorrect = selected.length === correct.length && selected.every((optionId, index) => optionId === correct[index]);

    answers[question.id] = selected;
    moduleQuestionCounts[question.moduleCode] += 1;
    if (isCorrect) {
      moduleCorrectCounts[question.moduleCode] += 1;
    }
  }

  const moduleScores = Object.fromEntries(
    learningModuleCodes.map((moduleCode) => [
      moduleCode,
      moduleQuestionCounts[moduleCode] === 0 ? 0 : Math.round((moduleCorrectCounts[moduleCode] / moduleQuestionCounts[moduleCode]) * 100)
    ])
  ) as Record<LearningModuleCode, number>;
  const totalCorrect = Object.values(moduleCorrectCounts).reduce((sum, count) => sum + count, 0);

  return {
    answers,
    moduleScores,
    totalScore: Math.round((totalCorrect / attempt.questions.length) * 100)
  };
}

function buildCompetencyScores(
  attempt: QuizAttemptRecord,
  answers: Record<string, string[]>
): Record<string, number> {
  const totals = new Map<string, { correct: number; total: number }>();
  for (const question of attempt.questions) {
    const selected = [...(answers[question.id] ?? [])].sort();
    const correct = [...question.correctOptionIds].sort();
    const isCorrect = selected.length === correct.length && selected.every((id, index) => id === correct[index]);
    for (const standardId of question.learningStandardIds) {
      const current = totals.get(standardId) ?? { correct: 0, total: 0 };
      totals.set(standardId, { correct: current.correct + (isCorrect ? 1 : 0), total: current.total + 1 });
    }
  }
  return Object.fromEntries(
    [...totals].map(([standardId, result]) => [standardId, Math.round((result.correct / result.total) * 100)])
  );
}

function buildRemediationRecommendations(
  attempt: QuizAttemptRecord,
  moduleScores: Record<LearningModuleCode, number>
): RemediationRecommendationRecord[] {
  return learningModuleCodes.flatMap((moduleCode) => {
    const score = moduleScores[moduleCode];
    if (score >= 80) return [];
    const questions = attempt.questions.filter((question) => question.moduleCode === moduleCode);
    const standardIds = [...new Set(questions.flatMap((question) => question.learningStandardIds))];
    const competencyTags = phase2LearningStandards
      .filter((standard) => standardIds.includes(standard.id))
      .flatMap((standard) => standard.tags);
    return [...new Set(questions.flatMap((question) => question.resourceIds))].map((resourceId, index) => ({
      moduleCode,
      standardIds,
      competencyTags: [...new Set(competencyTags)],
      resourceId,
      priority: Math.max(1, 100 - score - index),
      provenance: {
        attemptId: attempt.id,
        questionIds: questions.map((question) => question.questionId),
        sourceType: "DETERMINISTIC_MODULE_SCORE" as const
      }
    }));
  });
}

export function submitQuizAttempt(input: SubmitAttemptInput): SubmitAttemptResult {
  if (input.actor.role !== "student" || input.actor.id !== input.attempt.studentId) {
    throw new Error("Only the student who owns the attempt can submit it.");
  }

  if (input.attempt.status !== "in_progress") {
    throw new Error("Only in-progress attempts can be submitted.");
  }

  if (input.now > input.attempt.expiresAt) {
    return {
      attempt: { ...input.attempt, status: "expired" },
      updatedLicenses: input.existingLicenses,
      remediationRecommendations: [],
      auditEvents: [
        {
          actorId: input.actor.id,
          actorRole: input.actor.role,
          entityType: "quiz_attempt",
          entityId: input.attempt.id,
          action: "quiz_expired",
          fromStatus: "in_progress",
          toStatus: "expired"
        }
      ]
    };
  }

  const scored = scoreAttempt(input.attempt, input.selectedOptionIdsByAttemptQuestionId);
  const meetsOverall = scored.totalScore >= defaultQuizBlueprint.passingScore;
  const meetsModules = learningModuleCodes.every((moduleCode) => scored.moduleScores[moduleCode] >= defaultQuizBlueprint.minimumModuleScore);
  const passed = meetsOverall && meetsModules;
  const competencyScores = buildCompetencyScores(input.attempt, scored.answers);
  const remediationRecommendations = buildRemediationRecommendations(input.attempt, scored.moduleScores);
  const submittedAttempt: QuizAttemptRecord = {
    ...input.attempt,
    ...scored,
    status: passed ? "passed" : "failed",
    submittedAt: input.now,
    competencyScores,
    remediationRecommendations
  };
  const auditEvents: AuditEvent[] = [
    {
      actorId: input.actor.id,
      actorRole: input.actor.role,
      entityType: "quiz_attempt",
      entityId: input.attempt.id,
      action: "quiz_submitted",
      fromStatus: "in_progress",
      toStatus: submittedAttempt.status,
      changes: { totalScore: scored.totalScore, moduleScores: scored.moduleScores }
    }
  ];

  if (remediationRecommendations.length > 0) {
    auditEvents.push({
      actorId: input.actor.id,
      actorRole: input.actor.role,
      entityType: "quiz_attempt",
      entityId: input.attempt.id,
      action: "remediation_generated",
      changes: {
        threshold: 80,
        recommendationCount: remediationRecommendations.length,
        resourceIds: remediationRecommendations.map((item) => item.resourceId)
      }
    });
  }

  if (!passed) {
    return { attempt: submittedAttempt, updatedLicenses: input.existingLicenses, auditEvents, remediationRecommendations };
  }

  const supersededLicenses = input.existingLicenses.map((license) =>
    license.studentId === input.actor.id && license.licenseLevel === "level_1" && license.status === "active"
      ? { ...license, status: "superseded" as const }
      : license
  );
  const license: ResearchLicenseRecord = {
    id: `license_${input.actor.id}_${input.now.getTime()}`,
    studentId: input.actor.id,
    licenseLevel: "level_1",
    blueprintId: defaultQuizBlueprint.id,
    blueprintVersion: defaultQuizBlueprint.version,
    qualifyingAttemptId: submittedAttempt.id,
    status: "active",
    issuedAt: input.now,
    expiresAt: daysAfter(input.now, licenseValidityDays),
    certificateCode: `SL-L1-${input.actor.id.toUpperCase()}-${input.now.getTime()}`,
    certificateVersion: 1
  };

  auditEvents.push({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    entityType: "research_license",
    entityId: license.id,
    action: "license_issued",
    toStatus: "active",
    changes: { expiresAt: license.expiresAt.toISOString() }
  });

  return {
    attempt: submittedAttempt,
    license,
    updatedLicenses: [...supersededLicenses, license],
    auditEvents,
    remediationRecommendations
  };
}

export function canStudentCreateObservation(user: EngineUser, licenses: ResearchLicenseRecord[], now: Date): boolean {
  if (user.role !== "student") {
    return false;
  }

  return licenses.some(
    (license) =>
      license.studentId === user.id &&
      license.licenseLevel === "level_1" &&
      license.status === "active" &&
      license.expiresAt > now
  );
}

export function revokeLicense(actor: EngineUser, license: ResearchLicenseRecord, reason: string, now: Date): {
  license: ResearchLicenseRecord;
  auditEvent: AuditEvent;
} {
  if (actor.role !== "admin") {
    throw new Error("Only admins can revoke licenses.");
  }

  const revoked = {
    ...license,
    status: "revoked" as const,
    revokedAt: now,
    revokedBy: actor.id,
    revocationReason: reason
  };

  return {
    license: revoked,
    auditEvent: {
      actorId: actor.id,
      actorRole: actor.role,
      entityType: "research_license",
      entityId: license.id,
      action: "license_revoked",
      fromStatus: license.status,
      toStatus: "revoked",
      changes: { reason }
    }
  };
}

export function expireLicenses(licenses: ResearchLicenseRecord[], now: Date): { licenses: ResearchLicenseRecord[]; auditEvents: AuditEvent[] } {
  const auditEvents: AuditEvent[] = [];
  const updated = licenses.map((license) => {
    if (license.status === "active" && license.expiresAt <= now) {
      auditEvents.push({
        actorId: "system",
        actorRole: "system",
        entityType: "research_license",
        entityId: license.id,
        action: "license_expired",
        fromStatus: "active",
        toStatus: "expired"
      });
      return { ...license, status: "expired" as const };
    }
    return license;
  });

  return { licenses: updated, auditEvents };
}

export function reviewQuestion(input: unknown): { status: QuestionStatus; auditEvent: AuditEvent } {
  const parsed = reviewQuestionSchema.parse(input);
  const { actor, question, decision, reason } = parsed;

  if (actor.role !== "teacher" && actor.role !== "admin") {
    throw new Error("Only teachers and admins can review questions.");
  }

  if (question.status !== "pending_review") {
    throw new Error("Only pending questions can be reviewed.");
  }

  if (decision === "rejected" && !reason) {
    throw new Error("Question rejection requires a reason.");
  }

  if (decision === "approved" && actor.role !== "admin" && question.createdById === actor.id) {
    throw new Error("Question authors cannot approve their own question unless they are admins.");
  }

  return {
    status: decision,
    auditEvent: {
      actorId: actor.id,
      actorRole: actor.role,
      entityType: "question",
      entityId: question.id,
      action: decision === "approved" ? "question_approved" : "question_rejected",
      fromStatus: "pending_review",
      toStatus: decision,
      changes: reason ? { reason } : undefined
    }
  };
}

export function createApprovedQuestionVersion(
  question: QuestionSeed,
  changes: Partial<Pick<QuestionSeed, "prompt" | "explanation" | "difficulty">>
): QuestionSeed {
  if (question.status !== "approved" && question.status !== "published") {
    return { ...question, ...changes };
  }

  return {
    ...question,
    ...changes,
    id: `${question.id}_v${question.version + 1}`,
    version: question.version + 1,
    status: "draft"
  };
}
