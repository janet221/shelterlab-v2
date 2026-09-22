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
    unitTitle: "同樣是犬隻，為什麼過著不同的生活？",
    stages: [
      { stage: 1, label: "同一隻犬隻，三個畫面", title: "犬隻沒有改變，只是背景換了" },
      { stage: 2, label: "關係追蹤網", title: "想釐清牠的處境，得先看懂「關係」" },
      { stage: 3, label: "工作犬的日常考驗", title: "牠為我們工作，我們為牠做了什麼？" },
      { stage: 4, label: "退役之後", title: "脫下工作背心後，牠成了誰？" },
      { stage: 5, label: "遇見街頭流浪犬，然後呢？", title: "獨自在街上的犬隻，你的下一步行動是？" },
      { stage: 6, label: "資料深思｜毛色", title: "想想看牠們被貼上了什麼標籤" }
    ]
  },
  2: {
    week: 2,
    theme: "承諾與責任",
    unitTitle: "決定帶牠回家前，我真正要承擔的是什麼？",
    stages: [
      { stage: 1, label: "法律與飼主資格", title: "想帶牠回家，誰要成為法律上的飼主？" },
      { stage: 2, label: "時間與突發照護", title: "平常排得下，不代表生病時也接得住" },
      { stage: 3, label: "經濟能力", title: "花費不只有飼料，醫療與法定責任也不能延期" },
      { stage: 4, label: "情緒與家庭關係", title: "牠可以陪伴我，但不能成為唯一的情緒出口" },
      { stage: 5, label: "影音思考：帶我回家吧", title: "一時心動之後，誰陪牠走完一生？" },
      { stage: 6, label: "資料深思｜體型", title: "想想看牠們被貼上了什麼標籤" }
    ]
  },
  3: {
    week: 3,
    theme: "品種與標籤",
    unitTitle: "「米克斯」這個名字，究竟告訴了我們多少真相？",
    stages: [
      { stage: 1, label: "品種是怎麼形成的？", title: "從工作分工到外觀標準，品種不是自然寫好的答案" },
      { stage: 2, label: "品種能預測個性嗎？", title: "傾向不是命運，個體不等於品種平均" },
      { stage: 3, label: "純種與混種的健康迷思", title: "遺傳風險不能只靠「純」或「混」判斷" },
      { stage: 4, label: "領養、購買與來源查核", title: "喜歡品種沒有錯，但你願意追問牠從哪裡來嗎？" },
      { stage: 5, label: "影音思考：牠想要一個家", title: "在選擇之前，先看見一隻犬隻的一生" },
      { stage: 6, label: "資料深思｜品種", title: "想想看牠們被貼上了什麼標籤" }
    ]
  },
  4: {
    week: 4,
    theme: "數量與源頭",
    unitTitle: "大家都想讓遊蕩犬減少，為什麼答案不一樣？",
    stages: [
      { stage: 1, label: "犬隻動態系統", title: "認養能幫助一隻犬，為什麼收容與街頭仍有新犬進來？" },
      { stage: 2, label: "政策與證據", title: "同樣叫科學，為什麼不同研究會提出不同答案？" },
      { stage: 3, label: "家犬源頭", title: "街頭上的犬，真的一開始就沒有主人嗎？" },
      { stage: 4, label: "餵養與共存", title: "餵一餐是善意，接下來的責任由誰承擔？" },
      { stage: 5, label: "影音判讀：絕育", title: "宣導說『要絕育』，政策要成功還缺哪些條件？" },
      { stage: 6, label: "資料深思｜性別與絕育", title: "想想看牠們被貼上了什麼標籤" }
    ]
  },
  5: {
    week: 5,
    theme: "政策與兩難",
    unitTitle: "不讓生命倒數之後，什麼才算真正的人道？",
    stages: [
      { stage: 1, label: "零撲殺制度解碼", title: "零撲殺、安樂死與恢復十二夜，是同一件事嗎？" },
      { stage: 2, label: "收容與生活品質", title: "活著是一項條件，但足以證明牠過得好嗎？" },
      { stage: 3, label: "犬隻與野生動物", title: "保護遊蕩犬時，哪些生命可能成為看不見的代價？" },
      { stage: 4, label: "公共決策與代價", title: "每個方案都可能造成傷害，我們要如何負責地選擇？" },
      { stage: 5, label: "影音判讀：生態衝突", title: "影像讓人震撼之後，政策還需要回答哪些問題？" },
      { stage: 6, label: "資料深思｜年齡", title: "想想看牠們被貼上了什麼標籤" }
    ]
  },
  6: {
    week: 6,
    theme: "現場與行動",
    unitTitle: "走進收容所，我們能為牠做些什麼？",
    stages: [
      { stage: 1, label: "帶著好問題，走進現場", title: "好的問題，能在現場找到答案" },
      { stage: 2, label: "看見的，就是真相嗎？", title: "看見牠縮在籠舍角落，就代表牠曾被虐待嗎？" },
      { stage: 3, label: "解密收容所運作日常", title: "一隻犬隻從進所到離所，經過哪些看不見的工作？" },
      { stage: 4, label: "重新檢視最初的判斷", title: "哪些想法被證實，哪些需要修正？" },
      { stage: 5, label: "從我想幫忙到真正幫上忙", title: "有效的行動，必須打中真實的需求" },
      { stage: 6, label: "結案總結", title: "走完這趟旅程，我改變了什麼？" }
    ]
  }
};

export function getStudentCourseTitles(week: WeekNumber) {
  return STUDENT_COURSE_TITLES[week];
}
