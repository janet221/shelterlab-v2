import { learningModuleCodes, phase2LearningStandards, type LearningModuleCode } from "../research-license/phase2-data";
import type {
  CoursePlan,
  CourseWeek,
  CurriculumResource,
  QuestionDraft,
  QuestionGenerationBlueprint,
  ResourceMapping,
  StudentResourceProgress
} from "./types";

const checkedAt = new Date("2026-01-04T02:00:00.000Z");

export const phase4CoursePlan: CoursePlan = {
  id: "course_plan_shelterlab_16w_v1",
  code: "SHELTERLAB_16_WEEK_RESEARCH_LICENSE_V1",
  title: "ShelterLab 16-Week Living Laboratory Course",
  educationLevel: "secondary",
  gradeBand: "7-12",
  description: "A 16-week natural science course plan connecting Research License preparation, non-contact observation, review, and reflection.",
  status: "published",
  version: 1
};

const weekBlueprints: Array<[string, string, LearningModuleCode | undefined]> = [
  ["Program orientation and non-contact field norms", "Safety boundaries, roles, and data responsibility", "SHELTER_SAFETY"],
  ["Objective observation language", "Separate visible behavior from interpretation", "DOG_BEHAVIOR"],
  ["Dog body language and stress signals", "Recognize observable stress-related signals without diagnosis", "DOG_BEHAVIOR"],
  ["One Health foundations", "Connect human, animal, and environmental health", "ONE_HEALTH"],
  ["Hygiene and zoonotic disease prevention", "Apply prevention principles in field learning", "ONE_HEALTH"],
  ["Urban ecology variables", "Identify habitat, resource, and human activity variables", "URBAN_ECOLOGY"],
  ["Population and shelter intake context", "Use public datasets as context, not individual diagnosis", "URBAN_ECOLOGY"],
  ["Research ethics and privacy", "Protect people, dogs, and data integrity", "RESEARCH_ETHICS"],
  ["Data quality and bias", "Improve consistency, notes, and evidence limits", "RESEARCH_ETHICS"],
  ["Research License review", "Practice module-linked questions and remediation", "RESEARCH_ETHICS"],
  ["Shelter visit preparation", "Confirm tasks, zones, and observation protocol", "SHELTER_SAFETY"],
  ["Observation session rehearsal", "Use timer, behavior buttons, and timeline review", "DOG_BEHAVIOR"],
  ["Teacher review workshop", "Revise records with required reasons and evidence", "RESEARCH_ETHICS"],
  ["Shelter confirmation workshop", "Understand shelter confirmation and publish rules", "SHELTER_SAFETY"],
  ["Evidence-based interpretation", "Connect published observations to limited claims", "URBAN_ECOLOGY"],
  ["Course reflection and next research questions", "Summarize learning without overclaiming", undefined]
];

export const phase4CourseWeeks: CourseWeek[] = weekBlueprints.map(([title, focus, moduleCode], index) => ({
  id: `course_week_${String(index + 1).padStart(2, "0")}`,
  coursePlanId: phase4CoursePlan.id,
  weekNumber: index + 1,
  title,
  focus,
  moduleCode,
  learningGoals: [
    `Explain the week ${index + 1} focus using objective scientific language.`,
    "Identify at least one supporting resource and one related learning standard."
  ],
  assessmentNote: index + 1 === 10 ? "Research License practice and remediation check." : "Teacher checks discussion notes and completion evidence."
}));

function resource(seed: {
  id: string;
  title: string;
  resourceType: CurriculumResource["resourceType"];
  providerName: string;
  moduleCode: LearningModuleCode;
  approved?: boolean;
  governmentDatasetId?: string;
  externalResourceId?: string;
  sourceUrl?: string;
  sourceAgency?: string;
}): CurriculumResource {
  const approved = seed.approved === true;
  return {
    id: seed.id,
    title: seed.title,
    resourceType: seed.resourceType,
    providerName: seed.providerName,
    sourceAgency: seed.sourceAgency,
    sourceUrl: seed.sourceUrl ?? `internal://shelterlab/demo/${seed.id}`,
    governmentDatasetId: seed.governmentDatasetId,
    externalResourceId: seed.externalResourceId,
    subject: "Natural Science",
    educationLevel: "secondary",
    gradeBand: "7-12",
    topicTags: [seed.moduleCode.toLowerCase().replaceAll("_", "-"), "UNVERIFIED_DEMO"],
    learningContentCodes: [`DEMO-${seed.moduleCode}-LC`],
    learningPerformanceCodes: [`DEMO-${seed.moduleCode}-LP`],
    coreCompetencyCodes: [`DEMO-${seed.moduleCode}-CC`],
    durationMinutes: seed.resourceType === "video" ? 8 : 12,
    language: "zh-TW",
    description: approved
      ? "ShelterLab teacher-authored demo material reviewed inside this project. Not an official government resource."
      : "UNVERIFIED_DEMO placeholder metadata for adapter and verification workflow testing. Do not present to students as official content.",
    copyrightNote: approved
      ? "ShelterLab-authored demo content for MVP testing; no external copyrighted text copied."
      : "UNVERIFIED_DEMO metadata only; content must be reviewed before course use.",
    licenseNote: approved
      ? "Internal demo license for ShelterLab MVP testing."
      : "UNVERIFIED_DEMO license note pending verification.",
    verificationStatus: approved ? "approved_for_course" : "unverified",
    verificationNote: approved ? "Teacher-reviewed internal demo material." : undefined,
    verifiedAt: approved ? checkedAt : undefined,
    verifiedBy: approved ? "teacher_demo_001" : undefined,
    lastCheckedAt: checkedAt,
    availabilityStatus: "active",
    evidenceVerificationState: approved ? "SYNTHETIC_DEMO" : "UNVERIFIED"
  };
}

function officialResource(seed: {
  id: string;
  title: string;
  resourceType: CurriculumResource["resourceType"];
  providerName: string;
  sourceAgency: string;
  sourceUrl: string;
  governmentDatasetId: string;
  externalResourceId: string;
  moduleCode: LearningModuleCode;
  metadataOnly?: boolean;
}): CurriculumResource {
  return {
    id: seed.id,
    title: seed.title,
    resourceType: seed.resourceType,
    providerName: seed.providerName,
    sourceAgency: seed.sourceAgency,
    sourceUrl: seed.sourceUrl,
    governmentDatasetId: seed.governmentDatasetId,
    externalResourceId: seed.externalResourceId,
    subject: "Natural Science",
    educationLevel: "secondary",
    gradeBand: seed.metadataOnly ? undefined : "7-12",
    topicTags: [seed.moduleCode.toLowerCase().replaceAll("_", "-"), "OFFICIAL_OPEN_DATA"],
    learningContentCodes: [`DEMO-${seed.moduleCode}-LC`],
    learningPerformanceCodes: [`DEMO-${seed.moduleCode}-LP`],
    coreCompetencyCodes: [`DEMO-${seed.moduleCode}-CC`],
    language: "zh-TW",
    description: seed.metadataOnly
      ? "Verified official metadata and outbound link only. Blank curriculum fields are preserved and no video content is copied."
      : "Verified official aggregate data used for teacher-governed data interpretation and inquiry context.",
    copyrightNote: seed.metadataOnly ? "Metadata and outbound link only; no video was downloaded, embedded, transcribed, mirrored, or redistributed." : "Derived fixture contains a small normalized subset of government open data with attribution.",
    licenseNote: "政府資料開放授權條款第 1 版；資料來源已標示。",
    verificationStatus: seed.metadataOnly ? "metadata_verified" : "approved_for_course",
    verificationNote: "Official data.gov.tw metadata and downloadable resource inspected on 2026-07-11.",
    verifiedAt: new Date("2026-07-11T06:00:00.000Z"),
    verifiedBy: "admin_demo_001",
    lastCheckedAt: new Date("2026-07-11T06:00:00.000Z"),
    availabilityStatus: "active",
    evidenceVerificationState: "VERIFIED"
  };
}

export const phase4CurriculumResources: CurriculumResource[] = [
  resource({ id: "res_teacher_behavior_primer", title: "ShelterLab Teacher-Authored Behavior Primer", resourceType: "teacher_material", providerName: "ShelterLab teacher-authored", moduleCode: "DOG_BEHAVIOR", approved: true }),
  resource({ id: "res_teacher_one_health_primer", title: "ShelterLab Teacher-Authored One Health Primer", resourceType: "teacher_material", providerName: "ShelterLab teacher-authored", moduleCode: "ONE_HEALTH", approved: true }),
  resource({ id: "res_teacher_urban_ecology_primer", title: "ShelterLab Teacher-Authored Urban Ecology Data Primer", resourceType: "teacher_material", providerName: "ShelterLab teacher-authored", moduleCode: "URBAN_ECOLOGY", approved: true }),
  resource({ id: "res_synthetic_eduod_literacy", title: "SYNTHETIC_DEMO Education Open-Data Literacy Fixture", resourceType: "government_dataset", providerName: "ShelterLab Synthetic Demo", sourceAgency: "ShelterLab Synthetic Demo", sourceUrl: "internal://shelterlab/synthetic/education-participation-v1", governmentDatasetId: "SYNTHETIC_EDUOD_001", externalResourceId: "SYNTHETIC_EDUOD_001", moduleCode: "URBAN_ECOLOGY", approved: true }),
  resource({ id: "res_teacher_safety_primer", title: "ShelterLab Teacher-Authored Safety Primer", resourceType: "teacher_material", providerName: "ShelterLab teacher-authored", moduleCode: "SHELTER_SAFETY", approved: true }),
  resource({ id: "res_teacher_ethics_primer", title: "ShelterLab Teacher-Authored Research Ethics Primer", resourceType: "teacher_material", providerName: "ShelterLab teacher-authored", moduleCode: "RESEARCH_ETHICS", approved: true }),
  resource({ id: "res_unverified_ilearn_001", title: "UNVERIFIED_DEMO iLearn Resource Placeholder 001", resourceType: "video", providerName: "NAER iLearn", sourceAgency: "NAER", sourceUrl: "UNVERIFIED_DEMO_NO_REAL_URL", externalResourceId: "UNVERIFIED_ILEARN_001", moduleCode: "ONE_HEALTH" }),
  resource({ id: "res_unverified_ilearn_002", title: "UNVERIFIED_DEMO iLearn Resource Placeholder 002", resourceType: "interactive_resource", providerName: "NAER iLearn", sourceAgency: "NAER", sourceUrl: "UNVERIFIED_DEMO_NO_REAL_URL", externalResourceId: "UNVERIFIED_ILEARN_002", moduleCode: "URBAN_ECOLOGY" }),
  officialResource({ id: "res_dataset_41236", title: "全國公立動物收容所收容處理情形統計表", resourceType: "government_dataset", providerName: "data.gov.tw", sourceAgency: "農業部", sourceUrl: "https://data.gov.tw/dataset/41236", governmentDatasetId: "41236", externalResourceId: "41236", moduleCode: "URBAN_ECOLOGY" }),
  officialResource({ id: "res_dataset_6318", title: "愛學網：生物多樣性（官方外連中繼資料）", resourceType: "video", providerName: "國家教育研究院愛學網", sourceAgency: "國家教育研究院", sourceUrl: "https://stv.naer.edu.tw/watch/1735", governmentDatasetId: "6318", externalResourceId: "6318:224", moduleCode: "URBAN_ECOLOGY", metadataOnly: true }),
  resource({ id: "res_dataset_29027", title: "UNVERIFIED_DEMO data.gov.tw 29027 Metadata Placeholder", resourceType: "government_dataset", providerName: "data.gov.tw", sourceAgency: "National Academy for Educational Research", sourceUrl: "https://data.gov.tw/dataset/29027", governmentDatasetId: "29027", externalResourceId: "29027", moduleCode: "RESEARCH_ETHICS" }),
  resource({ id: "res_dataset_15391", title: "UNVERIFIED_DEMO data.gov.tw 15391 Metadata Placeholder", resourceType: "government_dataset", providerName: "data.gov.tw", sourceAgency: "Ministry of Education", sourceUrl: "https://data.gov.tw/dataset/15391", governmentDatasetId: "15391", externalResourceId: "15391", moduleCode: "RESEARCH_ETHICS" }),
  resource({ id: "res_dataset_6089", title: "UNVERIFIED_DEMO data.gov.tw 6089 Metadata Placeholder", resourceType: "government_dataset", providerName: "data.gov.tw", sourceAgency: "Ministry of Education", sourceUrl: "https://data.gov.tw/dataset/6089", governmentDatasetId: "6089", externalResourceId: "6089", moduleCode: "SHELTER_SAFETY" }),
  officialResource({ id: "res_dataset_40121", title: "各級學校縣市別學生人數", resourceType: "government_dataset", providerName: "data.gov.tw", sourceAgency: "教育部統計處", sourceUrl: "https://data.gov.tw/dataset/40121", governmentDatasetId: "40121", externalResourceId: "40121", moduleCode: "URBAN_ECOLOGY" }),
  resource({ id: "res_unverified_mohw_001", title: "UNVERIFIED_DEMO MOHW/CDC Public Health Placeholder", resourceType: "article", providerName: "Taiwan CDC/MOHW", sourceAgency: "MOHW", sourceUrl: "UNVERIFIED_DEMO_NO_REAL_URL", externalResourceId: "UNVERIFIED_MOHW_001", moduleCode: "ONE_HEALTH" })
];

const standardByModule = new Map<LearningModuleCode, string[]>();
for (const code of learningModuleCodes) {
  standardByModule.set(
    code,
    phase2LearningStandards.filter((standard) => standard.moduleCodes.includes(code)).map((standard) => standard.id)
  );
}

const resourceModuleById = new Map(
  phase4CurriculumResources.map((resourceItem) => [
    resourceItem.id,
    (resourceItem.learningContentCodes[0]?.replace("DEMO-", "").replace("-LC", "") as LearningModuleCode) ?? "RESEARCH_ETHICS"
  ])
);

export const phase4ResourceMappings: ResourceMapping[] = phase4CurriculumResources.flatMap((resourceItem, index) => {
  const moduleCode = resourceModuleById.get(resourceItem.id) ?? "RESEARCH_ETHICS";
  const usableOfficialMetadata = resourceItem.evidenceVerificationState === "VERIFIED" && resourceItem.verificationStatus === "metadata_verified";
  const mappingActive = resourceItem.verificationStatus === "approved_for_course" || usableOfficialMetadata;
  const moduleMapping: ResourceMapping = {
    resourceId: resourceItem.id,
    targetType: "module",
    targetId: moduleCode,
    requiredOrOptional: resourceItem.verificationStatus === "approved_for_course" ? "required" : "optional",
    displayOrder: index + 1,
    teacherNote: resourceItem.verificationStatus === "approved_for_course" ? "Approved evidence resource." : usableOfficialMetadata ? "Verified official metadata; optional outbound resource only." : "UNVERIFIED_DEMO mapping pending review.",
    remediationPriority: resourceItem.verificationStatus === "approved_for_course" ? 100 - index : usableOfficialMetadata ? 40 : 10,
    mappingStatus: mappingActive ? "active" : "draft"
  };
  const standardMappings = (standardByModule.get(moduleCode) ?? []).slice(0, 2).map((standardId, standardIndex) => ({
    ...moduleMapping,
    targetType: "standard" as const,
    targetId: standardId,
    displayOrder: standardIndex + 1
  }));
  const week = phase4CourseWeeks.find((courseWeek) => courseWeek.moduleCode === moduleCode);
  const weekMapping = week
    ? [{ ...moduleMapping, targetType: "course_week" as const, targetId: week.id, displayOrder: week.weekNumber }]
    : [];
  return [moduleMapping, ...standardMappings, ...weekMapping];
});

export const phase4QuestionBlueprints: QuestionGenerationBlueprint[] = learningModuleCodes.map((moduleCode, index) => ({
  id: `qgb_${moduleCode.toLowerCase()}_v1`,
  code: `QGB_${moduleCode}_V1`,
  title: `${moduleCode.replaceAll("_", " ")} Demo Question Blueprint`,
  moduleCode,
  educationLevel: "secondary",
  gradeBand: "7-12",
  questionType: index % 2 === 0 ? "single_choice" : "scenario_choice",
  bloomLevel: (["remember", "understand", "apply", "analyze", "evaluate"] as const)[index],
  difficulty: (["basic", "intermediate", "advanced"] as const)[index % 3],
  numberOfQuestions: 3,
  requiredResourceCount: 1,
  requiredLearningStandardCount: 1,
  scenarioContext: `DEMO_AI_DRAFT context for ${moduleCode}; use only approved resources and demo standards.`,
  prohibitedContent: ["diagnosis", "adoption suitability claims", "student identity", "copied exam text"],
  promptVersion: "shelterlab-s6-v1",
  requiresGovernmentData: moduleCode === "URBAN_ECOLOGY",
  sourceResourceIds: phase4CurriculumResources
    .filter((resourceItem) => resourceItem.verificationStatus === "approved_for_course" && resourceModuleById.get(resourceItem.id) === moduleCode)
    .filter((resourceItem) => moduleCode !== "URBAN_ECOLOGY" || resourceItem.id === "res_dataset_40121")
    .slice(0, 1)
    .map((resourceItem) => resourceItem.id),
  learningStandardIds: (standardByModule.get(moduleCode) ?? []).slice(0, 1),
  governmentDatasetIds: moduleCode === "URBAN_ECOLOGY" ? ["40121"] : [],
  qualityRules: {
    requireObjectiveLanguage: true,
    noCopyrightCopying: true,
    requireSourceTraceability: true,
    requireTeacherReview: true
  },
  status: "active",
  version: 1,
  createdBy: "teacher_demo_001",
  reviewedBy: "admin_demo_001"
}));

function draftFor(blueprint: QuestionGenerationBlueprint, order: number): QuestionDraft {
  const resources = phase4CurriculumResources.filter(
    (resourceItem) =>
      resourceItem.verificationStatus === "approved_for_course" &&
      resourceModuleById.get(resourceItem.id) === blueprint.moduleCode
  );
  const sourceResource = resources[0] ?? phase4CurriculumResources[0];
  const standards = standardByModule.get(blueprint.moduleCode) ?? ["std_demo_observation_classification"];
  return {
    id: `qd_${blueprint.moduleCode.toLowerCase()}_${order}`,
    generationBlueprintId: blueprint.id,
    coursePlanId: phase4CoursePlan.id,
    moduleCode: blueprint.moduleCode,
    version: 1,
    prompt: `DEMO_AI_DRAFT ${order}: Which statement best supports ${blueprint.moduleCode} using observable evidence?`,
    questionType: blueprint.questionType,
    options: [
      { optionKey: "A", optionText: "Use objective notes connected to the approved resource." },
      { optionKey: "B", optionText: "Guess the dog's feelings from one moment." },
      { optionKey: "C", optionText: "Copy text from an external page." },
      { optionKey: "D", optionText: "Publish before teacher review." }
    ],
    correctOptionKeys: ["A"],
    explanation: "The correct answer uses evidence, approved resources, and teacher-reviewed governance.",
    sourceResourceIds: [sourceResource.id],
    sourceExcerptNotes: "DEMO_AI_DRAFT source note; no copied source excerpt.",
    learningStandardIds: standards.slice(0, 1),
    governmentDatasetIds: blueprint.governmentDatasetIds,
    generationMethod: "ai_assisted",
    modelName: "DEMO_DETERMINISTIC_GENERATOR",
    modelVersion: "phase4-mock-v1",
    providerName: "deterministic",
    providerVersion: "shelterlab-s6-v1",
    promptVersion: "phase4-prompt-v1",
    generationTimestamp: checkedAt,
    factualityCheckStatus: "warning",
    sourceAlignmentStatus: "passed",
    teacherReviewStatus: order === 1 ? "published" : order === 2 ? "approved" : "ai_draft",
    teacherRevisionNotes: order === 3 ? "Teacher should verify alignment before approval." : undefined,
    riskFlags: ["DEMO_AI_DRAFT_REQUIRES_TEACHER_REVIEW"],
    similarityFlags: [],
    unsupportedClaimFlags: [],
    bloomLevel: blueprint.bloomLevel,
    difficulty: blueprint.difficulty,
    confidenceNote: "DEMO_AI_DRAFT only; deterministic mock output.",
    createdBy: "teacher_demo_001",
    reviewedBy: order <= 2 ? "admin_demo_001" : undefined,
    publishedBy: order === 1 ? "admin_demo_001" : undefined,
    approvedAt: order <= 2 ? checkedAt : undefined,
    publishedAt: order === 1 ? checkedAt : undefined
  };
}

export const phase4QuestionDrafts: QuestionDraft[] = phase4QuestionBlueprints.flatMap((blueprint) =>
  [1, 2, 3].map((order) => draftFor(blueprint, order))
);

export const phase4StudentResourceProgress: StudentResourceProgress[] = [
  {
    studentId: "student_demo_001",
    resourceId: "res_teacher_behavior_primer",
    moduleCode: "DOG_BEHAVIOR",
    openedAt: checkedAt,
    completedAt: undefined,
    progressState: "opened"
  },
  {
    studentId: "student_demo_001",
    resourceId: "res_teacher_safety_primer",
    moduleCode: "SHELTER_SAFETY",
    progressState: "assigned"
  }
];

export const phase4PublishedQuestionIds = phase4QuestionDrafts
  .filter((draft) => draft.teacherReviewStatus === "published")
  .map((draft) => `published_${draft.id}`);
