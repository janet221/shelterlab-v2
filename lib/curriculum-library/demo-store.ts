import {
  phase4CoursePlan,
  phase4CourseWeeks,
  phase4CurriculumResources,
  phase4QuestionBlueprints,
  phase4QuestionDrafts,
  phase4ResourceMappings,
  phase4StudentResourceProgress
} from "./phase4-data";
import { persistAuditEvent, persistAuditEvents } from "@/lib/audit/persistent-audit";
import {
  buildTraceability,
  archiveQuestionDraft,
  assignStudentResource,
  createQuestionGenerationBlueprint,
  editQuestionDraft,
  editQuestionGenerationBlueprint,
  importMockResources,
  listApprovedStudentResources,
  listResourcesForTeacher,
  markResourceUnavailable,
  previewResourceImport,
  publishQuestionDraft,
  recordResourceProgress,
  rejectResource,
  reviewQuestionDraft,
  reviewResourceRelevance,
  runDraftGeneration,
  submitDraftForReview,
  upsertResourceMapping,
  verifyResourceMetadata
} from "./services";
import type { CurriculumResource, CurriculumUser, QuestionDraft, QuestionGenerationBlueprint, ResourceImportProvider, ResourceMapping, StudentResourceProgress } from "./types";

const resources: CurriculumResource[] = phase4CurriculumResources.map((resource) => ({ ...resource }));
const resourceMappings: ResourceMapping[] = phase4ResourceMappings.map((mapping) => ({ ...mapping }));
const blueprints: QuestionGenerationBlueprint[] = phase4QuestionBlueprints.map((blueprint) => ({ ...blueprint }));
const drafts: QuestionDraft[] = phase4QuestionDrafts.map((draft) => ({ ...draft }));
const progress: StudentResourceProgress[] = phase4StudentResourceProgress.map((item) => ({ ...item }));

export function getCurriculumStoreSnapshot() {
  return {
    coursePlan: phase4CoursePlan,
    courseWeeks: phase4CourseWeeks,
    resources,
    resourceMappings,
    blueprints,
    drafts,
    progress
  };
}

export function getTeacherResources() {
  return listResourcesForTeacher(resources);
}

export function getStudentResources() {
  return listApprovedStudentResources(resources, resourceMappings);
}

export function getResourceById(id: string) {
  return resources.find((resource) => resource.id === id);
}

export async function applyMetadataVerification(user: CurriculumUser, resourceId: string, input: unknown) {
  const index = resources.findIndex((resource) => resource.id === resourceId);
  if (index === -1) {
    throw new Error("Resource not found.");
  }
  const result = verifyResourceMetadata(user, resources[index], input);
  await persistAuditEvent(result.auditEvent);
  resources[index] = result.resource;
  return result;
}

export async function applyRelevanceReview(user: CurriculumUser, resourceId: string, review: unknown) {
  const index = resources.findIndex((resource) => resource.id === resourceId);
  if (index === -1) {
    throw new Error("Resource not found.");
  }
  const result = reviewResourceRelevance(user, resources[index], review);
  await persistAuditEvents(result.auditEvents);
  resources[index] = result.resource;
  return result;
}

export async function applyResourceRejection(user: CurriculumUser, resourceId: string, reason: string) {
  const index = resources.findIndex((resource) => resource.id === resourceId);
  if (index === -1) {
    throw new Error("Resource not found.");
  }
  const result = rejectResource(user, resources[index], reason);
  await persistAuditEvent(result.auditEvent);
  resources[index] = result.resource;
  return result;
}

export async function applyUnavailable(user: CurriculumUser, resourceId: string, reason: string) {
  const index = resources.findIndex((resource) => resource.id === resourceId);
  if (index === -1) {
    throw new Error("Resource not found.");
  }
  const result = markResourceUnavailable(user, resources[index], reason);
  await persistAuditEvent(result.auditEvent);
  resources[index] = result.resource;
  return result;
}

export function getImportPreview(provider: ResourceImportProvider) {
  return previewResourceImport(provider, resources);
}

export async function runMockImport(user: CurriculumUser, provider: ResourceImportProvider) {
  const result = importMockResources(user, provider, resources);
  await persistAuditEvent(result.auditEvent);
  return result.summary;
}

export async function addQuestionBlueprint(user: CurriculumUser, input: unknown) {
  const result = createQuestionGenerationBlueprint(user, input);
  await persistAuditEvent(result.auditEvent);
  const blueprint = result.blueprint;
  blueprints.push(blueprint);
  return blueprint;
}

export async function applyEditQuestionBlueprint(user: CurriculumUser, blueprintId: string, input: unknown, reason: string) {
  const current = getBlueprintById(blueprintId);
  if (!current) {
    throw new Error("Blueprint not found.");
  }
  const result = editQuestionGenerationBlueprint(user, current, input, reason);
  await persistAuditEvent(result.auditEvent);
  blueprints.push(result.blueprint);
  return result;
}

export function getBlueprintById(id: string) {
  return blueprints.find((blueprint) => blueprint.id === id);
}

export async function generateDraftsForBlueprint(user: CurriculumUser, blueprintId: string) {
  const blueprint = getBlueprintById(blueprintId);
  if (!blueprint) {
    throw new Error("Blueprint not found.");
  }
  const result = runDraftGeneration(user, blueprint);
  await persistAuditEvent(result.auditEvent);
  drafts.push(...result.drafts);
  return result.drafts;
}

export function getQuestionDrafts() {
  return drafts;
}

export function getDraftById(id: string) {
  return drafts.find((draft) => draft.id === id);
}

export async function applyEditDraft(user: CurriculumUser, draftId: string, input: unknown) {
  const index = drafts.findIndex((draft) => draft.id === draftId);
  if (index === -1) {
    throw new Error("Draft not found.");
  }
  const result = editQuestionDraft(user, drafts[index], input);
  await persistAuditEvent(result.auditEvent);
  if (result.draft.id === draftId) {
    drafts[index] = result.draft;
  } else {
    drafts.push(result.draft);
  }
  return result;
}

export async function applySubmitDraft(user: CurriculumUser, draftId: string) {
  const index = drafts.findIndex((draft) => draft.id === draftId);
  if (index === -1) {
    throw new Error("Draft not found.");
  }
  const result = submitDraftForReview(user, drafts[index]);
  await persistAuditEvent(result.auditEvent);
  drafts[index] = result.draft;
  return result;
}

export async function applyReviewDraft(user: CurriculumUser, draftId: string, decision: "approved" | "revision_required" | "rejected", reason?: string) {
  const index = drafts.findIndex((draft) => draft.id === draftId);
  if (index === -1) {
    throw new Error("Draft not found.");
  }
  const result = reviewQuestionDraft(user, drafts[index], decision, reason);
  await persistAuditEvent(result.auditEvent);
  drafts[index] = result.draft;
  return result;
}

export async function applyPublishDraft(user: CurriculumUser, draftId: string) {
  const index = drafts.findIndex((draft) => draft.id === draftId);
  if (index === -1) {
    throw new Error("Draft not found.");
  }
  const result = publishQuestionDraft(user, drafts[index], resources);
  await persistAuditEvent(result.auditEvent);
  drafts[index] = result.draft;
  return result;
}

export async function applyArchiveDraft(user: CurriculumUser, draftId: string, reason: string) {
  const index = drafts.findIndex((draft) => draft.id === draftId);
  if (index === -1) {
    throw new Error("Draft not found.");
  }
  const result = archiveQuestionDraft(user, drafts[index], reason);
  await persistAuditEvent(result.auditEvent);
  drafts[index] = result.draft;
  return result;
}

export async function applyResourceMapping(user: CurriculumUser, mapping: ResourceMapping) {
  const resource = getResourceById(mapping.resourceId);
  if (!resource) {
    throw new Error("Resource not found.");
  }
  const index = resourceMappings.findIndex(
    (item) => item.resourceId === mapping.resourceId && item.targetType === mapping.targetType && item.targetId === mapping.targetId
  );
  const result = upsertResourceMapping(user, resource, mapping, index === -1 ? undefined : resourceMappings[index]);
  await persistAuditEvent(result.auditEvent);
  if (index === -1) resourceMappings.push(result.mapping);
  else resourceMappings[index] = result.mapping;
  return result;
}

export async function applyStudentResourceAssignment(
  user: CurriculumUser,
  studentId: string,
  resourceId: string,
  moduleCode: StudentResourceProgress["moduleCode"],
  coursePlanId: string
) {
  const resource = getResourceById(resourceId);
  if (!resource) {
    throw new Error("Resource not found.");
  }
  const index = progress.findIndex((item) => item.studentId === studentId && item.resourceId === resourceId);
  const result = assignStudentResource(user, studentId, resource, moduleCode, coursePlanId, index === -1 ? undefined : progress[index]);
  await persistAuditEvent(result.auditEvent);
  if (index === -1) progress.push(result.progress);
  else progress[index] = result.progress;
  return result;
}

export async function applyResourceProgress(user: CurriculumUser, resourceId: string, action: "opened" | "completed") {
  const result = recordResourceProgress(user, resourceId, action, progress);
  await persistAuditEvent(result.auditEvent);
  const next = result.progress;
  const index = progress.findIndex((item) => item.studentId === next.studentId && item.resourceId === next.resourceId);
  if (index === -1) {
    progress.push(next);
  } else {
    progress[index] = next;
  }
  return next;
}

export function getTraceability(resourceId: string, draftId?: string) {
  return buildTraceability(resourceId, draftId);
}
