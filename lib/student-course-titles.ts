import type { WeekNumber } from "@/lib/student-map";

export type CourseStageTitle = {
  stage: number;
  label: string;
  title: string;
};

export type StudentCourseTitleSet = {
  week: WeekNumber;
  theme: string;
  unitTitle: string;
  stages: readonly CourseStageTitle[];
};

/**
 * 六週關卡的核准標題。
 * label 用於進度列與關卡頁籤；title 用於關卡畫面主標。
 * 畫面實作應由此處取值，避免各週元件自行改寫。
 */
export const STUDENT_COURSE_TITLES: Record<WeekNumber, StudentCourseTitleSet> = {
  1: {
    week: 1,
    theme: "角色與處境",
    unitTitle: "同為犬隻，為何面臨不同的生活處境？",
    stages: [
      { stage: 1, label: "同一隻犬隻，三個畫面", title: "犬隻沒有改變，只是背景換了" },
      { stage: 2, label: "關係追蹤網", title: "理解犬隻處境，須先辨識其關係網絡" },
      { stage: 3, label: "工作犬的日常考驗", title: "工作犬執行任務時，人類應承擔哪些責任？" },
      { stage: 4, label: "退役之後", title: "工作犬退役後的身分與照護安排" },
      { stage: 5, label: "街頭犬隻處境與應對", title: "面對獨自在街頭活動的犬隻，應採取何種行動？" },
      { stage: 6, label: "資料深思｜毛色", title: "檢視毛色標籤及其影響" }
    ]
  },
  2: {
    week: 2,
    theme: "承諾與責任",
    unitTitle: "認養犬隻前，應承擔哪些長期責任？",
    stages: [
      { stage: 1, label: "法律與飼主資格", title: "認養犬隻時，誰應成為法律上的飼主？" },
      { stage: 2, label: "時間與突發照護", title: "日常安排不等同於突發狀況下的照護能力" },
      { stage: 3, label: "經濟能力", title: "花費不只有飼料，醫療與法定責任也不能延期" },
      { stage: 4, label: "情緒與家庭關係", title: "動物陪伴不應成為唯一的情緒支持" },
      { stage: 5, label: "影音思考：認養前的責任", title: "短暫感動之後，誰能承擔終身照護？" },
      { stage: 6, label: "資料深思｜體型", title: "檢視體型標籤及其影響" }
    ]
  },
  3: {
    week: 3,
    theme: "品種與標籤",
    unitTitle: "「米克斯」一詞能提供多少可靠資訊？",
    stages: [
      { stage: 1, label: "品種形成歷程", title: "從工作分工到外觀標準，品種是人類建構的分類" },
      { stage: 2, label: "品種與性格預測", title: "群體傾向不等同於個體特質" },
      { stage: 3, label: "純種與混種的健康迷思", title: "遺傳風險不能只靠「純」或「混」判斷" },
      { stage: 4, label: "領養、購買與來源查核", title: "偏好特定品種時，應如何查核犬隻來源？" },
      { stage: 5, label: "影音思考：牠想要一個家", title: "在選擇之前，先看見一隻犬隻的一生" },
      { stage: 6, label: "資料深思｜品種", title: "檢視品種標籤及其影響" }
    ]
  },
  4: {
    week: 4,
    theme: "數量與源頭",
    unitTitle: "降低遊蕩犬數量的共同目標，為何形成不同政策主張？",
    stages: [
      { stage: 1, label: "犬隻動態系統", title: "持續推動認養時，為何收容與街頭仍有新犬流入？" },
      { stage: 2, label: "政策與證據", title: "不同研究為何可能形成不同結論？" },
      { stage: 3, label: "家犬源頭", title: "街頭犬隻是否皆可視為自始無飼主？" },
      { stage: 4, label: "餵養與共存", title: "餵一餐是善意，接下來的責任由誰承擔？" },
      { stage: 5, label: "影音判讀：絕育", title: "宣導說『要絕育』，政策要成功還缺哪些條件？" },
      { stage: 6, label: "資料深思｜性別與絕育", title: "檢視性別與絕育資訊的證據界線" }
    ]
  },
  5: {
    week: 5,
    theme: "政策與兩難",
    unitTitle: "取消期限處置後，應如何界定人道照護？",
    stages: [
      { stage: 1, label: "零撲殺制度解碼", title: "零撲殺、安樂死與恢復十二夜，是同一件事嗎？" },
      { stage: 2, label: "收容與生活品質", title: "維持生命是否足以代表具備良好動物福利？" },
      { stage: 3, label: "犬隻與野生動物", title: "保護遊蕩犬時，哪些生命可能成為看不見的代價？" },
      { stage: 4, label: "公共決策與代價", title: "各項方案皆可能產生代價，應如何作成負責任的決策？" },
      { stage: 5, label: "影音判讀：生態衝突", title: "影像讓人震撼之後，政策還需要回答哪些問題？" },
      { stage: 6, label: "資料深思｜年齡", title: "檢視年齡標籤及其影響" }
    ]
  },
  6: {
    week: 6,
    theme: "現場與行動",
    unitTitle: "進入收容場域後，可採取哪些適切行動？",
    stages: [
      { stage: 1, label: "以適切問題進入現場", title: "以明確提問查證現場資訊" },
      { stage: 2, label: "觀察與推論界線", title: "犬隻縮在籠舍角落，是否足以證明曾遭受虐待？" },
      { stage: 3, label: "收容機構運作流程", title: "犬隻從入所到離所，涉及哪些照護與行政工作？" },
      { stage: 4, label: "重新檢視最初的判斷", title: "哪些想法被證實，哪些需要修正？" },
      { stage: 5, label: "從參與意願到有效行動", title: "有效行動必須回應真實需求" },
      { stage: 6, label: "結案總結", title: "回顧學習歷程與觀點變化" }
    ]
  }
};

export function getStudentCourseTitles(week: WeekNumber) {
  return STUDENT_COURSE_TITLES[week];
}
