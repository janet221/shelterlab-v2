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

const STORAGE_KEY = "shelterlab-week2-v3";
const CONTENT_VERSION = 1;
const COPY = getStudentCourseTitles(2);
const RECORD = getOpenDataCourseCase(2);
const REWARD = getLearningTool(2);
const STAGES = ["法律與資格", "時間與備援", "經濟能力", "情緒與家庭", "影音思考", "資料深思"] as const;

const LAW_QUESTIONS = [
  { question: "17 歲的小安想認養犬隻，法律上的飼主應如何安排？", options: ["由小安直接登記為飼主，家人只需在必要時提供協助", "由法定代理人或監護人成為飼主，小安可以共同照顧", "由收容所同意小安帶回家後，就不需要成年人承擔責任"], answer: 1, note: "自然人飼主以成年人為限；未成年人飼養動物時，由法定代理人或監護人成為法律上的飼主。這不否定青少年的照顧參與，而是要求成年人共同承擔。" },
  { question: "犬貓完成晶片植入與寵物登記，最完整的理解是什麼？", options: ["晶片只是在犬貓走失時顯示名字，和飼主責任沒有關係", "建立可追溯身分與飼主資料，走失、轉讓及責任查找時都重要", "完成第一次登記後，轉讓、遺失或死亡時都不必更新資料"], answer: 1, note: "晶片是身分標識，登記資料還需要在取得、轉讓、遺失、死亡等狀況依法辦理；截至 2026 年，犬貓皆屬應辦理登記的寵物。" },
  { question: "犬隻生病，但隔天要段考。哪個判斷符合法律與照護責任？", options: ["先完成段考再觀察，因為學生的重要行程可以暫時延後醫療", "飼主仍須提供必要醫療，應啟動家人或備援照護安排", "先持續供水並讓犬隻休息，這樣就能取代獸醫的必要判斷"], answer: 1, note: "動物保護法要求飼主對受傷或罹病動物給予必要醫療。忙碌不是免除責任的理由，因此認養前就要安排備援。" },
  { question: "如果家庭後來不想繼續飼養，以下何者正確？", options: ["可帶到較少人車的郊外安置，讓犬隻自行尋找新的生活範圍", "可在收容所關門後留在入口，等工作人員隔天發現並接手", "不得任意棄養，必須尋求合法、可追蹤的安置與主管機關協助"], answer: 2, note: "任意野放或棄置都不是安置。困難發生時應及早尋求原認養單位、地方動保機關或合法協助管道。" }
] as const;

const LAW_FILES = [
  { id: "adult", label: "未成年人飼養時，由法定代理人或監護人擔任法律上的飼主", correct: true },
  { id: "care", label: "提供乾淨食物、二十四小時充足飲水與安全生活環境", correct: true },
  { id: "medical", label: "受傷或罹病時給予必要醫療", correct: true },
  { id: "register", label: "犬貓依法植入晶片並辦理寵物登記與後續異動", correct: true },
  { id: "sterilize", label: "犬貓應絕育；若符合免絕育或繁殖需求，依法申報並管理", correct: true },
  { id: "no-abandon", label: "不得任意棄養，遇到困難要使用合法安置與求助管道", correct: true },
  { id: "minor-alone", label: "只要學生很喜歡，未成年人就能單獨承擔全部法律責任", correct: false },
  { id: "chip-care", label: "植入晶片後，飲水、醫療與活動需求就不再是法律責任", correct: false }
] as const;

const EVIDENCE_LENS_CATEGORIES = [
  { id: "official", label: "法律或正式資料明確支持" },
  { id: "course", label: "課程根據法律整理出的責任" },
  { id: "insufficient", label: "不能只靠這項資料判定" },
  { id: "verify", label: "還需要進一步查證" }
] as const;

const EVIDENCE_LENS_ITEMS = [
  { id: "food-water", label: "飼主必須提供適當食物與乾淨飲水。", correctCategory: "official", explanation: "《動物保護法》第 5 條要求飼主提供適當、乾淨且無害的食物，以及 24 小時充足、乾淨的飲水；這是正式規範直接支持的責任。" },
  { id: "liking", label: "只要喜歡動物，就代表已具備領養條件。", correctCategory: "insufficient", explanation: "喜歡能成為起點，卻不能證明家庭已有成年飼主、時間、經費、空間與備援；需要另外盤點真實條件。" },
  { id: "medical", label: "動物受傷或生病時，飼主應提供必要醫療。", correctCategory: "official", explanation: "必要醫療是《動物保護法》第 5 條明列的飼主責任，不能因考試、工作或費用壓力自行取消。" },
  { id: "minor", label: "未成年人可以完全自行承擔所有法律責任。", correctCategory: "insufficient", explanation: "這項說法不成立。自然人飼主須為成年人；未成年人可以參與照顧，但仍須由法定代理人或監護人承擔法律上的飼主責任。" },
  { id: "environment", label: "飼主應提供安全、通風且溫度適當的生活環境。", correctCategory: "course", explanation: "這是課程依飼主須提供安全生活環境、避免傷害與滿足動物基本需求所整理出的可執行照護責任。" }
] as const satisfies readonly TreasureItem[];

const TIME_QUESTIONS = [
  { question: "平日課表排得下散步，就能證明家庭有長期照護能力嗎？", options: ["可以，只要學生平日能排出固定時段，其他情況再臨時協調即可", "不能，還要測試段考、晚歸、生病、下雨與主要照護者臨時缺席", "可以，把週間不足的活動集中到週末補足，就能維持長期照護"], answer: 1, note: "照護不是只挑順利的一天來排。真正的時間能力，要看固定工作與突發狀況是否都有具體人員接手。" },
  { question: "犬隻半夜嘔吐，主要照護者隔天有重要考試。最負責任的下一步是什麼？", options: ["先查是否有緊急警訊，聯絡獸醫並啟動能送醫、觀察的成年人備援", "先讓犬隻禁食到考試結束；若精神仍不好，再請家人協助處理", "記錄嘔吐次數並讓犬隻獨自休息，避免影響全家隔天的行程"], answer: 0, note: "先判斷醫療急迫性，再啟動成年人支援。責任不是要求學生獨自犧牲一切，而是家庭事前準備能接手的系統。" },
  { question: "安排散步時，只寫『有空的人去』有什麼問題？", options: ["這種寫法保留最大的彈性，家庭成員看到需要時自然會主動接手", "缺少主要負責者、時段與未完成時的備援，容易讓責任落空", "家庭人數夠多就能分散工作，不必指定誰負責或確認是否完成"], answer: 1, note: "『大家都會幫』常等於沒有人確定負責。清楚的時間、主要人員與備援者，才能把承諾變成可執行安排。" },
  { question: "犬隻老年後活動方式和醫療頻率改變，這提醒我們什麼？", options: ["幼年期建立好作息後，成年與老年都應維持原安排，避免犬隻不適應", "時間安排要能隨生命階段重新協商，不是一次排完就永遠有效", "老犬活動量下降後可取消散步與陪伴，把時間集中用在餵食和看診"], answer: 1, note: "幼犬、成年犬、老犬的需求可能不同。責任盤點需要定期更新，而不是只完成認養當下的行程表。" }
] as const;

const TIME_ACTIONS = [
  { id: "daily", label: "每天明確安排餵食、飲水檢查、活動、清潔與陪伴時段", correct: true },
  { id: "exam", label: "段考、社團或補習前，先確認誰能接手固定照護", correct: true },
  { id: "illness", label: "建立生病時的觀察、聯絡獸醫、交通與陪診流程", correct: true },
  { id: "backup", label: "主要照護者與至少一名可實際接手的成年人備援", correct: true },
  { id: "review", label: "升學、搬家、家庭作息或犬隻生命階段改變時重新檢查", correct: true },
  { id: "weekend", label: "週間太忙就全部延到週末，犬隻會自己適應", correct: false },
  { id: "mood", label: "只有心情好、天氣好時才需要散步和陪伴", correct: false },
  { id: "promise", label: "寫下『我一定會做到』就不需要指定備援者", correct: false }
] as const;

const MONEY_QUESTIONS = [
  { question: "為什麼課程不直接給所有家庭一個固定的『每月養狗價目』？", options: ["因為費用會隨時改變、完全無法估計，所以家庭不必在認養前做任何預算準備", "因為體型、健康、地區、醫院與生活方式會改變支出，但仍應分項查價與預留", "因為長期支出主要只有飼料，其他醫療、用品、交通與照護費用都可以等發生後再處理"], answer: 1, note: "不使用假精準數字，不等於不用規劃。負責任的做法是列出支出種類、向所在地專業單位查價，並準備波動與突發情況。" },
  { question: "晶片登記、絕育或依法申報，應放在哪一種預算觀念裡？", options: ["可有可無的娛樂費", "認養前就要查明的法定與預防性責任", "等犬隻走失或繁殖後再說"], answer: 1, note: "法定與預防性項目不應被擠到最後。實際程序與費用要向所在地寵物登記站、主管機關及獸醫院確認。" },
  { question: "家庭付得起日常飼料，是否就代表經濟能力足夠？", options: ["可以；只要每月能穩定購買飼料，其他用品、交通與醫療通常都能省略或延後", "不一定，還要考慮預防醫療、用品、交通、行為支持、緊急醫療與替代照護", "可以；犬隻目前看起來健康，就表示未來不太會出現慢性病、意外或老年照護支出"], answer: 1, note: "經濟能力不是只看今天買不買得起，而是能否在牠生病、老化或生活改變時仍維持基本福利。" },
  { question: "遇到預期外醫療支出時，哪個安排最可靠？", options: ["完全依賴臨時網路募款", "事前準備緊急預備、保險或可求助資源，並知道誰能做醫療決策", "先停止必要醫療，等有空再處理"], answer: 1, note: "不同家庭可以採取不同工具，但必須事先知道可動用的資源、決策者與不足時的求助管道。" }
] as const;

const MONEY_FILES = [
  { id: "start", label: "一次性準備：晶片登記、適當用品、環境安全調整", correct: true },
  { id: "daily", label: "持續支出：合適飲食、清潔用品與日常照護", correct: true },
  { id: "prevent", label: "預防與法定項目：疫苗、健康檢查、絕育或依法申報", correct: true },
  { id: "support", label: "依個體需要：訓練、行為諮詢、交通與替代照護", correct: true },
  { id: "emergency", label: "不確定支出：突發疾病、受傷、慢性病與老年照護", correct: true },
  { id: "looks", label: "先把預算用在造型與配件，醫療可以有剩再準備", correct: false },
  { id: "healthy", label: "目前健康就不必預留任何醫療或老年照護資源", correct: false },
  { id: "parents", label: "未成年學生不用討論費用，反正家長最後一定會支付", correct: false }
] as const;

const EMOTION_QUESTIONS = [
  { question: "心情不好時找犬隻陪伴，本身就是不健康的依賴嗎？", options: ["是；任何情緒支持都不應來自動物，否則人犬之間就不可能形成健康的陪伴關係", "不一定；陪伴可以有益，但不能把所有情緒調節與人際支持都壓在動物身上", "不是；只要有寵物陪伴，就可以逐步退出家人、朋友與其他支持關係，把需求都交給犬隻"], answer: 1, note: "人與動物可以互相陪伴；健康界線是同時保留人際支持、自我照顧，並尊重動物也有休息、退開和被理解的需要。" },
  { question: "犬隻今天一直靠近哥哥，學生因此生氣、把牠關起來。問題在哪裡？", options: ["犬隻應該公平分配對每個人的喜愛", "把自己的失落變成對犬隻的控制，忽略牠不是用來證明誰更被愛的工具", "只要沒有受傷，就不影響動物福利"], answer: 1, note: "『牠最愛誰』的競爭可能反映青少年的敏感與自我認同困境。情緒需要被說出與處理，不應轉成控制或懲罰動物。" },
  { question: "家人提醒照護工作沒完成，學生回答『牠是我的狗，不要管』。比較好的理解是什麼？", options: ["個人喜歡不等於可以排除家庭協商與動物需求", "只要學生認養，其他家人就沒有任何責任或發言權", "寵物只需要情感，不需要穩定分工"], answer: 0, note: "寵物進入家庭後會改變時間、空間與資源。家庭系統需要共同協商，同時也不能把責任模糊成『反正家人會做』。" },
  { question: "學生因在學校受挫而對犬隻大吼。下一步最適合的是什麼？", options: ["犬隻應該承受主人的情緒", "先停止讓犬隻承受壓力、拉開安全距離，再向可信任的人尋求支持並修復互動", "只要事後餵零食，就不用處理原因"], answer: 1, note: "情緒本身可以被理解，但不能把動物當成承受或發洩的對象。安全、求助與修復，才是雙向關懷。" }
] as const;

const FAMILY_FILES = [
  { id: "support", label: "寵物可以提供陪伴，但同時保留家人、朋友、老師或專業支持", correct: true },
  { id: "signals", label: "學習辨認犬隻想休息、害怕或不想互動的訊號", correct: true },
  { id: "speak", label: "嫉妒、失落或分工不滿時，說出需要並召開家庭協商", correct: true },
  { id: "safety", label: "情緒升高時先確保人犬安全，不向動物吼叫、控制或發洩", correct: true },
  { id: "review", label: "定期檢查照護是否落空，以及家庭與動物的福利是否同時被看見", correct: true },
  { id: "only", label: "讓犬隻成為唯一能說心事的對象，其他關係都可以退出", correct: false },
  { id: "compete", label: "用餵食或限制互動來證明犬隻最愛自己", correct: false },
  { id: "vent", label: "只要沒有造成外傷，把壓力發洩在犬隻身上沒有關係", correct: false }
] as const;

const VIDEO_QUESTIONS = [
  { question: "影片讓你想立刻帶犬隻回家時，第一個負責任的動作是什麼？", options: ["趁感動最強時先做出承諾，法律、時間與費用可以等犬隻回家後再和家人慢慢協調", "把感動轉成法律、時間、費用、家庭與備援的查核", "先詢問犬隻的外表、名字與照片是否符合期待，其他照護資料可在認養完成後再補"], answer: 1, note: "同情與喜歡可以是起點，但不能代替責任盤點。真正的承諾必須在平常與困難時都能執行。" },
  { question: "家庭目前尚未形成共識，兩年後又可能搬家。哪個決策比較負責？", options: ["先把犬隻帶回家建立感情，家庭意見、搬家限制與後續安排可以等問題真的發生時再處理", "補足條件後再決定，或暫緩飼養並用其他方式幫助動物", "先不要告訴家人，由學生自己偷偷照顧；只要沒有被發現，就能避免家庭衝突"], answer: 1, note: "現在不養、先準備或改用志工與宣導方式參與，都可能是負責任的選擇；判斷重點是生命是否得到穩定照護。" }
] as const;

const DATA_FILES = [
  { id: "space", label: "居住規約、室內動線與安全空間是否適合這隻犬", correct: true },
  { id: "activity", label: "向照護人員確認個體活動量、散步方式與行為需求", correct: true },
  { id: "transport", label: "家中是否有人能安全牽引、搬運與安排就醫交通", correct: true },
  { id: "health", label: "向獸醫確認健康、體重、關節與後續醫療需求", correct: true },
  { id: "family", label: "主要照護、費用與緊急備援是否有人承擔", correct: true },
  { id: "all-big", label: "只看『中型』欄位，就判定所有中型犬都有相同的空間與活動需求", correct: false },
  { id: "photo", label: "只看照片估計個性、活動量與未來醫療費用", correct: false },
  { id: "cause", label: "單筆紀錄足以證明體型造成牠留在收容所", correct: false }
] as const;

type QuizItem = { readonly question: string; readonly options: readonly string[]; readonly answer: number; readonly note: string };
type Feedback = { kind: "correct" | "wrong"; title: string; body: string } | null;
type SavedWeekTwo = { contentVersion: number; stage: number; furthest: number; hearts: Record<number, number>; lawAnswers: Record<number, number>; lawFiles: string[]; treasureAnswers: Record<string, string>; treasureCompleted: boolean; timeAnswers: Record<number, number>; timeFiles: string[]; moneyAnswers: Record<number, number>; moneyFiles: string[]; emotionAnswers: Record<number, number>; familyFiles: string[]; videoAnswers: Record<number, number>; videoReflection: string; dataFiles: string[]; dataReflection: string; boundaryConfirmed: boolean; completed: boolean };
const DEFAULT_HEARTS: Record<number, number> = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
const EMPTY: SavedWeekTwo = { contentVersion: CONTENT_VERSION, stage: 0, furthest: 0, hearts: DEFAULT_HEARTS, lawAnswers: {}, lawFiles: [], treasureAnswers: {}, treasureCompleted: false, timeAnswers: {}, timeFiles: [], moneyAnswers: {}, moneyFiles: [], emotionAnswers: {}, familyFiles: [], videoAnswers: {}, videoReflection: "", dataFiles: [], dataReflection: "", boundaryConfirmed: false, completed: false };

function shuffled<T>(values: readonly T[]): T[] { const result = [...values]; for (let index = result.length - 1; index > 0; index -= 1) { const target = Math.floor(Math.random() * (index + 1)); [result[index], result[target]] = [result[target], result[index]]; } if (result.length > 1 && result.every((value, index) => value === values[index])) [result[0], result[1]] = [result[1], result[0]]; return result; }
function visitShuffle<T>(values: readonly T[], key: string): T[] { let result = shuffled(values); try { const storageKey = `shelterlab-choice-order-${key}`; const previous = sessionStorage.getItem(storageKey); if (result.length > 1 && previous === JSON.stringify(result)) result = [...result.slice(1), result[0]]; sessionStorage.setItem(storageKey, JSON.stringify(result)); } catch {} return result; }
type Orders = { law: number[][]; lawFiles: string[]; time: number[][]; timeFiles: string[]; money: number[][]; moneyFiles: string[]; emotion: number[][]; familyFiles: string[]; video: number[][]; dataFiles: string[] };
const INITIAL_ORDERS: Orders = { law: LAW_QUESTIONS.map((item) => item.options.map((_, index) => index)), lawFiles: LAW_FILES.map((item) => item.id), time: TIME_QUESTIONS.map((item) => item.options.map((_, index) => index)), timeFiles: TIME_ACTIONS.map((item) => item.id), money: MONEY_QUESTIONS.map((item) => item.options.map((_, index) => index)), moneyFiles: MONEY_FILES.map((item) => item.id), emotion: EMOTION_QUESTIONS.map((item) => item.options.map((_, index) => index)), familyFiles: FAMILY_FILES.map((item) => item.id), video: VIDEO_QUESTIONS.map((item) => item.options.map((_, index) => index)), dataFiles: DATA_FILES.map((item) => item.id) };
function quizComplete(items: readonly QuizItem[], answers: Record<number, number>) { return items.every((item, index) => answers[index] === item.answer); }

function QuizBlock({ items, answers, order, onAnswer }: { items: readonly QuizItem[]; answers: Record<number, number>; order: number[][]; onAnswer: (index: number, option: number) => void }) {
  return <div className={styles.quizGrid}>{items.map((item, index) => <fieldset className={styles.quizCard} key={item.question}><legend><span>{index + 1}</span>{item.question}</legend><div className={styles.choiceGrid}>{order[index].map((optionIndex) => <button type="button" key={item.options[optionIndex]} aria-pressed={answers[index] === optionIndex} className={answers[index] === optionIndex ? styles.correctChoice : ""} onClick={() => onAnswer(index, optionIndex)}>{item.options[optionIndex]}</button>)}</div>{answers[index] === item.answer && <p className={styles.answerNote}><strong>判讀重點</strong>{item.note}</p>}</fieldset>)}</div>;
}

export default function WeekTwoExperience() {
  const router = useRouter();
  const { completeWeek, progress } = useStudentLearningProgress();
  const [saved, setSaved] = useState<SavedWeekTwo>(EMPTY);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [orders, setOrders] = useState<Orders>(INITIAL_ORDERS);

  useEffect(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw) as Partial<SavedWeekTwo>; if (parsed.contentVersion === CONTENT_VERSION) setSaved({ ...EMPTY, ...parsed, hearts: { ...DEFAULT_HEARTS, ...(parsed.hearts ?? {}) }, treasureAnswers: parsed.treasureAnswers ?? {}, treasureCompleted: parsed.treasureCompleted ?? Boolean(parsed.completed) }); } } catch {} setReady(true); }, []);
  useEffect(() => { if (!ready) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {} }, [ready, saved]);
  useEffect(() => { if (!ready) return; setOrders((current) => { if (saved.stage === 0) return { ...current, law: LAW_QUESTIONS.map((item, i) => visitShuffle(item.options.map((_, j) => j), `week2-law-${i}`)), lawFiles: visitShuffle(LAW_FILES.map((item) => item.id), "week2-law-files") }; if (saved.stage === 1) return { ...current, time: TIME_QUESTIONS.map((item, i) => visitShuffle(item.options.map((_, j) => j), `week2-time-${i}`)), timeFiles: visitShuffle(TIME_ACTIONS.map((item) => item.id), "week2-time-files") }; if (saved.stage === 2) return { ...current, money: MONEY_QUESTIONS.map((item, i) => visitShuffle(item.options.map((_, j) => j), `week2-money-${i}`)), moneyFiles: visitShuffle(MONEY_FILES.map((item) => item.id), "week2-money-files") }; if (saved.stage === 3) return { ...current, emotion: EMOTION_QUESTIONS.map((item, i) => visitShuffle(item.options.map((_, j) => j), `week2-emotion-${i}`)), familyFiles: visitShuffle(FAMILY_FILES.map((item) => item.id), "week2-family-files") }; if (saved.stage === 4) return { ...current, video: VIDEO_QUESTIONS.map((item, i) => visitShuffle(item.options.map((_, j) => j), `week2-video-${i}`)) }; return { ...current, dataFiles: visitShuffle(DATA_FILES.map((item) => item.id), "week2-data-files") }; }); }, [ready, saved.stage]);

  const correctCount = (ids: string[], choices: readonly { id: string; correct: boolean }[]) => ids.filter((id) => choices.find((item) => item.id === id)?.correct).length;
  const lawCount = correctCount(saved.lawFiles, LAW_FILES), timeCount = correctCount(saved.timeFiles, TIME_ACTIONS), moneyCount = correctCount(saved.moneyFiles, MONEY_FILES), familyCount = correctCount(saved.familyFiles, FAMILY_FILES), dataCount = correctCount(saved.dataFiles, DATA_FILES);
  const treasureUnlocked = isTreasureUnlockedForWeek(2, progress.completedWeeks, progress.unlockedTools);
  const canContinue = [quizComplete(LAW_QUESTIONS, saved.lawAnswers) && lawCount === 6 && saved.treasureCompleted, quizComplete(TIME_QUESTIONS, saved.timeAnswers) && timeCount === 5, quizComplete(MONEY_QUESTIONS, saved.moneyAnswers) && moneyCount === 5, quizComplete(EMOTION_QUESTIONS, saved.emotionAnswers) && familyCount === 5, quizComplete(VIDEO_QUESTIONS, saved.videoAnswers) && saved.videoReflection.trim().length > 0, dataCount >= 4 && saved.dataReflection.trim().length > 0 && saved.boundaryConfirmed][saved.stage];

  const loseHeart = (stage: number, body: string, reset: (current: SavedWeekTwo) => SavedWeekTwo) => { setSaved((current) => { const next = Math.max(0, (current.hearts[stage] ?? 3) - 1); if (next === 0) { const cleared = reset(current); setFeedback({ kind: "wrong", title: "愛心用完了，這一關重新開始", body: `${body} 請回到上方教學區重新找線索。` }); return { ...cleared, hearts: { ...cleared.hearts, [stage]: 3 } }; } setFeedback({ kind: "wrong", title: "這個判斷還需要再想想", body }); return { ...current, hearts: { ...current.hearts, [stage]: next } }; }); };
  const answerQuiz = (stage: number, items: readonly QuizItem[], key: "lawAnswers" | "timeAnswers" | "moneyAnswers" | "emotionAnswers" | "videoAnswers", index: number, option: number, resetFiles?: keyof Pick<SavedWeekTwo, "lawFiles" | "timeFiles" | "moneyFiles" | "familyFiles">) => { if (option === items[index].answer) { setSaved((current) => ({ ...current, [key]: { ...current[key], [index]: option } })); setFeedback({ kind: "correct", title: "判讀正確", body: items[index].note }); return; } loseHeart(stage, items[index].note, (current) => ({ ...current, [key]: {}, ...(resetFiles ? { [resetFiles]: [] } : {}) })); };
  const fileEvidence = (stage: number, key: "lawFiles" | "timeFiles" | "moneyFiles" | "familyFiles" | "dataFiles", id: string, correct: boolean, choices: readonly { id: string; correct: boolean }[], resetAnswers?: keyof Pick<SavedWeekTwo, "lawAnswers" | "timeAnswers" | "moneyAnswers" | "emotionAnswers">) => { if (!correct) { const hints = ["法律責任需要以現行規定與可執行照護為基礎。", "時間能力要包含固定工作、突發事件和具名備援。", "經濟能力要涵蓋全生命期與不確定風險。", "健康依附要同時照顧人的情緒、家庭關係與動物福利。", "", "體型只能提出查證問題，不能替個體或家庭直接下結論。"]; loseHeart(stage, hints[stage], (current) => ({ ...current, [key]: [], ...(resetAnswers ? { [resetAnswers]: {} } : {}) })); return; } setSaved((current) => current[key].includes(id) ? current : { ...current, [key]: [...current[key], id] }); setFeedback({ kind: "correct", title: "已收進責任檔案", body: `這項安排有可執行內容。請繼續找齊 ${choices.filter((item) => item.correct).length} 項必要證據。` }); };
  const assignTreasure = (item: TreasureItem, categoryId: string, correct: boolean) => {
    if (!correct) {
      loseHeart(0, item.explanation, (current) => ({ ...current, lawAnswers: {}, lawFiles: [], treasureAnswers: {}, treasureCompleted: false }));
      return;
    }
    setSaved((current) => {
      const treasureAnswers = { ...current.treasureAnswers, [item.id]: categoryId };
      return { ...current, treasureAnswers, treasureCompleted: EVIDENCE_LENS_ITEMS.every((choice) => Boolean(treasureAnswers[choice.id])) };
    });
    setFeedback({ kind: "correct", title: "放大鏡找到證據界線", body: item.explanation });
  };
  const next = () => { if (!canContinue) return; setFeedback(null); if (saved.stage < 5) { const stage = saved.stage + 1; setSaved((current) => ({ ...current, stage, furthest: Math.max(current.furthest, stage) })); scrollTo({ top: 0, behavior: "smooth" }); } else { completeWeek(2); setSaved((current) => ({ ...current, completed: true })); scrollTo({ top: 0, behavior: "smooth" }); } };
  const replay = () => { setSaved({ ...EMPTY, hearts: { ...DEFAULT_HEARTS } }); setFeedback(null); scrollTo({ top: 0, behavior: "smooth" }); };

  if (!ready) return <main className={base.experience}><div className={base.loading}>正在整理第二週的責任檔案…</div></main>;
  if (saved.completed) return <main className={base.experience}><div className={base.shell}><nav className={base.topbar}><Link href="/student" className={base.backLink}>← 返回六週地圖</Link><span className={base.weekStamp}>WEEK 02 · 已完成</span></nav><article className={`${base.stagePaper} ${styles.completionPaper}`}><section className={styles.completionHero}><p>第二週任務完成</p><h1>獲得新的探究工具</h1><div className={styles.rewardStage}><span aria-hidden="true" /><img src={REWARD.image} alt={REWARD.name} /></div><h2>{REWARD.name}</h2><p>你已把喜歡轉成法律、時間、經濟、家庭與情緒界線的具體盤點，也知道「現在不養」有時是對生命更負責的選擇。</p><div className={styles.completionActions}><button type="button" className={base.paperButton} onClick={() => router.push("/student")}>收下寶物，回到地圖</button><button type="button" className={base.secondaryButton} onClick={replay}>重新體驗第二週</button></div></section></article></div></main>;

  const taskHeading = (number: string, title: string, description: string, progress: string) => <div className={styles.taskHeading}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><strong>{progress}</strong></div>;
  const fileGrid = (order: string[], choices: readonly { id: string; label: string; correct: boolean }[], key: "lawFiles" | "timeFiles" | "moneyFiles" | "familyFiles" | "dataFiles", stage: number, resetAnswers?: keyof Pick<SavedWeekTwo, "lawAnswers" | "timeAnswers" | "moneyAnswers" | "emotionAnswers">) => <div className={styles.fileGrid}>{order.map((id) => choices.find((item) => item.id === id)!).map((item) => <button type="button" key={item.id} aria-pressed={saved[key].includes(item.id)} className={saved[key].includes(item.id) ? styles.fileSelected : ""} onClick={() => fileEvidence(stage, key, item.id, item.correct, choices, resetAnswers)}>{saved[key].includes(item.id) ? "✓ " : "＋ "}{item.label}</button>)}</div>;

  return <main className={base.experience}><div className={base.shell}><nav className={base.topbar}><Link href="/student" className={base.backLink}>← 返回六週地圖</Link><span className={base.weekStamp}>WEEK 02 · 承諾與責任</span></nav><header className={base.hero}><p className={base.eyebrow}>第二週</p><h1>{COPY.unitTitle}</h1><p className={base.heroQuestion}>喜歡可以是起點；法律、時間、經濟、家庭與長期備援，才讓喜歡成為不離不棄的承諾。</p></header><div className={base.progressWrap}><div className={base.progressTop}><span>學習進度</span><span>{saved.stage + 1} / 6</span></div><div className={base.progressTrack}><div className={base.progressFill} style={{ width: `${((saved.stage + 1) / 6) * 100}%` }} /></div></div>
    <article className={`${base.stagePaper} ${styles.weekPaper}`}><div className={styles.stageRail} aria-label="第二週學習環節">{STAGES.map((label, index) => <button type="button" key={label} disabled={index > saved.furthest} className={index === saved.stage ? styles.stageActive : index < saved.stage ? styles.stageDone : ""} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: index })); }}><b>{index < saved.stage ? "✓" : index + 1}</b><small>{label}</small></button>)}</div><header className={base.stageHeader}><p className={base.stageLabel}>{saved.stage === 5 ? COPY.stages[saved.stage].label : `環節 ${saved.stage + 1} · ${STAGES[saved.stage]}`}</p><h2 className={base.stageTitle}>{COPY.stages[saved.stage].title}</h2></header><div className={styles.statusDock} role="status" aria-live="polite"><div><span>挑戰愛心</span><strong>{"♥".repeat(saved.hearts[saved.stage] ?? 3)}{"♡".repeat(3 - (saved.hearts[saved.stage] ?? 3))}</strong></div>{feedback && <section className={feedback.kind === "correct" ? styles.feedbackCorrect : styles.feedbackWrong}><b>{feedback.title}</b><p>{feedback.body}</p></section>}</div>

      {saved.stage === 0 && <section><div className={styles.storyBanner}><small>情境：一隻狗對你說「帶我回家吧！」</small><h3>17 歲的小安可以照顧牠，但不能獨自成為法律上的飼主</h3><p>未成年人對犬隻的喜歡與照顧可以很真實；法律仍要求法定代理人或監護人成為飼主，代表家庭必須在認養前共同理解並承擔責任。</p></div><div className={styles.lessonGrid}>
        <article><span>01</span><h3>誰是飼主？</h3><p>自然人飼主須為成年人；未成年人飼養時，由法定代理人或監護人擔任飼主。</p></article><article><span>02</span><h3>每天怎麼照顧？</h3><p>乾淨食物、二十四小時充足飲水、安全環境、活動、防疫與避免傷害，都是持續責任。</p></article><article><span>03</span><h3>生病怎麼辦？</h3><p>受傷或罹病時要給予必要醫療；考試、上班或費用壓力不會讓需求自動消失。</p></article><article><span>04</span><h3>身分與源頭管理</h3><p>截至 2026 年，犬貓皆須依法植入晶片並辦理寵物登記；取得、轉讓、遺失與死亡等資料也要更新。</p></article><article><span>05</span><h3>絕育不是口號</h3><p>犬貓原則上應絕育；若符合免絕育或繁殖需求，需依法申報並提出管理說明。</p></article><article><span>06</span><h3>困難不等於棄養</h3><p>不得把動物野放或任意棄置。照護出現危機時，要及早使用合法、可追蹤的求助與安置管道。</p></article></div><div className={styles.updateNote}><strong>資料更新提醒</strong><p>較早文章曾寫中央僅指定犬需登記；農業部後續已將貓納入，並自 2026 年 1 月 1 日起進入強制登記階段。本課程依目前規定呈現。</p></div>
        <TreasureWorkspace week={2} objective="檢查法律責任的說法，分清楚正式依據、課程整理與仍需查證的資訊。" instruction="從工具背包取出證據放大鏡，檢查以下說法是否真的具有法律或正式資料依據。" categories={EVIDENCE_LENS_CATEGORIES} items={EVIDENCE_LENS_ITEMS} assignments={saved.treasureAnswers} completed={saved.treasureCompleted} unlocked={treasureUnlocked} onAssign={assignTreasure} />
        {taskHeading("任務一", "把法律用在真實情境", "四題都要依上方教學內容判斷；答案每次進入會重新排序。", `${Object.keys(saved.lawAnswers).length} / 4`)}<div className={styles.taskPanel}><QuizBlock items={LAW_QUESTIONS} answers={saved.lawAnswers} order={orders.law} onAnswer={(index, option) => answerQuiz(0, LAW_QUESTIONS, "lawAnswers", index, option, "lawFiles")} /></div>{taskHeading("任務二", "建立法律責任檔案", "從八張卡找出六項真正的責任，不把喜歡或晶片當成免責理由。", `${lawCount} / 6`)}<div className={styles.taskPanel}>{fileGrid(orders.lawFiles, LAW_FILES, "lawFiles", 0, "lawAnswers")}</div><div className={styles.sourceRow}><a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=M0060027" target="_blank" rel="noreferrer">全國法規資料庫：動物保護法 ↗</a><a href="https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000867?parentID=Tab0000003" target="_blank" rel="noreferrer">農業部：犬貓寵物登記新制 ↗</a><a href="https://www.legis-pedia.com/article/environment-hygiene/996" target="_blank" rel="noreferrer">延伸閱讀：飼主法律義務 ↗</a></div></section>}

      {saved.stage === 1 && <section><div className={styles.storyBanner}><small>正常高中生日程 VS. 養犬後的日程</small><h3>不是「每天有一小時」就夠，而是每一天都有人接住需要</h3><p>犬隻不會因段考、社團、補習、下雨或家人晚歸而暫停飲水、排泄、活動與醫療需求。時間能力要同時包含固定工作、突發狀況與長期變動。</p></div><div className={styles.dayCompare}><section><small>原本的一天</small><h3>上學、通勤、社團、作業、睡眠</h3><ol><li><b>07:00</b><span>出門上學</span></li><li><b>17:30</b><span>社團或補習</span></li><li><b>20:30</b><span>回家寫作業</span></li><li><b>23:30</b><span>準備睡覺</span></li></ol></section><section><small>承諾之後</small><h3>照護必須進入原本已經很滿的生活</h3><ol><li><b>每天</b><span>餵食、飲水、排泄與狀態觀察</span></li><li><b>固定</b><span>散步活動、清潔、訓練與陪伴</span></li><li><b>突發</b><span>嘔吐、受傷、看診或夜間觀察</span></li><li><b>長期</b><span>段考、升學、搬家與犬隻老化</span></li></ol></section></div><div className={styles.surpriseCase}><span>突發事件</span><div><h3>段考前一晚，犬隻反覆嘔吐</h3><p>這不是要學生在考試與犬隻之間獨自犧牲，而是檢查家庭有沒有能判斷急迫性、聯絡獸醫、送醫與接續觀察的成年人。</p></div></div>{taskHeading("任務一", "測試時間安排的韌性", "不要只看順利的平日；每題都要把突發與生命階段放進判斷。", `${Object.keys(saved.timeAnswers).length} / 4`)}<div className={styles.taskPanel}><QuizBlock items={TIME_QUESTIONS} answers={saved.timeAnswers} order={orders.time} onAnswer={(index, option) => answerQuiz(1, TIME_QUESTIONS, "timeAnswers", index, option, "timeFiles")} /></div>{taskHeading("任務二", "完成可執行的時間計畫", "從八張卡找出五項有時段、有負責者、有備援的安排。", `${timeCount} / 5`)}<div className={styles.taskPanel}>{fileGrid(orders.timeFiles, TIME_ACTIONS, "timeFiles", 1, "timeAnswers")}</div></section>}

      {saved.stage === 2 && <section><div className={styles.storyBanner}><small>費用不是一次付清，而是跨越整個生命</small><h3>經濟能力不是「買得起」，而是需要發生時仍能照顧</h3><p>本課程不提供一個假裝適用所有家庭的固定月費。體型、年齡、健康、所在地與醫療需求都會改變金額；你要學會分項查價、預留波動並建立緊急備援。</p></div><div className={styles.moneyLayers}><article><span>開始前</span><h3>環境與身分</h3><p>晶片登記、適當用品、居家安全調整與初次健康評估。</p></article><article><span>每一天</span><h3>持續照護</h3><p>合適飲食、清潔、消耗用品、活動與交通。</p></article><article><span>可預期</span><h3>預防與法定責任</h3><p>疫苗、健康檢查、絕育或依法申報，依所在地與個體向專業單位查詢。</p></article><article><span>不確定</span><h3>疾病與意外</h3><p>急診、檢查、手術、慢性病、復健與替代照護可能突然出現。</p></article><article><span>生命後段</span><h3>老化與告別</h3><p>行動支持、較密集醫療、生活調整，以及負責任的終老安排。</p></article></div><div className={styles.budgetMethod}><small>家庭查價法</small><h3>列項目 → 問所在地專業單位 → 記錄區間 → 設定預備 → 定期更新</h3><p>如果某個必要項目只能靠「到時候再說」，它就是尚未補足的條件，而不是已經完成的預算。</p></div>{taskHeading("任務一", "辨認經濟能力的邊界", "重點不是背價格，而是知道哪些需求不能因為沒預料到就消失。", `${Object.keys(saved.moneyAnswers).length} / 4`)}<div className={styles.taskPanel}><QuizBlock items={MONEY_QUESTIONS} answers={saved.moneyAnswers} order={orders.money} onAnswer={(index, option) => answerQuiz(2, MONEY_QUESTIONS, "moneyAnswers", index, option, "moneyFiles")} /></div>{taskHeading("任務二", "建立全生命期費用檔案", "從八張卡找出五類必須查價與預留的資源。", `${moneyCount} / 5`)}<div className={styles.taskPanel}>{fileGrid(orders.moneyFiles, MONEY_FILES, "moneyFiles", 2, "moneyAnswers")}</div></section>}

      {saved.stage === 3 && <section><div className={styles.storyBanner}><small>雙向關懷，不是單向索取</small><h3>牠可以陪伴你，但不應成為唯一的情緒出口</h3><p>青少年可能從寵物獲得陪伴、責任感與同理心；同時也可能遇到照護鬆懈、情緒依賴過度、家庭競爭與現實負擔。健康關係要同時看見人、家庭與動物的需要。</p></div><div className={styles.relationshipMap}><article><span>獲得支持</span><h3>陪伴與安全感</h3><p>心情不好時，動物可能帶來安定、連結與被需要的感受。</p></article><b>⇄</b><article><span>回應生命</span><h3>照顧牠的需要</h3><p>真正的雙向關懷，也包括尊重休息、害怕、生病與不想互動的訊號。</p></article></div><div className={styles.challengeGrid}><article><span>挑戰 1</span><h3>責任感不足</h3><p>熱情下降或生活忙碌時，照護可能落到父母身上，甚至影響動物福利。</p></article><article><span>挑戰 2</span><h3>情緒依賴過度</h3><p>若生活重心全部放在寵物身上，其他關係、自我照顧與求助能力可能縮小。</p></article><article><span>挑戰 3</span><h3>家庭矛盾與競爭</h3><p>「牠最愛誰」可能放大嫉妒或失落；犬隻不應被拿來證明人的價值。</p></article><article><span>挑戰 4</span><h3>現實負擔</h3><p>費用、意外行為、疾病、老化與死亡，會同時考驗青少年與父母。</p></article></div><div className={styles.boundaryLesson}><strong>情緒可以被理解，動物不能成為承受情緒的工具</strong><p>當壓力升高時，先停止可能傷害或驚嚇動物的互動，向可信任的人求助，再回來修復關係。這也是生命教育的一部分。</p></div>{taskHeading("任務一", "辨認陪伴與依賴的界線", "用家庭系統與動物福利一起判斷，不把責任全推給孩子或寵物。", `${Object.keys(saved.emotionAnswers).length} / 4`)}<div className={styles.taskPanel}><QuizBlock items={EMOTION_QUESTIONS} answers={saved.emotionAnswers} order={orders.emotion} onAnswer={(index, option) => answerQuiz(3, EMOTION_QUESTIONS, "emotionAnswers", index, option, "familyFiles")} /></div>{taskHeading("任務二", "建立雙向關懷協議", "從八張卡找出五項能同時保護人、家庭與動物的安排。", `${familyCount} / 5`)}<div className={styles.taskPanel}>{fileGrid(orders.familyFiles, FAMILY_FILES, "familyFiles", 3, "emotionAnswers")}</div><div className={styles.sourceRow}><a href="https://www.lca.org.tw/education/29/21187" target="_blank" rel="noreferrer">閱讀資料：家庭中的寵物與青少年 ↗</a></div></section>}

      {saved.stage === 4 && <section><div className={styles.videoLayout}><article><small>愛學網影音任務</small><h3>一隻狗：「帶我回家吧！」</h3><p>先到官方頁面觀看「兒少論壇：愛護飼養的動物」，再把心動放進前四關的責任盤點：誰是飼主、誰有時間、費用怎麼準備、家庭關係如何維持。</p><a href="https://stv.naer.edu.tw/watch/257479" target="_blank" rel="noreferrer">前往愛學網官方頁面觀看 ↗</a><small>使用官方外部連結，避免 iframe 被來源網站拒絕存取。</small></article><div><h3>影片後判讀</h3><QuizBlock items={VIDEO_QUESTIONS} answers={saved.videoAnswers} order={orders.video} onAnswer={(index, option) => answerQuiz(4, VIDEO_QUESTIONS, "videoAnswers", index, option)} /></div></div><label className={styles.reflection}><span>如果你現在很喜歡影片中的犬隻，請寫出「帶回家以前」最需要和家庭確認的兩件事，以及條件不足時你願意採取的替代行動。</span><textarea value={saved.videoReflection} onChange={(event) => setSaved((current) => ({ ...current, videoReflection: event.target.value }))} placeholder="例如：先確認家長是否願意成為飼主，以及段考或生病時誰能接手……"/><small>{saved.videoReflection.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label></section>}

      {saved.stage === 5 && <section><div className={styles.storyBanner}><small>農業部「動物認領養」開放資料 · 快照日 {RECORD.snapshotDate}</small><h3>認養前，先確認體型相關的照護需求</h3><p>體型可以提醒我們查詢空間、牽引、運輸與醫療操作，但不能直接告訴我們犬隻的活動量、性格、健康需求或家庭適配。</p><a href="https://data.gov.tw/dataset/85903" target="_blank" rel="noreferrer">查看政府原始資料集 ↗</a></div><div className={base.dataStatSummary}><article><small>中型犬｜公開待認養占比 61.8%</small><strong>3,521 筆</strong><span>體型別認養率未提供 · 留所天數中位數 906 天</span></article><article><small>大型犬｜公開待認養占比 24.7%</small><strong>1,408 筆</strong><span>體型別認養率未提供 · 留所天數中位數 367.5 天</span></article><article><small>小型犬｜公開待認養占比 13.6%</small><strong>773 筆</strong><span>體型別認養率未提供 · 留所天數中位數 347 天</span></article></div><p className={styles.dataScopeNote}>全國收容處理統計有整體認領養率，但沒有按體型拆分；「動物認領養」清單則是公開待認養個案，不能用來計算各體型認養率。卡片因此在標題呈現各體型於本次快照的公開待認養占比，並明確標示這不是認養率。</p><div className={styles.caseFile}><div className={styles.casePhoto}><img src={RECORD.image} alt={`政府公開資料個案 ${RECORD.subId}`} loading="lazy" referrerPolicy="no-referrer" /></div><div><small>公開個案 · {RECORD.subId}</small><h3>先讀欄位，再提出問題</h3><div className={styles.caseFields}>{RECORD.displayFields.map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div><p>{RECORD.evidenceBoundary}</p></div></div><div className={styles.dataBoundary}><section><small>資料可以直接支持</small><h3>這筆紀錄標示為中型犬</h3><p>也能閱讀年齡、性別、毛色、品種標示與目前場域等已公開欄位。</p></section><section><small>資料不能直接支持</small><h3>中型造成牠留所較久</h3><p>單筆紀錄不能證明因果，也不能代表所有中型犬的需求與認養結果。</p></section></div>{taskHeading("任務一", "把體型線索轉成查證問題", "從八張卡找出至少四項應回到個體、家庭或專業人員確認的資料。", `${dataCount} / 至少 4`)}<div className={styles.taskPanel}>{fileGrid(orders.dataFiles, DATA_FILES, "dataFiles", 5)}</div><label className={styles.reflection}><span>生命教育深思：如果家庭只看見「中型」就認為需求一定相同，可能忽略了什麼？負責任的評估又應如何兼顧家庭限制與個體生命？</span><textarea value={saved.dataReflection} onChange={(event) => setSaved((current) => ({ ...current, dataReflection: event.target.value }))} placeholder="請用資料界線、家庭條件與個體需求回答……"/><small>{saved.dataReflection.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label><label className={styles.boundaryCheck}><input type="checkbox" checked={saved.boundaryConfirmed} onChange={(event) => setSaved((current) => ({ ...current, boundaryConfirmed: event.target.checked }))}/><span>我知道體型欄位可以提出問題，但不能單獨證明個性、家庭適配或留所原因。</span></label></section>}

      <div className={base.buttonRow}><button type="button" className={base.secondaryButton} disabled={saved.stage === 0} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: Math.max(0, current.stage - 1) })); }}>← 上一環節</button><button type="button" className={base.paperButton} disabled={!canContinue} onClick={next}>{saved.stage === 5 ? "完成第二週並解鎖工具" : "完成任務，前往下一環節 →"}</button></div>
    </article>
  </div></main>;
}
