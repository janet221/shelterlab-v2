export type DemoJourneyStep = {
  id: string;
  actor: string;
  title: string;
  evidence: string;
  href: string;
  evidenceStatus: "DEMO" | "SYNTHETIC" | "VERIFIED";
};

export const competitionDemoManifest = {
  id: "sprint8-read-only-demo-v1",
  version: "SL-DEMO-1",
  readOnly: true,
  productionMutationCount: 0,
  dataMode: "VERIFIED_FIXTURE + SYNTHETIC_DEMO" as const,
  steps: [
    { id: "student", actor: "學生", title: "學生識別", evidence: "使用代碼的合成學習者", href: "/student", evidenceStatus: "SYNTHETIC" },
    { id: "learning", actor: "學生", title: "自然科學學習", evidence: "五個科學與安全單元", href: "/research-license/modules", evidenceStatus: "DEMO" },
    { id: "license", actor: "學生", title: "研究觀察資格", evidence: "完成受治理的評量後取得有效資格", href: "/research-license", evidenceStatus: "SYNTHETIC" },
    { id: "mission", actor: "教師＋收容所", title: "觀察任務", evidence: "由收容所確認犬隻、區域與時間", href: "/today", evidenceStatus: "SYNTHETIC" },
    { id: "observation", actor: "學生", title: "300 秒觀察紀錄", evidence: "非接觸式結構化行為事件", href: "/student/living-lab", evidenceStatus: "SYNTHETIC" },
    { id: "teacher", actor: "教師", title: "教師審核", evidence: "重播不可覆寫的紀錄並明確核准", href: "/teacher/observation-reviews/session", evidenceStatus: "SYNTHETIC" },
    { id: "shelter", actor: "收容所", title: "收容所確認", evidence: "保留隱私權與事實確認權限", href: "/shelter/confirmations", evidenceStatus: "SYNTHETIC" },
    { id: "timeline", actor: "收容所", title: "證據時間軸", evidence: "獨立人工發布並保留來源追溯", href: "/dogs/DOG-TPE-001/evidence", evidenceStatus: "SYNTHETIC" },
    { id: "profile", actor: "公開瀏覽者", title: "犬隻證據檔案", evidence: "由收容所核准且不含診斷的敘述", href: "/dogs/DOG-TPE-001/evidence", evidenceStatus: "SYNTHETIC" },
    { id: "impact", actor: "評審", title: "影響力儀表板", evidence: "公式層級的影響力與競賽證據", href: "/competition/impact", evidenceStatus: "DEMO" }
  ] satisfies DemoJourneyStep[]
};
