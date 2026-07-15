import {
  COMPETITION_DEMO_DURATION_SEC,
  type CompetitionExperienceState,
  type CompetitionExperienceStep,
  type CompetitionExperienceStepId
} from "./types";

export const competitionExperienceSteps = [
  {
    id: "overview",
    sequence: 1,
    title: "ShelterLab 總覽",
    shortTitle: "總覽",
    narration: "ShelterLab 是把政府開放資料、Research License、非接觸觀察、人工審核與犬隻公開證據串成一條可追溯流程的教育服務平台。",
    evidence: "本頁使用合成示範資料，呈現已實作模組如何形成完整證據鏈；不宣稱真實學生、犬隻或認養成效。",
    evidenceMode: "DEMO",
    deepLink: "/competition/judge/overview",
    targetHref: "/competition/evidence",
    allocatedSec: 45
  },
  {
    id: "research-license",
    sequence: 2,
    title: "研究觀察資格",
    shortTitle: "觀察資格",
    narration: "學生先完成課程與測驗，達到門檻後才可進入收容所非接觸觀察。題目、來源、課程標籤與版本都保留快照。",
    evidence: "Research License 維持 80 分通過門檻與模組規則，未通過項目會產生 deterministic 補救建議。",
    evidenceMode: "SYNTHETIC_DEMO",
    deepLink: "/competition/judge/research-license",
    targetHref: "/research-license",
    allocatedSec: 60
  },
  {
    id: "observation",
    sequence: 3,
    title: "300 秒非接觸觀察",
    shortTitle: "觀察",
    narration: "取得資格的學生只能在核准區域進行最長 300 秒的結構化觀察，行為事件必須符合時間與字典規則。",
    evidence: "deterministic validation 只回傳資料品質提示，不改寫學生原始紀錄，也不能核准或發布。",
    evidenceMode: "SYNTHETIC_DEMO",
    deepLink: "/competition/judge/observation",
    targetHref: "/living-lab",
    allocatedSec: 75
  },
  {
    id: "evidence-timeline",
    sequence: 4,
    title: "證據時間軸",
    shortTitle: "時間軸",
    narration: "教師審核、收容所確認與人工發布分屬不同權限。每次發布都連回不可覆寫的版本與審核紀錄。",
    evidence: "公開時間軸排除學生身分、私人區域、事件敏感資訊與未確認證據。",
    evidenceMode: "SYNTHETIC_DEMO",
    deepLink: "/competition/judge/evidence-timeline",
    targetHref: "/adoption-profile/DOG-TPE-001/timeline",
    allocatedSec: 60
  },
  {
    id: "dog-profile",
    sequence: 5,
    title: "犬隻證據檔案",
    shortTitle: "犬隻檔案",
    narration: "每個公開描述都可以展開為 Evidence → Observation → Timeline → Reviewer → Publication。未知資訊保持 UNKNOWN。",
    evidence: "此檔案不產生認養機率、性格判斷、診斷或相容性推薦，只呈現 shelter-approved evidence。",
    evidenceMode: "SYNTHETIC_DEMO",
    deepLink: "/competition/judge/dog-profile",
    targetHref: "/adoption-profile/DOG-TPE-001",
    allocatedSec: 60
  },
  {
    id: "one-health-inquiry",
    sequence: 6,
    title: "One Health 探究",
    shortTitle: "One Health",
    narration: "學生把政府資料與已核准的收容所證據連回人、動物與環境三個面向，形成可審核的探究報告。",
    evidence: "探究分析是固定 deterministic 流程；報告清楚標示資料來源、限制與合成示範狀態。",
    evidenceMode: "SYNTHETIC_DEMO",
    deepLink: "/competition/judge/one-health-inquiry",
    targetHref: "/inquiries/demo",
    allocatedSec: 60
  },
  {
    id: "impact-dashboard",
    sequence: 7,
    title: "影響力儀表板",
    shortTitle: "影響力",
    narration: "教育、Living Lab、收容所、政府資料與 One Health 指標都公開公式、分子、分母、信心水準與 provenance。",
    evidence: "所有競賽展示指標都標示 VERIFIED、DEMO、SYNTHETIC 或 UNVERIFIED，不使用 AI 生成指標。",
    evidenceMode: "DEMO",
    deepLink: "/competition/judge/impact-dashboard",
    targetHref: "/competition/impact",
    allocatedSec: 60
  }
] as const satisfies readonly CompetitionExperienceStep[];

export function isCompetitionStepId(value: string): value is CompetitionExperienceStepId {
  return competitionExperienceSteps.some((step) => step.id === value);
}

export function getCompetitionStep(id: CompetitionExperienceStepId) {
  return competitionExperienceSteps.find((step) => step.id === id)!;
}

export function createCompetitionExperienceState(
  currentStepId: CompetitionExperienceStepId = "overview"
): CompetitionExperienceState {
  return {
    version: "SL-COMPETITION-EXPERIENCE-1",
    fixtureId: "shelterlab-synthetic-demo-v1",
    syntheticDemo: true,
    readOnly: true,
    productionMutationCount: 0,
    currentStepId,
    completedStepIds: [],
    elapsedSec: 0,
    timerStatus: "idle"
  };
}

export function resetCompetitionExperienceState(): CompetitionExperienceState {
  return createCompetitionExperienceState();
}

export function selectCompetitionStep(
  state: CompetitionExperienceState,
  stepId: CompetitionExperienceStepId
): CompetitionExperienceState {
  return { ...state, currentStepId: stepId };
}

export function beginGuidedCompetitionExperience(state: CompetitionExperienceState): CompetitionExperienceState {
  return {
    ...state,
    currentStepId: "research-license",
    completedStepIds: ["overview"],
    timerStatus: state.elapsedSec >= COMPETITION_DEMO_DURATION_SEC ? "complete" : "running"
  };
}

export function advanceCompetitionExperience(state: CompetitionExperienceState): CompetitionExperienceState {
  const currentIndex = competitionExperienceSteps.findIndex((step) => step.id === state.currentStepId);
  const currentId = competitionExperienceSteps[currentIndex].id;
  const completedStepIds = Array.from(new Set([...state.completedStepIds, currentId]));
  const next = competitionExperienceSteps[currentIndex + 1];
  return next ? { ...state, completedStepIds, currentStepId: next.id } : { ...state, completedStepIds };
}

export function setCompetitionTimerStatus(
  state: CompetitionExperienceState,
  timerStatus: "running" | "paused" | "idle"
): CompetitionExperienceState {
  if (state.elapsedSec >= COMPETITION_DEMO_DURATION_SEC) return { ...state, timerStatus: "complete" };
  return { ...state, timerStatus };
}

export function tickCompetitionTimer(state: CompetitionExperienceState, seconds = 1): CompetitionExperienceState {
  if (state.timerStatus !== "running" || seconds <= 0) return state;
  const elapsedSec = Math.min(COMPETITION_DEMO_DURATION_SEC, state.elapsedSec + seconds);
  return {
    ...state,
    elapsedSec,
    timerStatus: elapsedSec === COMPETITION_DEMO_DURATION_SEC ? "complete" : "running"
  };
}

export function getCompetitionExperienceManifest() {
  return {
    id: "sprint11a-competition-experience-v1",
    version: "SL-COMPETITION-EXPERIENCE-1",
    readOnly: true,
    syntheticDemo: true,
    productionMutationCount: 0,
    durationSec: COMPETITION_DEMO_DURATION_SEC,
    state: createCompetitionExperienceState(),
    steps: competitionExperienceSteps
  } as const;
}
