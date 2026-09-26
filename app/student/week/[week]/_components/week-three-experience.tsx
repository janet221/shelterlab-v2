"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentLearningProgress } from "@/app/student/_components/student-learning-progress";
import { getOpenDataCourseCase } from "@/lib/student-open-data-cases";
import { getStudentCourseTitles } from "@/lib/student-course-titles";
import { getLearningTool, isTreasureUnlockedForWeek } from "@/lib/student-map";
import TreasureWorkspace, { type TreasureItem } from "./treasure-workspace";
import base from "./week-one-game.module.css";
import styles from "./week-three-experience.module.css";

const STORAGE_KEY = "shelterlab-week3-v2";
const COPY = getStudentCourseTitles(3);
const CASE_RECORD = getOpenDataCourseCase(3);
const REWARD = getLearningTool(3);
const FOUNDATIONS_VERSION = 3;

const STAGES = ["品種的誕生", "性格迷思", "遺傳風險", "領養與買賣", "影音思考", "資料深思"] as const;

const HISTORY = [
  {
    id: "together",
    era: "數萬年前",
    title: "先有共同生活，還沒有現代品種",
    preview: "狼與人類逐漸靠近，合作與馴化早於品種分類。",
    context: "數萬年前，狼與人類可能因食物與聚落而逐漸接觸。較不害怕人、較願意靠近的犬科動物，更容易留在人類周邊；人類則從牠們的警戒、追蹤與協助中獲益。",
    change: "人類可能提供額外食物、庇護與繁殖機會，讓適合共同生活的特徵逐代累積。這不是某一天突然設計出一個犬種，而是長時間共同演化與選擇的結果。",
    impact: "人犬關係的第一章是生存與互惠合作，不是血統證書或固定外表。此時可以談馴化，卻還不能直接套用今天的現代品種分類。",
    takeaway: "馴化早於品種；共同生活的開始，不等於現代犬種已經形成。"
  },
  {
    id: "work",
    era: "長期功能選育",
    title: "工作需求讓犬隻出現不同傾向",
    preview: "人類先選擇犬能做什麼，放牧、尋回與守衛能力逐代分化。",
    context: "人類需要犬協助放牧、尋回、守衛或追逐，便偏好能完成特定任務的個體。搜尋、跟蹤、追逐、捕捉等行為環節，也因此在不同工作犬群體中被保留與強化。",
    change: "表現較符合工作需求的犬，較可能得到資源或繁殖機會；經過許多世代，相關身體特徵與行為傾向逐漸累積，犬隻也變得更加多樣。",
    impact: "牧犬、尋回犬等名稱保存了一部分工作歷史，可以提供寬鬆線索；但群體傾向不會讓每一隻犬都以相同方式行動。",
    takeaway: "功能選育留下的是群體傾向，不是每個個體都必須遵守的性格劇本。"
  },
  {
    id: "victorian",
    era: "19 世紀",
    title: "從「會做什麼」轉向「長什麼樣」",
    preview: "犬展、血統紀錄與外觀標準，讓現代品種快速固定。",
    context: "19 世紀維多利亞時代，犬展、育種組織、血統紀錄與正式標準興起。人們看犬的方式，逐漸從能完成什麼工作，轉向是否符合特定毛色、體型、外觀與血統。",
    change: "繁殖配對變得更有目的；外觀特徵又比複雜行為更容易挑選。相同品種的犬因此越來越相似，不同品種之間的外觀界線也快速變得明顯。",
    impact: "今天熟悉的現代品種概念在此時被制度化、標準化。品種不是自然界預先寫好的固定答案，而是人類偏好、選育與分類共同形成。",
    takeaway: "19 世紀的制度轉折，把外觀與血統變成現代品種的重要標準。"
  },
  {
    id: "today",
    era: "今天",
    title: "品種名稱成為看待犬隻的濾鏡",
    preview: "名稱能提供線索，也可能在認識個體前先製造期待與偏見。",
    context: "今天，人們常在真正觀察犬隻之前，就因品種名稱產生期待，例如認為黃金獵犬一定親人、柴犬一定固執，或某些犬一定危險。這些印象會影響領養、居住限制、工作安排與互動方式。",
    change: "犬隻行為同時受到遺傳、發育、社會化、環境、過往經驗與人的互動影響。文章整理的大型研究中，品種只能解釋不到 10% 的行為差異，代表它可能有影響，卻沒有強到可以替個體下結論。",
    impact: "品種仍能提示部分身體構造、工作背景與照護需求，但不能取代個體觀察，更不該直接成為性格、危險程度或生命價值的判決。",
    takeaway: "把品種當成待查證的線索，而不是判決；先看眼前的個體，再做決定。"
  }
] as const;

const TIMELINE_OPTIONS = [
  { id: "sequence", label: "狗先在共生與工作選擇中形成部分傾向；19 世紀的外觀、血統與正式標準建立現代品種，今天仍須以個體證據完成判斷", correct: true },
  { id: "nature", label: "狼與人類開始接觸時，現代品種就已由自然環境完整形成；後來的犬展、血統紀錄與人為選育只是在替牠們命名", correct: false },
  { id: "useless", label: "既然品種不能準確預測個性，品種歷史、身體構造與工作背景也都不值得參考，只需看一次互動就能判斷", correct: false }
] as const;

const MYTHS = [
  { question: "收容資料寫著「黃金獵犬」，有人因此保證牠一定親人、適合兒童。哪個判讀最完整？", options: ["品種名稱已經整合了穩定性格與家庭適配資訊，因此不必再觀察犬隻對兒童、聲音和接觸的反應", "品種可形成待查證的初步假設；仍要了解個體經驗、社會化、壓力訊號與實際互動", "只要確認牠是成年犬且體型符合品種標準，就能推定同品種犬都會以相近方式與兒童互動"], answer: 1, note: "品種印象不能替個體背書。是否適合兒童，需要查證生活史、社會化、壓力反應及實際互動。" },
  { question: "研究發現某品種平均較常遵從指令。面對眼前這隻犬，應該怎麼使用這項資訊？", options: ["把它當成群體傾向，再觀察個體，不能當作保證", "直接用群體平均推定這隻犬會服從，因為同一品種的遺傳背景足以排除個體差異", "完全忽略品種的工作歷史與群體研究，只用一次現場互動決定牠長期的行為表現"], answer: 0, note: "群體平均可以形成假設，卻不能取代個體評估；同一群體內仍有很大的差異。" },
  { question: "文章整理的研究中，品種只能解釋不到 10% 的行為差異。這句話代表什麼？", options: ["品種與行為完全沒有任何關聯，因此身體構造、工作歷史和群體傾向都不需要再查證", "雖然比例不到 10%，仍足以依品種準確預測每一隻犬的性格、家庭適配與未來反應", "品種可能影響部分傾向，但更多差異仍要從發育、社會化、環境與經驗理解"], answer: 2, note: "『有影響』不等於『能決定』。不到 10% 提醒我們：不能拿品種名稱代替對個體與情境的查證。" },
  { question: "一隻小型犬在被陌生人突然抱起時吠叫。下列哪個判讀比較合理？", options: ["這個反應已經足以證明小型犬天生神經質；之後即使情境不同，也不必再觀察牠的壓力訊號", "先看突然靠近、被抱起、受驚等情境與過往經驗，再評估牠的行為", "為了避免衝突，應禁止所有小型犬接近陌生人；如此就不用理解被抱起前後發生了什麼"], answer: 1, note: "行為發生在情境中。體型會影響犬如何經驗世界，人類靠近、抱起或驚嚇牠的方式也可能改變反應。" },
  { question: "既然不能用品種判定個性，品種資訊什麼時候仍然有用？", options: ["用來提前留意身體構造、工作背景與可能的照護需求，再回到個體確認", "用來比較不同犬隻的生命價值，並優先排除社會評價較差或照護成本可能較高的品種", "用來保證牠未來一定出現某種性格，讓家庭不必再做行為觀察、健康檢查或適配評估"], answer: 0, note: "品種可提示身體限制、工作傾向或照護方向；正確用法是提出下一個問題，而不是提前宣布答案。" }
] as const;

const HEALTH_MYTHS = [
  { question: "研究寫「42% 在純種犬較高」，這個 42% 的分母是什麼？", options: ["研究納入的全部純種犬個體數，所以代表其中約四成已被診斷出遺傳疾病", "研究比較的 24 種遺傳疾病", "現有醫學已知的所有犬類疾病，因此可直接推論每一種疾病的發生比例"], answer: 1, note: "42% 是 10 ÷ 24，指 24 種疾病中有 10 種在純種犬較常見；不是說 42% 的純種犬生病。" },
  { question: "13 種疾病在混種犬與純種犬之間沒有顯著差異，最合理的解讀是什麼？", options: ["這表示兩組犬都不會罹患這些疾病，因此不需要針對相關症狀安排個體檢查", "混種並不會自動消除廣泛存在的風險，兩組仍需個體健康評估", "只要統計沒有顯著差異，就代表研究沒有提供任何資訊，也不必再考慮其他健康證據"], answer: 1, note: "『沒有顯著差異』不是『沒有疾病』。髖關節問題、研究中的多種癌症等，仍可能出現在兩組犬。" },
  { question: "基因多樣性可能降低部分遺傳風險，能推出「米克斯一定比較健康」嗎？", options: ["可以；混種犬具有較多基因組合，因此能免除例行健康檢查、疫苗與後續醫療追蹤", "不能；雜種優勢只涉及部分風險，健康還受個體基因、年齡、環境與照護影響", "可以；只要外表無法辨認出單一品種，就能排除所有遺傳疾病與後天健康風險"], answer: 1, note: "基因多樣性不是健康保證。研究甚至有 1 種疾病在混種犬較常見，提醒我們不能把群體結果變成個體判決。" },
  { question: "一隻犬的基因檢測沒有發現已知高風險變異，下一步最負責任的說法是什麼？", options: ["檢測已證明牠終生不會生病，因此後續身體檢查和病史紀錄都可以停止", "結果可供獸醫規劃參考，但不能取代身體檢查、病史與後續追蹤", "既然沒有發現已知變異，就可以停止疫苗、預防醫療及環境風險的管理"], answer: 1, note: "基因檢測不是醫療診斷，也無法涵蓋所有疾病與環境因素；需要和獸醫的個體評估一起使用。" }
] as const;

const HEALTH_CHOICES = [
  { id: "health-v2-records", label: "整理家族或既往病史、目前症狀與健康檢查紀錄", correct: true },
  { id: "health-v2-vet", label: "由獸醫依年齡、身體狀況與可能風險安排檢查", correct: true },
  { id: "health-v2-screening", label: "把品種或血緣線索轉成適用的篩檢問題，而不是直接診斷", correct: true },
  { id: "health-v2-limits", label: "理解基因檢測不是醫療診斷，陰性結果也不保證終生健康", correct: true },
  { id: "health-v2-mix-skip", label: "只要是米克斯，就能省略例行檢查與預防醫療", correct: false },
  { id: "health-v2-breed-diagnosis", label: "只用品種名稱，就能確定牠未來會罹患哪一種疾病", correct: false },
  { id: "health-v2-overclaim", label: "這項研究已證明所有純種犬都比所有米克斯不健康", correct: false }
] as const;

const CARE_PLANNER_CATEGORIES = [
  { id: "long-term", label: "我能長期承擔" },
  { id: "support", label: "需要家庭或專業支援" },
  { id: "not-yet", label: "目前還無法承擔" }
] as const;

const CARE_PLANNER_ITEMS = [
  { id: "checkups", label: "定期健康檢查", explanation: "定期檢查是長期照護的一部分；無論選在哪一欄，都要知道由誰預約、陪同並持續追蹤。" },
  { id: "medical-cost", label: "可能出現的長期醫療費", explanation: "這不是在測驗誰比較有錢，而是確認家庭是否願意共同規劃必要醫療與不足時的求助方案。" },
  { id: "activity-rehab", label: "每日活動或復健需求", explanation: "活動或復健可能每天發生，也可能隨疾病和年齡改變，需要時間、人力與專業建議。" },
  { id: "specialist-vet", label: "尋找熟悉相關疾病的獸醫", explanation: "品種或病史只能提示風險；實際檢查、治療與轉診仍要由合適的獸醫評估。" },
  { id: "emergency", label: "突發手術與緊急醫療", explanation: "緊急事件無法等到生活有空時才發生，應事先確認決策者、交通與可動用資源。" },
  { id: "family-care", label: "家庭成員共同照護", explanation: "共同照護需要具名分工與備援，不能只用『大家會幫忙』代替可執行安排。" },
  { id: "medication-diet", label: "長期用藥或特殊飲食", explanation: "長期用藥與飲食管理需要穩定執行、觀察反應並依專業意見調整。" }
] as const satisfies readonly TreasureItem[];

const MARKET_MYTHS = [
  { question: "喜歡品種犬、選擇購買，就一定是不負責任嗎？", options: ["是；只要透過購買取得犬隻，就一定支持不當繁殖，不必再查業者資格、環境或健康資料", "不一定；關鍵包括來源、繁殖動物福利、健康資訊與購買者是否充分準備", "不是；只要家庭付得起購買價格與基本用品，就已經完成來源和長期責任的評估"], answer: 1, note: "文章的重點不是替購買貼上善惡標籤，而是追問這次消費支持了什麼樣的繁殖與買賣。" },
  { question: "只要宣傳「領養代替購買」，就能解決非法繁殖嗎？", options: ["不完全；領養幫無主動物找家，辨識並拒絕惡質來源則是另一項工作", "可以；只要提高領養宣傳，來源查核、市場監督及消費者索取證明就不再必要", "可以；只要讓所有品種犬退出市場，非法繁殖、棄養和源頭管理問題就會同時消失"], answer: 0, note: "領養與不助長非法繁殖有不同訴求；口號不能取代消費資訊、查核與監督。" },
  { question: "業者有合法許可，就代表一定是優良繁殖者嗎？", options: ["是；取得許可已代表每隻種犬的健康、生活品質與所有繁殖計畫都受到完整保證", "不一定；合法是最低門檻，還要查繁殖計畫、篩檢、環境及種犬生活狀況", "是；只要網路評價和追蹤人數夠多，就能替代現場環境、健康紀錄與契約查核"], answer: 1, note: "合法資格是起點，不是品質保證；是否公開可驗證的健康與動物福利證據才是關鍵。" },
  { question: "近親繁殖應該怎麼理解？", options: ["它可能是育種策略，但會提高遺傳疾病風險，需要科學計畫、族譜與篩檢", "只要能穩定維持品種外觀和血統特徵，就可以忽略疾病風險、族譜資訊與後續健康追蹤", "近親繁殖能讓優良特徵固定，因此每一隻後代都會更健康，也不需要進行遺傳檢測"], answer: 0, note: "不能只用『一定好』或『一定壞』回答；重點是風險是否被看見、管理並誠實揭露。" },
  { question: "買到不健康的犬貓，只能歸因於品種遺傳嗎？", options: ["可以；只要是品種犬貓，健康問題就必然來自遺傳，繁殖環境和後天照護不會改變結果", "不是；育種方式、繁殖期照護、營養、環境、遺傳與後天照護都可能影響健康", "不一定；但只要幼年外表活潑、食慾正常，就能排除日後疾病與繁殖期照護造成的風險"], answer: 1, note: "健康結果往往由多個因素共同形成，不能把所有問題都推給品種，也不能省略個體檢查。" },
  { question: "購買要如何降低支持傷害的風險？", options: ["把價格、交付速度與外觀列為主要依據；如果賣方回覆迅速，就不必再確認繁殖環境", "確認幼犬照片、毛色與體型符合期待即可；種犬生活、篩檢紀錄與契約可在付款後再詢問", "查核合法資格、繁殖環境、種犬健康、篩檢資料，並索取健康證明與閱讀契約"], answer: 2, note: "有意義的選擇來自可查證資料；消費者的追問，也會影響市場願意提供什麼樣的繁殖與照護。" }
] as const;

const RESPONSIBILITY_CHOICES = [
  { id: "source-legal", label: "先確認特定寵物業許可，再繼續查核是否符合更高的健康與動福標準", correct: true },
  { id: "parents", label: "查看繁殖場環境，以及種公、種母的生活與健康狀況", correct: true },
  { id: "screening", label: "索取遺傳疾病篩檢與健康檢查資料，確認檢查對象及日期", correct: true },
  { id: "plan", label: "詢問育種策略、血緣與族譜，理解業者如何降低遺傳風險", correct: true },
  { id: "source-contract", label: "索取近期健康檢查證明，並逐條閱讀雙方同意的買賣契約", correct: true },
  { id: "license-only", label: "只要有合法執照，就不必再看環境、篩檢或種犬狀況", correct: false },
  { id: "popular", label: "社群追蹤人數多、幼犬照片可愛，就足以證明來源優良", correct: false },
  { id: "fast", label: "不能說明繁殖計畫也沒關係，只要能最快、最便宜交付", correct: false }
] as const;

const VIDEO_QUESTIONS = [
  { question: "看見犬隻需要一個家時，負責任的下一步是什麼？", options: ["先把犬隻帶回家，再利用共同生活的過程慢慢確認需求與家庭是否能配合", "先了解個體需求，再確認家庭能否長期承擔", "優先挑外表最接近理想品種的犬，因為外觀能推測未來性格與照護難度"], answer: 1, note: "同情可以開啟關係，但長期照護需要資訊、資源與家庭共識。" },
  { question: "如果犬隻標示為「混種犬、中型」，還應理解什麼？", options: ["品種與體型標籤已足以判斷家庭適配，不必再向照護者詢問個體生活史", "只需再確認毛色與照片是否符合偏好，其他需求可等認養回家後再觀察", "健康、行為、活動量、成年體型與照護需求"], answer: 2, note: "品種與體型只是欄位，真正的責任判斷需要完整的個體資料。" }
] as const;

const W3_STATS = [
  { breed: "混種犬", sample: 5362, median: 724, over180: "75.1%" },
  { breed: "柴犬", sample: 83, median: 194, over180: "51.8%" },
  { breed: "貴賓犬", sample: 55, median: 207, over180: "56.4%" },
  { breed: "比特犬", sample: 36, median: 1098.5, over180: "97.2%" }
] as const;

const DATA_CHOICES = [
  { id: "records", label: "真正的認養興趣與紀錄", correct: true },
  { id: "health", label: "犬隻年齡、體型與健康狀況", correct: true },
  { id: "behavior", label: "個體行為與過往生活史", correct: true },
  { id: "region", label: "地區與收容所資源差異", correct: true },
  { id: "breed-rule", label: "品種欄位如何被判定", correct: true },
  { id: "exposure", label: "認養資訊曝光方式與民眾偏好", correct: true },
  { id: "one-photo", label: "看一張照片就能證明品種造成留所較久", correct: false },
  { id: "largest", label: "只找最高的數字，不必比較樣本數與地區", correct: false },
  { id: "comments", label: "用少數網路留言代表所有領養人的想法", correct: false }
] as const;

type SavedWeekThree = {
  foundationsVersion: number;
  stage: number;
  furthest: number;
  hearts: Record<number, number>;
  historyOpened: string[];
  timelineAnswer: string;
  mythAnswers: Record<number, number>;
  healthAnswers: Record<number, number>;
  marketAnswers: Record<number, number>;
  healthActions: string[];
  treasureAnswers: Record<string, string>;
  treasureCompleted: boolean;
  responsibilityActions: string[];
  videoAnswers: Record<number, number>;
  dataChecks: string[];
  reflection: string;
  boundaryConfirmed: boolean;
  completed: boolean;
};

const DEFAULT_HEARTS: Record<number, number> = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
const EMPTY: SavedWeekThree = { foundationsVersion: FOUNDATIONS_VERSION, stage: 0, furthest: 0, hearts: DEFAULT_HEARTS, historyOpened: [], timelineAnswer: "", mythAnswers: {}, healthAnswers: {}, marketAnswers: {}, healthActions: [], treasureAnswers: {}, treasureCompleted: false, responsibilityActions: [], videoAnswers: {}, dataChecks: [], reflection: "", boundaryConfirmed: false, completed: false };

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

function shuffledForVisit<T>(values: readonly T[], key: string): T[] {
  let result = shuffled(values);
  try {
    const storageKey = `shelterlab-choice-order-${key}`;
    const previous = window.sessionStorage.getItem(storageKey);
    if (result.length > 1 && previous === JSON.stringify(result)) {
      result = [...result.slice(1), result[0]];
    }
    window.sessionStorage.setItem(storageKey, JSON.stringify(result));
  } catch {}
  return result;
}

type ChoiceOrders = {
  timeline: string[];
  myths: number[][];
  healthMyths: number[][];
  health: string[];
  responsibility: string[];
  markets: number[][];
  videos: number[][];
  data: string[];
};

const INITIAL_ORDERS: ChoiceOrders = {
  timeline: TIMELINE_OPTIONS.map((item) => item.id),
  myths: MYTHS.map((item) => item.options.map((_, index) => index)),
  healthMyths: HEALTH_MYTHS.map((item) => item.options.map((_, index) => index)),
  health: HEALTH_CHOICES.map((item) => item.id),
  responsibility: RESPONSIBILITY_CHOICES.map((item) => item.id),
  markets: MARKET_MYTHS.map((item) => item.options.map((_, index) => index)),
  videos: VIDEO_QUESTIONS.map((item) => item.options.map((_, index) => index)),
  data: DATA_CHOICES.map((item) => item.id)
};

function StagePaper({ children }: { children: React.ReactNode }) {
  return <article className={`${base.stagePaper} ${styles.weekThreePaper}`}>{children}</article>;
}

export default function WeekThreeExperience() {
  const router = useRouter();
  const { completeWeek, progress } = useStudentLearningProgress();
  const [saved, setSaved] = useState<SavedWeekThree>(EMPTY);
  const [ready, setReady] = useState(false);
  const [historyDialog, setHistoryDialog] = useState<(typeof HISTORY)[number] | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "correct" | "wrong"; title: string; body: string } | null>(null);
  const [orders, setOrders] = useState<ChoiceOrders>(INITIAL_ORDERS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedWeekThree>;
        const hasCurrentFoundations = parsed.foundationsVersion === FOUNDATIONS_VERSION;
        setSaved({
          ...EMPTY,
          ...parsed,
          foundationsVersion: FOUNDATIONS_VERSION,
          hearts: hasCurrentFoundations ? { ...DEFAULT_HEARTS, ...(parsed.hearts ?? {}) } : { ...DEFAULT_HEARTS },
          stage: hasCurrentFoundations ? Math.min(Math.max(Number(parsed.stage) || 0, 0), 5) : 0,
          furthest: Math.min(Math.max(Number(parsed.furthest) || 0, 0), 5),
          historyOpened: hasCurrentFoundations ? (parsed.historyOpened ?? []) : [],
          timelineAnswer: hasCurrentFoundations ? (parsed.timelineAnswer ?? "") : "",
          mythAnswers: hasCurrentFoundations ? (parsed.mythAnswers ?? {}) : {},
          healthAnswers: hasCurrentFoundations ? (parsed.healthAnswers ?? {}) : {},
          healthActions: hasCurrentFoundations ? (parsed.healthActions ?? []) : [],
          treasureAnswers: hasCurrentFoundations ? (parsed.treasureAnswers ?? {}) : {},
          treasureCompleted: hasCurrentFoundations ? (parsed.treasureCompleted ?? Boolean(parsed.completed)) : false,
          marketAnswers: hasCurrentFoundations ? (parsed.marketAnswers ?? {}) : {},
          responsibilityActions: hasCurrentFoundations ? (parsed.responsibilityActions ?? []) : [],
          completed: hasCurrentFoundations ? Boolean(parsed.completed) : false
        });
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
  }, [ready, saved]);

  useEffect(() => {
    if (!ready) return;
    setOrders((current) => {
      if (saved.stage === 0) return { ...current, timeline: shuffledForVisit(TIMELINE_OPTIONS.map((item) => item.id), "week3-timeline") };
      if (saved.stage === 1) return { ...current, myths: MYTHS.map((item, index) => shuffledForVisit(item.options.map((_, optionIndex) => optionIndex), `week3-myth-${index}`)) };
      if (saved.stage === 2) return {
        ...current,
        healthMyths: HEALTH_MYTHS.map((item, index) => shuffledForVisit(item.options.map((_, optionIndex) => optionIndex), `week3-health-myth-${index}`)),
        health: shuffledForVisit(HEALTH_CHOICES.map((item) => item.id), "week3-health")
      };
      if (saved.stage === 3) return {
        ...current,
        markets: MARKET_MYTHS.map((item, index) => shuffledForVisit(item.options.map((_, optionIndex) => optionIndex), `week3-market-${index}`)),
        responsibility: shuffledForVisit(RESPONSIBILITY_CHOICES.map((item) => item.id), "week3-responsibility")
      };
      if (saved.stage === 4) return { ...current, videos: VIDEO_QUESTIONS.map((item, index) => shuffledForVisit(item.options.map((_, optionIndex) => optionIndex), `week3-video-${index}`)) };
      return { ...current, data: shuffledForVisit(DATA_CHOICES.map((item) => item.id), "week3-data") };
    });
  }, [ready, saved.stage]);

  const mythComplete = useMemo(() => MYTHS.every((item, index) => saved.mythAnswers[index] === item.answer), [saved.mythAnswers]);
  const mythProgress = MYTHS.filter((item, index) => saved.mythAnswers[index] === item.answer).length;
  const healthComplete = useMemo(() => HEALTH_MYTHS.every((item, index) => saved.healthAnswers[index] === item.answer), [saved.healthAnswers]);
  const healthProgress = HEALTH_MYTHS.filter((item, index) => saved.healthAnswers[index] === item.answer).length;
  const marketComplete = useMemo(() => MARKET_MYTHS.every((item, index) => saved.marketAnswers[index] === item.answer), [saved.marketAnswers]);
  const marketProgress = MARKET_MYTHS.filter((item, index) => saved.marketAnswers[index] === item.answer).length;
  const videoComplete = useMemo(() => VIDEO_QUESTIONS.every((item, index) => saved.videoAnswers[index] === item.answer), [saved.videoAnswers]);
  const correctHealth = saved.healthActions.filter((id) => HEALTH_CHOICES.find((item) => item.id === id)?.correct).length;
  const correctResponsibility = saved.responsibilityActions.filter((id) => RESPONSIBILITY_CHOICES.find((item) => item.id === id)?.correct).length;
  const correctData = saved.dataChecks.filter((id) => DATA_CHOICES.find((item) => item.id === id)?.correct).length;
  const reflectionLength = saved.reflection.trim().length;
  const treasureUnlocked = isTreasureUnlockedForWeek(3, progress.completedWeeks, progress.unlockedTools);
  const canContinue = [
    HISTORY.every((item) => saved.historyOpened.includes(item.id)) && saved.timelineAnswer === "sequence",
    mythComplete,
    healthComplete && correctHealth === HEALTH_CHOICES.filter((item) => item.correct).length && saved.treasureCompleted,
    marketComplete && correctResponsibility === RESPONSIBILITY_CHOICES.filter((item) => item.correct).length,
    videoComplete,
    correctData >= 3 && reflectionLength > 0 && saved.boundaryConfirmed
  ][saved.stage];

  const finalButtonLabel = correctData < 3
    ? `再選 ${3 - correctData} 項可查證資料`
    : !saved.boundaryConfirmed
        ? "請先確認資料解讀界線"
        : "完成第三週並送交稽核";

  const loseHeart = (stage: number, message: string, reset: (current: SavedWeekThree) => SavedWeekThree) => {
    setSaved((current) => {
      const next = Math.max(0, (current.hearts[stage] ?? 3) - 1);
      if (next === 0) {
        setFeedback({ kind: "wrong", title: "愛心用完了，任務重新開始", body: `${message} 這一環節已重設，重新閱讀線索再挑戰一次。` });
        const cleared = reset(current);
        return { ...cleared, hearts: { ...cleared.hearts, [stage]: 3 } };
      }
      setFeedback({ kind: "wrong", title: "這個判斷還需要再想想", body: message });
      return { ...current, hearts: { ...current.hearts, [stage]: next } };
    });
  };

  const answerTimeline = (id: string, correct: boolean) => {
    if (correct) {
      setSaved((current) => ({ ...current, timelineAnswer: id }));
      setFeedback({ kind: "correct", title: "四段歷史串起來了", body: "共同生活 → 功能選育 → 外觀與血統標準 → 今日的有限線索。品種既不是命運，也不是毫無資訊。" });
    } else loseHeart(0, "不要在『品種決定一切』與『品種毫無意義』之間二選一；回看每張卡的形成機制與適用範圍。", (current) => ({ ...current, timelineAnswer: "" }));
  };

  const answerMyth = (index: number, option: number) => {
    if (option === MYTHS[index].answer) {
      setSaved((current) => ({ ...current, mythAnswers: { ...current.mythAnswers, [index]: option } }));
      setFeedback({ kind: "correct", title: "判讀正確", body: MYTHS[index].note });
    } else loseHeart(1, MYTHS[index].note, (current) => ({ ...current, mythAnswers: {} }));
  };

  const answerHealth = (index: number, option: number) => {
    if (option === HEALTH_MYTHS[index].answer) {
      setSaved((current) => ({ ...current, healthAnswers: { ...current.healthAnswers, [index]: option } }));
      setFeedback({ kind: "correct", title: "資料解讀正確", body: HEALTH_MYTHS[index].note });
    } else loseHeart(2, HEALTH_MYTHS[index].note, (current) => ({ ...current, healthAnswers: {}, healthActions: [], treasureAnswers: {}, treasureCompleted: false }));
  };

  const answerVideo = (index: number, option: number) => {
    if (option === VIDEO_QUESTIONS[index].answer) {
      setSaved((current) => ({ ...current, videoAnswers: { ...current.videoAnswers, [index]: option } }));
      setFeedback({ kind: "correct", title: "判讀正確", body: VIDEO_QUESTIONS[index].note });
    } else loseHeart(4, VIDEO_QUESTIONS[index].note, (current) => ({ ...current, videoAnswers: {} }));
  };

  const answerMarket = (index: number, option: number) => {
    if (option === MARKET_MYTHS[index].answer) {
      setSaved((current) => ({ ...current, marketAnswers: { ...current.marketAnswers, [index]: option } }));
      setFeedback({ kind: "correct", title: "迷思拆解正確", body: MARKET_MYTHS[index].note });
    } else {
      loseHeart(3, MARKET_MYTHS[index].note, (current) => ({ ...current, marketAnswers: {}, responsibilityActions: [] }));
    }
  };

  const fileChoice = (stage: 2 | 3 | 5, id: string, correct: boolean) => {
    const key = stage === 2 ? "healthActions" : stage === 3 ? "responsibilityActions" : "dataChecks";
    if (!correct) {
      const hint = stage === 2 ? "負責任的健康判斷需要證據與個體檢查，不能用品種直接診斷。" : stage === 3 ? "人氣、價格或一張合法證照都不能單獨證明繁殖來源具有良好動物福利。" : "資料能提出問題，不能只靠單一數字或照片證明因果。";
      loseHeart(stage, hint, (current) => stage === 2 ? { ...current, healthAnswers: {}, healthActions: [], treasureAnswers: {}, treasureCompleted: false } : stage === 3 ? { ...current, marketAnswers: {}, responsibilityActions: [] } : { ...current, [key]: [] });
      return;
    }
    setSaved((current) => {
      const values = current[key];
      return values.includes(id) ? current : { ...current, [key]: [...values, id] };
    });
    setFeedback({ kind: "correct", title: stage === 3 ? "查核證據成立" : "已放入責任檔案", body: stage === 3 ? "這是能進一步驗證繁殖來源、健康或動物福利的資料。" : "這項判斷有證據基礎，可以保留下來。" });
  };

  const assignTreasure = (item: TreasureItem, categoryId: string) => {
    setSaved((current) => {
      const treasureAnswers = { ...current.treasureAnswers, [item.id]: categoryId };
      return { ...current, treasureAnswers, treasureCompleted: CARE_PLANNER_ITEMS.every((choice) => Boolean(treasureAnswers[choice.id])) };
    });
    setFeedback({ kind: "correct", title: "責任盤點已記錄", body: item.explanation });
  };

  const next = async () => {
    if (!canContinue) return;
    setFeedback(null);
    if (saved.stage < 5) {
      const stage = saved.stage + 1;
      setSaved((current) => ({ ...current, stage, furthest: Math.max(current.furthest, stage) }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (await completeWeek(3)) {
        setSaved((current) => ({ ...current, completed: true }));
        router.push("/student");
      } else setFeedback({ kind: "wrong", title: "尚未送出", body: "請確認網路後再送出；目前作答都已保留。" });
    }
  };

  if (!ready) return <main className={base.experience}><div className={styles.loading}>正在整理第三週的學習卡片…</div></main>;

  if (saved.completed) {
    return <main className={base.experience}>
      <div className={base.shell}>
        <nav className={base.topbar}>
          <Link href="/student" className={base.backLink}>← 返回六週地圖</Link>
          <span className={base.weekStamp}>WEEK 03 · 已完成</span>
        </nav>
        <article className={`${base.stagePaper} ${styles.completionPaper}`}>
          <section className={styles.completionHero}>
            <p>第三週任務完成</p>
            <h1>已送交教師稽核</h1>
            <div className={styles.rewardStage}>
              <span className={styles.rewardGlow} aria-hidden="true" />
              <img src={REWARD.image} alt={REWARD.name} />
            </div>
            <h2>通過後獲得：{REWARD.name}</h2>
            <p className={styles.rewardDescription}>作答已鎖定；教師通過後，寶物與下一週會一起解鎖。</p>
            <div className={styles.completionActions}>
              <button type="button" className={base.paperButton} onClick={() => router.push("/student")}>返回地圖等待審核</button>
            </div>
          </section>
        </article>
      </div>
    </main>;
  }

  return (
    <main className={base.experience}>
      <div className={base.shell}>
        <nav className={base.topbar}>
          <Link href="/student" className={base.backLink}>← 返回六週地圖</Link>
          <span className={base.weekStamp}>WEEK 03 · 品種與標籤</span>
        </nav>

        <header className={base.hero}>
          <p className={base.eyebrow}>第三週</p>
          <h1>{COPY.unitTitle}</h1>
          <p className={base.heroQuestion}>核心提問：品種能提供線索，但它能替我們決定一隻犬的性格、健康與價值嗎？</p>
        </header>

        <div className={base.progressWrap}>
          <div className={base.progressTop}><span>學習進度</span><span>{saved.stage + 1} / 6</span></div>
          <div className={base.progressTrack}><div className={base.progressFill} style={{ width: `${((saved.stage + 1) / 6) * 100}%` }} /></div>
        </div>

        <StagePaper>
          <div className={styles.stageRail} aria-label="第三週六個環節">
            {STAGES.map((label, index) => (
              <button key={label} type="button" disabled={index > saved.furthest} className={index === saved.stage ? styles.activeStage : index < saved.stage ? styles.doneStage : ""} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: index })); }} aria-label={`環節 ${index + 1}：${label}`}>
                {index < saved.stage ? "✓" : index + 1}<small>{label}</small>
              </button>
            ))}
          </div>

          <header className={base.stageHeader}>
            <p className={base.stageLabel}>{saved.stage === 5 ? COPY.stages[saved.stage].label : `環節 ${saved.stage + 1} · ${STAGES[saved.stage]}`}</p>
            <h2 className={base.stageTitle}>{COPY.stages[saved.stage].title}</h2>
          </header>

          <div className={styles.stickyStatus} role="status" aria-live="polite">
            <div className={styles.compactHearts}><span>挑戰愛心</span><strong>{"♥".repeat(saved.hearts[saved.stage] ?? 3)}{"♡".repeat(3 - (saved.hearts[saved.stage] ?? 3))}</strong><small>答錯扣一顆</small></div>
            {feedback && <div className={`${styles.inlineFeedback} ${feedback.kind === "correct" ? styles.inlineCorrect : styles.inlineWrong}`}><strong>{feedback.title}</strong><p>{feedback.body}</p></div>}
          </div>

          {saved.stage === 0 && <section>
            <div className={styles.historyGuide}>
              <span>閱讀方法</span>
              <div><h3>這不是背年代，而是追蹤「人類怎麼改變犬」</h3><p>每張年代卡都要回答三件事：當時發生什麼、改變如何形成，以及這段歷史如何影響我們今天理解品種。</p></div>
              <div className={styles.historyGuideFlow} aria-label="第三週品種形成閱讀順序"><b>共同生活</b><i>→</i><b>功能選育</b><i>→</i><b>外觀標準</b><i>→</i><b>今日標籤</b></div>
            </div>
            <div className={styles.timeline}>
              {HISTORY.map((item, index) => {
                const opened = saved.historyOpened.includes(item.id);
                return <button key={item.id} type="button" aria-pressed={opened} className={opened ? styles.timelineOpened : ""} onClick={() => setHistoryDialog(item)}>
                  <span>{opened ? "✓" : index + 1}</span><strong>{item.era}</strong><b className={styles.timelineTitle}>{item.title}</b><small>{opened ? item.preview : "點擊閱讀完整年代卡"}</small>
                </button>;
              })}
            </div>
            {saved.historyOpened.length === HISTORY.length && <div className={styles.challengeBox}>
              <small className={styles.challengeEyebrow}>四張年代卡已閱讀完畢</small>
              <h3>時間線挑戰：哪一句最完整串起四個階段？</h3>
              <p>把「共同生活、功能選育、現代標準與今日判讀」連成一條因果鏈；不要只記一個年代。</p>
              <div className={styles.choiceGrid}>{orders.timeline.map((id) => TIMELINE_OPTIONS.find((item) => item.id === id)!).map((item) => <button key={item.id} type="button" className={saved.timelineAnswer === item.id ? styles.correctChoice : ""} onClick={() => answerTimeline(item.id, item.correct)}>{item.label}</button>)}</div>
            </div>}
            <a className={styles.sourceLink} href="https://www.savoirtw.org/article/4321" target="_blank" rel="noreferrer">閱讀資料：品種真的能預測一隻犬的個性嗎？ ↗</a>
          </section>}

          {saved.stage === 1 && <section>
            <div className={styles.lessonBanner}><small>作答前，先建立判讀方法</small><h3>品種能提供線索，但不能替眼前的個體下判決</h3><p>文章中的研究不是要我們完全忽略品種，而是把「群體平均」和「個體必然」分開。犬隻行為是多個因素共同作用的結果。</p></div>

            <div className={styles.behaviorResearch} aria-label="文章引用研究的資料規模與主要發現">
              <article><strong>約 20,000</strong><span>份飼主行為問卷</span></article>
              <article><strong>約 2,000</strong><span>隻犬的全基因組資料</span></article>
              <article><strong>不到 10%</strong><span>品種可解釋的行為差異</span></article>
              <p>研究刻意納入許多米克斯，並同時比較行為調查與 DNA。結果發現部分貼近歷史工作的行為確有遺傳訊號，但沒有任何一項行為是某品種每隻犬都具備，或只屬於單一品種。</p>
            </div>

            <div className={styles.behaviorFormula}>
              <small>行為判讀框架｜這是閱讀順序，不是計算公式</small>
              <div><span>遺傳傾向</span><b>＋</b><span>發育與社會化</span><b>＋</b><span>過往經驗</span><b>＋</b><span>當下環境</span><b>＋</b><span>人的互動方式</span></div>
              <strong>共同影響「眼前這隻犬現在怎麼行動」</strong>
            </div>

            <div className={styles.behaviorLessonGrid}>
              <article><small>品種能告訴我們</small><h3>一段歷史與寬鬆傾向</h3><p>工作選育、體型與身體構造可能留下某些群體傾向，也能提示活動、健康或照護需求。它適合用來提出下一個問題。</p></article>
              <article><small>品種不能保證</small><h3>每個個體都照劇本行動</h3><p>同一品種中也可能有很大差異。文章整理的研究顯示，品種只能解釋不到 10% 的行為差異，預測力有限。</p></article>
              <article><small>人類也在影響結果</small><h3>期待會改變互動與機會</h3><p>如果先認定某犬親人、固執或危險，我們可能用不同方式靠近牠，也可能影響牠能否被領養、居住或參與工作。</p></article>
            </div>

            <div className={styles.behaviorExample}>
              <div><small>判讀示範</small><h3>資料卡只寫「黃金獵犬」，可以直接判定牠適合兒童嗎？</h3><p>不行。品種名稱最多讓我們形成一個待查證假設，接著仍要把鏡頭拉回個體。</p></div>
              <ol><li><b>先看線索</b><span>品種與工作背景可能提示什麼？</span></li><li><b>再問資料</b><span>牠的生活史、社會化與健康狀況如何？</span></li><li><b>觀察當下</b><span>牠在不同距離與互動中有哪些壓力訊號？</span></li><li><b>最後決定</b><span>用個體證據評估需求與適配，不用品種代替答案。</span></li></ol>
            </div>

            <div className={styles.taskSectionHeading}>
              <span>任務</span>
              <div><h3>把「線索」和「判決」分開</h3><p>完成五個情境判讀。每題只有一個最完整答案，選項每次進入都會重新排列。</p></div>
              <strong>{mythProgress} / {MYTHS.length}</strong>
            </div>
            <div className={`${styles.quizStack} ${styles.behaviorQuizGrid}`}>{MYTHS.map((item, index) => <fieldset className={styles.quizCard} key={item.question}>
              <legend><span>{index + 1}</span>{item.question}</legend>
              <div className={styles.choiceGrid}>{orders.myths[index].map((optionIndex) => <button key={item.options[optionIndex]} type="button" aria-pressed={saved.mythAnswers[index] === optionIndex} className={saved.mythAnswers[index] === optionIndex ? styles.correctChoice : ""} onClick={() => answerMyth(index, optionIndex)}>{item.options[optionIndex]}</button>)}</div>
              {saved.mythAnswers[index] === item.answer && <p className={styles.answerExplanation}><strong>判讀重點</strong>{item.note}</p>}
            </fieldset>)}</div>
            <a className={styles.sourceLink} href="https://www.savoirtw.org/article/4321" target="_blank" rel="noreferrer">閱讀資料：品種、行為與刻板印象 ↗</a>
          </section>}

          {saved.stage === 2 && <section>
            <div className={styles.healthThesis}>
              <small>先把分母看清楚</small>
              <h3>42% 是「疾病種類」的比例，不是犬隻的生病率</h3>
              <p>UC Davis 的病例對照研究檢視 24 種遺傳疾病。結果是其中 10 種在純種犬較常見、1 種在混種犬較常見、13 種沒有偵測到顯著差異；這不能改寫成「42% 的純種犬生病」。</p>
            </div>

            <div className={styles.healthStudyBoard}>
              <div className={styles.healthStudyMeta}><span>病例紀錄</span><strong>27,254 隻犬</strong><p>研究另外為每一疾病配對年齡、體重與性別相近的健康對照，逐項比較兩組犬的疾病表現。</p></div>
              <div className={styles.healthDiseaseMap} aria-label="24 種遺傳疾病的研究結果分布">
                {Array.from({ length: 24 }, (_, index) => <span key={index} className={index < 10 ? styles.diseasePure : index === 10 ? styles.diseaseMixed : styles.diseaseSimilar} aria-hidden="true" />)}
              </div>
              <div className={styles.healthLegend}>
                <article><i className={styles.diseasePure} /><strong>10 / 24</strong><span>約 42%：純種犬較常見</span></article>
                <article><i className={styles.diseaseMixed} /><strong>1 / 24</strong><span>約 4%：混種犬較常見</span></article>
                <article><i className={styles.diseaseSimilar} /><strong>13 / 24</strong><span>約 54%：沒有顯著差異</span></article>
              </div>
              <p className={styles.healthMathNote}>原文章寫「約 52%」，但原始研究列出 13 種無顯著差異；13 ÷ 24 約為 54%。本頁以原始項目數 10＋1＋13＝24 呈現。</p>
            </div>

            <div className={styles.diseaseGroups}>
              <article><small>純種犬較常見｜10 種</small><h3>部分風險可能隨封閉血系累積</h3><p>包括主動脈狹窄、異位性皮膚炎、胃扭轉、早發性白內障、擴張性心肌病、肘關節發育不良、癲癇、甲狀腺功能低下、椎間盤疾病與肝門脈短路。</p></article>
              <article><small>沒有顯著差異｜13 種</small><h3>混種不會把所有風險洗掉</h3><p>例如髖關節發育不良、研究中的多種癌症與肥厚性心肌病。沒有顯著差異不等於沒有疾病，而是這份資料沒有顯示兩組有明確差距。</p></article>
              <article><small>混種犬較常見｜1 種</small><h3>前十字韌帶斷裂</h3><p>這個結果提醒我們：沒有任何一組犬能被簡化成「永遠比較健康」。真正的照護仍要回到個體病史、身體狀況與獸醫評估。</p></article>
            </div>

            <div className={styles.healthBoundary}><strong>雜種優勢的正確邊界</strong><p>較高的基因多樣性可能降低「部分」遺傳疾病風險，但不等於全面免疫。基因檢測可以提供線索，也不是醫療診斷；健康判斷還需要病史、身體檢查、年齡、環境與後續追蹤。</p></div>

            <TreasureWorkspace
              week={3}
              objective="把外貌偏好可能伴隨的健康風險，轉成自己與家庭需要承擔的長期照護條件。"
              instruction="使用責任盤點表整理每一項照護條件。這不是測驗你有沒有錢，而是誠實分辨哪些能長期做到、哪些需要支援，以及哪些目前還做不到。"
              categories={CARE_PLANNER_CATEGORIES}
              items={CARE_PLANNER_ITEMS}
              assignments={saved.treasureAnswers}
              completed={saved.treasureCompleted}
              unlocked={treasureUnlocked}
              onAssign={assignTreasure}
            />

            <div className={styles.taskSectionHeading}>
              <span>任務一</span>
              <div><h3>讀懂研究，而不是只背百分比</h3><p>四個情境都在測試同一件事：你有沒有把群體研究誤用成個體保證。</p></div>
              <strong>{healthProgress} / {HEALTH_MYTHS.length}</strong>
            </div>
            <div className={styles.taskPanel}><div className={`${styles.quizStack} ${styles.behaviorQuizGrid}`}>{HEALTH_MYTHS.map((item, index) => <fieldset className={styles.quizCard} key={item.question}>
              <legend><span>{index + 1}</span>{item.question}</legend>
              <div className={styles.choiceGrid}>{orders.healthMyths[index].map((optionIndex) => <button key={item.options[optionIndex]} type="button" aria-pressed={saved.healthAnswers[index] === optionIndex} className={saved.healthAnswers[index] === optionIndex ? styles.correctChoice : ""} onClick={() => answerHealth(index, optionIndex)}>{item.options[optionIndex]}</button>)}</div>
              {saved.healthAnswers[index] === item.answer && <p className={styles.answerExplanation}><strong>判讀重點</strong>{item.note}</p>}
            </fieldset>)}</div></div>

            <div className={styles.taskSectionHeading}>
              <span>任務二</span>
              <div><h3>把研究轉成健康照護行動</h3><p>從 7 張卡片找出 4 項能真正支持個體健康判斷的做法。</p></div>
              <strong>{correctHealth} / 4</strong>
            </div>
            <div className={styles.taskPanel}><div className={styles.cardGrid}>{orders.health.map((id) => HEALTH_CHOICES.find((item) => item.id === id)!).map((item) => <button key={item.id} type="button" aria-pressed={saved.healthActions.includes(item.id)} className={saved.healthActions.includes(item.id) ? styles.filedChoice : ""} onClick={() => fileChoice(2, item.id, item.correct)}>{saved.healthActions.includes(item.id) ? "✓ " : "＋ "}{item.label}</button>)}</div><small className={styles.taskProgress}>已找到 {correctHealth} / 4 項健康證據</small></div>

            <div className={styles.sourceRow}>
              <a className={styles.sourceLink} href="https://biligene.com.tw/blogs/news/%e7%b1%b3%e5%85%8b%e6%96%af%e6%af%94%e8%bc%83%e5%81%a5%e5%ba%b7%e5%97%8e-%e6%b7%b7%e8%a1%80%e7%8a%ac%e8%88%87%e7%b4%94%e7%a8%ae%e7%8a%ac%e7%9a%84%e5%81%a5%e5%ba%b7%e7%9c%9f%e7%9b%b8" target="_blank" rel="noreferrer">閱讀資料：混種犬與純種犬的健康真相 ↗</a>
              <a className={styles.sourceLink} href="https://pubmed.ncbi.nlm.nih.gov/23683021/" target="_blank" rel="noreferrer">原始研究：24 種遺傳疾病比較 ↗</a>
            </div>
          </section>}

          {saved.stage === 3 && <section>
            <div className={styles.marketThesis}>
              <small>這一關不替選擇貼善惡標籤</small>
              <h3>不是選邊站，而是看見生命來源</h3>
              <p>真正要判斷的，不是「領養的人一定比較好」或「合法購買就一定沒問題」，而是每一個選擇有沒有看見生命來源，以及背後的繁殖、健康與動物福利。</p>
            </div>

            <div className={styles.splitLesson}>
              <article><small>領養的訴求</small><h3>讓正在等待的無主動物有家</h3><p>領養回應的是已經存在、正在等待安置的生命；牠的品種或外表不應決定是否值得被好好照顧。</p></article>
              <article><small>拒絕惡質來源</small><h3>不讓消費繼續支持繁殖傷害</h3><p>不購買來路不明的犬貓、要求可驗證資訊，是在阻止需求支持非法或低動福繁殖。這與領養相關，但不是同一件事。</p></article>
            </div>

            <div className={styles.marketLessonIntro}><small>六大迷思教學區</small><h3>先理解每個「不一定」背後要查什麼</h3><p>下面不是六句口號。每張卡都指出一個常見的二分法，以及判斷時不能漏掉的證據；讀完後再進入任務。</p></div>
            <div className={styles.marketLessonGrid}>
              <article><span>迷思 1</span><strong>不一定，看你怎麼買</strong><h3>喜歡品種不等於支持傷害</h3><p>偏好特定外觀或需求本身不是善惡判決；問題在於是否衝動購買、是否具備照護能力，以及這次消費支持了什麼樣的繁殖與動物福利。</p></article>
              <article><span>迷思 2</span><strong>不完全，是兩項不同工作</strong><h3>領養與拒絕惡質繁殖不能互相取代</h3><p>領養幫已存在的無主動物找到家；查核並拒絕不當來源，則是避免需求繼續支持非法或低動福繁殖。兩者相關，目的不同。</p></article>
              <article><span>迷思 3</span><strong>有好業者，但合法只是起點</strong><h3>許可證不是品質保證書</h3><p>合法資格代表符合最低管理門檻，不能單獨證明繁殖計畫、遺傳篩檢、環境衛生或種犬生活狀況都達到良好標準。</p></article>
              <article><span>迷思 4</span><strong>可能是策略，也伴隨風險</strong><h3>近親繁殖不能只回答好或壞</h3><p>它可能用來固定特徵，也會提高有害遺傳變異相遇的機會。負責任的判讀必須追問族譜、繁殖計畫、適用品種的篩檢與風險管理。</p></article>
              <article><span>迷思 5</span><strong>健康結果有很多原因</strong><h3>不能只把疾病推給品種</h3><p>育種方式、繁殖期照護、飲食營養、犬舍衛生、遺傳風險、年齡與後天照護都可能影響健康；外表活潑也不能取代檢查。</p></article>
              <article><span>迷思 6</span><strong>可以降低傷害，但要有證據</strong><h3>消費者與業者都必須做好</h3><p>購買前要自我評估、查合法資格、看繁殖環境與種犬狀況、詢問計畫與篩檢、索取近期健康資料，並閱讀雙方同意的契約。</p></article>
            </div>

            <div className={styles.marketDecisionFlow}>
              <small>把知識變成查核順序</small>
              <h3>當資訊不足時，負責任的選擇是先停下來補查</h3>
              <ol><li><b>1</b><span>先評估自己的知識、時間與經濟能力</span></li><li><b>2</b><span>確認合法資格，但不在這一步停止</span></li><li><b>3</b><span>查看環境、種公種母與幼犬的生活狀況</span></li><li><b>4</b><span>詢問繁殖計畫、族譜與遺傳篩檢</span></li><li><b>5</b><span>核對近期健康資料與契約內容</span></li><li><b>6</b><span>任何關鍵資料被拒絕提供，就暫停交易</span></li></ol>
            </div>

            <div className={styles.taskSectionHeading}>
              <span>任務一</span>
              <div><h3>拆解繁殖買賣的六個迷思</h3><p>每題選出最完整的判讀。答錯會扣愛心，提示會立即出現在右下角。</p></div>
              <strong>{marketProgress} / {MARKET_MYTHS.length}</strong>
            </div>
            <div className={styles.taskPanel}><div className={`${styles.quizStack} ${styles.marketQuizGrid}`}>{MARKET_MYTHS.map((item, index) => <fieldset className={styles.quizCard} key={item.question}>
              <legend><span>{index + 1}</span>{item.question}</legend>
              <div className={styles.choiceGrid}>{orders.markets[index].map((optionIndex) => <button key={item.options[optionIndex]} type="button" aria-pressed={saved.marketAnswers[index] === optionIndex} className={saved.marketAnswers[index] === optionIndex ? styles.correctChoice : ""} onClick={() => answerMarket(index, optionIndex)}>{item.options[optionIndex]}</button>)}</div>
              {saved.marketAnswers[index] === item.answer && <p className={styles.answerExplanation}><strong>判讀重點</strong>{item.note}</p>}
            </fieldset>)}</div></div>

            <div className={styles.taskSectionHeading}>
              <span>任務二</span>
              <div><h3>繁殖來源查核</h3><p>從 8 張卡片找出 5 項可進一步驗證的證據。合法許可只是起點，人氣、價格和漂亮照片都不能代替查核。</p></div>
              <strong>{correctResponsibility} / 5</strong>
            </div>
            <div className={styles.taskPanel}><div className={styles.cardGrid}>{orders.responsibility.map((id) => RESPONSIBILITY_CHOICES.find((item) => item.id === id)!).map((item) => <button key={item.id} type="button" aria-pressed={saved.responsibilityActions.includes(item.id)} className={saved.responsibilityActions.includes(item.id) ? styles.filedChoice : ""} onClick={() => fileChoice(3, item.id, item.correct)}>{saved.responsibilityActions.includes(item.id) ? "✓ " : "＋ "}{item.label}</button>)}</div><small className={styles.taskProgress}>已找到 {correctResponsibility} / 5 項查核證據</small></div>

            <div className={styles.marketConclusion}><strong>這一關的結論</strong><p>領養或購買不該變成互相攻擊的標籤。品種犬貓與米克斯都是生命；做選擇時，要能說明來源、拒絕支持傷害，也要準備陪伴牠走完一生。</p></div>
            <div className={styles.sourceRow}>
              <a className={styles.sourceLink} href="https://wuo-wuo.com/topics/companion-animals/breedpet/1330-breeddogs-catsfaq" target="_blank" rel="noreferrer">閱讀資料：繁殖買賣的 6 大迷思 ↗</a>
              <a className={styles.sourceLink} href="https://www.pet.gov.tw/Web/BusinessList.aspx" target="_blank" rel="noreferrer">官方查核：合法寵物業者名單 ↗</a>
            </div>
          </section>}

          {saved.stage === 4 && <section className={styles.videoLayout}>
            <article className={styles.videoPanel}><small>愛學網影音任務</small><h3>牠想要一個家</h3><p>影片帶學生走進流浪動物之家，認識認養流程與條件。請先在官方頁面觀看，再回來完成判讀。</p><a href="https://stv.naer.edu.tw/watch/257495" target="_blank" rel="noreferrer">前往愛學網官方頁面觀看 ↗</a><p className={styles.videoNote}>採用官方外部連結，避免網站禁止 iframe 而出現「拒絕存取」。</p></article>
            <div className={styles.quizStack}>{VIDEO_QUESTIONS.map((item, index) => <fieldset className={styles.quizCard} key={item.question}><legend>影片判讀 {index + 1}</legend><p>{item.question}</p><div className={styles.choiceGrid}>{orders.videos[index].map((optionIndex) => <button key={item.options[optionIndex]} type="button" className={saved.videoAnswers[index] === optionIndex ? styles.correctChoice : ""} onClick={() => answerVideo(index, optionIndex)}>{item.options[optionIndex]}</button>)}</div></fieldset>)}</div>
          </section>}

          {saved.stage === 5 && <section>
            <div className={styles.lessonBanner}><small>資料來源：農業部政府開放資料</small><h3>「動物認領養」資料集</h3><p>本頁使用政府公開的動物認領養資料，整理截止日為 2026-09-05。下方數字用來練習觀察差異與提出問題，不代表認養所需時間或認養率。</p><a className={styles.bannerLink} href="https://data.gov.tw/dataset/85903" target="_blank" rel="noreferrer">查看政府原始資料集 ↗</a></div>
            <p className={styles.statsIntro}>同一份資料快照中，以下比較四種品種標示的樣本數、留所天數中位數與留所超過 180 天的比例。樣本數差異很大，只能描述這批資料，不能推論品種造成留所結果。</p>
            <div className={styles.statsGrid}>{W3_STATS.map((item) => <article key={item.breed}><div><h3>{item.breed}</h3><b>n={item.sample.toLocaleString("zh-TW")}</b></div><div className={styles.statBar}><span style={{ width: `${Math.max(8, (item.median / 1100) * 100)}%` }} /></div><div className={styles.statNumbers}><span>留所天數中位數<strong>{item.median.toLocaleString("zh-TW")} 天</strong></span><span>180 天以上<strong>{item.over180}</strong></span></div></article>)}</div>
            <p className={styles.warning}>四組樣本數差距很大；圖表只能描述目前資料中的分布，不能據此宣稱「某品種造成留所較久」，也不能把結果套到每一隻犬。</p>
            <div className={styles.caseFile}><div className={styles.casePhoto}><img src={CASE_RECORD.image} alt={`開放資料犬隻 ${CASE_RECORD.subId}`} loading="lazy" referrerPolicy="no-referrer" /></div><div><small>政府 Open Data · {CASE_RECORD.subId}</small><h3>「混種犬」沒有說出的事情</h3><div className={styles.caseFields}>{CASE_RECORD.displayFields.map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div><p>{CASE_RECORD.evidenceBoundary}</p></div></div>
            <div className={styles.filedBox}><h3>要解釋差異，還需要哪些證據？</h3><p>至少選出 3 項可繼續查證的資料；把武斷推論放進來會扣愛心。</p><div className={styles.cardGrid}>{orders.data.map((id) => DATA_CHOICES.find((item) => item.id === id)!).map((item) => <button key={item.id} type="button" className={saved.dataChecks.includes(item.id) ? styles.filedChoice : ""} onClick={() => fileChoice(5, item.id, item.correct)}>{saved.dataChecks.includes(item.id) ? "✓ " : "＋ "}{item.label}</button>)}</div><small>已歸檔 {correctData} / 至少 3</small></div>
            <label className={styles.reflection}><span>當我在選擇認養一隻狗時，我是不是會用品種來當成決定性的因素？如果我真的將品種當作決定性因素，可能會有哪些狗的真實需求與經歷因此被忽略？你會如何查證後再做選擇？</span><textarea value={saved.reflection} onChange={(event) => setSaved((current) => ({ ...current, reflection: event.target.value }))} placeholder="請用自己的話寫下：我還需要查什麼、詢問誰，以及我會如何負責……" /><small>{reflectionLength > 0 ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small></label>
            <label className={styles.boundaryCheck}><input type="checkbox" checked={saved.boundaryConfirmed} onChange={(event) => setSaved((current) => ({ ...current, boundaryConfirmed: event.target.checked }))} /><span>我知道這份資料能描述群體差異，但不能單獨證明品種標籤造成留所較久。</span></label>
            <div className={styles.dataSources}><a href="https://data.gov.tw/dataset/85903" target="_blank" rel="noreferrer">農業部動物認領養資料集 ↗</a></div>
          </section>}

          <div className={base.buttonRow}>
            <button type="button" className={base.secondaryButton} disabled={saved.stage === 0} onClick={() => { setFeedback(null); setSaved((current) => ({ ...current, stage: Math.max(0, current.stage - 1) })); }}>← 上一環節</button>
            <button type="button" className={base.paperButton} disabled={!canContinue} onClick={() => void next()}>{saved.stage === 5 ? finalButtonLabel : "完成任務，前往下一環節 →"}</button>
          </div>
        </StagePaper>
      </div>

      {historyDialog && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setHistoryDialog(null)}><section className={`${styles.modalCard} ${styles.historyModal}`} role="dialog" aria-modal="true" aria-labelledby="history-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.historyModalTop}><small>時間線紀錄 · {historyDialog.era}</small><span>{HISTORY.findIndex((item) => item.id === historyDialog.id) + 1} / {HISTORY.length}</span></div>
        <h2 id="history-title">{historyDialog.title}</h2>
        <p className={styles.historyModalLead}>{historyDialog.preview}</p>
        <div className={styles.historyDetailGrid}>
          <article><small>01｜當時發生什麼？</small><p>{historyDialog.context}</p></article>
          <article><small>02｜改變如何形成？</small><p>{historyDialog.change}</p></article>
          <article><small>03｜如何影響今天？</small><p>{historyDialog.impact}</p></article>
        </div>
        <div className={styles.historyTakeaway}><strong>這張卡要帶走的觀念</strong><p>{historyDialog.takeaway}</p></div>
        <button type="button" className={base.paperButton} onClick={() => { setSaved((current) => ({ ...current, historyOpened: current.historyOpened.includes(historyDialog.id) ? current.historyOpened : [...current.historyOpened, historyDialog.id] })); setHistoryDialog(null); }}>我看懂了，回到時間線</button>
      </section></div>}
    </main>
  );
}
