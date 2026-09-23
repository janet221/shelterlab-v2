"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentLearningProgress } from "@/app/student/_components/student-learning-progress";
import { getOpenDataCourseCase } from "@/lib/student-open-data-cases";
import { getStudentCourseTitles } from "@/lib/student-course-titles";
import { getLearningTool, isTreasureUnlockedForWeek } from "@/lib/student-map";
import TreasureWorkspace, { type TreasureItem } from "./treasure-workspace";
import base from "./week-one-game.module.css";
import styles from "./week-two-experience.module.css";

const STORAGE_KEY = "shelterlab-week4-v1";
const CONTENT_VERSION = 1;
const COPY = getStudentCourseTitles(4);
const RECORD = getOpenDataCourseCase(4);
const REWARD = getLearningTool(4);
const STAGES = ["系統全貌", "政策與證據", "家犬源頭", "餵養與共存", "影音判讀", "資料深思"] as const;

type QuizItem = {
  readonly question: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly note: string;
};

type EvidenceItem = { readonly id: string; readonly label: string; readonly correct: boolean };
type Feedback = { kind: "correct" | "wrong"; title: string; body: string } | null;

const SYSTEM_QUESTIONS = [
  {
    question: "一個月有 30 隻犬被認養，卻有 45 隻因走失、棄養、捕捉或新生幼犬進入系統。月底最合理的判讀是？",
    options: ["當月有 30 隻被認養，代表在所犬隻一定減少 30 隻", "犬隻仍淨增加 15 隻；要同時處理流入與繁殖", "先增加收容空間，就能暫時不處理新的流入與繁殖"],
    answer: 1,
    note: "認養能幫助個體離開收容，但若流入量長期高於流出量，總量仍會上升。政策必須同時看進入、離開與新生。"
  },
  {
    question: "看到街上的犬隻，以下哪個描述最符合『系統思考』？",
    options: ["牠長期出現在街頭，可以先視為沒有飼主", "牠可能是無主犬，也可能是走失、放養或遭棄養的家犬，需要查證", "只要沒有戴項圈，就可判定是收容所漏捕的犬隻"],
    answer: 1,
    note: "外觀看不出犬隻如何進入遊蕩狀態。晶片掃描、附近訪查與追蹤紀錄，才可能補上來源。"
  },
  {
    question: "官方推估 113 年全國遊蕩犬為 141,584 隻，比 111 年下降 11.34%。可以直接說已經解決了嗎？",
    options: ["可以，全國總數下降可直接代表各地採取的方法都有效", "不可以；趨勢值得注意，但官方也說差距尚未達統計顯著，且地區情況不同", "不可以；既然差距尚未達統計顯著，這組數字就不必再追蹤"],
    answer: 1,
    note: "好的判讀既不忽略下降，也不把一次推估說成全面成功；還要看誤差、方法、地區與後續趨勢。"
  },
  {
    question: "如果收容所長期客滿，最有解釋力的第一組資料是？",
    options: ["同期間的認養件數與宣導觸及人數", "同期間的入所、出所、繁殖、走失返還與在所量", "年底在所數量與單次捕捉數量"],
    answer: 1,
    note: "容量是存量，入所與出所是流量。把多條路徑放在同一時間範圍，才看得見壓力從哪裡產生。"
  }
] as const satisfies readonly QuizItem[];

const SYSTEM_FILES = [
  { id: "inflow", label: "追蹤走失、棄養、捕捉與飼主送交等流入", correct: true },
  { id: "birth", label: "追蹤家犬與遊蕩犬的未管理繁殖", correct: true },
  { id: "outflow", label: "追蹤返還飼主、認養、轉置與其他流出", correct: true },
  { id: "stock", label: "在相同時間範圍比較期初、期末在所與街頭推估", correct: true },
  { id: "source", label: "調查犬隻從哪裡來，以及是否有晶片、飼主或固定照護者", correct: true },
  { id: "adopt", label: "只要辦更多認養會，就不必再記錄流入", correct: false },
  { id: "catch", label: "把街上的犬全部抓走，來源會自然停止", correct: false },
  { id: "photo", label: "看照片就能分辨野犬、放養犬與棄犬", correct: false }
] as const satisfies readonly EvidenceItem[];

const EVIDENCE_QUESTIONS = [
  {
    question: "某地執行少量絕育半年後犬數沒有下降，可以直接證明『絕育無效』嗎？",
    options: ["可以；只要政策名稱包含絕育，半年內沒有歸零就足以判定這種方法在任何地區都無效", "不行；要先看覆蓋率、持續時間、新犬移入與調查方法", "不行；絕育屬於既定正確的做法，因此無論覆蓋率、執行時間或結果如何都不需要評估"],
    answer: 1,
    note: "介入名稱相同，不代表執行強度相同。低覆蓋、時間不足或持續移入，都可能改變結果。"
  },
  {
    question: "電腦模型顯示某方法有效，但實地計畫失敗。較科學的處理方式是？",
    options: ["模型結果與現場不一致，就表示模型本身一定錯誤；不必再檢查它原先設定的假設與條件", "實地結果沒有符合模型，就表示第一線人員不夠專業；換一批執行者即可套用原結論", "比較模型假設與真實執行條件，找出人力、配合度、移入或追蹤差異"],
    answer: 2,
    note: "模型回答『在這些假設下可能怎樣』；實地評估回答『在這個場域實際怎樣』。兩者需要對話，不是互相取消。"
  },
  {
    question: "文章列出某地通報量大幅下降，最穩健的結論是？",
    options: ["通報下降支持當地問題可能改善，但不等於直接量到所有遊蕩犬", "當地通報量下降，已足以證明全臺各地遊蕩犬數都以相同比例下降，不需再做族群調查", "通報量不是直接犬數，因此完全沒有研究價值，也不必和其他資料交叉比對"],
    answer: 0,
    note: "通報量是間接指標，能提供線索，但也會受民眾通報習慣、分類與制度影響。應與犬隻調查及其他指標互證。"
  },
  {
    question: "兩篇都自稱依據科學，卻提出不同政策優先順序。學生最該先比較什麼？",
    options: ["先比較兩位作者的知名度、職稱與支持者數量，較有名的一方就可以代表較可靠的政策", "研究問題、成功指標、資料來源、場域與未控制變項", "先比較哪一篇敘事更感人、立場更符合自己的價值，再把其中的結論當成科學證據"],
    answer: 1,
    note: "不同研究可能分別關心減量、歸零、野生動物、動物福利或執行可行性；指標不同，不能只比結論句。"
  }
] as const satisfies readonly QuizItem[];

const EVIDENCE_FILES = [
  { id: "goal", label: "先說清楚目標是減量、歸零、降低衝突或改善福利", correct: true },
  { id: "coverage", label: "記錄介入覆蓋率、執行時間與未捕獲個體", correct: true },
  { id: "movement", label: "檢查新犬移入、放養、分送與棄養是否持續", correct: true },
  { id: "method", label: "使用可比較的調查方法、時間與區域", correct: true },
  { id: "limits", label: "主動標示資料限制，並用多項指標互相驗證", correct: true },
  { id: "headline", label: "只讀標題，選擇最符合自己立場的結論", correct: false },
  { id: "single", label: "一個成功地區足以證明任何地方都會成功", correct: false },
  { id: "authority", label: "作者有專業身分，因此不必公開方法與限制", correct: false }
] as const satisfies readonly EvidenceItem[];

const SOURCE_QUESTIONS = [
  {
    question: "有人固定餵一隻犬，也讓牠自由在社區活動，卻說『牠不是我的狗』。源頭管理最需要補問什麼？",
    options: ["先確認附近居民是否替犬隻取名與固定餵食", "誰提供持續照護、犬是否有晶片登記與絕育、活動如何被管理", "先以犬隻晚上停留的位置判定責任歸屬"],
    answer: 1,
    note: "『有沒有人自稱飼主』不一定等於實際照護關係。訪查要把餵養、居住、醫療、繁殖與活動管理放在一起看。"
  },
  {
    question: "未絕育家犬生下一窩幼犬，飼主把幼犬分送各地。這為何是系統問題？",
    options: ["只要接手者同意照顧，原飼主就不必留下轉讓紀錄", "幼犬跨區移動，若持續未登記、未絕育或再被轉送，可能形成新的來源", "優先記錄母犬即可，公犬與幼犬的流向影響較小"],
    answer: 1,
    note: "犬隻不只在街頭移動，也會隨人際網絡長距離移動。登記、絕育與轉讓紀錄能讓責任不在分送後消失。"
  },
  {
    question: "為什麼『把無主犬都抓紮』仍可能不足？",
    options: ["因為完成部分絕育後，犬群會立刻從其他地區補入", "如果放養家犬、棄養與未管理繁殖仍持續，新的犬還會進入", "因為家犬已有飼主，所以不必納入街頭犬來源分析"],
    answer: 1,
    note: "只處理已在街頭的個體，卻沒有降低新的流入，就像只擦地板卻沒有關掉漏水的水龍頭。"
  },
  {
    question: "源頭管理要優先找誰合作？",
    options: ["由收容所彙整即可，其他人的觀察較難標準化", "飼主、餵養者、社區、獸醫、民間團體與政府都可能掌握不同環節", "先採用公開發言最多的一方，再視需要補其他資料"],
    answer: 1,
    note: "犬隻族群受到多種人類行為影響。跨角色合作能補足單一單位的人力、資料與信任不足。"
  }
] as const satisfies readonly QuizItem[];

const SOURCE_FILES = [
  { id: "register", label: "確認家犬晶片、寵物登記及資料異動", correct: true },
  { id: "sterilize", label: "確認絕育，或依法完成免絕育與繁殖管理申報", correct: true },
  { id: "roam", label: "避免放養，外出由能控制犬隻的人伴同", correct: true },
  { id: "transfer", label: "分送或轉讓時留下可追蹤紀錄並確認新照護者", correct: true },
  { id: "support", label: "主動找到資源不足的飼主，提供可執行的登記、絕育與照護協助", correct: true },
  { id: "gift", label: "幼犬有人願意拿走，就不必確認後續責任", correct: false },
  { id: "yard", label: "犬隻住在自家庭院，出去遊蕩與繁殖不算飼主責任", correct: false },
  { id: "hide", label: "為了避免麻煩，稽查前先把未登記犬藏起來", correct: false }
] as const satisfies readonly EvidenceItem[];

const LABEL_FOLDER_CATEGORIES = [
  { id: "direct", label: "可以直接確認" },
  { id: "clue", label: "只能提供線索" },
  { id: "inference", label: "屬於人的推測或標籤" },
  { id: "verify", label: "還需要進一步查證" }
] as const;

const LABEL_FOLDER_ITEMS = [
  { id: "chip", label: "晶片掃描紀錄", correctCategory: "direct", explanation: "晶片掃描可以直接確認當下是否讀到晶片及其登記資訊；仍要確認資料是否更新，以及實際照護關係是否改變。" },
  { id: "intake", label: "收容所入所紀錄", correctCategory: "direct", explanation: "入所紀錄能直接確認登載的日期、地點與行政原因，但不一定完整重建犬隻進入街頭前的生活史。" },
  { id: "interview", label: "附近居民訪查", correctCategory: "clue", explanation: "居民可能看見犬隻出現、餵養或活動情況，能提供時間與人物線索；仍需比對不同說法與正式紀錄。" },
  { id: "transfer", label: "繁殖與轉送紀錄", correctCategory: "direct", explanation: "有日期、對象與來源的紀錄可以直接確認被記錄的繁殖或轉送事件，但無法自動證明沒有其他未記錄事件。" },
  { id: "feeder", label: "餵養者的說法", correctCategory: "clue", explanation: "餵養者可能掌握照護頻率與犬隻來去情況，但單一說法需要和晶片、訪查及其他紀錄互證。" },
  { id: "appearance", label: "犬隻外觀", correctCategory: "inference", explanation: "外觀能描述毛色、體型或可見特徵，不能直接說明牠是走失、放養、遭棄養或在外出生。" },
  { id: "post", label: "網路貼文", correctCategory: "verify", explanation: "貼文可成為尋找時間、地點與人物的線索，但發布者、日期、原始內容及後續狀況都需要查證。" },
  { id: "abandonment", label: "未經證實的棄養說法", correctCategory: "inference", explanation: "沒有可核對紀錄或訪查時，把犬隻直接標成『遭棄養』只是人的推測，不能當作已確認來源。" }
] as const satisfies readonly TreasureItem[];

const FEEDING_QUESTIONS = [
  {
    question: "在生態敏感區固定放置大量食物，卻沒有絕育、清潔與犬群追蹤，最大的問題是？",
    options: ["只要定點定時餵食，善意照護就不會改變犬群分布", "食物可能集中犬群並提高存活與繁殖機會，也可能產生環境與野生動物衝突", "犬隻吃飽後追逐動物的機會較低，因此可不必另做風險監測"],
    answer: 1,
    note: "犬隻追逐行為不只由飢餓決定。評估餵養要同時看犬群變化、環境衛生、棲地風險與後續管理。"
  },
  {
    question: "『全面禁止餵食』為何也可能難以單獨落地？",
    options: ["只要公告禁止餵食，原有犬群就會自然離開且不需後續處理", "若缺少溝通、替代照護、絕育與追蹤，長期餵養者可能不配合，犬群問題也未必消失", "餵食影響的只是環境整潔，與犬群停留及繁殖管理無關"],
    answer: 1,
    note: "政策除了理論效果，也要考慮人如何反應。把餵養者納入責任照護與犬群管理，可能比只有口號更可執行。"
  },
  {
    question: "社區同時有人怕狗、有人餵狗、有人關心野生動物。好的討論起點是？",
    options: ["先以是否支持餵食區分立場，再由多數一方決定", "共同盤點犬群位置、數量、絕育、衝突與環境，再設定可追蹤的安全目標", "先暫停所有討論，等犬群數量自然下降後再決定"],
    answer: 1,
    note: "把價值衝突轉成共同可觀察的問題，才有機會建立持續合作，而不是讓立場互相否定。"
  },
  {
    question: "如果餵養者願意合作，哪種做法最接近『責任照護』？",
    options: ["增加固定餵食點，讓犬群集中後維持原有照護方式", "配合清查、絕育、醫療、清潔、風險通報與逐步減少犬群", "為避免棄養者得知位置，不建立可供管理單位使用的犬群紀錄"],
    answer: 1,
    note: "責任照護不是把食物放下就離開，而是承擔對犬隻、居民、環境與資料追蹤的後續責任。"
  }
] as const satisfies readonly QuizItem[];

const COMMUNITY_FILES = [
  { id: "map", label: "共同標記犬群、餵食點、人犬衝突與生態敏感區", correct: true },
  { id: "count", label: "固定方法追蹤犬數、幼犬、絕育率與新犬移入", correct: true },
  { id: "care", label: "餵養同步負責清潔、健康觀察、絕育與異常通報", correct: true },
  { id: "safety", label: "在高風險場域調整餵食位置與時間，避免聚集和衝突", correct: true },
  { id: "cooperate", label: "讓居民、餵養者、動保與野保人員共同檢討成效", correct: true },
  { id: "secret", label: "為免爭議，隱藏犬群與幼犬資訊", correct: false },
  { id: "full", label: "只要餵飽，犬就不會繁殖或追逐野生動物", correct: false },
  { id: "blame", label: "把問題全歸咎於餵養者，就不必處理放養與棄養", correct: false }
] as const satisfies readonly EvidenceItem[];

const VIDEO_QUESTIONS = [
  {
    question: "影片用簡短口號鼓勵絕育。看完後最重要的補充是？",
    options: ["只要熱區完成一次絕育行動，短期內沒有幼犬就代表族群問題已解決", "絕育要有足夠覆蓋、持續追蹤，並同時降低放養、棄養與未管理繁殖", "絕育可以優先取代登記與飼主追蹤，等數量下降後再補做"],
    answer: 1,
    note: "宣導影片適合建立起點，但政策成效仍取決於執行規模、時間、場域與其他來源是否持續。"
  },
  {
    question: "如果學生只記得『未絕育的犬不好』，哪裡需要修正？",
    options: ["應把責任放回人與制度，不把管理失敗變成對犬隻的道德標籤", "為了讓宣導更有力，可以暫時用責怪犬隻的說法促使居民行動", "若不責怪所有犬隻，改把繁殖責任集中在母犬身上會較精確"],
    answer: 0,
    note: "犬隻不理解登記、放養或繁殖政策。生命教育要區分動物本身與人類應負的管理責任。"
  }
] as const satisfies readonly QuizItem[];

const DATA_FILES = [
  { id: "verify", label: "向收容與獸醫端確認目前絕育、健康與醫療安排是否已更新", correct: true },
  { id: "pregnancy", label: "是否懷孕、孕期與生殖健康需要專業檢查", correct: true },
  { id: "history", label: "詢問犬隻來源、照護與繁殖史，但保留未知與紀錄限制", correct: true },
  { id: "system", label: "把個案放回登記、絕育、移入與收容流程理解", correct: true },
  { id: "date", label: "保留資料快照日，避免把可能已變動的欄位當成永久狀態", correct: true },
  { id: "assume", label: "看到母犬且未絕育，就直接宣布牠正在懷孕", correct: false },
  { id: "blame", label: "把遊蕩犬數量問題歸咎於這一隻母犬", correct: false },
  { id: "cause", label: "用單筆個案證明未絕育是牠留在收容所的原因", correct: false }
] as const satisfies readonly EvidenceItem[];

type QuizKey = "systemAnswers" | "evidenceAnswers" | "sourceAnswers" | "feedingAnswers" | "videoAnswers";
type FileKey = "systemFiles" | "evidenceFiles" | "sourceFiles" | "communityFiles" | "dataFiles";

type SavedWeekFour = {
  contentVersion: number;
  stage: number;
  furthest: number;
  hearts: Record<number, number>;
  systemAnswers: Record<number, number>;
  systemFiles: string[];
  evidenceAnswers: Record<number, number>;
  evidenceFiles: string[];
  sourceAnswers: Record<number, number>;
  sourceFiles: string[];
  treasureAnswers: Record<string, string>;
  treasureCompleted: boolean;
  feedingAnswers: Record<number, number>;
  communityFiles: string[];
  videoAnswers: Record<number, number>;
  videoReflection: string;
  dataFiles: string[];
  dataReflection: string;
  boundaryConfirmed: boolean;
  completed: boolean;
};

const DEFAULT_HEARTS: Record<number, number> = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
const EMPTY: SavedWeekFour = {
  contentVersion: CONTENT_VERSION,
  stage: 0,
  furthest: 0,
  hearts: DEFAULT_HEARTS,
  systemAnswers: {},
  systemFiles: [],
  evidenceAnswers: {},
  evidenceFiles: [],
  sourceAnswers: {},
  sourceFiles: [],
  treasureAnswers: {},
  treasureCompleted: false,
  feedingAnswers: {},
  communityFiles: [],
  videoAnswers: {},
  videoReflection: "",
  dataFiles: [],
  dataReflection: "",
  boundaryConfirmed: false,
  completed: false
};

type Orders = {
  system: number[][];
  systemFiles: string[];
  evidence: number[][];
  evidenceFiles: string[];
  source: number[][];
  sourceFiles: string[];
  feeding: number[][];
  communityFiles: string[];
  video: number[][];
  dataFiles: string[];
};

function shuffled<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  if (result.length > 1 && result.every((value, index) => value === values[index])) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

function visitShuffle<T>(values: readonly T[], key: string): T[] {
  let result = shuffled(values);
  try {
    const storageKey = `shelterlab-choice-order-${key}`;
    const previous = sessionStorage.getItem(storageKey);
    if (result.length > 1 && previous === JSON.stringify(result)) result = [...result.slice(1), result[0]];
    sessionStorage.setItem(storageKey, JSON.stringify(result));
  } catch {}
  return result;
}

function optionOrder(items: readonly QuizItem[]) {
  return items.map((item) => item.options.map((_, index) => index));
}

const INITIAL_ORDERS: Orders = {
  system: optionOrder(SYSTEM_QUESTIONS),
  systemFiles: SYSTEM_FILES.map((item) => item.id),
  evidence: optionOrder(EVIDENCE_QUESTIONS),
  evidenceFiles: EVIDENCE_FILES.map((item) => item.id),
  source: optionOrder(SOURCE_QUESTIONS),
  sourceFiles: SOURCE_FILES.map((item) => item.id),
  feeding: optionOrder(FEEDING_QUESTIONS),
  communityFiles: COMMUNITY_FILES.map((item) => item.id),
  video: optionOrder(VIDEO_QUESTIONS),
  dataFiles: DATA_FILES.map((item) => item.id)
};

function quizComplete(items: readonly QuizItem[], answers: Record<number, number>) {
  return items.every((item, index) => answers[index] === item.answer);
}

function QuizBlock({ items, answers, order, onAnswer }: {
  items: readonly QuizItem[];
  answers: Record<number, number>;
  order: number[][];
  onAnswer: (index: number, option: number) => void;
}) {
  return (
    <div className={styles.quizGrid}>
      {items.map((item, index) => (
        <fieldset className={styles.quizCard} key={item.question}>
          <legend><span>{index + 1}</span>{item.question}</legend>
          <div className={styles.choiceGrid}>
            {order[index].map((optionIndex) => (
              <button
                type="button"
                key={item.options[optionIndex]}
                aria-pressed={answers[index] === optionIndex}
                className={answers[index] === optionIndex ? styles.correctChoice : ""}
                onClick={() => onAnswer(index, optionIndex)}
              >
                {item.options[optionIndex]}
              </button>
            ))}
          </div>
          {answers[index] === item.answer && <p className={styles.answerNote}><strong>判讀重點</strong>{item.note}</p>}
        </fieldset>
      ))}
    </div>
  );
}

export default function WeekFourExperience() {
  const router = useRouter();
  const { completeWeek, progress } = useStudentLearningProgress();
  const [saved, setSaved] = useState<SavedWeekFour>(EMPTY);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [orders, setOrders] = useState<Orders>(INITIAL_ORDERS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedWeekFour>;
        if (parsed.contentVersion === CONTENT_VERSION) {
          setSaved({ ...EMPTY, ...parsed, hearts: { ...DEFAULT_HEARTS, ...(parsed.hearts ?? {}) }, treasureAnswers: parsed.treasureAnswers ?? {}, treasureCompleted: parsed.treasureCompleted ?? Boolean(parsed.completed) });
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
  }, [ready, saved]);

  useEffect(() => {
    if (!ready) return;
    setOrders((current) => {
      if (saved.stage === 0) return { ...current, system: SYSTEM_QUESTIONS.map((item, index) => visitShuffle(item.options.map((_, option) => option), `week4-system-${index}`)), systemFiles: visitShuffle(SYSTEM_FILES.map((item) => item.id), "week4-system-files") };
      if (saved.stage === 1) return { ...current, evidence: EVIDENCE_QUESTIONS.map((item, index) => visitShuffle(item.options.map((_, option) => option), `week4-evidence-${index}`)), evidenceFiles: visitShuffle(EVIDENCE_FILES.map((item) => item.id), "week4-evidence-files") };
      if (saved.stage === 2) return { ...current, source: SOURCE_QUESTIONS.map((item, index) => visitShuffle(item.options.map((_, option) => option), `week4-source-${index}`)), sourceFiles: visitShuffle(SOURCE_FILES.map((item) => item.id), "week4-source-files") };
      if (saved.stage === 3) return { ...current, feeding: FEEDING_QUESTIONS.map((item, index) => visitShuffle(item.options.map((_, option) => option), `week4-feeding-${index}`)), communityFiles: visitShuffle(COMMUNITY_FILES.map((item) => item.id), "week4-community-files") };
      if (saved.stage === 4) return { ...current, video: VIDEO_QUESTIONS.map((item, index) => visitShuffle(item.options.map((_, option) => option), `week4-video-${index}`)) };
      return { ...current, dataFiles: visitShuffle(DATA_FILES.map((item) => item.id), "week4-data-files") };
    });
  }, [ready, saved.stage]);

  const correctCount = (ids: string[], choices: readonly EvidenceItem[]) => ids.filter((id) => choices.find((item) => item.id === id)?.correct).length;
  const systemCount = correctCount(saved.systemFiles, SYSTEM_FILES);
  const evidenceCount = correctCount(saved.evidenceFiles, EVIDENCE_FILES);
  const sourceCount = correctCount(saved.sourceFiles, SOURCE_FILES);
  const communityCount = correctCount(saved.communityFiles, COMMUNITY_FILES);
  const dataCount = correctCount(saved.dataFiles, DATA_FILES);
  const treasureUnlocked = isTreasureUnlockedForWeek(4, progress.completedWeeks, progress.unlockedTools);
  const canContinue = [
    quizComplete(SYSTEM_QUESTIONS, saved.systemAnswers) && systemCount === 5,
    quizComplete(EVIDENCE_QUESTIONS, saved.evidenceAnswers) && evidenceCount === 5,
    quizComplete(SOURCE_QUESTIONS, saved.sourceAnswers) && sourceCount === 5 && saved.treasureCompleted,
    quizComplete(FEEDING_QUESTIONS, saved.feedingAnswers) && communityCount === 5,
    quizComplete(VIDEO_QUESTIONS, saved.videoAnswers) && saved.videoReflection.trim().length > 0,
    dataCount >= 4 && saved.dataReflection.trim().length > 0 && saved.boundaryConfirmed
  ][saved.stage];

  const resetStage = (current: SavedWeekFour, stage: number): SavedWeekFour => {
    if (stage === 0) return { ...current, systemAnswers: {}, systemFiles: [] };
    if (stage === 1) return { ...current, evidenceAnswers: {}, evidenceFiles: [] };
    if (stage === 2) return { ...current, sourceAnswers: {}, sourceFiles: [], treasureAnswers: {}, treasureCompleted: false };
    if (stage === 3) return { ...current, feedingAnswers: {}, communityFiles: [] };
    if (stage === 4) return { ...current, videoAnswers: {} };
    return { ...current, dataFiles: [] };
  };

  const loseHeart = (stage: number, body: string) => {
    const remaining = saved.hearts[stage] ?? 3;
    setSaved((current) => {
      if (remaining <= 1) {
        const reset = resetStage(current, stage);
        return { ...reset, hearts: { ...reset.hearts, [stage]: 3 } };
      }
      return { ...current, hearts: { ...current.hearts, [stage]: remaining - 1 } };
    });
    setFeedback({
      kind: "wrong",
      title: remaining <= 1 ? "愛心用完，這一環節已重新整理" : "這個判斷還需要再想想",
      body
    });
  };

  const answerQuiz = (stage: number, items: readonly QuizItem[], key: QuizKey, index: number, option: number) => {
    if (saved[key][index] === items[index].answer) return;
    if (option !== items[index].answer) {
      loseHeart(stage, items[index].note);
      return;
    }
    setSaved((current) => ({ ...current, [key]: { ...current[key], [index]: option } }));
    setFeedback({ kind: "correct", title: "判讀正確", body: items[index].note });
  };

  const fileEvidence = (stage: number, key: FileKey, id: string, correct: boolean, choices: readonly EvidenceItem[]) => {
    if (saved[key].includes(id)) return;
    if (!correct) {
      loseHeart(stage, "這張卡把複雜問題簡化成單一原因，或超出了資料能支持的範圍。請回到上方教學區，找出有對象、方法與追蹤方式的做法。");
      return;
    }
    setSaved((current) => ({ ...current, [key]: [...current[key], id] }));
    setFeedback({ kind: "correct", title: "已加入系統檔案", body: `這項做法有明確的觀察或行動內容。請繼續找齊 ${choices.filter((item) => item.correct).length} 項。` });
  };

  const assignTreasure = (item: TreasureItem, categoryId: string, correct: boolean) => {
    if (!correct) {
      loseHeart(2, item.explanation);
      return;
    }
    setSaved((current) => {
      const treasureAnswers = { ...current.treasureAnswers, [item.id]: categoryId };
      return { ...current, treasureAnswers, treasureCompleted: LABEL_FOLDER_ITEMS.every((choice) => Boolean(treasureAnswers[choice.id])) };
    });
    setFeedback({ kind: "correct", title: "分類解碼完成一筆", body: item.explanation });
  };

  const next = () => {
    if (!canContinue) return;
    setFeedback(null);
    if (saved.stage < 5) {
      const stage = saved.stage + 1;
      setSaved((current) => ({ ...current, stage, furthest: Math.max(current.furthest, stage) }));
      scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    completeWeek(4);
    setSaved((current) => ({ ...current, completed: true }));
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const replay = () => {
    setSaved({ ...EMPTY, hearts: { ...DEFAULT_HEARTS } });
    setFeedback(null);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const taskHeading = (number: string, title: string, description: string, progress: string) => (
    <div className={styles.taskHeading}>
      <span>{number}</span>
      <div><h3>{title}</h3><p>{description}</p></div>
      <strong>{progress}</strong>
    </div>
  );

  const fileGrid = (order: string[], choices: readonly EvidenceItem[], key: FileKey, stage: number) => (
    <div className={styles.fileGrid}>
      {order.map((id) => choices.find((item) => item.id === id)!).map((item) => (
        <button
          type="button"
          key={item.id}
          aria-pressed={saved[key].includes(item.id)}
          className={saved[key].includes(item.id) ? styles.fileSelected : ""}
          onClick={() => fileEvidence(stage, key, item.id, item.correct, choices)}
        >
          {saved[key].includes(item.id) ? "✓ " : "＋ "}{item.label}
        </button>
      ))}
    </div>
  );

  if (!ready) return <main className={base.experience}><div className={base.loading}>正在整理第四週的源頭線索…</div></main>;

  if (saved.completed) {
    return (
      <main className={base.experience}>
        <div className={base.shell}>
          <nav className={base.topbar}><Link href="/student" className={base.backLink}>← 返回六週地圖</Link><span className={base.weekStamp}>WEEK 04 · 已完成</span></nav>
          <article className={`${base.stagePaper} ${styles.completionPaper}`}>
            <section className={styles.completionHero}>
              <p>第四週任務完成</p>
              <h1>獲得新的探究工具</h1>
              <div className={styles.rewardStage}><span aria-hidden="true" /><img src={REWARD.image} alt={REWARD.name} /></div>
              <h2>{REWARD.name}</h2>
              <p>你已學會把遊蕩犬放回流入、繁殖與流出的系統，看見動保、生態、居民與第一線工作者共同面對的限制，也知道科學不是一句口號，而是可檢查的方法與證據界線。</p>
              <div className={styles.completionActions}>
                <button type="button" className={base.paperButton} onClick={() => router.push("/student")}>收下寶物，回到地圖</button>
                <button type="button" className={base.secondaryButton} onClick={replay}>重新體驗第四週</button>
              </div>
            </section>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className={base.experience}>
      <div className={base.shell}>
        <nav className={base.topbar}><Link href="/student" className={base.backLink}>← 返回六週地圖</Link><span className={base.weekStamp}>WEEK 04 · 數量與源頭</span></nav>
        <header className={base.hero}>
          <p className={base.eyebrow}>第四週</p>
          <h1>{COPY.unitTitle}</h1>
          <p className={base.heroQuestion}>同樣想讓遊蕩犬減少，為什麼不同人會提出不同答案？先把立場放下，沿著犬隻與人的路徑找證據。</p>
        </header>
        <div className={base.progressWrap}><div className={base.progressTop}><span>學習進度</span><span>{saved.stage + 1} / 6</span></div><div className={base.progressTrack}><div className={base.progressFill} style={{ width: `${((saved.stage + 1) / 6) * 100}%` }} /></div></div>

        <article className={`${base.stagePaper} ${styles.weekPaper}`}>
          <div className={styles.stageRail} aria-label="第四週學習環節">
            {STAGES.map((label, index) => (
              <button
                type="button"
                key={label}
                disabled={index > saved.furthest}
                className={index === saved.stage ? styles.stageActive : index < saved.stage ? styles.stageDone : ""}
                onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: index })); }}
              >
                <b>{index < saved.stage ? "✓" : index + 1}</b><small>{label}</small>
              </button>
            ))}
          </div>
          <header className={base.stageHeader}><p className={base.stageLabel}>{saved.stage === 5 ? COPY.stages[saved.stage].label : `環節 ${saved.stage + 1} · ${STAGES[saved.stage]}`}</p><h2 className={base.stageTitle}>{COPY.stages[saved.stage].title}</h2></header>
          <div className={styles.statusDock} role="status" aria-live="polite">
            <div><span>挑戰愛心</span><strong>{"♥".repeat(saved.hearts[saved.stage] ?? 3)}{"♡".repeat(3 - (saved.hearts[saved.stage] ?? 3))}</strong></div>
            {feedback && <section className={feedback.kind === "correct" ? styles.feedbackCorrect : styles.feedbackWrong}><b>{feedback.title}</b><p>{feedback.body}</p></section>}
          </div>

          {saved.stage === 0 && <section>
            <div className={styles.storyBanner}><small>系統任務：收容所為什麼一直有新犬進來？</small><h3>要改善街頭流浪犬問題，不能只靠末端認養，還要從源頭減少新的流入</h3><p>收容與街頭的犬隻數量，同時受到家犬走失、放養、棄養、任意分送、未管理繁殖、捕捉、返還、認養與死亡影響。只盯著其中一條路徑，很容易把努力做在末端，卻沒看見新的犬仍持續進入。</p></div>
            <div className={styles.relationshipMap}><article><span>流入與新生</span><h3>數量增加</h3><p>走失、放養、棄養、捕捉，以及家犬或街頭犬未管理繁殖。</p></article><b>⇄</b><article><span>返還與安置</span><h3>數量減少</h3><p>尋回飼主、認養、合適轉置，以及源頭減少新的個體進入。</p></article></div>
            <div className={styles.challengeGrid}>
              <article><span>存量</span><h3>此刻有多少犬？</h3><p>街頭推估與收容所在所量，都是某個時間點的狀態。</p></article>
              <article><span>流量</span><h3>這段時間怎麼變？</h3><p>入所、出所與新生速度，決定存量會上升、下降或持平。</p></article>
              <article><span>113 年官方推估</span><h3>141,584 隻</h3><p>比 111 年下降 11.34%，但官方說差距尚未達統計顯著。</p></article>
              <article><span>重要界線</span><h3>全國趨勢不等於每個地區</h3><p>不同縣市、熱區與調查時間，可能呈現不同問題與優先順序。</p></article>
            </div>
            {taskHeading("任務一", "看懂犬隻存量如何改變", "四題都要區分存量、流量與可能來源；答案每次進入會重新排序。", `${Object.keys(saved.systemAnswers).length} / 4`)}
            <div className={styles.taskPanel}><QuizBlock items={SYSTEM_QUESTIONS} answers={saved.systemAnswers} order={orders.system} onAnswer={(index, option) => answerQuiz(0, SYSTEM_QUESTIONS, "systemAnswers", index, option)} /></div>
            {taskHeading("任務二", "找出五項可持續追蹤的資料", "從八張卡找出五項能用來觀察數量如何變化的資料。", `${systemCount} / 5`)}
            <div className={styles.taskPanel}>{fileGrid(orders.systemFiles, SYSTEM_FILES, "systemFiles", 0)}</div>
            <div className={styles.sourceRow}><a href="https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001599" target="_blank" rel="noreferrer">農業部：113 年全國遊蕩犬推估 ↗</a></div>
          </section>}

          {saved.stage === 1 && <section>
            <div className={styles.storyBanner}><small>科學不是結論貼紙，而是一套可被檢查的方法</small><h3>絕育政策的成效，取決於覆蓋率、持續時間與是否阻止新犬移入</h3><p>動保與生態保育可能共享「減少遊蕩犬」的目標，卻選擇不同成功指標：有人關心減量速度，有人關心野生動物風險，也有人關心動物福利與政策可執行性。比較研究時，要先看問題、條件與限制。</p></div>
            <div className={styles.moneyLayers}>
              <article><span>先問目標</span><h3>減量或歸零？</h3><p>降低通報、降低繁殖與完全歸零是不同指標。</p></article>
              <article><span>再看強度</span><h3>做了多少？</h3><p>絕育比例、涵蓋區域與持續年數會改變成效。</p></article>
              <article><span>檢查移入</span><h3>新犬從哪來？</h3><p>放養、棄養、分送與跨區移動可能抵銷介入。</p></article>
              <article><span>核對量尺</span><h3>怎麼測量？</h3><p>通報、捕捉與族群調查回答的問題並不相同。</p></article>
              <article><span>回到現場</span><h3>人會怎麼做？</h3><p>人力、經費、民眾配合與信任會影響政策落地。</p></article>
            </div>
            {taskHeading("任務一", "辨認證據說到哪裡", "不要用一篇文章或一個地區替全部場域下結論。", `${Object.keys(saved.evidenceAnswers).length} / 4`)}
            <div className={styles.taskPanel}><QuizBlock items={EVIDENCE_QUESTIONS} answers={saved.evidenceAnswers} order={orders.evidence} onAnswer={(index, option) => answerQuiz(1, EVIDENCE_QUESTIONS, "evidenceAnswers", index, option)} /></div>
            {taskHeading("任務二", "組成可檢查的政策評估", "找出五項讓不同立場能用同一套資料對話的條件。", `${evidenceCount} / 5`)}
            <div className={styles.taskPanel}>{fileGrid(orders.evidenceFiles, EVIDENCE_FILES, "evidenceFiles", 1)}</div>
            <div className={styles.sourceRow}><a href="https://opinion.cw.com.tw/blog/profile/52/article/15711" target="_blank" rel="noreferrer">觀點投書：流浪犬政策爭議解析 ↗</a><a href="https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-solutions" target="_blank" rel="noreferrer">《報導者》：被遺忘的源頭管理 ↗</a></div>
          </section>}

          {saved.stage === 2 && <section>
            <div className={styles.storyBanner}><small>被忽略的水龍頭：有人照顧，卻未被妥善管理的家犬</small><h3>街頭上的犬，不一定一開始就是「沒有主人」</h3><p>家犬可能因走失、放養、任意分送、棄養或未絕育繁殖而進入遊蕩系統。若只處理已經在街頭的犬，卻沒有讓家犬可追蹤、不放養並管理繁殖，新的個體仍可能持續出現。</p></div>
            <div className={styles.dayCompare}>
              <section><small>容易被看見的末端</small><h3>街頭犬與收容壓力</h3><ol><li><b>捕捉</b><span>犬隻離開原場域</span></li><li><b>收容</b><span>空間、人力與醫療承受壓力</span></li><li><b>認養</b><span>個體獲得新家庭</span></li><li><b>回置</b><span>回到場域並持續管理</span></li></ol></section>
              <section><small>較不容易被看見的源頭</small><h3>家犬如何進入系統</h3><ol><li><b>放養</b><span>有照護者卻可自由遊蕩</span></li><li><b>繁殖</b><span>未絕育犬生下幼犬</span></li><li><b>分送</b><span>犬隻沿人際網絡跨區移動</span></li><li><b>棄養</b><span>照護關係中斷並失去追蹤</span></li></ol></section>
            </div>
            <div className={styles.updateNote}><strong>別把責任推給犬</strong><p>「未絕育母犬」不是道德錯誤；登記、活動管理、醫療與繁殖決策都是人類與制度的責任。源頭治理是在犬隻進入風險以前提供規範、協助與追蹤。</p></div>
            <TreasureWorkspace
              week={4}
              objective="把來源判讀需要的資料分層，避免用外觀或未證實說法替犬隻決定身世。"
              instruction="使用分類解碼夾整理每一項資料：它能直接確認什麼、只能提供什麼線索，以及還缺少哪些紀錄或訪查。"
              categories={LABEL_FOLDER_CATEGORIES}
              items={LABEL_FOLDER_ITEMS}
              assignments={saved.treasureAnswers}
              completed={saved.treasureCompleted}
              unlocked={treasureUnlocked}
              onAssign={assignTreasure}
            />
            {taskHeading("任務一", "沿著人與犬的路徑追查", "每題都要找出責任在哪個環節中斷，而不是猜犬的身分。", `${Object.keys(saved.sourceAnswers).length} / 4`)}
            <div className={styles.taskPanel}><QuizBlock items={SOURCE_QUESTIONS} answers={saved.sourceAnswers} order={orders.source} onAnswer={(index, option) => answerQuiz(2, SOURCE_QUESTIONS, "sourceAnswers", index, option)} /></div>
            {taskHeading("任務二", "關掉新的流入", "從八張卡找出五項能讓家犬責任可追蹤、可執行的措施。", `${sourceCount} / 5`)}
            <div className={styles.taskPanel}>{fileGrid(orders.sourceFiles, SOURCE_FILES, "sourceFiles", 2)}</div>
            <div className={styles.sourceRow}><a href="https://animal.moa.gov.tw/Frontend/News/Detail/N0000000002234" target="_blank" rel="noreferrer">農業部：115 年遊蕩犬社區管理計畫 ↗</a></div>
          </section>}

          {saved.stage === 3 && <section>
            <div className={styles.storyBanner}><small>善意需要方法，管理需要理解人性</small><h3>餵一餐可以回應眼前飢餓，卻不等於犬群已被負責任地照護</h3><p>餵養者看見犬隻挨餓的痛苦；居民可能擔心追車、咬傷與髒亂；保育人員關心野生動物與棲地。這些擔憂可以同時真實。課程的任務不是貼上「有愛／沒愛」標籤，而是建立可追蹤的責任照護。</p></div>
            <div className={styles.challengeGrid}>
              <article><span>犬隻福利</span><h3>飢餓之外還有什麼？</h3><p>健康、絕育、疾病、受傷、幼犬、天候與穩定照護都需要處理。</p></article>
              <article><span>居民安全</span><h3>誰承擔衝突？</h3><p>群聚、追車、吠叫與攻擊風險需要通報、調整與持續追蹤。</p></article>
              <article><span>生態影響</span><h3>吃飽不等於不追逐</h3><p>狩獵與追逐不只由飢餓驅動；敏感棲地需要更審慎的管理。</p></article>
              <article><span>人的行為</span><h3>只有禁止能落地嗎？</h3><p>若不理解長期餵養者的動機與提供替代方案，政策可能難以合作。</p></article>
            </div>
            <div className={styles.budgetMethod}><small>責任照護循環</small><h3>清查 → 絕育與醫療 → 風險調整 → 清潔 → 追蹤 → 共同檢討</h3><p>真正的目標不是讓餵食點永遠存在，而是在保障動物福利的同時，逐步降低犬群與衝突。</p></div>
            {taskHeading("任務一", "在價值衝突中找可行方案", "同時看動物、居民、野生動物與執行者，不用一刀切回答複雜問題。", `${Object.keys(saved.feedingAnswers).length} / 4`)}
            <div className={styles.taskPanel}><QuizBlock items={FEEDING_QUESTIONS} answers={saved.feedingAnswers} order={orders.feeding} onAnswer={(index, option) => answerQuiz(3, FEEDING_QUESTIONS, "feedingAnswers", index, option)} /></div>
            {taskHeading("任務二", "建立社區共存協議", "從八張卡找出五項能被執行、紀錄與檢討的安排。", `${communityCount} / 5`)}
            <div className={styles.taskPanel}>{fileGrid(orders.communityFiles, COMMUNITY_FILES, "communityFiles", 3)}</div>
          </section>}

          {saved.stage === 4 && <section>
            <div className={styles.videoLayout}>
              <article><small>農業部動物保護宣導影片</small><h3>絕育：生不完，你好亂</h3><p>先到官方收錄的影片觀看，再回來檢查：影片說清楚了什麼？哪些執行條件仍需要前四關的系統資料補足？</p><a href="https://youtu.be/j9IH5ydH-fc?feature=shared" target="_blank" rel="noreferrer">前往官方影片觀看 ↗</a><small>使用外部連結開啟，避免影片來源拒絕嵌入。</small></article>
              <div><h3>影片後判讀</h3><QuizBlock items={VIDEO_QUESTIONS} answers={saved.videoAnswers} order={orders.video} onAnswer={(index, option) => answerQuiz(4, VIDEO_QUESTIONS, "videoAnswers", index, option)} /></div>
            </div>
            <label className={styles.reflection}><span>如果要把這支宣導片改成一個真正能評估的社區計畫，你會補上哪兩個執行條件與哪一個成效指標？</span><textarea value={saved.videoReflection} onChange={(event) => setSaved((current) => ({ ...current, videoReflection: event.target.value }))} placeholder="例如：補上熱區母犬絕育覆蓋率與家犬放養訪查；每半年用相同方法追蹤幼犬與新犬移入……" /><small>{saved.videoReflection.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label>
            <div className={styles.sourceRow}><a href="https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E" target="_blank" rel="noreferrer">農業部動物保護影音與教材專區 ↗</a></div>
          </section>}

          {saved.stage === 5 && <section>
            <div className={styles.storyBanner}><small>農業部「動物認領養」開放資料 · 快照日 {RECORD.snapshotDate}</small><h3>「母、未絕育」是兩個欄位，不是「正在懷孕」的診斷</h3><p>資料可以確認這筆公開紀錄的性別與當時登載的絕育狀態；它沒有懷孕欄位，也沒有完整生殖史。好的源頭治理從查證開始，不把一隻犬變成問題的代罪羔羊。</p><a href="https://data.gov.tw/dataset/85903" target="_blank" rel="noreferrer">查看政府原始資料集 ↗</a></div>
            <div className={base.dataStatSummary}><article><small>公犬</small><strong>2,999 筆</strong><span>留所天數中位數 696 天</span></article><article><small>母犬</small><strong>2,689 筆</strong><span>留所天數中位數 603 天</span></article><article><small>性別未註明</small><strong>14 筆</strong><span>留所天數中位數 194 天</span></article></div>
            <p className={styles.dataScopeNote}>統計只描述同一份資料快照中的性別標示與留所天數；樣本數差異很大，也沒有繁殖史，不能解讀為性別或絕育狀態造成留所結果。</p>
            <div className={styles.caseFile}><div className={styles.casePhoto}><img src={RECORD.image} alt={`政府公開資料個案 ${RECORD.subId}`} loading="lazy" referrerPolicy="no-referrer" /></div><div><small>公開個案 · {RECORD.subId}</small><h3>先讀欄位，再提出問題</h3><div className={styles.caseFields}>{RECORD.displayFields.map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div><p>{RECORD.evidenceBoundary}</p></div></div>
            <div className={styles.dataBoundary}><section><small>資料可以直接支持</small><h3>母犬，資料標示未絕育</h3><p>也能閱讀年齡分類、體型、毛色、品種標示與目前場域等公開欄位。</p></section><section><small>資料不能直接支持</small><h3>牠正在懷孕或曾繁殖</h3><p>懷孕、健康、繁殖史及進入收容原因，都需要其他紀錄或專業檢查。</p></section></div>
            {taskHeading("任務一", "把風險轉成查證問題", "從八張卡找出至少四項能補足資料界線的證據。", `${dataCount} / 至少 4`)}
            <div className={styles.taskPanel}>{fileGrid(orders.dataFiles, DATA_FILES, "dataFiles", 5)}</div>
            <label className={styles.reflection}><span>生命教育深思：當社會想快速找到一個『造成流浪犬的原因』時，為什麼容易把責任投射到母犬、餵養者或某一群人？你會如何設計一個既減少新生、又不把生命當成問題本身的方案？</span><textarea value={saved.dataReflection} onChange={(event) => setSaved((current) => ({ ...current, dataReflection: event.target.value }))} placeholder="請用系統路徑、證據界線、人的責任與動物福利回答……" /><small>{saved.dataReflection.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label>
            <label className={styles.boundaryCheck}><input type="checkbox" checked={saved.boundaryConfirmed} onChange={(event) => setSaved((current) => ({ ...current, boundaryConfirmed: event.target.checked }))} /><span>我知道「母、未絕育」可能隱含繁殖風險，但不能證明牠已經造成社會流浪犬繁衍的問題。</span></label>
          </section>}

          <div className={base.buttonRow}>
            <button type="button" className={base.secondaryButton} disabled={saved.stage === 0} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: Math.max(0, current.stage - 1) })); }}>← 上一環節</button>
            <button type="button" className={base.paperButton} disabled={!canContinue} onClick={next}>{saved.stage === 5 ? "完成第四週並解鎖工具" : "完成任務，前往下一環節 →"}</button>
          </div>
        </article>
      </div>
    </main>
  );
}
