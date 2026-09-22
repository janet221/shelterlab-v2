"use client";
import { learningStorage } from "@/lib/classroom/browser-storage";


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

const STORAGE_KEY = "shelterlab-week5-v1";
const CONTENT_VERSION = 1;
const COPY = getStudentCourseTitles(5);
const RECORD = getOpenDataCourseCase(5);
const REWARD = getLearningTool(5);
const STAGES = ["制度解碼", "收容福利", "生態衝突", "公共選擇", "影音判讀", "資料深思"] as const;

type QuizItem = { question: string; options: readonly string[]; answer: number; note: string };
type EvidenceItem = { id: string; label: string; correct: boolean };
type Lesson = { eyebrow: string; heading: string; intro: string; facts: readonly { tag: string; title: string; body: string }[]; boundaryTitle: string; boundary: string; taskOne: string; taskTwo: string; sources: readonly { label: string; href: string }[] };
type Feedback = { kind: "correct" | "wrong"; title: string; body: string } | null;

const TERMS_QUESTIONS: readonly QuizItem[] = [
  { question: "2017 年後的『零撲殺』，最準確的意思是？", options: ["收容動物原則上都要終生留置，個別醫療與福利狀況不再影響處置", "取消只因公告期滿、無人認領養就例行撲殺的制度", "遊蕩犬原地生活就不會受到收容政策影響，因此應全面維持現狀"], answer: 1, note: "零撲殺主要取消以收容天數作為例行處置理由；現行法仍保留嚴重傷病、法定傳染病或嚴重公共安全等情況下的個別人道處理。" },
  { question: "公共政策平台有 8,845 人附議恢復限期收容，代表什麼？", options: ["提案已有足夠民意支持，可先視為已完成修法", "提案達成成案門檻並進入政府回應程序，但尚不是現行法", "主管機關回應前，各收容所可以自行決定是否恢復舊制"], answer: 1, note: "附議成案讓主管機關必須回應，不等於修法完成。政策提案、政府回應、行政措施與法律生效是不同階段。" },
  { question: "犬隻重病、持續痛苦且獸醫評估無法治癒，零撲殺是否要求無限延長生命？", options: ["是；為避免違反零撲殺，應維持生命到自然死亡", "不是；應以個體福利、醫療可能與現行法進行專業評估", "不是；收容空間吃緊時，可把空間需求作為主要處置依據"], answer: 1, note: "延長生命與減少痛苦不一定相同。個別安樂死需有法定理由、專業評估與人道程序，不能只用天數或空間替代。" },
  { question: "『恢復十二夜』和『落實個別人道安樂死』為什麼不能混成同一件事？", options: ["前者以期限決定，後者應依個體狀況與法定程序評估", "兩者目的相同，只是由收容所選擇採用天數或年齡作門檻", "兩者都屬醫療決定，只要有獸醫參與就不必區分制度依據"], answer: 0, note: "期限制度用在所天數觸發；個別人道安樂死則判斷痛苦、疾病、治療可能與安全風險，證據基礎不同。" }
];

const WELFARE_QUESTIONS: readonly QuizItem[] = [
  { question: "犬隻在收容所活了很多年，就能證明牠的福利良好嗎？", options: ["能；長期存活至少能代表飲食、醫療與心理需求都已被滿足", "不能；還要看健康、疼痛、環境、行為、心理與改善可能", "不能；長期留所本身就足以判定生活品質已無改善可能"], answer: 1, note: "生命長度與生命品質都重要。福利評估不能只看有沒有死亡，也不能把年齡本身當成處置理由。" },
  { question: "犬隻長期來回踱步、躲避人並拒絕進食，最適合的第一步是？", options: ["先將行為視為個性問題，等牠適應後再決定是否需要醫療", "記錄情境、排除疾病疼痛、調整環境並由獸醫與行為專業評估", "先加強認養宣傳，換到家庭環境後這些行為通常會自行消失"], answer: 1, note: "異常行為可能與疼痛、恐懼、刺激不足或環境壓力有關。先查原因、介入並追蹤反應，才能做個別判斷。" },
  { question: "收容空間擁擠時，哪個方案較符合動物福利？", options: ["優先增加籠位，等空間充足後再處理流入與照護品質", "同時降低源頭流入、改善照護、提升返還與合適認養，並做個別福利評估", "先縮減健康與行為紀錄，把人力集中在提高收容量"], answer: 1, note: "擁擠是系統壓力，不能只推到末端個體。源頭、收容品質、醫療、媒合與專業人力都要一起處理。" },
  { question: "誰應參與嚴重傷病犬的生命末期決策？", options: ["由關注此犬的民眾投票，以多數意見作為主要依據", "由獸醫依醫療與痛苦評估，結合照護紀錄、法規與可行方案", "由管理單位依在所天數與剩餘空間統一決定"], answer: 1, note: "生命末期決策需要專業、紀錄、複核與透明程序，也要照顧執行人員的倫理壓力。" }
];

const ECOLOGY_QUESTIONS: readonly QuizItem[] = [
  { question: "自動相機拍到犬隻與穿山甲在相同地區活動，能直接證明每隻犬都攻擊穿山甲嗎？", options: ["能；只要活動範圍重疊，就可把該區犬隻都列為攻擊個體", "不能；共域顯示接觸風險，攻擊仍需影像、救傷或其他證據", "不能；共域只能說明出現位置，無法成為風險評估的一部分"], answer: 1, note: "空間重疊是重要風險線索，但不是每個個體行為的直接證明。多種證據互證，才能提高判讀強度。" },
  { question: "野生動物被犬攻擊時，生命教育應把責任放在哪裡？", options: ["先強調攻擊犬的個體性格，避免把問題擴大到人的管理方式", "看見野生動物痛苦，也把放養、棄養、餵養、回置與場域管理責任放回人與制度", "為避免污名化犬隻，生態傷亡可等犬隻安置問題解決後再討論"], answer: 1, note: "承認生態傷害不等於仇視犬隻。犬依其行為與環境活動；人類必須為帶入、繁殖與管理方式負責。" },
  { question: "生態敏感區需要優先移除犬隻，但收容空間不足。哪個方案較完整？", options: ["先訂出移除數量，安置與照護量能可在捕捉後逐步補上", "先盤點數量、安置與照護量能，同步阻止新犬移入並監測", "先將犬移到衝突較少的外圍地區，再觀察是否需要持續追蹤"], answer: 1, note: "移除不是把犬從視線中消失。捕捉、檢疫、醫療、安置、認養與後續福利都要在行動前規劃。" },
  { question: "壽山山羌觀測值下降、犬活動重疊且有攻擊通報。較負責任的表述是？", options: ["資料支持犬隻是重要威脅之一，但仍要保留限制並持續驗證", "多項線索同時出現，已足以把山羌下降完全歸因於犬隻", "在因果關係達到百分之百確定前，不宜採取任何預防措施"], answer: 0, note: "公共決策常要在不完全資訊下採取比例適當、可追蹤的預防措施，同時持續蒐證與修正。" }
];

const POLICY_QUESTIONS: readonly QuizItem[] = [
  { question: "政策只以『收容死亡數最低』作為成功指標，可能漏掉什麼？", options: ["死亡數已涵蓋主要結果，其他影響可留待個案處理", "在所福利、街頭與野生動物傷亡、人犬衝突及工作者負荷", "主要只會漏掉宣導成效，對動物與工作者影響不大"], answer: 1, note: "單一指標可能把痛苦移到別處。評估要同時看不同生命、場域與執行者承受的結果。" },
  { question: "政策只以『快速移除最多犬隻』作為成功，可能產生什麼問題？", options: ["可能忽略個體福利、程序公平、安置量能與源頭是否持續", "只要生態風險夠高，速度就能取代後續安置與追蹤評估", "合法程序可在移除完成後補做，先達成數量目標較重要"], answer: 0, note: "速度很重要，但不是唯一價值。快速行動仍須符合比例、專業、可追蹤與避免重複發生。" },
  { question: "嚴重生態熱區與一般住宅區，是否一定要使用完全相同措施？", options: ["是；只要措施不同，就代表不同地區受到不公平對待", "不一定；可依風險採比例措施，但標準、理由與監督須透明", "不一定；由執行單位依現場經驗決定即可，不必公開差異理由"], answer: 1, note: "因地制宜不等於任意決定。差異化措施需要公開風險、目標、期限、福利保障與檢核方式。" },
  { question: "哪一種公民意見最能幫助政策討論？", options: ["清楚表明支持或反對即可，執行細節應完全交給政府", "提出重視的價值、可驗證證據、可能代價與降低傷害的配套", "先指出反對者忽略生命，再要求決策者採用自己的方案"], answer: 1, note: "民主討論不只計算立場，也要讓決策者看見理由、代價、替代方案與願意承擔的責任。" }
];

const VIDEO_QUESTIONS: readonly QuizItem[] = [
  { question: "影片呈現犬隻對野生動物的威脅後，最成熟的回應是？", options: ["為避免生態傷亡，應把所有遊蕩犬視為相同風險並立即移除", "承認風險並優先保護敏感棲地，同時規劃犬隻捕捉、醫療、安置與源頭阻斷", "影像容易放大少數事件，應先停止處理直到取得完整全國資料"], answer: 1, note: "保護野生動物與保障犬隻福利不必只能擇一。難題在於如何用場域、風險與量能安排順序並降低各方傷害。" },
  { question: "看完影像感到憤怒或難過時，下一步最能幫助判斷的是？", options: ["先採取最能回應情緒的方案，再用後續資料修正", "查核影片的數據、場域與未呈現觀點，再提出可檢驗的政策條件", "為維持客觀，應排除情緒並避免討論影像中的生命處境"], answer: 1, note: "情緒提醒我們重視什麼；證據幫助判斷怎麼做。兩者不必排斥，但不能讓影像替代完整評估。" }
];

const TERMS_FILES: readonly EvidenceItem[] = [
  { id: "old", label: "說明舊制曾以公告期滿且無適當處置作為例行撲殺條件", correct: true },
  { id: "current", label: "核對現行《動物保護法》第 12、13 條的事由與人道程序", correct: true },
  { id: "individual", label: "區分限期撲殺與依個體痛苦、疾病或安全進行的專業評估", correct: true },
  { id: "proposal", label: "標示公共提案仍在政策程序中，不把附議數寫成已生效法律", correct: true },
  { id: "language", label: "分清收容、移除、安置、安寧照護、安樂死與族群撲殺", correct: true },
  { id: "none", label: "零撲殺代表任何情況都不能終止痛苦", correct: false },
  { id: "vote", label: "附議超過五千人，法律就會自動修改", correct: false },
  { id: "space", label: "收容空間不足本身就足以決定哪隻犬死亡", correct: false }
];

const WELFARE_FILES: readonly EvidenceItem[] = [
  { id: "nutrition", label: "營養：能否正常飲水進食、維持體態並得到合適飲食", correct: true },
  { id: "environment", label: "環境：空間、溫度、噪音、清潔、休息與躲藏是否合宜", correct: true },
  { id: "health", label: "健康：疼痛、疾病、傷勢、治療反應與預後", correct: true },
  { id: "behavior", label: "行為：能否活動、探索、互動並表現物種與個體需要", correct: true },
  { id: "mental", label: "心理：恐懼、焦慮、挫折、愉悅與安全感的持續變化", correct: true },
  { id: "days", label: "只看在所天數，天數一到就完成福利評估", correct: false },
  { id: "cute", label: "照片看起來可愛，就代表沒有疼痛或壓力", correct: false },
  { id: "age", label: "只要年紀大，就沒有治療、安寧或認養價值", correct: false }
];

const ECOLOGY_FILES: readonly EvidenceItem[] = [
  { id: "camera", label: "自動相機：比較犬與野生動物的空間、時間與活動變化", correct: true },
  { id: "rescue", label: "救傷紀錄：辨識犬咬傷型態、數量、地點與物種", correct: true },
  { id: "report", label: "攻擊與居民通報：保留日期、位置與可驗證內容", correct: true },
  { id: "population", label: "族群調查：用相同方法追蹤犬與野生動物趨勢", correct: true },
  { id: "movement", label: "移入追蹤：確認移除後是否有放養、棄養或新犬補入", correct: true },
  { id: "evil", label: "把犬叫做壞動物，就足以證明生態因果", correct: false },
  { id: "one", label: "一張攻擊照片能代表全臺所有場域", correct: false },
  { id: "hide", label: "為避免爭議，不公開研究方法與不確定性", correct: false }
];

const POLICY_FILES: readonly EvidenceItem[] = [
  { id: "welfare", label: "動物福利：疼痛、健康、環境、行為與心理狀態如何改變", correct: true },
  { id: "ecology", label: "生態與安全：野生動物、人犬衝突與公共衛生風險", correct: true },
  { id: "effect", label: "成效：是否降低流入、繁殖、傷害與問題重複發生", correct: true },
  { id: "fair", label: "公平與合法：標準是否透明、可複核，責任是否合理分配", correct: true },
  { id: "feasible", label: "可執行性：人力、獸醫、收容安置、經費與追蹤是否到位", correct: true },
  { id: "popular", label: "哪個口號票數最多，就不必評估後果", correct: false },
  { id: "cheap", label: "只選眼前最便宜的方法，不計算痛苦移轉與長期成本", correct: false },
  { id: "onegroup", label: "只聽單一利害關係人，其他生命與執行者可以忽略", correct: false }
];

const SOURCE_TRACKER_CATEGORIES = [
  { id: "prevention", label: "源頭預防" },
  { id: "before-street", label: "犬隻進入街頭前" },
  { id: "community", label: "社區共存與管理" },
  { id: "shelter", label: "收容末端處理" }
] as const;

const SOURCE_TRACKER_ITEMS = [
  { id: "owner-education", label: "飼主教育", correctCategory: "prevention", explanation: "飼主教育在問題發生前建立登記、不放養、不棄養與照護責任；但若沒有服務、執法與追蹤，宣導本身不一定改變行為。" },
  { id: "registration", label: "寵物登記", correctCategory: "prevention", explanation: "登記讓犬隻與責任人可追蹤，屬於源頭基礎；它不能單獨阻止放養、棄養或未管理繁殖。" },
  { id: "sterilization", label: "絕育與繁殖管理", correctCategory: "prevention", explanation: "絕育與繁殖管理直接降低未規劃的新生來源；仍需足夠覆蓋率、持續追蹤及家犬管理。" },
  { id: "abandonment", label: "棄養預防", correctCategory: "before-street", explanation: "在照護中斷前提供求助、轉介與責任追蹤，可避免犬隻進入街頭；但無法取代後續對既有遊蕩犬的管理。" },
  { id: "roaming", label: "家犬放養管理", correctCategory: "before-street", explanation: "限制無人伴同的放養，能在家犬進入街頭、繁殖或發生衝突前介入；仍需登記、訪查與飼主配合。" },
  { id: "feeding", label: "社區餵養管理", correctCategory: "community", explanation: "餵養管理處理既有犬群的清潔、醫療、絕育與衝突，位於社區現場；它不能單獨阻止新犬被棄養或移入。" },
  { id: "survey", label: "犬群調查", correctCategory: "community", explanation: "調查能追蹤犬群數量、幼犬、移入與衝突，支持社區決策；但蒐集資料本身不會自動減少犬隻。" },
  { id: "intake", label: "收容安置", correctCategory: "shelter", explanation: "收容安置處理已進入街頭或需要保護的個體，是末端承接；若源頭流入不變，收容量能仍會持續承壓。" },
  { id: "adoption", label: "認養媒合", correctCategory: "shelter", explanation: "認養讓合適個體離開收容並進入家庭，但不能單獨處理新的棄養、放養與繁殖來源。" },
  { id: "kennels", label: "增加收容籠舍", correctCategory: "shelter", explanation: "增加籠舍可以暫時提升末端容量，卻不會關掉棄養、未登記、未絕育、繁殖與放養造成的持續流入。" }
] as const satisfies readonly TreasureItem[];

const DATA_FILES: readonly EvidenceItem[] = [
  { id: "exact", label: "向收容單位確認較精確年齡或估齡依據與紀錄日期", correct: true },
  { id: "health", label: "取得目前健康、疼痛、慢性病、治療反應與預後評估", correct: true },
  { id: "behavior", label: "觀察不同環境中的行為、壓力訊號、互動與恢復能力", correct: true },
  { id: "quality", label: "持續記錄生活品質，不用單次照片或年齡標籤決定", correct: true },
  { id: "options", label: "盤點治療、安寧、中途、認養與其他合適安置的可行性", correct: true },
  { id: "adult", label: "看到『成年』就能判定牠太老、不值得被認養", correct: false },
  { id: "days", label: "開放認養日期可以直接證明牠每天的福利狀態", correct: false },
  { id: "euthanasia", label: "單筆 Open Data 足以決定是否應執行安樂死", correct: false }
];

const LESSONS: readonly Lesson[] = [
  { eyebrow: "先拆開最容易混淆的三個詞", heading: "零撲殺不等於零安樂死，附議成案也不等於法律已經改變", intro: "2017 年後取消的是只因公告期滿、無人認領養就例行撲殺的制度；現行法仍允許在法定狀況下進行個別人道處理。2026 年恢復限期收容的公共提案已成案，但仍在政府正式回應程序中。", facts: [
    { tag: "舊制", title: "生命由收容天數倒數", body: "公告期滿、無人認領養或無適當處置，曾可成為例行撲殺理由。" },
    { tag: "現行", title: "不因天數例行死亡", body: "收容仍須照護；法定情況下保留個別人道處理。" },
    { tag: "專業", title: "安樂死要個別評估", body: "重病、痛苦、傳染病或公共安全需依法與由專業判斷。" },
    { tag: "公民參與", title: "成案不等於修法", body: "附議促成政府回應，後續仍須政策與法制作業。" }
  ], boundaryTitle: "2026 公共提案狀態", boundary: "恢復限期收容與拒絕恢復十二夜兩案都反映價值衝突；附議人數是參與訊號，不是科學證據，也不會自動修改法律。", taskOne: "把口號翻成制度", taskTwo: "建立制度解碼卡", sources: [
    { label: "全國法規資料庫：動物保護法", href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=M0060027" },
    { label: "公共政策平台：恢復限期收容提案", href: "https://join.gov.tw/idea/detail/4690bfc9-7b75-4f50-9039-ab46ccf09e1e" }
  ] },
  { eyebrow: "活著是一項基本條件，不是完整的福利結論", heading: "沒有被撲殺的生命，也可能正在承受疼痛、恐懼或剝奪", intro: "零撲殺把社會從『天數到了沒有』推向更困難的問題：動物每天過得如何？是否有治療與改善機會？福利惡化時誰記錄、誰決策、誰複核？", facts: [
    { tag: "營養", title: "能好好吃喝嗎？", body: "飲水、食慾、體態與特殊飲食需求是否被滿足。" },
    { tag: "環境", title: "能休息與避開壓力嗎？", body: "空間、噪音、溫度、清潔、躲藏與安全感。" },
    { tag: "健康", title: "疼痛有被處理嗎？", body: "疾病、傷勢、治療反應、預後與安寧需求。" },
    { tag: "行為與心理", title: "牠做一隻狗活在這個世界上，能有尊嚴地活著嗎？", body: "活動、探索、互動、選擇，以及恐懼、焦慮與愉悅。" }
  ], boundaryTitle: "安樂死不是收容壓力的快速按鈕", boundary: "空間、人力與經費不足是制度問題；個體是否需要安樂死，仍須回到法定事由、醫療與痛苦評估。兩者相關，卻不能互相取代。", taskOne: "從活著走向生活品質", taskTwo: "完成五面向福利檔案", sources: [
    { label: "遊蕩犬族群控制與收容管理", href: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001995" }
  ] },
  { eyebrow: "生命衝突：犬隻沒有惡意，野生動物的傷亡仍然真實", heading: "保護遊蕩犬時，不能讓穿山甲、石虎與山羌成為看不見的代價", intro: "遊蕩犬持續繁殖、進入淺山並與野生動物活動重疊時，穿山甲、石虎與山羌會面臨被追逐、咬傷甚至死亡的風險。犬隻沒有惡意；證據顯示的是需要處理的風險，而放養、棄養、餵養、回置與場域管理的責任仍在人與制度。", facts: [
    { tag: "自動相機", title: "誰在何時出現？", body: "利用紅外線感應或動作偵測，在野外無人看守時自動拍攝；可比較出現的空間與時間，但共域不等於每次都有攻擊。" },
    { tag: "救傷紀錄", title: "傷勢留下什麼證據？", body: "犬咬傷型態、物種、位置與時間能顯示衝突規模。" },
    { tag: "族群趨勢", title: "數量如何一起變動？", body: "用一致方法長期調查，並檢查棲地與其他原因。" },
    { tag: "場域風險", title: "哪裡不能慢慢等？", body: "瀕危物種與繁殖棲地可能需要優先、預防性保護。" }
  ], boundaryTitle: "移除不是丟到別處", boundary: "生態敏感區優先移除若沒有檢疫、醫療、安置、認養、收容量能與阻止新犬移入，只會把犬隻痛苦或問題轉移到下一個場域。", taskOne: "判讀生態證據", taskTwo: "組成生態風險證據鏈", sources: [
    { label: "《報導者》：遊蕩犬與野生動物衝突", href: "https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-conflict-with-wildlife" }
  ] },
  { eyebrow: "公共決策不是找一個不會痛的答案", heading: "每個方案都可能保護一些生命，也把風險、成本或痛苦移到別處", intro: "支持零撲殺者擔心生命被期限淘汰；主張檢討者擔心長期收容、生態傷亡與第一線崩潰。成熟的政策討論要讓這些問題進入同一張決策表。", facts: [
    { tag: "收容犬", title: "生活品質與機會", body: "在所福利、醫療、媒合、安寧，以及不被天數淘汰。" },
    { tag: "野生動物", title: "沒有投票權的利害關係人", body: "承受追逐、攻擊、疾病與棲地資源競爭。" },
    { tag: "居民與飼主", title: "安全與責任", body: "生活安寧、人犬衝突、登記絕育與不棄養。" },
    { tag: "第一線", title: "量能與倫理壓力", body: "政府、獸醫、照護者與團體承擔執行和心理負荷。" }
  ], boundaryTitle: "不讓單一漂亮數字遮住其他痛苦", boundary: "只看收容死亡數，可能漏掉在所、生態與工作者負荷；只看移除速度，也可能漏掉個體福利、程序與安置量能。", taskOne: "辨認痛苦被移到哪裡", taskTwo: "建立公共決策量尺", sources: [
    { label: "《報導者》：零撲殺上路六年專題", href: "https://www.twreporter.org/topics/6-years-after-no-kill-policy-adopted" }
  ] }
];

const QUIZZES: readonly (readonly QuizItem[])[] = [TERMS_QUESTIONS, WELFARE_QUESTIONS, ECOLOGY_QUESTIONS, POLICY_QUESTIONS, VIDEO_QUESTIONS];
const FILE_SETS: readonly (readonly EvidenceItem[])[] = [TERMS_FILES, WELFARE_FILES, ECOLOGY_FILES, POLICY_FILES, [], DATA_FILES];
type SavedWeekFive = { contentVersion: number; stage: number; furthest: number; hearts: Record<number, number>; answers: Record<number, Record<number, number>>; files: Record<number, string[]>; treasureAnswers: Record<string, string>; treasureCompleted: boolean; videoReflection: string; dataReflection: string; boundaryConfirmed: boolean; completed: boolean };
const DEFAULT_HEARTS: Record<number, number> = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
const EMPTY: SavedWeekFive = { contentVersion: CONTENT_VERSION, stage: 0, furthest: 0, hearts: DEFAULT_HEARTS, answers: {}, files: {}, treasureAnswers: {}, treasureCompleted: false, videoReflection: "", dataReflection: "", boundaryConfirmed: false, completed: false };

function shuffled<T>(values: readonly T[]): T[] { const result = [...values]; for (let i = result.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } if (result.length > 1 && result.every((value, index) => value === values[index])) [result[0], result[1]] = [result[1], result[0]]; return result; }
function visitShuffle<T>(values: readonly T[], key: string): T[] { let result = shuffled(values); try { const storageKey = `shelterlab-choice-order-${key}`; const previous = sessionStorage.getItem(storageKey); if (result.length > 1 && previous === JSON.stringify(result)) result = [...result.slice(1), result[0]]; sessionStorage.setItem(storageKey, JSON.stringify(result)); } catch {} return result; }
function defaultQuizOrders() { return QUIZZES.map((items) => items.map((item) => item.options.map((_, index) => index))); }
function defaultFileOrders() { return FILE_SETS.map((items) => items.map((item) => item.id)); }
function quizComplete(items: readonly QuizItem[], answers: Record<number, number> = {}) { return items.every((item, index) => answers[index] === item.answer); }

function QuizBlock({ items, answers = {}, order, onAnswer }: { items: readonly QuizItem[]; answers?: Record<number, number>; order: number[][]; onAnswer: (index: number, option: number) => void }) {
  return <div className={styles.quizGrid}>{items.map((item, index) => <fieldset className={styles.quizCard} key={item.question}><legend><span>{index + 1}</span>{item.question}</legend><div className={styles.choiceGrid}>{order[index].map((optionIndex) => <button type="button" key={item.options[optionIndex]} aria-pressed={answers[index] === optionIndex} className={answers[index] === optionIndex ? styles.correctChoice : ""} onClick={() => onAnswer(index, optionIndex)}>{item.options[optionIndex]}</button>)}</div>{answers[index] === item.answer && <p className={styles.answerNote}><strong>判讀重點</strong>{item.note}</p>}</fieldset>)}</div>;
}

export default function WeekFiveExperience() {
  const router = useRouter();
  const { completeWeek, progress } = useStudentLearningProgress();
  const [saved, setSaved] = useState<SavedWeekFive>(EMPTY);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [quizOrders, setQuizOrders] = useState<number[][][]>(defaultQuizOrders);
  const [fileOrders, setFileOrders] = useState<string[][]>(defaultFileOrders);

  useEffect(() => { try { const raw = learningStorage.getItem(STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw) as Partial<SavedWeekFive>; if (parsed.contentVersion === CONTENT_VERSION) setSaved({ ...EMPTY, ...parsed, hearts: { ...DEFAULT_HEARTS, ...(parsed.hearts ?? {}) }, answers: parsed.answers ?? {}, files: parsed.files ?? {}, treasureAnswers: parsed.treasureAnswers ?? {}, treasureCompleted: parsed.treasureCompleted ?? Boolean(parsed.completed) }); } } catch {} setReady(true); }, []);
  useEffect(() => { if (!ready) return; try { learningStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {} }, [ready, saved]);
  useEffect(() => { if (!ready) return; const stage = saved.stage; if (stage < 5) setQuizOrders((current) => current.map((orders, index) => index === stage ? QUIZZES[stage].map((item, question) => visitShuffle(item.options.map((_, option) => option), `week5-${stage}-${question}`)) : orders)); if (FILE_SETS[stage].length) setFileOrders((current) => current.map((orders, index) => index === stage ? visitShuffle(FILE_SETS[stage].map((item) => item.id), `week5-files-${stage}`) : orders)); }, [ready, saved.stage]);

  const selected = saved.files[saved.stage] ?? [];
  const correctCount = selected.filter((id) => FILE_SETS[saved.stage].find((item) => item.id === id)?.correct).length;
  const treasureUnlocked = isTreasureUnlockedForWeek(5, progress.completedWeeks, progress.unlockedTools);
  const canContinue = saved.stage < 4
    ? quizComplete(QUIZZES[saved.stage], saved.answers[saved.stage]) && correctCount === 5 && (saved.stage !== 3 || saved.treasureCompleted)
    : saved.stage === 4
      ? quizComplete(VIDEO_QUESTIONS, saved.answers[4]) && saved.videoReflection.trim().length > 0
      : correctCount >= 4 && saved.dataReflection.trim().length > 0 && saved.boundaryConfirmed;

  const loseHeart = (stage: number, body: string) => {
    const remaining = saved.hearts[stage] ?? 3;
    setSaved((current) => remaining <= 1
      ? { ...current, hearts: { ...current.hearts, [stage]: 3 }, answers: { ...current.answers, [stage]: {} }, files: { ...current.files, [stage]: [] }, ...(stage === 3 ? { treasureAnswers: {}, treasureCompleted: false } : {}) }
      : { ...current, hearts: { ...current.hearts, [stage]: remaining - 1 } });
    setFeedback({ kind: "wrong", title: remaining <= 1 ? "愛心用完，這一環節已重新整理" : "這個判斷還需要再想想", body });
  };
  const answerQuiz = (stage: number, index: number, option: number) => {
    const item = QUIZZES[stage][index];
    if (saved.answers[stage]?.[index] === item.answer) return;
    if (option !== item.answer) { loseHeart(stage, item.note); return; }
    setSaved((current) => ({ ...current, answers: { ...current.answers, [stage]: { ...(current.answers[stage] ?? {}), [index]: option } } }));
    setFeedback({ kind: "correct", title: "判讀正確", body: item.note });
  };
  const fileEvidence = (stage: number, item: EvidenceItem) => {
    const values = saved.files[stage] ?? [];
    if (values.includes(item.id)) return;
    if (!item.correct) { loseHeart(stage, "這張卡用單一標籤替代個體評估，或把公共決策簡化成口號。請回到上方教學區，找出有證據、程序與保障的做法。"); return; }
    setSaved((current) => ({ ...current, files: { ...current.files, [stage]: [...(current.files[stage] ?? []), item.id] } }));
    setFeedback({ kind: "correct", title: "已加入決策檔案", body: `這項資料能補足公共判斷。請繼續找齊 ${FILE_SETS[stage].filter((choice) => choice.correct).length} 項。` });
  };
  const assignTreasure = (item: TreasureItem, categoryId: string, correct: boolean) => {
    if (!correct) { loseHeart(3, item.explanation); return; }
    setSaved((current) => {
      const treasureAnswers = { ...current.treasureAnswers, [item.id]: categoryId };
      return { ...current, treasureAnswers, treasureCompleted: SOURCE_TRACKER_ITEMS.every((choice) => Boolean(treasureAnswers[choice.id])) };
    });
    setFeedback({ kind: "correct", title: "源頭路徑判讀正確", body: item.explanation });
  };
  const next = () => { if (!canContinue) return; setFeedback(null); if (saved.stage < 5) { const stage = saved.stage + 1; setSaved((current) => ({ ...current, stage, furthest: Math.max(current.furthest, stage) })); scrollTo({ top: 0, behavior: "smooth" }); } else { completeWeek(5); setSaved((current) => ({ ...current, completed: true })); scrollTo({ top: 0, behavior: "smooth" }); } };
  const replay = () => { setSaved({ ...EMPTY, hearts: { ...DEFAULT_HEARTS } }); setFeedback(null); scrollTo({ top: 0, behavior: "smooth" }); };
  const taskHeading = (number: string, title: string, description: string, progress: string) => <div className={styles.taskHeading}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><strong>{progress}</strong></div>;
  const fileGrid = (stage: number) => <div className={styles.fileGrid}>{fileOrders[stage].map((id) => FILE_SETS[stage].find((item) => item.id === id)!).map((item) => <button type="button" key={item.id} aria-pressed={selected.includes(item.id)} className={selected.includes(item.id) ? styles.fileSelected : ""} onClick={() => fileEvidence(stage, item)}>{selected.includes(item.id) ? "✓ " : "＋ "}{item.label}</button>)}</div>;

  if (!ready) return <main className={base.experience}><div className={base.loading}>正在整理第五週的公共決策檔案…</div></main>;
  if (saved.completed) return <main className={base.experience}><div className={base.shell}><nav className={base.topbar}><Link href="/student" className={base.backLink}>← 返回六週地圖</Link><span className={base.weekStamp}>WEEK 05 · 已完成</span></nav><article className={`${base.stagePaper} ${styles.completionPaper}`}><section className={styles.completionHero}><p>第五週任務完成</p><h1>獲得新的探究工具</h1><div className={styles.rewardStage}><span aria-hidden="true" /><img src={REWARD.image} alt={REWARD.name} /></div><h2>{REWARD.name}</h2><p>你已學會在最困難的生命決策中區分口號、法律與個體福利，也能同時看見犬隻、野生動物、居民與第一線工作者，不用一個簡單答案掩蓋痛苦被移到哪裡。</p><div className={styles.completionActions}><button type="button" className={base.paperButton} onClick={() => router.push("/student")}>收下寶物，回到地圖</button><button type="button" className={base.secondaryButton} onClick={replay}>重新體驗第五週</button></div></section></article></div></main>;

  const lesson = saved.stage < 4 ? LESSONS[saved.stage] : null;
  return <main className={base.experience}><div className={base.shell}><nav className={base.topbar}><Link href="/student" className={base.backLink}>← 返回六週地圖</Link><span className={base.weekStamp}>WEEK 05 · 政策與兩難</span></nav><header className={base.hero}><p className={base.eyebrow}>第五週</p><h1>{COPY.unitTitle}</h1><p className={base.heroQuestion}>真正困難的不是喊出「救」或「殺」，而是說清楚每個選擇保護了誰、傷害可能移到哪裡，以及誰願意承擔後續責任。</p></header><div className={base.progressWrap}><div className={base.progressTop}><span>學習進度</span><span>{saved.stage + 1} / 6</span></div><div className={base.progressTrack}><div className={base.progressFill} style={{ width: `${((saved.stage + 1) / 6) * 100}%` }} /></div></div>
    <article className={`${base.stagePaper} ${styles.weekPaper}`}><div className={styles.stageRail} aria-label="第五週學習環節">{STAGES.map((label, index) => <button type="button" key={label} disabled={index > saved.furthest} className={index === saved.stage ? styles.stageActive : index < saved.stage ? styles.stageDone : ""} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: index })); }}><b>{index < saved.stage ? "✓" : index + 1}</b><small>{label}</small></button>)}</div><header className={base.stageHeader}><p className={base.stageLabel}>{saved.stage === 5 ? COPY.stages[saved.stage].label : `環節 ${saved.stage + 1} · ${STAGES[saved.stage]}`}</p><h2 className={base.stageTitle}>{COPY.stages[saved.stage].title}</h2></header><div className={styles.statusDock} role="status" aria-live="polite"><div><span>挑戰愛心</span><strong>{"♥".repeat(saved.hearts[saved.stage] ?? 3)}{"♡".repeat(3 - (saved.hearts[saved.stage] ?? 3))}</strong></div>{feedback && <section className={feedback.kind === "correct" ? styles.feedbackCorrect : styles.feedbackWrong}><b>{feedback.title}</b><p>{feedback.body}</p></section>}</div>

      {lesson && <section><div className={styles.storyBanner}><small>{lesson.eyebrow}</small><h3>{lesson.heading}</h3><p>{lesson.intro}</p></div><div className={styles.challengeGrid}>{lesson.facts.map((fact) => <article key={fact.title}><span>{fact.tag}</span><h3>{fact.title}</h3><p>{fact.body}</p></article>)}</div><div className={styles.boundaryLesson}><strong>{lesson.boundaryTitle}</strong><p>{lesson.boundary}</p></div>{saved.stage === 3 && <TreasureWorkspace week={5} objective="辨認政策介入犬隻問題的哪一段路徑，避免只用末端容量遮住持續流入。" instruction="使用源頭追蹤卡，把每項政策或行動放到主要介入位置；再閱讀它能處理什麼，以及單獨使用時會漏掉什麼。" categories={SOURCE_TRACKER_CATEGORIES} items={SOURCE_TRACKER_ITEMS} assignments={saved.treasureAnswers} completed={saved.treasureCompleted} unlocked={treasureUnlocked} onAssign={assignTreasure} />}{taskHeading("任務一", lesson.taskOne, "四題都要依上方教學內容判斷；答案每次進入會重新排序。", `${Object.keys(saved.answers[saved.stage] ?? {}).length} / 4`)}<div className={styles.taskPanel}><QuizBlock items={QUIZZES[saved.stage]} answers={saved.answers[saved.stage]} order={quizOrders[saved.stage]} onAnswer={(index, option) => answerQuiz(saved.stage, index, option)} /></div>{taskHeading("任務二", lesson.taskTwo, "從八張卡找出五項能被查證、執行與複核的資料。", `${correctCount} / 5`)}<div className={styles.taskPanel}>{fileGrid(saved.stage)}</div><div className={styles.sourceRow}>{lesson.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div></section>}

      {saved.stage === 4 && <section><div className={styles.videoLayout}><article><small>公視《我們的島》第 1207 集</small><h3>遊蕩犬貓怎麼管：對野生動物造成哪些衝擊？</h3><p>觀看影片時，請記下它用了哪些證據、呈現了哪些生命，又有哪些政策代價需要其他資料才能回答。</p><a href="https://www.youtube.com/watch?v=eHWNR-rstjc" target="_blank" rel="noreferrer">前往公視官方影片觀看 ↗</a><small>使用官方外部連結，避免影音來源拒絕嵌入。</small></article><div><h3>影片後判讀</h3><QuizBlock items={VIDEO_QUESTIONS} answers={saved.answers[4]} order={quizOrders[4]} onAnswer={(index, option) => answerQuiz(4, index, option)} /></div></div><label className={styles.reflection}><span>提出一項你認為必須優先採取的措施，並寫出它保護誰、可能傷害誰，以及至少一項降低傷害的配套。</span><textarea value={saved.videoReflection} onChange={(event) => setSaved((current) => ({ ...current, videoReflection: event.target.value }))} placeholder="例如：生態敏感區優先移除犬隻；保護野生動物，但需先準備檢疫、醫療、安置與阻止新犬移入……" /><small>{saved.videoReflection.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label></section>}

      {saved.stage === 5 && <section><div className={styles.storyBanner}><small>農業部「動物認領養」開放資料 · 快照日 {RECORD.snapshotDate}</small><h3>資料只寫「成年」，卻可能把漫長生命壓縮成一個分類</h3><p>「成年」涵蓋很大的生命階段。備註中的估齡也有紀錄日期，會隨時間改變。年齡能提示照護問題，不能單獨證明健康、痛苦、認養可能或是否需要安樂死。</p><a href="https://data.gov.tw/dataset/85903" target="_blank" rel="noreferrer">查看政府原始資料集 ↗</a></div><div className={base.dataStatSummary}><article><small>成年犬</small><strong>4,577 筆</strong><span>留所天數中位數 663 天</span></article><article><small>幼年犬</small><strong>885 筆</strong><span>留所天數中位數 276 天</span></article></div><p className={styles.dataScopeNote}>同一份資料快照的描述性整理；年齡未註明的 240 筆紀錄未放入比較。樣本數與資料品質不同，不能把年齡視為留所結果的單一原因。</p><div className={styles.caseFile}><div className={styles.casePhoto}><img src={RECORD.image} alt={`政府公開資料個案 ${RECORD.subId}`} loading="lazy" referrerPolicy="no-referrer" /></div><div><small>公開個案 · {RECORD.subId}</small><h3>「成年」沒有說完的生命</h3><div className={styles.caseFields}>{RECORD.displayFields.map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div><p>{RECORD.evidenceBoundary}</p></div></div><div className={styles.dataBoundary}><section><small>資料可以直接支持</small><h3>年齡欄位分類為成年</h3><p>備註可補充有日期的估齡與部分行為描述，但使用時要保留時間與來源。</p></section><section><small>資料不能直接支持</small><h3>牠太老、痛苦或沒有認養價值</h3><p>目前健康、生活品質、治療反應與家庭適配，都需要更新的個體資料。</p></section></div>{taskHeading("任務一", "把年齡標籤還原成個體", "從八張卡找出至少四項做生命決策前必須補足的證據。", `${correctCount} / 至少 4`)}<div className={styles.taskPanel}>{fileGrid(5)}</div><label className={styles.reflection}><span>生命教育深思：當資源有限，有人說「老犬需要更多照護，所以應優先讓年輕犬得到機會」。這句話看見了什麼現實，又忽略哪些公平與生命價值？你會用什麼程序做決定？</span><textarea value={saved.dataReflection} onChange={(event) => setSaved((current) => ({ ...current, dataReflection: event.target.value }))} placeholder="請用個體福利、資料界線、資源公平與透明程序回答……" /><small>{saved.dataReflection.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label><label className={styles.boundaryCheck}><input type="checkbox" checked={saved.boundaryConfirmed} onChange={(event) => setSaved((current) => ({ ...current, boundaryConfirmed: event.target.checked }))} /><span>我知道「成年」是寬泛分類，不能單靠年齡、在所時間或一筆公開資料決定生命品質、認養價值或安樂死。</span></label></section>}

      <div className={base.buttonRow}><button type="button" className={base.secondaryButton} disabled={saved.stage === 0} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: Math.max(0, current.stage - 1) })); }}>← 上一環節</button><button type="button" className={base.paperButton} disabled={!canContinue} onClick={next}>{saved.stage === 5 ? "完成第五週並解鎖工具" : "完成任務，前往下一環節 →"}</button></div>
    </article>
  </div></main>;
}
