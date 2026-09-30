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
    "title": "第一步：選定身分，開啟旅程",
    "eyebrow": "學期準備",
    "summary": "學生、教師與收容所夥伴可依身分登入，進入專屬的學習或管理空間。",
    "detail": "教師能輕鬆掌握班級進度，學生從學習地圖出發，收容所夥伴則能維護與發布活動公告。",
    "evidenceLabel": "進入系統設置",
    "evidenceHref": "/auth"
  },
  {
    "slug": "six-week-course",
    "sequence": 2,
    "title": "第二步：循序漸進，完成六週課程",
    "eyebrow": "核心學習",
    "summary": "從照護責任、資料判讀到公共議題，六週課程帶領你逐步建立動保意識。",
    "detail": "系統採直覺的連續式地圖設計，讓你可以順暢地依序解鎖各週關卡。",
    "evidenceLabel": "以學生身分登入",
    "evidenceHref": "/auth?role=student"
  },
  {
    "slug": "final-vision",
    "sequence": 3,
    "title": "第三步：對接真實，規劃行動",
    "eyebrow": "自主行動",
    "summary": "完成學習後，即可探索收容所釋出的真實公告，尋找適合自己的參與機會。",
    "detail": "本平台採純佈告欄模式，所有洽詢與報名請直接透過官方管道聯繫主辦單位，讓學習完美延伸至真實世界！",
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
