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


// 保留給仍存在的舊版公開示範頁使用；正式角色入口不再顯示此訊息。
export const syntheticDemoNotice =
  "競賽原型｜合成示範資料｜尚未宣稱正式合作或實證認養成效";

export const publicRoleProfiles = [
  {
    id: "student",
    demoRole: "student",
    title: "我是學生",
    description: "從六週數位關卡完成行前準備，閱讀收容所活動公告並規劃適合自己的參與方式。",
    primaryCta: "進入學生登入／註冊",
    primaryHref: "/auth?role=student",
    capabilities: ["六週關卡逐步解鎖", "完成行前訓練", "閱讀活動公告", "規劃參與方式"],
    journey: ["六週課程", "行前準備", "公告探索"],
    accent: "teal"
  },
  {
    id: "teacher",
    demoRole: "teacher",
    title: "我是教師",
    description: "設定班級與學校資料，掌握學生的六週學習進度與課程完成情況。",
    primaryCta: "進入教師登入／註冊",
    primaryHref: "/auth?role=teacher",
    capabilities: ["設定班級資料", "查看全班學習進度", "掌握關卡完成狀態", "提供課程引導"],
    journey: ["班級設定", "學習進度", "課程引導"],
    accent: "amber"
  },
  {
    id: "shelter",
    demoRole: "shelter",
    title: "我是收容所人員",
    description: "刊登與管理活動公告，讓學生與教師依公告中的官方聯絡方式直接洽詢主辦單位。",
    primaryCta: "進入收容所登入／註冊",
    primaryHref: "/auth?role=shelter",
    capabilities: ["刊登活動公告", "管理刊登狀態", "更新活動內容", "提供官方聯絡資訊"],
    journey: ["發布公告", "維護資訊", "直接聯繫"],
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
