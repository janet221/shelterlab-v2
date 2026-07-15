import type { AuditEvent } from "../research-license/engine";

export const inquiryTypes = ["shelter_behavior", "one_health_public_health", "urban_ecology", "shelter_statistics", "animal_welfare", "adoption_accessibility", "data_quality", "custom_teacher_approved"] as const;
export type InquiryType = (typeof inquiryTypes)[number];
export const inquiryStatuses = ["draft", "question_review", "design_review", "data_collection", "analysis", "submitted", "teacher_revision", "teacher_rejected", "teacher_approved", "shelter_review", "shelter_revision", "shelter_rejected", "shelter_confirmed", "final", "archived"] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];
export const oneHealthDimensions = ["human_health", "animal_health", "animal_welfare", "environment", "public_health", "education", "citizen_science", "local_policy"] as const;
export type OneHealthDimension = (typeof oneHealthDimensions)[number];
export const inquiryEvidenceTypes = ["government_dataset_snapshot", "curriculum_resource", "learning_standard", "observation_session", "published_dog_evidence", "shelter_statistic", "student_generated_dataset", "teacher_reference"] as const;
export type InquiryEvidenceType = (typeof inquiryEvidenceTypes)[number];
export const analysisMethods = ["count", "proportion", "mean", "median", "minimum", "maximum", "category_comparison", "time_comparison", "regional_comparison", "contingency_table", "simple_correlation", "observation_frequency", "behavior_duration_summary"] as const;
export type AnalysisMethod = (typeof analysisMethods)[number];
export const cleaningActionTypes = ["remove_duplicate", "correct_invalid_code", "mark_missing", "exclude_with_reason", "standardize_category", "standardize_unit", "merge_approved_datasets", "create_derived_field"] as const;
export type CleaningActionType = (typeof cleaningActionTypes)[number];
export type InquiryActor = { id: string; role: "student" | "teacher" | "shelter_staff" | "admin"; authorizedCourseIds?: string[]; authorizedShelterIds?: string[] };
export type ValidationFlag = { code: string; severity: "warning" | "error"; field: string; message: string };

export type InquiryProject = {
  id: string; parentProjectId?: string; revisionNumber: number; courseId?: string; classroomId?: string; researchGroupId?: string;
  ownerStudentId: string; supervisingTeacherId: string; shelterId?: string; title: string; inquiryType: InquiryType; status: InquiryStatus;
  oneHealthDimensions: OneHealthDimension[]; oneHealthConnection: string; learningStandardIds: string[]; researchQuestion: string; background: string;
  hypothesis: string; independentVariable: string; dependentVariable: string; controlledVariables: string[]; evidenceScope: string;
  protocolVersion: string; dataClassification: "student_private" | "restricted_research" | "public_approved"; syntheticDemo: boolean;
  createdAt: Date; updatedAt: Date; submittedAt?: Date; teacherApprovedAt?: Date; shelterConfirmedAt?: Date; publishedAt?: Date; rowVersion: number;
  reflection: string; submittedSnapshot?: Record<string, unknown>;
};

export type InquiryEvidenceLink = {
  id: string; projectId: string; evidenceType: InquiryEvidenceType; sourceEntityId: string; sourceVersion: string;
  verificationState: "VERIFIED" | "DEMO_REFERENCE" | "SYNTHETIC_DEMO" | "SHELTER_CONFIRMED" | "UNVERIFIED";
  usagePurpose: string; citationText: string; includedAt: Date; includedBy: string; privacyClassification: "public" | "restricted" | "private";
};

export type ResearchDesign = {
  id: string; projectId: string; populationOrSample: string; observationUnit: string; samplingMethod: string; sampleSizePlanned: number;
  timePeriod: string; measurementMethod: string; variables: { name: string; role: "independent" | "dependent" | "controlled" | "context"; unit?: string }[];
  possibleConfounders: string[]; ethicalLimits: string; safetyLimits: string; privacyLimits: string; analysisPlan: string;
  teacherDesignDecision: "pending" | "approved" | "revision" | "rejected"; teacherFeedback?: string; flags: ValidationFlag[]; version: number; createdAt: Date;
};

export type DatasetColumn = { name: string; unit?: string; type: "number" | "string" | "category" | "boolean"; missingValueLabel?: string };
export type DatasetRow = Record<string, string | number | boolean | null>;
export type CleaningAction = { id: string; action: CleaningActionType; column?: string; fromValue?: string | number | boolean | null; toValue?: string | number | boolean | null; rowIndex?: number; reason?: string; formulaDescription?: string; createdAt: Date; actorId: string };
export type InquiryDatasetVersion = { id: string; datasetId: string; version: number; kind: "original" | "cleaned"; rows: DatasetRow[]; sourceProvenance: string[]; cleaningActions: CleaningAction[]; immutable: true; createdAt: Date };
export type InquiryDataset = { id: string; projectId: string; name: string; columns: DatasetColumn[]; versions: InquiryDatasetVersion[]; syntheticDemo: boolean; createdAt: Date };

export type ChartSpecification = { type: "bar" | "line" | "stacked_bar" | "pie" | "histogram" | "scatterplot" | "table" | "one_health_system"; title: string; xAxis?: string; yAxis?: string; categories?: string[]; unit: string; source: string; sampleSize: number; evidenceLabel: "VERIFIED" | "DEMO_REFERENCE" | "SYNTHETIC_DEMO"; interpretationWarning?: string };
export type AnalysisResult = { id: string; projectId: string; datasetVersionId: string; method: AnalysisMethod; variables: string[]; filteredPopulation: string; numerator: number; denominator: number; calculatedValue: number | Record<string, number>; chartSpecification: ChartSpecification; sourceDatasetVersions: string[]; interpretationNote: string; limitationNote: string; flags: ValidationFlag[]; generatedAt: Date; calculationVersion: string };

export type CERStatement = { id: string; projectId: string; claim: string; evidenceLinkIds: string[]; reasoning: string; confidenceLevel: "low" | "medium" | "high"; alternativeExplanation: string; limitation: string; teacherFeedback?: string; status: "draft" | "submitted" | "revision" | "approved" | "rejected"; flags: ValidationFlag[]; version: number; createdAt: Date };
export type OneHealthSystemNode = { id: string; type: "student_community" | "shelter_staff" | "dogs" | "pathogen_parasite" | "environment" | "parks" | "rivers" | "waste_food" | "weather" | "schools" | "public_agencies" | "adoption_system"; label: string; evidenceLinkIds: string[] };
export type OneHealthSystemEdge = { id: string; fromNodeId: string; toNodeId: string; relationshipType: string; direction: "directed" | "bidirectional"; evidenceLinkIds: string[]; uncertainty: "low" | "medium" | "high"; impact: "positive" | "negative" | "mixed" | "unknown"; studentExplanation: string };
export type OneHealthSystemMap = { id: string; projectId: string; nodes: OneHealthSystemNode[]; edges: OneHealthSystemEdge[]; version: number; createdAt: Date };
export type InquiryRecommendation = { id: string; projectId: string; recommendation: string; targetActor: "student" | "teacher" | "shelter" | "school" | "community" | "local_government"; supportingEvidence: string[]; feasibility: string; expectedBenefit: string; possibleRisk: string; requiredResources: string; evaluationIndicator: string; studentScope: string; status: "proposed" | "teacher_approved" | "teacher_revision" | "shelter_confirmed" | "shelter_revision" | "rejected"; evidenceStrength: "limited" | "moderate" | "strong"; createdAt: Date };
export type InquiryReview = { id: string; projectId: string; reviewerId: string; reviewerRole: "teacher" | "shelter_staff" | "admin"; stage: "question" | "design" | "dataset" | "analysis" | "cer" | "recommendation" | "final"; decision: "approve" | "request_revision" | "reject" | "confirm"; reason?: string; rubric: Record<string, number>; projectRevision: number; createdAt: Date };
export type InquiryCompetencyEvidence = { id: string; projectId: string; competency: "scientific_observation" | "research_question_formation" | "research_design" | "data_collection" | "data_cleaning" | "data_interpretation" | "evidence_based_reasoning" | "one_health_understanding" | "scientific_communication" | "ethical_reasoning"; evidenceEntityIds: string[]; teacherScore?: number; teacherFeedback?: string; version: number; syntheticDemo: boolean; createdAt: Date };

export type InquiryState = { projects: Map<string, InquiryProject>; evidenceLinks: InquiryEvidenceLink[]; designs: ResearchDesign[]; datasets: InquiryDataset[]; analyses: AnalysisResult[]; cerStatements: CERStatement[]; systemMaps: OneHealthSystemMap[]; recommendations: InquiryRecommendation[]; reviews: InquiryReview[]; competencyEvidence: InquiryCompetencyEvidence[]; auditEvents: AuditEvent[] };
