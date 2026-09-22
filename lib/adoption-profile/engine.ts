import type { AuditEvent } from "../research-license/engine";
import type {
  AdoptionEvidenceCard,
  AdoptionProfile,
  AdoptionProfileActor,
  AdoptionProfileSection,
  AdoptionProfileState,
  AdoptionProfileStatement,
  AdoptionTimelineEvent,
  CompletenessDimension,
  CompletenessDimensionResult,
  DogPublicFacts,
  EvidenceCompletenessScore,
  ProfileGap,
  ProfileGapAssessment,
  PublishedAdoptionEvidence
} from "./types";
import { adoptionTimelineTypes, completenessDimensions, profileSections } from "./types";

const round = (value: number) => Math.round(value * 100) / 100;
const percent = (numerator: number, denominator: number) => denominator === 0 ? 0 : round(Math.min(100, numerator / denominator * 100));
const unique = <T>(values: T[]) => [...new Set(values)];
const publicFactLabels: Record<string, string> = { female: "母", male: "公", unknown: "尚無資料（UNKNOWN）", puppy: "幼犬", young: "青年犬", adult: "成犬", senior: "高齡犬", available: "開放認養", pending: "待確認", adopted: "已認養", unavailable: "暫不開放認養" };
const factLabel = (value: string) => publicFactLabels[value] ?? value;

function audit(actor: AdoptionProfileActor, entityType: string, entityId: string, action: string, now: Date, extra: Partial<AuditEvent> = {}): AuditEvent {
  return { actorId: actor.id, actorRole: actor.role, entityType, entityId, action, timestamp: now, ...extra };
}

function evidenceStatement(
  id: string,
  section: AdoptionProfileSection,
  text: string,
  evidence: PublishedAdoptionEvidence[]
): AdoptionProfileStatement {
  if (evidence.length === 0) throw new Error("Every public profile statement requires published evidence.");
  if (evidence.some((item) => item.status !== "published" || !item.shelterApproved)) throw new Error("Profile statements require shelter-approved published evidence.");
  return {
    id,
    section,
    text,
    evidenceIds: evidence.map((item) => item.id),
    timelineEntryIds: unique(evidence.map((item) => item.timelineEntryId)),
    reviewerIds: unique(evidence.map((item) => item.reviewerId)),
    confidence: evidence.some((item) => item.confidence === "low") ? "low" : evidence.some((item) => item.confidence === "medium") ? "medium" : evidence.every((item) => item.confidence === "not_applicable") ? "not_applicable" : "high",
    verificationStates: unique(evidence.map((item) => item.verificationState))
  };
}

function evidenceCards(evidence: PublishedAdoptionEvidence[]): AdoptionEvidenceCard[] {
  return evidence.filter((item) => item.evidenceType === "observation").map((item, index) => ({
    id: `card_public_observation_${index + 1}_${item.dogId}`,
    observation: item.observation?.observedValue ?? "尚無資料（UNKNOWN）",
    date: item.publishedAt,
    evidenceSource: `${item.sourceEntityType}:public-record-${index + 1}`,
    sourceVersion: item.sourceVersion,
    reviewer: item.reviewerRole === "teacher" ? "teacher_reviewer" : item.reviewerRole === "admin" ? "admin_reviewer" : "shelter_reviewer",
    reviewerRole: item.reviewerRole,
    confidence: item.confidence,
    context: item.context,
    timelineEntryId: item.timelineEntryId,
    verification: item.verificationState,
    syntheticDemo: item.syntheticDemo
  }));
}

function gapAssessment(dogId: string, profileId: string, evidence: PublishedAdoptionEvidence[], now: Date): ProfileGapAssessment {
  const observations = evidence.filter((item) => item.evidenceType === "observation");
  const distinctObservationSources = new Set(observations.map((item) => item.sourceEntityId)).size;
  const make = (code: ProfileGap["code"], missing: boolean, label: string, reason: string, matched: PublishedAdoptionEvidence[]): ProfileGap => ({
    code,
    missing,
    label,
    reason,
    evidenceIds: matched.map((item) => item.id),
    action: "COLLECT_MORE_EVIDENCE"
  });
  const walking = observations.filter((item) => ["STAND", "PACE", "MOVE_AWAY", "APPROACH"].includes(item.observation?.behaviorCode ?? ""));
  const human = observations.filter((item) => ["LOOK_AT_HUMAN", "APPROACH"].includes(item.observation?.behaviorCode ?? "") || item.context.toLowerCase().includes("human"));
  const environment = observations.filter((item) => /hallway|visitor|noise|outdoor|weather|environment/.test(item.context.toLowerCase()));
  const photo = evidence.filter((item) => item.evidenceType === "media_photo");
  const video = evidence.filter((item) => item.evidenceType === "media_video");
  const confirmation = evidence.filter((item) => item.evidenceType === "shelter_confirmation" || item.evidenceType === "publication");
  const gaps = [
    make("walking_observation", walking.length === 0, "步行情境觀察", walking.length ? "已有發布的移動行為證據。" : "尚無發布的步行或移動行為觀察。", walking),
    make("human_interaction", human.length === 0, "與人互動", human.length ? "已有發布的朝向人類行為證據。" : "尚無發布的與人互動觀察。", human),
    make("environmental_observation", environment.length === 0, "環境情境觀察", environment.length ? "已有發布的環境情境證據。" : "尚無發布的環境反應觀察。", environment),
    make("video", video.length === 0, "影片證據", video.length ? "已有收容所核准並發布的影片紀錄。" : "尚無收容所核准並發布的影片紀錄。", video),
    make("photo", photo.length === 0, "照片證據", photo.length ? "已有收容所核准並發布的照片紀錄。" : "尚無收容所核准並發布的照片紀錄。", photo),
    make("repeated_observation", distinctObservationSources < 2, "重複觀察", distinctObservationSources >= 2 ? "已有至少兩個不同的發布觀察來源。" : "不同的發布觀察來源少於兩個。", observations),
    make("shelter_confirmation", confirmation.length === 0, "收容所確認", confirmation.length ? "已有收容所確認的發布證據。" : "尚缺收容所確認。", confirmation)
  ];
  return { id: `gap_${profileId}`, dogId, profileId, gaps, version: "SL-PROFILE-GAP-1", syntheticDemo: evidence.every((item) => item.syntheticDemo), calculatedAt: now };
}

function dimension(dimensionName: CompletenessDimension, numerator: number, denominator: number, formula: string, evidenceIds: string[], limitation: string): CompletenessDimensionResult {
  return { dimension: dimensionName, score: percent(numerator, denominator), formula, numerator, denominator, evidenceIds, limitation };
}

function completeness(facts: DogPublicFacts, profileId: string, evidence: PublishedAdoptionEvidence[], timeline: AdoptionTimelineEvent[], gaps: ProfileGapAssessment, now: Date): EvidenceCompletenessScore {
  const factEvidence = evidence.filter((item) => item.evidenceType === "shelter_intake");
  const observations = evidence.filter((item) => item.evidenceType === "observation");
  const health = evidence.filter((item) => item.evidenceType === "health_check");
  const media = evidence.filter((item) => item.evidenceType === "media_photo" || item.evidenceType === "media_video");
  const confirmation = evidence.filter((item) => item.evidenceType === "shelter_confirmation" || item.evidenceType === "publication");
  const basicValues = [facts.publicName, facts.sex, facts.ageBand, facts.adoptionStatus].filter((value) => value && value !== "unknown").length;
  const healthFields = unique(health.flatMap((item) => Object.keys(item.facts ?? {}))).filter((key) => ["health_status", "vaccination_status", "special_care"].includes(key)).length;
  const behaviorGroups = unique(observations.map((item) => {
    const code = item.observation?.behaviorCode ?? "UNKNOWN";
    if (["LOOK_AT_HUMAN", "APPROACH", "LOOK_AWAY"].includes(code)) return "interaction";
    if (["STAND", "SIT", "LIE", "PACE", "MOVE_AWAY"].includes(code)) return "activity";
    if (["BARK", "WHINE"].includes(code)) return "vocalization";
    if (["YAWN", "LIP_LICK", "EARS_BACK", "TAIL_TUCK"].includes(code)) return "body_signal";
    return "other";
  })).length;
  const currentTimelineEvidence = unique(timeline.filter((item) => item.state === "evidence" && adoptionTimelineTypes.slice(0, 7).includes(item.eventType)).map((item) => item.eventType)).length;
  const adoptionFields = [facts.adoptionStatus !== "unknown", factEvidence.some((item) => Boolean(item.facts?.contact_process))].filter(Boolean).length;
  const dimensions = [
    dimension("basic_information", basicValues, 4, "已知公開基本欄位 / 4 * 100", factEvidence.map((item) => item.id), "公開基本資訊分數刻意排除區域與風險紀錄。"),
    dimension("health_metadata", healthFields, 3, "已發布健康中繼資料欄位 / 3 * 100", health.map((item) => item.id), "完整度不是健康評估或診斷。"),
    dimension("observation_coverage", Math.min(observations.length, 3), 3, "已發布觀察卡片，上限 3 筆 / 3 * 100", observations.map((item) => item.id), "紀錄數量不能證明個性或是否適合認養。"),
    dimension("observation_diversity", Math.min(behaviorGroups, 5), 5, "不同可觀察行為群組，上限 5 組 / 5 * 100", observations.map((item) => item.id), "行為群組只描述證據涵蓋範圍，不代表個性。"),
    dimension("timeline_coverage", currentTimelineEvidence, 7, "目前必要時間軸事件類型 / 7 * 100", timeline.flatMap((item) => item.evidenceIds), "缺少的事件維持尚無紀錄，未來占位項目不計分。"),
    dimension("shelter_confirmation", confirmation.length ? 1 : 0, 1, "具收容所確認的發布紀錄 / 1 * 100", confirmation.map((item) => item.id), "確認只代表證據可使用，不等於推薦認養。"),
    dimension("media_completeness", unique(media.map((item) => item.evidenceType)).length, 2, "已發布照片／影片類型 / 2 * 100", media.map((item) => item.id), "目前只記錄媒體中繼資料，不推論二進位內容。"),
    dimension("adoption_information", adoptionFields, 2, "已知認養狀態與聯絡流程 / 2 * 100", factEvidence.map((item) => item.id), "此分數不預測認養結果。"),
    dimension("unknown_disclosure", gaps.gaps.every((item) => item.reason.trim().length > 0) ? 1 : 0, 1, "明確揭露證據缺口 / 1 * 100", evidence.map((item) => item.id), "揭露鼓勵誠實呈現，不代表證據量較多。")
  ];
  if (dimensions.map((item) => item.dimension).join("|") !== completenessDimensions.join("|")) throw new Error("Completeness dimension contract mismatch.");
  return {
    id: `score_${profileId}`,
    dogId: facts.dogId,
    profileId,
    total: round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length),
    dimensions,
    formula: "arithmetic_mean_of_nine_dimensions",
    version: "SL-ADOPTION-COMPLETE-1",
    syntheticDemo: evidence.every((item) => item.syntheticDemo),
    calculatedAt: now
  };
}

function timelineFor(dogId: string, profileId: string, evidence: PublishedAdoptionEvidence[], now: Date): AdoptionTimelineEvent[] {
  const currentTypes = adoptionTimelineTypes.slice(0, 7);
  const futureTypes = adoptionTimelineTypes.slice(7);
  const current = currentTypes.map((eventType) => {
    const matched = eventType === "profile_update" ? [] : evidence.filter((item) => item.evidenceType === eventType);
    if (eventType === "profile_update") {
      return { id: `timeline_profile_update_${profileId}`, dogId, eventType, eventDate: now, state: "evidence" as const, label: "以證據支持的認養資訊檔案已發布", evidenceIds: evidence.map((item) => item.id), sourceVersions: [profileId], reviewerRoles: ["shelter_staff"], verificationStates: unique(evidence.map((item) => item.verificationState)), syntheticDemo: evidence.every((item) => item.syntheticDemo) };
    }
    return { id: `timeline_${eventType}_${dogId}`, dogId, eventType, eventDate: matched.length ? new Date(Math.min(...matched.map((item) => item.publishedAt.getTime()))) : undefined, state: matched.length ? "evidence" as const : "not_recorded" as const, label: matched.length ? eventType : `${eventType}：尚無紀錄`, evidenceIds: matched.map((item) => item.id), sourceVersions: unique(matched.map((item) => item.sourceVersion)), reviewerRoles: unique(matched.map((item) => item.reviewerRole)), verificationStates: unique(matched.map((item) => item.verificationState)), syntheticDemo: evidence.every((item) => item.syntheticDemo) };
  });
  const future = futureTypes.map((eventType) => ({ id: `timeline_future_${eventType}_${dogId}`, dogId, eventType, state: "future_placeholder" as const, label: `${eventType}：未來規劃`, evidenceIds: [], sourceVersions: [], reviewerRoles: [], verificationStates: ["SYNTHETIC_DEMO"], syntheticDemo: true }));
  return [...current, ...future];
}

export class AdoptionProfileService {
  state: AdoptionProfileState;

  constructor(initial?: Partial<AdoptionProfileState>) {
    this.state = {
      facts: initial?.facts ?? new Map(),
      evidence: initial?.evidence ?? [],
      profiles: initial?.profiles ?? [],
      evidenceCards: initial?.evidenceCards ?? [],
      completenessScores: initial?.completenessScores ?? [],
      gapAssessments: initial?.gapAssessments ?? [],
      timeline: initial?.timeline ?? [],
      auditEvents: initial?.auditEvents ?? []
    };
  }

  publishProfile(actor: AdoptionProfileActor, dogId: string, now: Date) {
    const facts = this.state.facts.get(dogId);
    if (!facts) throw new Error("Dog public facts not found.");
    if (actor.role !== "shelter_staff" && actor.role !== "admin") throw new Error("Shelter approval is required to publish an adoption profile.");
    if (actor.role !== "admin" && !actor.authorizedShelterIds?.includes(facts.shelterId)) throw new Error("Shelter scope is not authorized.");
    const evidence = this.state.evidence.filter((item) => item.dogId === dogId && item.status === "published" && item.shelterApproved);
    if (evidence.length === 0) throw new Error("Adoption profile requires shelter-approved published evidence.");
    const version = this.state.profiles.filter((item) => item.dogId === dogId).length + 1;
    const profileId = `adoption_profile_${dogId}_v${version}`;
    const sections = {} as Record<AdoptionProfileSection, AdoptionProfileStatement[]>;
    for (const section of profileSections) sections[section] = [];
    const intake = evidence.filter((item) => item.evidenceType === "shelter_intake");
    if (intake.length === 0) throw new Error("Published shelter intake evidence is required for public basic information.");
    const observations = evidence.filter((item) => item.evidenceType === "observation");
    const coverageEvidence = observations.length ? observations : evidence;
    sections.basic_information.push(evidenceStatement(`${profileId}_basic`, "basic_information", `${facts.publicName}：性別 ${factLabel(facts.sex)}、年齡層 ${factLabel(facts.ageBand)}、認養狀態 ${factLabel(facts.adoptionStatus)}。`, intake));
    for (const [index, item] of observations.entries()) sections.observed_behaviors.push(evidenceStatement(`${profileId}_behavior_${index + 1}`, "observed_behaviors", `${item.observation?.observedValue ?? "尚無資料（UNKNOWN）"} 情境：${item.context}。`, [item]));
    sections.observed_contexts.push(evidenceStatement(`${profileId}_contexts`, "observed_contexts", `觀察情境：${unique(observations.map((item) => item.context)).join("；") || "尚無資料（UNKNOWN）"}。`, coverageEvidence));
    const activity = observations.filter((item) => ["STAND", "SIT", "LIE", "PACE", "MOVE_AWAY", "APPROACH"].includes(item.observation?.behaviorCode ?? ""));
    sections.activity.push(evidenceStatement(`${profileId}_activity`, "activity", activity.length ? `已發布的活動觀察包含 ${unique(activity.map((item) => item.observation?.behaviorCode ?? "UNKNOWN")).join("、")}。` : "已發布證據以外的活動狀況尚無資料（UNKNOWN）。", activity.length ? activity : coverageEvidence));
    const human = observations.filter((item) => ["LOOK_AT_HUMAN", "APPROACH", "LOOK_AWAY"].includes(item.observation?.behaviorCode ?? ""));
    sections.human_interaction.push(evidenceStatement(`${profileId}_human`, "human_interaction", human.length ? `已記錄情境中的朝向人類行為包含 ${unique(human.map((item) => item.observation?.behaviorCode ?? "UNKNOWN")).join("、")}。` : "已發布證據以外的與人互動狀況尚無資料（UNKNOWN）。", human.length ? human : coverageEvidence));
    const environmental = observations.filter((item) => /hallway|visitor|noise|outdoor|weather|environment/.test(item.context.toLowerCase()));
    sections.environmental_responses.push(evidenceStatement(`${profileId}_environment`, "environmental_responses", environmental.length ? `以下情境已有環境反應證據：${unique(environmental.map((item) => item.context)).join("；")}。` : "已發布證據以外的環境反應尚無資料（UNKNOWN）。", environmental.length ? environmental : coverageEvidence));
    sections.known_information.push(evidenceStatement(`${profileId}_known`, "known_information", `收容所已知資訊：公開名稱 ${facts.publicName}；年齡層 ${factLabel(facts.ageBand)}；認養狀態 ${factLabel(facts.adoptionStatus)}。`, intake));
    sections.unknown_information.push(evidenceStatement(`${profileId}_unknown`, "unknown_information", "尚無資料（UNKNOWN）：目前已發布證據無法建立健康資料、居家行為與相容性資訊。", evidence));
    sections.not_yet_tested.push(evidenceStatement(`${profileId}_not_tested`, "not_yet_tested", "尚未觀察：步行、居家環境、兒童、貓與場外情境；除非未來另有發布證據支持。", evidence));
    const latestEvidenceAt = new Date(Math.max(...evidence.map((item) => item.publishedAt.getTime())));
    const timeline = timelineFor(dogId, profileId, evidence, now);
    const gaps = gapAssessment(dogId, profileId, evidence, now);
    const score = completeness(facts, profileId, evidence, timeline, gaps, now);
    sections.evidence_coverage.push(evidenceStatement(`${profileId}_coverage`, "evidence_coverage", `依透明公式 ${score.version} 計算，證據完整度為 ${score.total}%；此分數只衡量涵蓋範圍。`, evidence));
    const latestEvidence = evidence.filter((item) => item.publishedAt.getTime() === latestEvidenceAt.getTime());
    sections.latest_evidence.push(evidenceStatement(`${profileId}_latest`, "latest_evidence", `最新發布證據時間：${latestEvidenceAt.toISOString()}。`, latestEvidence));
    sections.profile_version.push(evidenceStatement(`${profileId}_version`, "profile_version", `這是由收容所核准的第 ${version} 版檔案。`, evidence));
    const cards = evidenceCards(evidence);
    const profile: AdoptionProfile = { id: profileId, dogId, shelterId: facts.shelterId, version, status: "published", sections, evidenceCardIds: cards.map((item) => item.id), unknownInformation: ["health metadata", "home behavior", "compatibility"], notYetTested: ["walking", "home environment", "children", "cats", "off-site settings"], latestEvidenceAt, approvedById: actor.id, approvedAt: now, publishedAt: now, generationMethod: "deterministic_evidence_projection", aiGenerated: false, syntheticDemo: evidence.every((item) => item.syntheticDemo) };
    this.state.profiles.push(profile);
    this.state.evidenceCards.push(...cards);
    this.state.timeline.push(...timeline);
    this.state.gapAssessments.push(gaps);
    this.state.completenessScores.push(score);
    const auditEvents = [
      audit(actor, "adoption_profile", profile.id, "adoption_profile_published", now, { newState: { dogId, version, evidenceIds: evidence.map((item) => item.id), aiGenerated: false } }),
      audit(actor, "evidence_completeness_score", score.id, "evidence_completeness_calculated", now, { newState: { total: score.total, version: score.version } }),
      audit(actor, "profile_gap_assessment", gaps.id, "profile_gaps_assessed", now, { newState: { missing: gaps.gaps.filter((item) => item.missing).map((item) => item.code) } })
    ];
    this.state.auditEvents.push(...auditEvents);
    return { profile, score, gaps, timeline, evidenceCards: cards, auditEvents };
  }

  getPublicProfile(dogId: string) { return [...this.state.profiles].reverse().find((item) => item.dogId === dogId && item.status === "published"); }
  getCompleteness(dogId: string) { return [...this.state.completenessScores].reverse().find((item) => item.dogId === dogId); }
  getGaps(dogId: string) { return [...this.state.gapAssessments].reverse().find((item) => item.dogId === dogId); }
  getEvidenceCards(dogId: string) { const profile = this.getPublicProfile(dogId); return profile ? this.state.evidenceCards.filter((item) => profile.evidenceCardIds.includes(item.id)) : []; }
  getTimeline(dogId: string) { return this.state.timeline.filter((item) => item.dogId === dogId); }
  getReadinessDashboard() {
    return [...this.state.facts.values()].map((facts) => {
      const profile = this.getPublicProfile(facts.dogId); const score = this.getCompleteness(facts.dogId); const gaps = this.getGaps(facts.dogId);
      const dimension = (name: CompletenessDimension) => score?.dimensions.find((item) => item.dimension === name)?.score ?? 0;
      return { dogId: facts.dogId, publicName: facts.publicName, evidenceCompleteness: score?.total ?? 0, profileCompleteness: profile ? percent(profileSections.filter((section) => profile.sections[section].length > 0).length, profileSections.length) : 0, timelineCompleteness: dimension("timeline_coverage"), mediaCompleteness: dimension("media_completeness"), unknownCoverage: dimension("unknown_disclosure"), needsUpdate: !profile || Boolean(gaps?.gaps.some((item) => item.missing)), missingGapCount: gaps?.gaps.filter((item) => item.missing).length ?? 7, syntheticDemo: profile?.syntheticDemo ?? true };
    });
  }
}
