export const publicRoleIds = ["student", "teacher", "shelter", "judge_partner"] as const;

export type PublicRoleId = (typeof publicRoleIds)[number];

export type PublicRoleProfile = {
  id: PublicRoleId;
  demoRole: "student" | "teacher" | "shelter" | "judge";
  title: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  capabilities: readonly string[];
  journey: readonly string[];
  previewTitle: string;
  previewStats: readonly string[];
  accent: "teal" | "amber" | "rose" | "sky";
};

export const roleModeNotice =
  "";

export const syntheticDemoNotice =
  "";

export const publicRoleProfiles = [
  {
    id: "student",
    demoRole: "student",
    title: "我是學生",
    description: "學習安全與科學觀察方法，完成資格後參與收容所實境探究。",
    primaryCta: "以學生身分開始體驗",
    primaryHref: "/demo/student",
    capabilities: ["完成研究觀察資格", "查看觀察任務", "進行 300 秒非接觸觀察", "完成 One Health 探究報告"],
    journey: ["學習與測驗", "現場觀察", "科學探究與反思"],
    previewTitle: "學生首頁預覽",
    previewStats: ["研究觀察資格", "今日任務", "觀察時間軸"],
    accent: "teal"
  },
  {
    id: "teacher",
    demoRole: "teacher",
    title: "我是教師",
    description: "建立課程與觀察任務，審核學生證據，掌握探究學習成果。",
    primaryCta: "查看教師工作流程",
    primaryHref: "/demo/teacher",
    capabilities: ["建立課程與任務", "審核學生觀察", "查看能力與學習證據", "審閱探究報告"],
    journey: ["課程設計", "證據審核", "學習成果分析"],
    previewTitle: "教師工作台預覽",
    previewStats: ["待審觀察", "課程資源", "學習證據"],
    accent: "amber"
  },
  {
    id: "shelter",
    demoRole: "shelter",
    title: "我是收容所人員",
    description: "掌握觀察邊界與公開權限，確認哪些犬隻證據可以被採用。",
    primaryCta: "查看收容所工作流程",
    primaryHref: "/demo/shelter",
    capabilities: ["確認觀察任務", "審核犬隻證據", "管理證據時間軸", "決定資訊是否公開"],
    journey: ["任務確認", "證據確認", "人工發布"],
    previewTitle: "收容所審核預覽",
    previewStats: ["犬隻證據", "人工發布", "公開限制"],
    accent: "rose"
  },
  {
    id: "judge_partner",
    demoRole: "judge",
    title: "我是評審或合作夥伴",
    description: "快速查看政府開放資料、教育流程、犬隻證據與影響力。",
    primaryCta: "進入七分鐘評審導覽",
    primaryHref: "/competition/judge",
    capabilities: ["查看完整證據鏈", "查看政府開放資料用途", "查看 One Health 探究", "查看影響力與產品限制"],
    journey: ["問題與解方", "系統證據鏈", "影響與下一步"],
    previewTitle: "評審導覽預覽",
    previewStats: ["七分鐘流程", "影響力儀表板", "證據鏈"],
    accent: "sky"
  }
] as const satisfies readonly PublicRoleProfile[];

export function isPublicRoleId(value: string | null | undefined): value is PublicRoleId {
  return Boolean(value && publicRoleIds.includes(value as PublicRoleId));
}

export function getPublicRoleProfile(role: PublicRoleId) {
  return publicRoleProfiles.find((profile) => profile.id === role)!;
}

export function roleFromDemoRole(value: string | null | undefined): PublicRoleId | null {
  const found = publicRoleProfiles.find((profile) => profile.demoRole === value);
  return found?.id ?? null;
}
