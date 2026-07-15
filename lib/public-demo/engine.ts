export const publicDemoRoleIds = ["judge", "teacher", "shelter", "student"] as const;
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
    id: "demo-perspective-judge-v1",
    role: "judge",
    label: "評審或合作夥伴",
    testCode: "DEMO-JUDGE-001",
    purpose: "快速檢視 ShelterLab 如何把政府開放資料、Research License、觀察證據、犬隻公開資訊與影響力指標串成一條可追溯的示範旅程。",
    contribution: "此視角適合七分鐘簡報，所有狀態皆為唯讀，不建立登入 session，也不授予任何正式權限。",
    evidenceLabel: "進入七分鐘評審導覽",
    evidenceHref: "/competition/judge",
    readOnly: true,
    syntheticDemo: true
  },
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
    purpose: "查看收容所如何確認觀察邊界、審核犬隻證據、管理證據時間軸，並決定哪些資訊可以公開。",
    contribution: "收容所保有犬隻資料與公開資訊的最後權限；示範頁只呈現經過隱私過濾的合成資料。",
    evidenceLabel: "查看犬隻證據檔案",
    evidenceHref: "/adoption-profile/DOG-TPE-001",
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
  evidenceLabel: string;
  evidenceHref: string;
};

export const publicTourSteps = [
  {
    slug: "welcome",
    sequence: 1,
    title: "第一步：課程與帳號啟動",
    eyebrow: "學期準備",
    summary: "完成學生與教師帳號註冊，設定系統連線環境。",
    detail: "學期初由教師建立課程專屬空間，學生完成註冊並與收容所系統完成帳號綁定。確保所有參與者皆能正確介接政府開放資料，順利開啟 16 週的實作任務。",
    evidenceLabel: "進入系統設置",
    evidenceHref: "/"
  },
  {
    slug: "research-license",
    sequence: 2,
    title: "第二步：通過觀察資格認證",
    eyebrow: "實地準備",
    summary: "完成行為觀察課程並通過測驗，取得進入收容所實地的許可。",
    detail: "學生必須在課堂中完成標準化觀察測驗，系統紀錄通過資格後，學生方可獲得前往現場的門禁許可與觀察權限。",
    evidenceLabel: "進行資格測驗",
    evidenceHref: "/research-license"
  },
  {
    slug: "observation",
    sequence: 3,
    title: "第三步：進行行為觀察紀錄",
    eyebrow: "現場觀察",
    summary: "到收容所現場，依照規定格式把看到的行為寫下來。",
    detail: "學生根據課程教的方法，對指定的犬隻進行觀察。請在系統的觀察表單中，填入看到的行為細節與互動過程，將這些觀察變成課堂需要的紀錄資料。",
    evidenceLabel: "查看觀察表單",
    evidenceHref: "/living-lab"
  },
  {
    slug: "review-process",
    sequence: 4,
    title: "第四步：師生共同審閱紀錄",
    eyebrow: "品質管理",
    summary: "由指導教師對學生提交的觀察紀錄進行品質檢查與修正。",
    detail: "學生提交紀錄後，教師在系統內檢查資料邏輯與觀察精確度，確認無誤後核准該筆紀錄，確保資料符合學術品質要求。",
    evidenceLabel: "查看審閱狀態",
    evidenceHref: "/adoption-profile/DOG-TPE-001/timeline"
  },
  {
    slug: "dog-profile",
    sequence: 5,
    title: "第五步：產出犬隻數位檔案",
    eyebrow: "資訊輸出",
    summary: "將審核後的觀察紀錄彙整為犬隻檔案，並發送至收容所系統。",
    detail: "系統整合 16 週累積的觀察結果，自動生成犬隻行為檔案，並即時更新至收容所的作業系統中，供工作人員進行認養配對參考。",
    evidenceLabel: "查看犬隻數位檔案",
    evidenceHref: "/adoption-profile/DOG-TPE-001"
  },
  {
    slug: "one-health-inquiry",
    sequence: 6,
    title: "第六步：撰寫探究分析報告",
    eyebrow: "期末作業",
    summary: "整合觀察數據與政府資料，產出 One Health 分析報告並提交審核。",
    detail: "學生應用期末蒐集的行為數據，結合區域環境與公衛資料進行分析，產出完整的分析報告，並交由授課教師完成最終評核。",
    evidenceLabel: "查看探究報告格式",
    evidenceHref: "/inquiries/demo"
  },
  {
    slug: "impact-dashboard",
    sequence: 7,
    title: "第七步：系統指標資料回填",
    eyebrow: "數據蒐集",
    summary: "系統自動計算探究結果，更新影響力指標與治理資料庫。",
    detail: "學生的作業成果經教師最終確認後，數據會自動回填至儀表板，更新收容所治理指標與公共資料庫，完成資料循環。",
    evidenceLabel: "查看治理影響力數據",
    evidenceHref: "/competition/impact"
  },
  {
    slug: "final-vision",
    sequence: 8,
    title: "第八步：學期結案與存檔",
    eyebrow: "作業歸檔",
    summary: "確認所有觀察紀錄與報告皆已歸檔，完成學期實作流程。",
    detail: "最後確認所有的行為觀察、審核紀錄與探究報告均已正確分類並永久存檔，供相關單位作為下學期實作的基礎資料。",
    evidenceLabel: "進入評審作業總覽",
    evidenceHref: "/competition/judge"
  }
] as const satisfies readonly PublicTourStep[];

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

export function getPublicDemoManifest() {
  return {
    ...createPublicDemoState(),
    accounts: publicDemoAccounts,
    tour: publicTourSteps
  } as const;
}