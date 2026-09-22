export const PUBLIC_LOCALE = "zh-TW";
export const PUBLIC_TIME_ZONE = "Asia/Taipei";

const publicLabels: Record<string, string> = {
  VERIFIED: "已驗證（VERIFIED）",
  VERIFIED_FIXTURE: "已驗證資料快照（VERIFIED_FIXTURE）",
  DEMO: "示範（DEMO）",
  SYNTHETIC: "合成示範資料（SYNTHETIC_DEMO）",
  SYNTHETIC_DEMO: "合成示範資料（SYNTHETIC_DEMO）",
  UNVERIFIED: "尚未驗證（UNVERIFIED）",
  UNKNOWN: "尚無資料（UNKNOWN）",
  READ_ONLY: "唯讀",
  COMPLETE: "完整",
  INCOMPLETE: "不完整",
  ACTIVE: "有效",
  AVAILABLE: "可使用",
  SUBMITTED: "已提交",
  APPROVED: "已核准",
  CONFIRMED: "已確認",
  PUBLISHED: "已發布",
  FINAL: "最終版",
  DEMO_REFERENCE: "示範參考（DEMO_REFERENCE）",
  METADATA_VERIFIED: "中繼資料已驗證（METADATA_VERIFIED）",
  SHELTER_CONFIRMED: "收容所已確認（SHELTER_CONFIRMED）",
  limited: "有限",
  positive: "正向",
  unknown: "未知",
  DISABLED: "停用",
  MISSING: "缺少證據",
  COVERED: "已有證據",
  COLLECT_MORE_EVIDENCE: "補充更多證據",
  INSUFFICIENT: "資料不足",
  DEMO_ONLY: "僅供示範",
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
  high: "高",
  medium: "中",
  low: "低",
  not_applicable: "不適用",
  NOT_APPLICABLE: "不適用",
  teacher: "教師",
  shelter_staff: "收容所人員",
  admin: "管理者",
  student: "學生",
  judge: "評審",
  shelter: "收容所",
  recorded: "已有紀錄",
  not_recorded: "尚無紀錄",
  future_placeholder: "未來規劃",
  evidence: "證據",
  published: "已發布"
};

const impactMetricLabels: Record<string, string> = {
  STUDENTS_ENROLLED: "學生參與數",
  LEARNING_COMPLETION_RATE: "學習完成率",
  AVERAGE_PRETEST: "平均前測",
  AVERAGE_POSTTEST: "平均後測",
  LEARNING_GAIN: "學習成長",
  RESEARCH_LICENSE_COMPLETION: "研究觀察資格完成率",
  OBSERVATION_MISSIONS: "觀察任務數",
  COMPLETED_MISSIONS: "完成任務數",
  OBSERVATION_EVENTS: "觀察事件數",
  APPROVED_EVIDENCE: "已核准證據",
  OBSERVATION_QUALITY: "觀察品質",
  DATA_QUALITY_IMPROVEMENT: "資料品質改善",
  DOGS_UPDATED: "犬隻檔案更新數",
  EVIDENCE_COMPLETENESS: "證據完整度",
  PROFILE_COMPLETENESS: "檔案完整度",
  SHELTER_PARTICIPATION: "收容所參與度",
  ADOPTION_SUPPORT_READINESS: "認養資訊支援準備度",
  TEACHER_ENGAGEMENT: "教師參與度",
  STUDENTS_ENGAGED: "參與學生",
  TEACHERS_ENGAGED: "參與教師",
  SHELTERS_ENGAGED: "參與收容所",
  COMMUNITY_PARTICIPATION: "社群參與",
  VERIFIED_DATASETS: "已驗證資料集",
  DATASET_USAGE: "資料集使用",
  DATASET_ATTRIBUTION: "資料來源標示",
  EVIDENCE_TRACEABILITY: "證據可追溯性",
  ONE_HEALTH_HUMAN: "One Health：人",
  ONE_HEALTH_ANIMAL: "One Health：動物",
  ONE_HEALTH_ENVIRONMENT: "One Health：環境",
  EVIDENCE_GENERATED: "產生的證據"
};

const impactDimensionLabels: Record<string, string> = {
  Innovation: "創新性",
  "Technical Quality": "技術品質",
  "Educational Value": "教育價值",
  "Open Data Utilization": "開放資料運用",
  "Social Impact": "社會影響",
  Sustainability: "永續性",
  Scalability: "可擴充性"
};

const impactCriterionCopy: Record<string, [string, string]> = {
  "INN-01": ["開放資料進入教育流程", "資料來源不只是展示圖表，而是進入課程、測驗與探究。"],
  "INN-02": ["收容所 Living Lab", "以非接觸觀察和人工審核形成安全的公民科學情境。"],
  "INN-03": ["可追溯影響力證據", "每個指標保留公式、分子、分母與 provenance。"],
  "TECH-01": ["明確的權限邊界", "教師、收容所與管理者的權責分離。"],
  "TECH-02": [" deterministic 驗證", "資料品質提示不改寫原始紀錄，也不做自動核准。"],
  "TECH-03": ["證據鏈資料模型", "公開資訊可連回證據、審核與發布紀錄。"],
  "EDU-01": ["Research License", "學生通過課程與測驗後才可進行觀察。"],
  "EDU-02": ["教師審核治理", "教師審查學生證據與探究成果。"],
  "EDU-03": ["學習證據可視化", "呈現能力、補救與學習成長。"],
  "DATA-01": ["政府資料來源治理", "資料集狀態、來源與使用限制清楚可見。"],
  "DATA-02": ["資料使用可追溯", "資料不只被引用，也能追溯到產品流程。"],
  "DATA-03": ["示範與真實分離", "合成資料不被包裝成真實成效。"],
  "SOC-01": ["支援犬隻公開資訊", "公開敘述需有收容所確認的證據。"],
  "SOC-02": ["降低收容所資料整理負擔", "用結構化證據協助後續整理。"],
  "SOC-03": ["避免不當推論", "未知資訊保留 UNKNOWN，不產生認養機率。"],
  "SUS-01": ["可維護的技術棧", "Next.js、TypeScript、Prisma 與測試流程適合學生團隊維護。"],
  "SUS-02": ["外部服務可替換", "AI 與政府資料介面保留 adapter 邊界。"],
  "SUS-03": ["治理優先於功能堆疊", "人類審核、隱私與證據完整性優先。"],
  "SCALE-01": ["跨校跨所擴充", "角色與資料邊界支援更多學校與收容所。"],
  "SCALE-02": ["示範模式可重置", "評審與夥伴能穩定重播完整流程。"],
  "SCALE-03": ["模組化延伸", "後續可加入 GIS、媒體治理與正式身份系統。"]
};

const sdgCopy: Record<string, [string, string, string]> = {
  "SDG 3": ["健康與福祉", "以 One Health 視角理解人、動物與環境關係。", "目前只呈現示範資料，不宣稱健康成效。"],
  "SDG 4": ["優質教育", "以真實情境與開放資料強化科學探究。", "仍需真實課堂驗證。"],
  "SDG 11": ["永續城市", "讓都市收容所議題進入資料素養與公民科學學習。", "目前不代表城市政策成效。"],
  "SDG 15": ["陸域生命", "以非接觸觀察建立對動物福利與棲地的理解。", "不做生態或福利因果宣稱。"],
  "SDG 17": ["夥伴關係", "連結學校、收容所與政府資料來源。", "正式合作仍待外部驗證。"]
};

const codeLabels: Record<string, string> = {
  basic_information: "基本資訊",
  observed_behaviors: "已觀察行為",
  observed_contexts: "觀察情境",
  activity: "活動狀態",
  human_interaction: "人犬互動",
  environmental_responses: "環境反應",
  known_information: "已知資訊",
  unknown_information: "未知資訊",
  not_yet_tested: "尚未觀察",
  evidence_coverage: "證據涵蓋度",
  latest_evidence: "最新證據",
  profile_version: "檔案版本",
  health_metadata: "健康中繼資料",
  observation_coverage: "觀察涵蓋",
  observation_diversity: "觀察多樣性",
  timeline_coverage: "時間軸涵蓋",
  shelter_confirmation: "收容所確認",
  media_completeness: "媒體完整度",
  adoption_information: "認養資訊",
  unknown_disclosure: "未知揭露",
  shelter_intake: "入所紀錄",
  health_check: "健康檢查",
  observation: "觀察",
  teacher_approval: "教師審核",
  publication: "發布",
  evidence_profile_update: "證據檔案更新",
  human_presence: "人員出現",
  distance_maintaining: "保持距離",
  vocalization: "發聲",
  movement: "移動",
  unknowns: "未知項目",
  profile_update: "檔案更新",
  media_photo: "照片",
  media_video: "影片",
  foster: "中途照護",
  one_day_outing: "一日外出",
  trial_adoption: "試養",
  formal_adoption: "正式認養",
  returned: "退回",
  female: "母",
  male: "公",
  puppy: "幼犬",
  young: "青年犬",
  adult: "成犬",
  senior: "高齡犬",
  available: "可認養",
  pending: "待確認",
  adopted: "已認養",
  unavailable: "暫不開放",
  "health metadata": "健康資料",
  "home behavior": "居家行為",
  compatibility: "適配資訊",
  "public name": "公開名稱",
  sex: "性別",
  "age band": "年齡帶",
  "adoption status": "認養狀態",
  walking_observation: "散步觀察",
  environmental_observation: "環境觀察",
  video: "影片證據",
  photo: "照片證據",
  repeated_observation: "重複觀察",
  human_health: "人類健康",
  animal_health: "動物健康",
  animal_welfare: "動物福利",
  environment: "環境",
  education: "教育",
  citizen_science: "公民科學",
  public_health: "公共衛生",
  local_policy: "地方政策",
  student_community: "學生社群",
  dogs: "犬隻",
  public_agencies: "公部門"
};

export function formatTaiwanDate(value: Date | string) {
  return new Intl.DateTimeFormat(PUBLIC_LOCALE, {
    dateStyle: "medium",
    timeZone: PUBLIC_TIME_ZONE
  }).format(new Date(value));
}

export function formatTaiwanDateTime(value: Date | string) {
  return new Intl.DateTimeFormat(PUBLIC_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: PUBLIC_TIME_ZONE
  }).format(new Date(value));
}

export function formatTaiwanNumber(value: number) {
  return new Intl.NumberFormat(PUBLIC_LOCALE).format(value);
}

export function publicLabel(value: string) {
  return publicLabels[value] ?? codeLabels[value] ?? value;
}

export function publicCodeLabel(value: string) {
  return codeLabels[value] ?? publicLabels[value] ?? value.replaceAll("_", " ");
}

export function impactMetricLabel(code: string) {
  return impactMetricLabels[code] ?? code;
}

export function impactDimensionLabel(dimension: string) {
  return impactDimensionLabels[dimension] ?? dimension;
}

export function impactCriterionLabel(id: string, fallbackFeature: string, fallbackEvidence: string) {
  const copy = impactCriterionCopy[id];
  return copy ? { feature: copy[0], evidence: copy[1] } : { feature: fallbackFeature, evidence: fallbackEvidence };
}

export function impactLimitation(status: string) {
  if (status === "VERIFIED") return "已驗證來源可用於來源追溯，但仍需避免過度推論。";
  if (status === "UNVERIFIED") return "資料尚未完成外部驗證，只能作為待確認資訊。";
  return "此為競賽示範指標，不代表真實世界成效。";
}

export function sdgPublicCopy(goal: string, fallback: [string, string, string]) {
  const copy = sdgCopy[goal] ?? fallback;
  return { title: copy[0], contribution: copy[1], limitation: copy[2] };
}
