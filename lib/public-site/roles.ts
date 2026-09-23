export const publicRoleIds = ["student", "teacher", "shelter"] as const;

export type PublicRoleId = (typeof publicRoleIds)[number];

export type PublicRoleProfile = {
  id: PublicRoleId;
  demoRole: "student" | "teacher" | "shelter";
  title: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  capabilities: readonly string[];
  journey: readonly string[];
  accent: "teal" | "amber" | "rose" | "sky";
};


export const syntheticDemoNotice =
  "競賽原型｜合成示範資料｜尚未宣稱正式合作或實證認養成效";

export const publicRoleProfiles = [
  {
    id: "student",
    demoRole: "student",
    title: "我是學生",
    description: "從六週數位關卡閱讀政府開放資料、記錄自己的判斷與反思，完成後進入真實收容場域。",
    primaryCta: "進入學生登入／註冊",
    primaryHref: "/auth?role=student",
    capabilities: ["六週關卡逐步解鎖", "閱讀政府開放資料", "保存個人思考歷程", "完成後進入真實場域"],
    journey: ["六週課程", "場域觀察", "回顧與反思"],
    accent: "teal"
  },
  {
    id: "teacher",
    demoRole: "teacher",
    title: "我是教師",
    description: "建立課程與觀察任務，審核學生證據，掌握探究學習成果。",
    primaryCta: "進入教師登入／註冊",
    primaryHref: "/auth?role=teacher",
    capabilities: ["建立課程與任務", "審核學生觀察", "查看能力與學習證據", "審閱探究報告"],
    journey: ["課程設計", "證據審核", "學習成果分析"],
    accent: "amber"
  },
  {
    id: "shelter",
    demoRole: "shelter",
    title: "我是收容所人員",
    description: "接收學生與教師提出的申請，刊登志工、參訪與教育活動，安排參與人員並回填行動成果。",
    primaryCta: "進入動保夥伴工作台",
    primaryHref: "/shelter",
    capabilities: ["刊登志工與教育活動", "接收及審核學生申請", "安排參訪與服務任務", "傳送通知並回填成果"],
    journey: ["發布機會", "審核與安排", "回覆與成果"],
    accent: "rose"
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
