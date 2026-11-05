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
    purpose: "檢視教師如何規劃教學任務、審核學生觀察紀錄、驗證學習成效，並將 One Health 探究對接至課程目標。",
    contribution: "教師視角強調導引審核與學術成效評估，不代行收容機構之最終決策或發布。",
    evidenceLabel: "檢視教師審核與證據流程",
    evidenceHref: "/competition/evidence",
    readOnly: true,
    syntheticDemo: true
  },
  {
    id: "demo-perspective-shelter-v1",
    role: "shelter",
    label: "收容所人員",
    testCode: "DEMO-SHELTER-001",
    purpose: "瞭解動保機構如何發布參與機會、評估學生申請案、規劃參訪課程及登載服務成效。",
    contribution: "本入口開立模擬工作台供介面展示；展示數據不構成真實合作契約或跨系統案件傳送。",
    evidenceLabel: "進入動保機構工作台模組",
    evidenceHref: "/shelter",
    readOnly: true,
    syntheticDemo: true
  },
  {
    id: "demo-perspective-student-v1",
    role: "student",
    label: "學生",
    testCode: "DEMO-STUDENT-001",
    purpose: "體驗學生如何完成研究觀察資格審核、執行當日任務、進行 300 秒無接觸觀察，並產出 One Health 探究報告。",
    contribution: "學生視角著重安全原則、無接觸觀察與資料嚴謹度；系統不公開展示個資與人像資訊。",
    evidenceLabel: "檢視研究觀察資格條件",
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
    "title": "第一步：選定角色權限，開展研習歷程",
    "eyebrow": "學期準備",
    "summary": "學生、教師與動保機構人員依相應身分登入，進駐專屬學習或管理模組。",
    "detail": "教師可掌握教學進度，學生依循學習地圖探索，動保機構則可管理並發布活動公告。",
    "evidenceLabel": "進入系統設置",
    "evidenceHref": "/auth"
  },
  {
    "slug": "six-week-course",
    "sequence": 2,
    "title": "第二步：循序漸進研習，完成六週單元",
    "eyebrow": "核心學習",
    "summary": "涵蓋動物照護責任、開放資料分析及公共議題探究，系統化建立動物保護之公民素養。",
    "detail": "課程採結構化學習地圖，指引學習者按部就班解鎖各週探究單元。",
    "evidenceLabel": "以學生身分登入",
    "evidenceHref": "/auth?role=student"
  },
  {
    "slug": "final-vision",
    "sequence": 3,
    "title": "第三步：連結真實情境，深化公民行動",
    "eyebrow": "自主行動",
    "summary": "完成理論與方法研習後，可查閱收容機構發布之真實公告，評估適宜之參與管道。",
    "detail": "本平台採用佈告欄資訊整合模式；所有諮詢與報名作業請逕向主辦單位官方管道辦理，落實實務學習。",
    "evidenceLabel": "以學生身分登入",
    "evidenceHref": "/auth?role=student"
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
