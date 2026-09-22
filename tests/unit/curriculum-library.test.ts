import { describe, expect, it } from "vitest";
import { phase4CurriculumResources, phase4QuestionBlueprints, phase4QuestionDrafts, phase4ResourceMappings } from "../../lib/curriculum-library/phase4-data";
import {
  buildTraceability,
  archiveQuestionDraft,
  assignStudentResource,
  canUseResourceAsRequired,
  createQuestionGenerationBlueprint,
  deterministicQuestionDraftGenerator,
  editQuestionDraft,
  importMockResources,
  listApprovedStudentResources,
  learningStandardStatusLabel,
  markResourceUnavailable,
  previewResourceImport,
  publishQuestionDraft,
  recommendRemediationResources,
  recordResourceProgress,
  rejectResource,
  reviewQuestionDraft,
  reviewResourceRelevance,
  submitDraftForReview,
  upsertResourceMapping,
  validateResourceMapping,
  verifyResourceMetadata
} from "../../lib/curriculum-library/services";
import type { CurriculumUser } from "../../lib/curriculum-library/types";

const coursePlanId = "course_plan_shelterlab_16w_v1";
const teacher: CurriculumUser = { id: "teacher_demo_001", role: "teacher", authorizedCoursePlanIds: [coursePlanId] };
const secondTeacher: CurriculumUser = { id: "teacher_demo_002", role: "teacher", authorizedCoursePlanIds: [coursePlanId] };
const admin: CurriculumUser = { id: "admin_demo_001", role: "admin" };
const student: CurriculumUser = { id: "student_demo_001", role: "student" };

describe("Curriculum Library and question authoring", () => {
  it("hides unverified resources from students", () => {
    const resources = listApprovedStudentResources();

    expect(resources.length).toBeGreaterThan(0);
    expect(resources.every((resource) => resource.verificationStatus === "approved_for_course")).toBe(true);
    expect(resources.some((resource) => resource.title.includes("UNVERIFIED_DEMO"))).toBe(false);
  });

  it("keeps external metadata unverified until access and reuse rules are verified", () => {
    const target = phase4CurriculumResources.find((resource) => resource.verificationStatus === "unverified")!;

    expect(() => verifyResourceMetadata(teacher, target, { note: "Title checked." })).toThrow("remain UNVERIFIED");
  });

  it("moves external metadata to metadata_verified only with complete evidence", () => {
    const target = phase4CurriculumResources.find((resource) => resource.verificationStatus === "unverified")!;
    const result = verifyResourceMetadata(teacher, target, {
      note: "Official source, access method, and reuse terms checked.",
      officialSourceVerified: true,
      accessMethodVerified: true,
      reuseTermsVerified: true,
      outboundLinkOnly: true
    });

    expect(result.resource.verificationStatus).toBe("metadata_verified");
    expect(result.auditEvent.action).toBe("resource_metadata_verified");
  });

  it("requires metadata verification before course approval", () => {
    const target = phase4CurriculumResources.find((resource) => resource.verificationStatus === "unverified")!;

    expect(() =>
      reviewResourceRelevance(teacher, target, {
        curriculumFit: "Fits module.",
        copyrightChecked: true,
        studentSafetyChecked: true,
        notes: "Ready."
      })
    ).toThrow("verified metadata");
  });

  it("approves a metadata-verified resource after relevance review", () => {
    const target = { ...phase4CurriculumResources.find((resource) => resource.verificationStatus === "unverified")!, verificationStatus: "metadata_verified" as const };
    const result = reviewResourceRelevance(teacher, target, {
      curriculumFit: "Supports objective observation.",
      copyrightChecked: true,
      studentSafetyChecked: true,
      notes: "No copied content."
    });

    expect(result.resource.verificationStatus).toBe("approved_for_course");
  });

  it("requires a reason when rejecting a resource", () => {
    const target = phase4CurriculumResources[0];

    expect(() => rejectResource(teacher, target, "")).toThrow("requires a reason");
  });

  it("marks unavailable resources as hidden from student use", () => {
    const result = markResourceUnavailable(teacher, phase4CurriculumResources[0], "Link unavailable.");

    expect(result.resource.availabilityStatus).toBe("unavailable");
    expect(canUseResourceAsRequired(result.resource)).toBe(false);
  });

  it("prevents unverified resources from being required", () => {
    const unverified = phase4CurriculumResources.find((resource) => resource.verificationStatus === "unverified")!;
    const mapping = { ...phase4ResourceMappings[0], resourceId: unverified.id, requiredOrOptional: "required" as const };

    expect(() => validateResourceMapping(unverified, mapping)).toThrow("approved active");
  });

  it("previews imports without external API calls and detects duplicates", () => {
    const preview = previewResourceImport("government_dataset");

    expect(preview[0].validationFlags).toContain("MOCK_IMPORT_ONLY");
    expect(preview[0].validationFlags).toContain("DUPLICATE");
  });

  it("allows only admins to run mock imports", () => {
    expect(() => importMockResources(teacher, "manual_teacher")).toThrow("Only admins");

    const result = importMockResources(admin, "manual_teacher");
    expect(result.summary.lastSyncMetadata.externalApiCalled).toBe(false);
    expect(result.auditEvent.action).toBe("resource_import");
  });

  it("creates a teacher-owned question generation blueprint", () => {
    const result = createQuestionGenerationBlueprint(teacher, {
      code: "CUSTOM_BLUEPRINT",
      title: "Custom Blueprint",
      moduleCode: "DOG_BEHAVIOR",
      educationLevel: "secondary",
      questionType: "single_choice",
      bloomLevel: "apply",
      difficulty: "basic",
      numberOfQuestions: 2,
      requiredResourceCount: 1,
      requiredLearningStandardCount: 1,
      scenarioContext: "Objective observation.",
      prohibitedContent: ["diagnosis"],
      qualityRules: { noCopyrightCopying: true }
    });

    expect(result.blueprint.status).toBe("draft");
    expect(result.blueprint.createdBy).toBe(teacher.id);
    expect(result.auditEvent.action).toBe("generation_blueprint_created");
  });

  it("generates deterministic DEMO_AI_DRAFT output only", () => {
    const blueprint = phase4QuestionBlueprints[0];
    const resources = listApprovedStudentResources().filter((resource) => resource.id === "res_teacher_behavior_primer");
    const drafts = deterministicQuestionDraftGenerator(blueprint, resources, ["std_demo_observation_classification"]);

    expect(drafts).toHaveLength(blueprint.numberOfQuestions);
    expect(drafts[0].risk_flags).toContain("DEMO_AI_DRAFT");
    expect(drafts[0].confidence_note).toContain("no LLM");
  });

  it("refuses generation without approved source resources", () => {
    expect(() => deterministicQuestionDraftGenerator(phase4QuestionBlueprints[0], [], ["std_demo_observation_classification"])).toThrow("enough approved resources");
  });

  it("submits AI drafts for teacher review", () => {
    const draft = phase4QuestionDrafts.find((item) => item.teacherReviewStatus === "ai_draft")!;
    const result = submitDraftForReview(teacher, draft);

    expect(result.draft.teacherReviewStatus).toBe("pending_review");
  });

  it("prevents non-admin authors from approving their own draft", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "pending_review" as const, createdBy: teacher.id };

    expect(() => reviewQuestionDraft(teacher, draft, "approved")).toThrow("cannot approve");
  });

  it("does not allow AI drafts to skip pending review", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "ai_draft" as const, createdBy: "other" };

    expect(() => reviewQuestionDraft(secondTeacher, draft, "approved")).toThrow("PENDING_REVIEW");
  });

  it("requires a reason for draft revision and rejection", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "pending_review" as const, createdBy: "other" };

    expect(() => reviewQuestionDraft(secondTeacher, draft, "revision_required")).toThrow("requires a reason");
    expect(() => reviewQuestionDraft(secondTeacher, draft, "rejected")).toThrow("requires a reason");
  });

  it("publishes only approved drafts with approved resources and standards", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "approved" as const };
    const result = publishQuestionDraft(admin, draft);

    expect(result.draft.teacherReviewStatus).toBe("published");
    expect(result.draft.publishedQuestionId).toContain("published_");
  });

  it("does not publish unapproved drafts", () => {
    expect(() => publishQuestionDraft(admin, phase4QuestionDrafts.find((draft) => draft.teacherReviewStatus === "ai_draft")!)).toThrow("Only approved drafts");
  });

  it("limits teacher publication to authorized courses", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "approved" as const };
    const unauthorizedTeacher: CurriculumUser = { id: "teacher_other", role: "teacher", authorizedCoursePlanIds: [] };

    expect(() => publishQuestionDraft(unauthorizedTeacher, draft)).toThrow("authorized courses");
    expect(publishQuestionDraft(teacher, draft).draft.publishedBy).toBe(teacher.id);
  });

  it("recommends remediation by weak module and priority", () => {
    const recommendations = recommendRemediationResources({ DOG_BEHAVIOR: 50, ONE_HEALTH: 90 });

    expect(recommendations[0].moduleCode).toBe("DOG_BEHAVIOR");
    expect(recommendations[0].resource.verificationStatus).toBe("approved_for_course");
  });

  it("uses below 80, not 80, as the remediation threshold", () => {
    expect(recommendRemediationResources({ DOG_BEHAVIOR: 80 })).toHaveLength(0);
    expect(recommendRemediationResources({ DOG_BEHAVIOR: 79.99 }).length).toBeGreaterThan(0);
  });

  it("records student resource progress", () => {
    const result = recordResourceProgress(student, "res_teacher_behavior_primer", "completed");

    expect(result.progress.progressState).toBe("completed");
    expect(result.progress.completedAt).toBeInstanceOf(Date);
    expect(result.auditEvent.action).toBe("student_resource_progress_changed");
  });

  it("rejects non-student resource progress updates", () => {
    expect(() => recordResourceProgress(teacher, "res_teacher_behavior_primer", "opened")).toThrow("Only students");
  });

  it("builds resource-to-license traceability", () => {
    const trace = buildTraceability("res_teacher_behavior_primer");

    expect(trace.resource.id).toBe("res_teacher_behavior_primer");
    expect(trace.modules).toContain("DOG_BEHAVIOR");
    expect(trace.researchLicenses).toContain("license_demo_level_1_001");
  });

  it("visibly distinguishes learning-standard verification states", () => {
    expect(learningStandardStatusLabel("official_verified")).toBe("OFFICIAL_VERIFIED");
    expect(learningStandardStatusLabel("demo_reference")).toBe("DEMO_REFERENCE");
    expect(learningStandardStatusLabel("unverified")).toBe("UNVERIFIED");
  });

  it("audits resource-to-standard and resource-to-week mappings", () => {
    const resource = phase4CurriculumResources[0];
    const standard = phase4ResourceMappings.find((mapping) => mapping.resourceId === resource.id && mapping.targetType === "standard")!;
    const week = phase4ResourceMappings.find((mapping) => mapping.resourceId === resource.id && mapping.targetType === "course_week")!;

    expect(upsertResourceMapping(teacher, resource, standard).auditEvent.action).toBe("resource_to_standard_mapping");
    expect(upsertResourceMapping(teacher, resource, week).auditEvent.action).toBe("resource_to_week_mapping");
  });

  it("creates a new auditable version when editing an approved question", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "approved" as const };
    const result = editQuestionDraft(teacher, draft, { prompt: "Revised objective prompt", reason: "Improve clarity" });

    expect(result.draft.version).toBe(draft.version + 1);
    expect(result.draft.parentDraftId).toBe(draft.id);
    expect(result.auditEvent.action).toBe("question_version_created");
  });

  it("requires reasons for archival and audits student assignment changes", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "approved" as const };
    expect(() => archiveQuestionDraft(teacher, draft, "")).toThrow("requires a reason");

    const assignment = assignStudentResource(teacher, student.id, phase4CurriculumResources[0], "DOG_BEHAVIOR", coursePlanId);
    expect(assignment.auditEvent.action).toBe("student_resource_assignment_changed");
    expect(assignment.auditEvent.newState).toEqual({ status: "assigned" });
  });
});
