import { describe, expect, it } from "vitest";
import {
  canStudentCreateObservation,
  createApprovedQuestionVersion,
  expireLicenses,
  getApprovedStudentQuestions,
  getAttemptResultWithExplanations,
  reviewQuestion,
  revokeLicense,
  sanitizeAttemptQuestions,
  startQuizAttempt,
  submitQuizAttempt,
  type EngineUser,
  type QuizAttemptRecord,
  type ResearchLicenseRecord
} from "../../lib/research-license/engine";
import { defaultQuizBlueprint, phase2Questions } from "../../lib/research-license/phase2-data";

const student: EngineUser = { id: "student_demo_001", role: "student" };
const teacher: EngineUser = { id: "teacher_demo_001", role: "teacher" };
const admin: EngineUser = { id: "admin_demo_001", role: "admin" };

function startedAttempt(seed = "stable-seed"): QuizAttemptRecord {
  return startQuizAttempt({
    user: student,
    now: new Date("2026-01-01T00:00:00.000Z"),
    previousAttempts: [],
    randomSeed: seed
  }).attempt;
}

function correctAnswersFor(attempt: QuizAttemptRecord) {
  return Object.fromEntries(attempt.questions.map((question) => [question.id, [...question.correctOptionIds]]));
}

function failOneModuleAnswersFor(attempt: QuizAttemptRecord) {
  const answers = correctAnswersFor(attempt);
  const targetModule = attempt.questions.filter((question) => question.moduleCode === "DOG_BEHAVIOR").slice(0, 2);
  for (const question of targetModule) {
    answers[question.id] = ["wrong-option"];
  }
  return answers;
}

describe("Research License engine", () => {
  it("prevents non-students from starting quiz attempts", () => {
    expect(() =>
      startQuizAttempt({
        user: teacher,
        now: new Date("2026-01-01T00:00:00.000Z"),
        previousAttempts: []
      })
    ).toThrow("Only students");
  });

  it("never selects draft questions for students", () => {
    const approved = getApprovedStudentQuestions([
      ...phase2Questions,
      { ...phase2Questions[0], id: "draft-question", status: "draft" }
    ]);

    expect(approved.some((question) => question.id === "draft-question")).toBe(false);
  });

  it("does not return correct answers before submission", () => {
    const payload = sanitizeAttemptQuestions(startedAttempt());

    expect(JSON.stringify(payload)).not.toContain("correctOptionIds");
    expect(JSON.stringify(payload)).not.toContain("isCorrect");
  });

  it("randomizes questions on the server", () => {
    const first = startedAttempt("seed-one").questions.map((question) => question.questionId);
    const second = startedAttempt("seed-two").questions.map((question) => question.questionId);

    expect(first).not.toEqual(second);
  });

  it("does not pass when overall score passes but a module minimum fails", () => {
    const attempt = startedAttempt("module-fail");
    const result = submitQuizAttempt({
      actor: student,
      attempt,
      selectedOptionIdsByAttemptQuestionId: failOneModuleAnswersFor(attempt),
      now: new Date("2026-01-01T00:20:00.000Z"),
      existingLicenses: []
    });

    expect(result.attempt.totalScore).toBeGreaterThanOrEqual(defaultQuizBlueprint.passingScore);
    expect(result.attempt.moduleScores.DOG_BEHAVIOR).toBeLessThan(defaultQuizBlueprint.minimumModuleScore);
    expect(result.attempt.status).toBe("failed");
    expect(result.license).toBeUndefined();
  });

  it("issues a license after a valid passing attempt", () => {
    const attempt = startedAttempt("pass");
    const result = submitQuizAttempt({
      actor: student,
      attempt,
      selectedOptionIdsByAttemptQuestionId: correctAnswersFor(attempt),
      now: new Date("2026-01-01T00:20:00.000Z"),
      existingLicenses: []
    });

    expect(result.attempt.status).toBe("passed");
    expect(result.license?.status).toBe("active");
    expect(result.license?.expiresAt).toEqual(new Date("2026-06-30T00:20:00.000Z"));
  });

  it("does not issue a license after a failed attempt", () => {
    const attempt = startedAttempt("fail");
    const result = submitQuizAttempt({
      actor: student,
      attempt,
      selectedOptionIdsByAttemptQuestionId: {},
      now: new Date("2026-01-01T00:20:00.000Z"),
      existingLicenses: []
    });

    expect(result.attempt.status).toBe("failed");
    expect(result.license).toBeUndefined();
  });

  it("expires licenses after 180 days", () => {
    const license = licenseFixture("active");
    const result = expireLicenses([license], new Date("2026-06-30T00:00:01.000Z"));

    expect(result.licenses[0].status).toBe("expired");
    expect(result.auditEvents[0].action).toBe("license_expired");
  });

  it("blocks observation eligibility when license is revoked", () => {
    expect(canStudentCreateObservation(student, [licenseFixture("revoked")], new Date("2026-01-02T00:00:00.000Z"))).toBe(false);
  });

  it("prevents teachers from approving their own questions unless admin", () => {
    expect(() =>
      reviewQuestion({
        actor: teacher,
        question: { id: "q1", createdById: teacher.id, status: "pending_review" },
        decision: "approved"
      })
    ).toThrow("cannot approve");

    expect(
      reviewQuestion({
        actor: admin,
        question: { id: "q1", createdById: admin.id, status: "pending_review" },
        decision: "approved"
      }).status
    ).toBe("approved");
  });

  it("requires a reason when rejecting a question", () => {
    expect(() =>
      reviewQuestion({
        actor: teacher,
        question: { id: "q1", createdById: "other", status: "pending_review" },
        decision: "rejected"
      })
    ).toThrow("requires a reason");
  });

  it("creates a new draft version when editing an approved question", () => {
    const next = createApprovedQuestionVersion(phase2Questions[0], { prompt: "Updated prompt" });

    expect(next.id).not.toBe(phase2Questions[0].id);
    expect(next.version).toBe(phase2Questions[0].version + 1);
    expect(next.status).toBe("draft");
  });

  it("preserves question snapshots even if source question changes later", () => {
    const attempt = startedAttempt("snapshot");
    const firstSnapshot = attempt.questions[0];
    const changedQuestion = createApprovedQuestionVersion(phase2Questions.find((question) => question.id === firstSnapshot.questionId)!, {
      prompt: "Changed after attempt"
    });

    expect(changedQuestion.prompt).toBe("Changed after attempt");
    expect(firstSnapshot.prompt).not.toBe("Changed after attempt");
  });

  it("does not allow expired attempts to be submitted", () => {
    const attempt = startedAttempt("expired");
    const result = submitQuizAttempt({
      actor: student,
      attempt,
      selectedOptionIdsByAttemptQuestionId: correctAnswersFor(attempt),
      now: new Date("2026-01-01T01:00:01.000Z"),
      existingLicenses: []
    });

    expect(result.attempt.status).toBe("expired");
    expect(result.license).toBeUndefined();
  });

  it("server-calculates score and ignores student score tampering", () => {
    const attempt = { ...startedAttempt("tamper"), totalScore: 100 };
    const result = submitQuizAttempt({
      actor: student,
      attempt,
      selectedOptionIdsByAttemptQuestionId: {},
      now: new Date("2026-01-01T00:20:00.000Z"),
      existingLicenses: []
    });

    expect(result.attempt.totalScore).toBe(0);
    expect(result.attempt.status).toBe("failed");
  });

  it("prevents students from revoking licenses", () => {
    expect(() => revokeLicense(student, licenseFixture("active"), "Not allowed", new Date())).toThrow("Only admins");
  });

  it("generates audit records for quiz submission and license issuance", () => {
    const attempt = startedAttempt("audit");
    const result = submitQuizAttempt({
      actor: student,
      attempt,
      selectedOptionIdsByAttemptQuestionId: correctAnswersFor(attempt),
      now: new Date("2026-01-01T00:20:00.000Z"),
      existingLicenses: []
    });

    expect(result.auditEvents.map((event) => event.action)).toEqual(["quiz_submitted", "license_issued"]);
  });

  it("returns explanations only after final submission", () => {
    const attempt = startedAttempt("explanations");
    expect(JSON.stringify(sanitizeAttemptQuestions(attempt))).not.toContain("explanation");

    const result = getAttemptResultWithExplanations({ ...attempt, status: "passed", totalScore: 100 });
    expect(result.explanations.length).toBeGreaterThan(0);
  });
});

function licenseFixture(status: ResearchLicenseRecord["status"]): ResearchLicenseRecord {
  return {
    id: "license-1",
    studentId: student.id,
    licenseLevel: "level_1",
    blueprintId: defaultQuizBlueprint.id,
    blueprintVersion: 1,
    qualifyingAttemptId: "attempt-1",
    status,
    issuedAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: new Date("2026-06-30T00:00:00.000Z"),
    certificateCode: "SL-L1-TEST",
    certificateVersion: 1
  };
}
