export const publicDemoRoleIds = ["teacher", "shelter", "student"] as const;
export type PublicDemoRoleId = (typeof publicDemoRoleIds)[number];

export type PublicDemoAccount = {
  id: string;
  role: PublicDemoRoleId;
  label: string;
  testCode: string;
  purpose: string;
  contribution: string;
  evidenceLabel: string;
  evidenceHref: string;
  readOnly: true;
  syntheticDemo: true;
};

export const publicDemoAccounts = [
  {
    id: "demo-perspective-teacher-v1",
    role: "teacher",
    label: "教師",
    testCode: "DEMO-TEACHER-001",
    purpose: "查看教師如何建立課程任務、審核學生觀察、檢視能力證據，並把 One Health 探究連回課程目標。",
    contribution: "教師視角呈現審核責任與學習證據，不會代替收容所做最終確認或公開發布。",
    evidenceLabel: "查看教師證據流程",
    evidenceHref: "/competition/evidence",
    readOnly: true,
    syntheticDemo: true
  },
  {
    id: "demo-perspective-shelter-v1",
    role: "shelter",
    label: "收容所人員",
    testCode: "DEMO-SHELTER-001",
    purpose: "查看動保夥伴如何刊登行動機會、處理學生申請、安排參訪與課程，並回填服務成果。",
    contribution: "此入口會開啟同瀏覽器功能展示工作台；展示資料不代表真實合作、招募或跨裝置送件。",
    evidenceLabel: "進入動保夥伴工作台",
    evidenceHref: "/shelter",
    readOnly: true,
    syntheticDemo: true
  },
  {
    id: "demo-perspective-student-v1",
    role: "student",
    label: "學生",
    testCode: "DEMO-STUDENT-001",
    purpose: "體驗學生如何完成研究觀察資格、查看今日任務、進行 300 秒非接觸觀察，並完成 One Health 探究報告。",
    contribution: "學生視角強調安全、非接觸與資料品質；公開展示不包含真實學生姓名或臉部資料。",
    evidenceLabel: "查看研究觀察資格",
    evidenceHref: "/research-license",
    readOnly: true,
    syntheticDemo: true
  }
] as const satisfies readonly PublicDemoAccount[];

export type PublicTourStep = {
  slug: string;
  sequence: number;
  title: string;
  eyebrow: string;
  summary: string;
  detail: string;
  evidenceLabel?: string;
  evidenceHref?: string;
};

export const publicTourSteps: readonly PublicTourStep[] = [
  {
    "slug": "welcome",
    "sequence": 1,
    "title": "第一步：課程與帳號啟動",
    "eyebrow": "學期準備",
    "summary": "完成師生帳號註冊與系統連線環境設定。",
    "detail": "由教師建立課程專屬空間，學生完成註冊與系統介接，串接政府開放資料 (COA_OpenData)，正式開啟 6 週核心探究任務。",
    "evidenceLabel": "進入系統設置",
    "evidenceHref": "/auth"
  },
  {
    "slug": "research-license",
    "sequence": 2,
    "title": "第二步：第一週｜角色與處境",
    "eyebrow": "第一週",
    "summary": "探索家庭、工作、校犬與街頭犬的生活差異。",
    "detail": "透過比較生活路徑風險，並以毛色資料練習區分觀察與解釋，拒絕不當腦補與編故事。"
  },
  {
    "slug": "observation",
    "sequence": 3,
    "title": "第三步：第二週｜承諾與責任",
    "eyebrow": "第二週",
    "summary": "透過情境作答全面盤點長期飼養的時間、經濟、醫療與家庭備援。",
    "detail": "利用體型數據思考個體實際需求，學習不把體型直接當成命運。"
  },
  {
    "slug": "review-process",
    "sequence": 4,
    "title": "第四步：第三週｜品種與標籤",
    "eyebrow": "第三週",
    "summary": "閱讀品種形成時間線，拆解品種傾向與健康迷思。",
    "detail": "針對混種犬等欄位進行追問，練習辨識資料支持什麼、不能支持什麼、還缺哪些證據。"
  },
  {
    "slug": "dog-profile",
    "sequence": 5,
    "title": "第五步：第四週｜數量與源頭",
    "eyebrow": "第四週",
    "summary": "以系統觀點理解遊蕩犬的存量與流量，比較政策研究指標與責任照護。",
    "detail": "學習嚴謹的資料邏輯，避免直接用「未絕育」推論懷孕。"
  },
  {
    "slug": "one-health-inquiry",
    "sequence": 6,
    "title": "第六步：第五週｜政策與兩難",
    "eyebrow": "第五週",
    "summary": "面對動物福利、生態保育與公共安全衝突，在資源限制下權衡多方處境。",
    "detail": "評估政策提案與個別處置，提出兼顧現實的理性方案。"
  },
  {
    "slug": "impact-dashboard",
    "sequence": 7,
    "title": "第七步：第六週｜現場與行動",
    "eyebrow": "第六週",
    "summary": "使用動保資源地圖搜尋單位、盤點自身角色與安全情境。",
    "detail": "產出包含執行日期、成人協助與替代方案的具體可行行動計畫。"
  },
  {
    "slug": "final-vision",
    "sequence": 8,
    "title": "第八步：學期結案與證據總覽",
    "eyebrow": "學期結案",
    "summary": "整合前六週的每週作業與教師審核結果，繳交結構化的實證思辨報告。",
    "detail": "系統同步彙整班級數據分析與盲點，完成學期實作循環與歸檔。"
  }
];

// 以下狀態管理部分保持不變
export type PublicDemoState = {
  version: "SL-PUBLIC-DEMO-1";
  fixtureId: "shelterlab-public-synthetic-v1";
  selectedRole: PublicDemoRoleId | null;
  syntheticDemo: true;
  readOnly: true;
  productionMutationCount: 0;
};

export function createPublicDemoState(): PublicDemoState {
  return {
    version: "SL-PUBLIC-DEMO-1",
    fixtureId: "shelterlab-public-synthetic-v1",
    selectedRole: null,
    syntheticDemo: true,
    readOnly: true,
    productionMutationCount: 0
  };
}

export function resetPublicDemoState(): PublicDemoState {
  return createPublicDemoState();
}

export function selectPublicDemoRole(state: PublicDemoState, role: PublicDemoRoleId): PublicDemoState {
  return { ...state, selectedRole: role };
}

export function isPublicDemoRole(value: string): value is PublicDemoRoleId {
  return publicDemoRoleIds.includes(value as PublicDemoRoleId);
}

export function getPublicDemoAccount(role: PublicDemoRoleId) {
  return publicDemoAccounts.find((account) => account.role === role)!;
}

export function isPublicTourStep(value: string) {
  return publicTourSteps.some((step) => step.slug === value);
}

export function getPublicTourStep(slug: string) {
  return publicTourSteps.find((step) => step.slug === slug);
}

export function getRemainingTourSeconds(sequence: number) {
  const totalSeconds = 7 * 60;
  const secondsPerStep = totalSeconds / publicTourSteps.length;
  return Math.max(0, Math.round((publicTourSteps.length - sequence) * secondsPerStep));
}

export function getPublicDemoManifest() {
  return {
    ...createPublicDemoState(),
    accounts: publicDemoAccounts,
    tour: publicTourSteps
  } as const;
}
