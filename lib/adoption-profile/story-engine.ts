import type {
  AdoptionProfile,
  AdoptionProfileSection,
  AdoptionProfileState,
  DogPublicFacts,
  ProfileGapCode,
  PublishedAdoptionEvidence
} from "./types";
import { evidenceStoryStages, type EvidenceStoryTrace, type EvidenceStoryView, type UnknownExplanation } from "./story-types";

const gapRequirements: Record<ProfileGapCode, string> = {
  walking_observation: "一筆經收容所核准並發布的步行或移動行為觀察。",
  human_interaction: "一筆在明確與人互動情境中，經收容所核准並發布的觀察。",
  environmental_observation: "一筆包含環境情境、經收容所核准並發布的觀察。",
  video: "一筆經收容所核准並發布的影片證據紀錄。",
  photo: "一筆經收容所核准並發布的照片證據紀錄。",
  repeated_observation: "至少兩個不同、經收容所核准並發布的觀察來源。",
  shelter_confirmation: "收容所確認與人工發布紀錄。"
};

const unknownPolicies: Record<string, { why: string; category: string; missing: string }> = {
  "health metadata": {
    why: "目前沒有經收容所核准並發布的健康資料可建立此項資訊。",
    category: "health_check",
    missing: "一筆涵蓋此欄位、經收容所核准並發布的健康檢查資料。"
  },
  "home behavior": {
    why: "目前發布的證據不是在居家環境中蒐集。",
    category: "home_environment_observation",
    missing: "依核准居家環境規範取得、通過審核並由收容所核准的觀察。"
  },
  compatibility: {
    why: "目前發布的證據無法建立與人、動物或家庭的相容性。",
    category: "compatibility_context_observation",
    missing: "在特別核准的相容性情境中取得，並通過審核與收容所核准的證據。"
  },
  "public name": {
    why: "目前沒有收容所核准的公開名稱。",
    category: "shelter_intake_public_name",
    missing: "已發布入所證據中的收容所核准公開名稱欄位。"
  },
  sex: {
    why: "目前沒有收容所核准的公開性別欄位。",
    category: "shelter_intake_sex",
    missing: "已發布入所證據中的收容所核准性別欄位。"
  },
  "age band": {
    why: "目前沒有收容所核准的公開年齡層欄位。",
    category: "shelter_intake_age_band",
    missing: "已發布入所證據中的收容所核准年齡層欄位。"
  },
  "adoption status": {
    why: "目前沒有收容所核准的公開認養狀態。",
    category: "shelter_intake_adoption_status",
    missing: "目前已發布收容所證據中的核准認養狀態欄位。"
  }
};

const normalize = (value: string) => value.trim().toLowerCase().replaceAll("_", " ");
const slug = (value: string) => normalize(value).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function reviewerReference(role: PublishedAdoptionEvidence["reviewerRole"]) {
  return role === "teacher" ? "teacher_reviewer" : role === "admin" ? "admin_reviewer" : "shelter_reviewer";
}

function unknownExplanation(field: string, statementIds: string[]): UnknownExplanation {
  const key = normalize(field);
  const policy = unknownPolicies[key] ?? {
    why: `經收容所核准並發布的證據尚未建立「${field}」資訊。`,
    category: `${slug(field)}_evidence`,
    missing: `一筆可直接建立「${field}」資訊，並經收容所核准發布的證據紀錄。`
  };
  return {
    id: `unknown_${slug(field)}`,
    field,
    value: "UNKNOWN",
    whyUnknown: policy.why,
    missingEvidence: [{ category: policy.category, description: policy.missing }],
    statementIds
  };
}

function buildUnknowns(profile: AdoptionProfile, facts: DogPublicFacts) {
  const unknownStatementIds = profile.sections.unknown_information.map((item) => item.id);
  const result = profile.unknownInformation.map((field) => unknownExplanation(field, unknownStatementIds));
  const basicStatementIds = profile.sections.basic_information.map((item) => item.id);
  const factUnknowns: Array<[string, string]> = [
    ["public name", facts.publicName],
    ["sex", facts.sex],
    ["age band", facts.ageBand],
    ["adoption status", facts.adoptionStatus]
  ];
  for (const [field, value] of factUnknowns) {
    if (normalize(value) === "unknown" && !result.some((item) => normalize(item.field) === field)) {
      result.push(unknownExplanation(field, basicStatementIds));
    }
  }
  for (const statement of Object.values(profile.sections).flat()) {
    if (!statement.text.includes("UNKNOWN") || result.some((item) => item.statementIds.includes(statement.id))) continue;
    result.push(unknownExplanation(statement.section.replaceAll("_", " "), [statement.id]));
  }
  return result;
}

export function buildEvidenceStory(state: AdoptionProfileState, dogId: string): EvidenceStoryView {
  const profile = [...state.profiles].reverse().find((item) => item.dogId === dogId && item.status === "published");
  const facts = state.facts.get(dogId);
  const gapAssessment = [...state.gapAssessments].reverse().find((item) => item.dogId === dogId && item.profileId === profile?.id);
  if (!profile || !facts || !gapAssessment) throw new Error("Published evidence story is unavailable.");

  const publishedEvidence = state.evidence.filter((item) => item.dogId === dogId && item.status === "published" && item.shelterApproved);
  const evidenceById = new Map(publishedEvidence.map((item) => [item.id, item]));
  const timelineById = new Map(state.timeline.filter((item) => item.dogId === dogId).map((item) => [item.id, item]));
  const publicReferences = new Map(publishedEvidence.map((item, index) => [item.id, `PE-${String(index + 1).padStart(3, "0")}`]));
  const statements = Object.values(profile.sections).flat().map((statement) => {
    if (statement.evidenceIds.length === 0) throw new Error(`Statement ${statement.id} has no published evidence.`);
    const traces = statement.evidenceIds.map((evidenceId, index): EvidenceStoryTrace => {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence) throw new Error(`Statement ${statement.id} references unavailable evidence.`);
      const timeline = timelineById.get(evidence.timelineEntryId);
      if (!timeline || timeline.state !== "evidence" || !timeline.evidenceIds.includes(evidence.id)) {
        throw new Error(`Evidence ${evidence.id} is not linked to a published timeline event.`);
      }
      if (!statement.timelineEntryIds.includes(timeline.id) || !statement.reviewerIds.includes(evidence.reviewerId)) {
        throw new Error(`Statement ${statement.id} trace metadata is incomplete.`);
      }
      const reference = publicReferences.get(evidence.id)!;
      return {
        id: `trace_${statement.id}_${index + 1}`,
        stageOrder: evidenceStoryStages,
        evidence: {
          reference,
          evidenceType: evidence.evidenceType,
          sourceType: evidence.sourceEntityType,
          sourceVersion: `public-profile-v${profile.version}-${reference.toLowerCase()}`,
          context: evidence.context,
          confidence: evidence.confidence,
          verification: evidence.verificationState
        },
        observation: evidence.observation ? {
          status: "recorded",
          value: evidence.observation.observedValue,
          behaviorCode: evidence.observation.behaviorCode,
          durationSec: evidence.observation.durationSec
        } : {
          status: "not_applicable",
          value: "NOT_APPLICABLE",
          explanation: `${evidence.evidenceType} 是已發布證據，不是觀察事件。`
        },
        timeline: {
          id: timeline.id,
          eventType: timeline.eventType,
          label: timeline.label,
          state: "evidence",
          eventDate: timeline.eventDate
        },
        reviewer: {
          role: evidence.reviewerRole,
          publicReference: reviewerReference(evidence.reviewerRole)
        },
        publication: {
          status: "published",
          evidencePublishedAt: evidence.publishedAt,
          profilePublishedAt: profile.publishedAt,
          profileVersion: profile.version,
          shelterApproved: true,
          authority: "shelter_authority",
          verification: evidence.verificationState
        }
      };
    });
    return { statementId: statement.id, section: statement.section as AdoptionProfileSection, statement: statement.text, traces };
  });

  return {
    version: "SL-EVIDENCE-STORY-1",
    dogId,
    publicName: facts.publicName,
    profileId: profile.id,
    profileVersion: profile.version,
    profilePublishedAt: profile.publishedAt,
    statements,
    unknowns: buildUnknowns(profile, facts),
    gaps: gapAssessment.gaps.filter((item) => item.missing).map((item) => ({
      code: item.code,
      category: item.label,
      whyMissing: item.reason,
      requiredEvidence: gapRequirements[item.code],
      currentEvidenceCount: item.evidenceIds.length,
      action: "COLLECT_MORE_EVIDENCE"
    })),
    readOnly: true,
    deterministic: true,
    aiGenerated: false,
    syntheticDemo: profile.syntheticDemo
  };
}
