"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import RewardUnlockModal from "@/app/student/_components/reward-unlock-modal";
import { useStudentLearningProgress } from "@/app/student/_components/student-learning-progress";
import { getLearningTool } from "@/lib/student-map";
import { getOpenDataCourseCase } from "@/lib/student-open-data-cases";
import { getStudentCourseTitles } from "@/lib/student-course-titles";
import styles from "./week-one-game.module.css";

const COPY = getStudentCourseTitles(1);
const CASE_RECORD = getOpenDataCourseCase(1);
type PathId = "home" | "work" | "school" | "street";
const isPathId = (value: string): value is PathId => ["home", "work", "school", "street"].includes(value);

const SCENES = [
  { id: "home", icon: "🏠", name: "家庭犬", front: "牠如何成為家庭的一員？", origin: "犬隻可能經由認養、購買、救援或原飼主轉讓進入家庭。", need: "家庭犬提供陪伴，也讓人學習長期照護與尊重生命。", duty: "牠不負責完成任務；家庭須負責飲食、活動、醫療、安全與終身安置。" },
  { id: "work", icon: "🦺", name: "工作犬", front: "牠為什麼穿上工作背心？", origin: "犬隻經過健康、性格與能力評估，再接受符合任務需求的專業訓練。", need: "人類運用犬隻的嗅覺、警覺與合作能力，協助搜救、偵測或服務工作。", duty: "牠在受訓範圍內執行任務；機構須保障工時、休息、醫療、防護與退役生活。" },
  { id: "school", icon: "🏫", name: "校犬", front: "牠如何進入校園生活？", origin: "校犬可能來自收容所、校園周邊或認養計畫，經評估後由學校安置。", need: "穩定且合宜的校犬計畫可連結生命教育，讓學生練習安全互動與照護責任。", duty: "牠可以陪伴校園社群；學校仍須指定成人照護者、經費、休息區與假日安排。" },
  { id: "street", icon: "🌳", name: "街頭犬", front: "牠為什麼留在公共空間？", origin: "牠可能是走失、遭棄養、在外繁殖，或長期由社區居民餵養而形成遊蕩生活。", need: "社會需要處理動物福祉、公共安全與環境衛生，不能只靠零散餵食。", duty: "犬隻沒有公共工作職責；政府與社區須進行辨識、醫療、絕育、風險管理與適切安置。" }
] as const;

const ROLE_PATHS = [
  { id: "home", icon: "🏠", title: "成為家庭犬", gain: ["固定住所與主要照護者", "較穩定的飲食、活動與醫療", "能與家庭建立長期關係"], cost: ["需要時間適應新環境與生活規範", "可能出現分離焦慮或健康問題", "終身福祉仰賴家庭持續承諾"] },
  { id: "work", icon: "🦺", title: "成為工作犬", gain: ["接受專業評估、訓練與照護", "透過任務與領犬員建立合作關係", "生活通常有明確制度安排"], cost: ["並非每隻犬都適合執行任務", "訓練與工作可能帶來壓力或傷害", "需要休息、醫療與退役保障"] },
  { id: "school", icon: "🏫", title: "成為校犬", gain: ["獲得固定生活空間與校園陪伴", "可能連結生命教育課程", "由校園社群共同關注"], cost: ["人群、噪音與觸摸可能造成壓力", "假日與人員異動可能中斷照護", "必須有主要照護者、經費與互動規範"] },
  { id: "street", icon: "🌳", title: "維持街頭生活", gain: ["保留熟悉的活動範圍", "不必立刻適應陌生室內環境", "可能已有熟悉的社區關係"], cost: ["食物、醫療與安全較不穩定", "面臨交通、疾病與人犬衝突風險", "照護與責任歸屬可能不明"] }
] as const;

type PlanItem = { id: string; label: string; required: boolean; explanation: string; basis: string };
type Challenge = { title: string; intro: string; box: string; items: PlanItem[] };

const CHALLENGES: Record<PathId, Challenge> = {
  home: {
    title: "迎接犬隻回家前，家庭還要補齊哪些承諾？",
    intro: "家庭照護須涵蓋日常生活、健康、安全與長期安排。請把必要配套放進箱中。",
    box: "家庭照護配套箱",
    items: [
      { id: "home-water", label: "每天提供足量、乾淨的飲水與適當食物", required: true, explanation: "犬隻需要持續取得潔淨飲水與符合健康需求的食物，這是維持生命與健康的基本條件。", basis: "教學依據：動物保護法第 5 條飼主照護義務。" },
      { id: "home-space", label: "準備安全、通風、溫度適當且可活動的空間", required: true, explanation: "居住空間應讓犬隻能站立、轉身、躺臥及活動，並排除高溫、危險物與逃脫風險。", basis: "教學依據：動物保護法第 5 條及犬隻生活環境基本需求。" },
      { id: "home-medical", label: "規劃疫苗、例行健檢與生病受傷時的醫療", required: true, explanation: "飼主須觀察健康變化，犬隻受傷或罹病時不能拖延必要醫療。", basis: "教學依據：動物保護法第 5 條的必要醫療責任。" },
      { id: "home-future", label: "確認搬家、升學或照護者異動後的終身安排", required: true, explanation: "認養是跨越生活變動的長期責任，應先確認主要照護者、代理人與無法續養時的合法轉接。", basis: "教學依據：飼主不得棄養，以及終身照護的責任觀念。" },
      { id: "home-cage", label: "平日長時間關籠，週末再一次補足活動", required: false, explanation: "活動與互動需求不能用週末集中補償；長時間限制在狹小空間會影響身心健康。", basis: "教學依據：適當活動空間與避免不當限制的動物福利原則。" },
      { id: "home-leftover", label: "每天以人類吃剩的食物當作主食", required: false, explanation: "人類剩食可能鹽分、油脂過高，也未必符合犬隻營養需求，不能視為穩定且適當的主食。", basis: "教學依據：提供適當、足量食物的飼主義務。" }
    ]
  },
  work: {
    title: "完成任務之外，制度如何照顧犬隻的一生？",
    intro: "工作能力不能取代動物福利。請補齊執勤、健康與退役階段需要的保障。",
    box: "工作犬保障配套箱",
    items: [
      { id: "work-record", label: "建立培訓、工時、傷病與醫療的連續紀錄", required: true, explanation: "連續紀錄能讓照護者追蹤工作負荷與健康變化，及早調整任務。", basis: "教學依據：政府部門執勤犬照護管理規則的健康、訓練與管理要求。" },
      { id: "work-rest", label: "依高溫與任務風險制定休息及防護標準", required: true, explanation: "高溫、瓦礫或長時間執勤會增加熱傷害及外傷風險，必須安排休息與防護。", basis: "教學依據：執勤安全、適當環境與避免傷害原則。" },
      { id: "work-review", label: "定期評估身心狀態與工作適任性", required: true, explanation: "能力與健康會隨年齡、傷病及壓力改變，評估結果應決定是否調整或停止任務。", basis: "教學依據：動物福祉與執勤犬定期健康管理要求。" },
      { id: "work-retire", label: "預先規劃退役轉接、終老照護與醫療支持", required: true, explanation: "退役不等於責任終止，機構仍須安排合適去處與後續照護。", basis: "教學依據：政府部門執勤犬退役送養或照養規範。" },
      { id: "work-results", label: "只記錄任務成果，不保存健康資料", required: false, explanation: "只有成果紀錄無法判斷犬隻承受的負荷，也無法支持醫療與退役決策。", basis: "教學依據：可追蹤的照護與健康管理原則。" },
      { id: "work-until", label: "犬隻還能移動，就繼續延長執勤時間", required: false, explanation: "能移動不代表身心適任；忽略疲勞、疼痛或壓力會提高受傷風險。", basis: "教學依據：避免過度使役與必要休息的動物福利原則。" }
    ]
  },
  school: {
    title: "一項善意計畫，還需要哪些配套？",
    intro: "校犬計畫要讓犬隻與學生都安全，必須由明確的人員與制度承接日常責任。",
    box: "校犬計畫配套箱",
    items: [
      { id: "school-guardian", label: "指定主要照護者與代理人", required: true, explanation: "共同關心不能取代明確責任，須知道每天由誰餵食、清潔、觀察與處理緊急狀況。", basis: "教學依據：動物保護法第 5 條飼主照護責任。" },
      { id: "school-assess", label: "進校前完成健康與行為評估", required: true, explanation: "評估可了解犬隻對人群、聲音與接觸的反應，據此規劃適合的校園生活。", basis: "教學依據：風險預防、適切環境與專業評估原則。" },
      { id: "school-budget", label: "編列日常、醫療與緊急支出", required: true, explanation: "飼料、預防醫療與突發治療都需要穩定經費，不能只依賴臨時募款。", basis: "教學依據：提供適當食物與必要醫療的法定責任。" },
      { id: "school-holiday", label: "安排休息區、夜間、假日與人員異動照護", required: true, explanation: "校園下課或放假後，犬隻仍持續需要飲水、活動、休息與健康觀察。", basis: "教學依據：照護責任具有連續性，並應提供安全適當的生活環境。" },
      { id: "school-casual", label: "由當天有空的班級自行輪流餵食", required: false, explanation: "臨時輪值容易產生漏餵、重複餵食與健康異常無人追蹤等問題。", basis: "教學依據：明確主要照護者與責任可追蹤原則。" },
      { id: "school-touch", label: "讓學生隨時追逐、抱起或觸摸犬隻", required: false, explanation: "犬隻需要拒絕互動與安靜休息的權利；無規範接觸也可能增加人犬安全風險。", basis: "教學依據：避免騷擾、驚嚇與傷害的動物福利及安全原則。" }
    ]
  },
  street: {
    title: "留在街頭，就不需要照護制度嗎？",
    intro: "熟悉街頭不代表風險消失。請找出兼顧犬隻福祉、公共安全與責任追蹤的配套。",
    box: "社區照護配套箱",
    items: [
      { id: "street-identify", label: "確認晶片、來源、健康狀況與是否有飼主", required: true, explanation: "先辨識犬隻身分與狀況，才能判斷是走失、棄養、社區照護或需要安置。", basis: "教學依據：寵物登記、飼主責任及動物管制的基礎程序。" },
      { id: "street-medical", label: "安排絕育、疫苗、驅蟲與必要醫療", required: true, explanation: "健康管理能降低繁殖、傳染病與傷病惡化風險，但仍須由明確單位持續追蹤。", basis: "教學依據：動物保護與公共衛生的風險預防原則。" },
      { id: "street-risk", label: "評估交通、追車、群聚與人犬衝突風險", required: true, explanation: "每個場域風險不同，應依犬隻行為與環境決定管理或安置方式。", basis: "教學依據：兼顧動物福祉與公共安全的個案評估原則。" },
      { id: "street-owner", label: "建立固定照護窗口、紀錄與通報方式", required: true, explanation: "固定窗口能持續記錄餵食、健康與衝突事件，避免責任在問題發生時消失。", basis: "教學依據：照護責任明確化與可追蹤管理原則。" },
      { id: "street-feed", label: "只要每天放飼料，其他問題不用處理", required: false, explanation: "餵食只能處理部分飢餓需求，無法取代醫療、絕育、環境清潔與衝突管理。", basis: "教學依據：完整照護包含健康、安全與環境管理。" },
      { id: "street-move", label: "發生衝突就把犬隻載到陌生地點放走", required: false, explanation: "任意移置會讓犬隻失去熟悉資源，也可能把風險轉移到另一個社區。", basis: "教學依據：不得棄養，以及安置應經評估並有責任承接。" }
    ]
  }
};

const QUIZ = [
  { q: "校犬在週末與寒暑假仍需要照護，最完整的做法是？", options: ["放足一週飼料與飲水，等校園重新開放後再檢查狀況", "事先指定照護者、代理人與緊急聯絡方式", "由有空的學生輪流到校，不必安排固定成人負責"], answer: 1, note: "照護必須連續且責任明確，不能因校園放假而中斷。" },
  { q: "犬隻走進休息區並避開人群時，學生應該怎麼做？", options: ["尊重牠退出互動，保持距離", "跟進休息區輕摸安撫，讓牠逐漸習慣學生靠近", "把牠帶回活動區，避免牠錯過團體互動與訓練"], answer: 0, note: "休息區提供犬隻自主退出互動的空間，可降低壓力與人犬衝突。" },
  { q: "影片呈現一個成功案例後，規劃校犬制度還要確認什麼？", options: ["確認多數學生喜歡犬隻，再由各班自行協調日常工作", "照護者、評估、經費、假日安排與互動規範", "先替犬隻命名並完成宣傳，其他細節等進校後再調整"], answer: 1, note: "個案故事能提供觀察線索，制度仍須逐項確認長期責任。" }
] as const;

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

function PaperButton({ children, onClick, disabled = false, secondary = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={secondary ? styles.secondaryButton : styles.paperButton}>{children}</button>;
}

function StagePaper({ children, onPrevious, blackboard = false }: { children: React.ReactNode; onPrevious?: () => void; blackboard?: boolean }) {
  return <section className={`${styles.stagePaper} ${blackboard ? styles.blackboardStage : ""}`}>
    {onPrevious && <div style={{ marginBottom: 20 }}><button type="button" className={styles.backLink} onClick={onPrevious}>← 上一頁</button></div>}
    {children}
  </section>;
}

export default function WeekOneGame() {
  const router = useRouter();
  const { progress, ready, updateWeekOne, completeWeekOne, resetWeekOne } = useStudentLearningProgress();
  const draft = progress.weekOne;
  const stage = draft.stage;
  const reward = getLearningTool(1);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [roleChoice, setRoleChoice] = useState<PathId | "">("");
  const [challengeId, setChallengeId] = useState<PathId | null>(null);
  const [filed, setFiled] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);
  const [feedback, setFeedback] = useState<{ ok: boolean; title: string; text: string; basis: string } | null>(null);
  const [reminder, setReminder] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [challengeOrder, setChallengeOrder] = useState<string[]>([]);
  const [quizOptionOrders, setQuizOptionOrders] = useState<number[][]>(QUIZ.map((item) => item.options.map((_, index) => index)));

  useEffect(() => {
    if (!ready) return;
    if (stage === 3) {
      updateWeekOne({ stage: 4 });
      return;
    }
    if (stage === 2 && isPathId(draft.firstImpression)) {
      setRoleChoice(draft.firstImpression);
      setChallengeId(draft.firstImpression);
    }
  }, [ready, stage, draft.firstImpression, updateWeekOne]);

  const completedPaths = useMemo(() => Array.from(new Set(
    draft.sourceTags
      .filter((tag) => tag.startsWith("path:"))
      .map((tag) => tag.slice(5))
      .filter(isPathId)
  )), [draft.sourceTags]);
  const allPathsComplete = ROLE_PATHS.every((role) => completedPaths.includes(role.id));
  const selectedRole = ROLE_PATHS.find((role) => role.id === roleChoice);
  const challenge = challengeId ? CHALLENGES[challengeId] : null;
  const requiredItems = challenge?.items.filter((item) => item.required) ?? [];
  const challengeComplete = requiredItems.length > 0 && requiredItems.every((item) => filed.includes(item.id));
  const quizComplete = QUIZ.every((item, index) => quizAnswers[index] === item.answer);

  useEffect(() => {
    if (stage === 2 && challengeId) {
      setChallengeOrder(shuffledForVisit(CHALLENGES[challengeId].items.map((item) => item.id), `week1-${challengeId}`));
    }
    if (stage === 4) {
      setQuizOptionOrders(QUIZ.map((item, index) => shuffledForVisit(item.options.map((_, optionIndex) => optionIndex), `week1-quiz-${index}`)));
    }
  }, [stage, challengeId]);

  const chooseRole = (id: PathId) => {
    setReminder("");
    setRoleChoice(id);
    if (completedPaths.includes(id)) setReminder("你已經完成這項挑戰。請選擇尚未完成的犬隻生活路徑。");
  };

  const beginChallenge = () => {
    if (!roleChoice || completedPaths.includes(roleChoice)) return;
    setChallengeId(roleChoice);
    setFiled([]);
    setHearts(3);
    setFeedback(null);
    updateWeekOne({ firstImpression: roleChoice, stage: 2 });
  };

  const fileItem = (id: string) => {
    if (!challenge) return;
    const item = challenge.items.find((entry) => entry.id === id);
    if (!item || filed.includes(id)) return;
    if (item.required) {
      setFiled((current) => [...current, id]);
      setFeedback({ ok: true, title: "放對了：這是必要配套", text: item.explanation, basis: item.basis });
      return;
    }
    const nextHearts = hearts - 1;
    setFeedback({ ok: false, title: "這個判斷還需要再想想", text: item.explanation, basis: item.basis });
    if (nextHearts <= 0) {
      setHearts(3);
      setFiled([]);
      setFeedback({ ok: false, title: "三顆愛心已用完，本關重新開始", text: `${item.explanation} 已歸檔的配套已清空，愛心也恢復為三顆。請重新完成這項責任配套挑戰。`, basis: item.basis });
    } else {
      setHearts(nextHearts);
    }
  };

  const finishChallenge = () => {
    if (!challengeId || !challengeComplete) return;
    const nextCompleted = Array.from(new Set([...completedPaths, challengeId]));
    updateWeekOne({ sourceTags: nextCompleted.map((id) => `path:${id}`), firstImpression: "", stage: nextCompleted.length === 4 ? 4 : 1 });
    setRoleChoice("");
    setChallengeId(null);
    setFiled([]);
    setHearts(3);
    setFeedback(null);
  };

  const finish = () => {
    completeWeekOne();
    setRewardOpen(true);
  };

  if (!ready) return <main className={styles.experience}><div className={styles.loading}>正在整理你的學習紀錄…</div></main>;

  const displayStep = stage === 0 ? 1 : stage === 1 || stage === 2 ? 2 : stage === 4 ? 3 : stage === 5 ? 4 : 4;
  const progressPercent = stage >= 6 ? 100 : displayStep * 25;

  return <main className={styles.experience}>
    <div className={styles.shell}>
      <div className={styles.topbar}>
        <Link href="/student" className={styles.backLink}>← 返回六週地圖</Link>
        <span className={styles.weekStamp}>WEEK 01 · {COPY.theme}</span>
      </div>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>第一週</p>
        <h1>{COPY.unitTitle}</h1>
        <p className={styles.heroQuestion}>核心提問：同樣身為犬，牠們為什麼會在人類社會中獲得不同角色、資源與保障？</p>
      </header>
      <div className={styles.progressWrap}>
        <div className={styles.progressTop}><span>{stage >= 6 ? "第一週完成" : `學習進度 ${displayStep}／4`}</span><span>{stage >= 6 ? "完成" : `${progressPercent}%`}</span></div>
        <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${progressPercent}%` }} /></div>
      </div>

      {stage === 0 && <StagePaper onPrevious={() => router.push("/student")} blackboard>
        <div className={styles.stageHeader}>
          <p className={styles.stageLabel}>環節 1｜角色認識站</p>
          <h2 className={styles.stageTitle}>四種犬隻，如何出現在不同生活環境？</h2>
          <p className={styles.stageLead}>點擊四張卡片翻到背面，認識牠的出現原因、社會需求，以及人類必須承擔的責任。</p>
        </div>
        <div className={styles.flipGrid}>
          {SCENES.map((scene) => {
            const isFlipped = flipped.includes(scene.id);
            return <button type="button" key={scene.id} className={`${styles.flipCard} ${isFlipped ? styles.flipCardActive : ""}`} onClick={() => setFlipped((current) => current.includes(scene.id) ? current.filter((id) => id !== scene.id) : [...current, scene.id])} aria-pressed={isFlipped}>
              <span className={styles.flipInner}>
                <span className={styles.flipFront}><span className={styles.flipIcon}>{scene.icon}</span><strong>{scene.name}</strong><small>{scene.front}</small><em>點擊翻面</em></span>
                <span className={styles.flipBack}><strong>{scene.name}</strong><span><b>牠如何出現</b>{scene.origin}</span><span><b>社會為何需要認識牠</b>{scene.need}</span><span><b>工作與責任</b>{scene.duty}</span></span>
              </span>
            </button>;
          })}
        </div>
        <div className={styles.feedback}>角色名稱只能描述犬隻所處的關係與場域。真正需要檢查的是：誰負責、提供哪些資源、風險如何處理，以及照護能否長期持續。</div>
        <div className={styles.buttonRow}><PaperButton onClick={() => updateWeekOne({ stage: 1 })}>進入角色轉換站</PaperButton></div>
      </StagePaper>}

      {stage === 1 && <StagePaper onPrevious={() => updateWeekOne({ stage: 0 })}>
        <div className={styles.stageHeader}>
          <p className={styles.stageLabel}>環節 2｜角色轉換站</p>
          <h2 className={styles.stageTitle}>你想先了解哪一種犬隻生活？</h2>
          <p className={styles.stageLead}>這裡是闖關導覽。選擇一條路徑後，先閱讀牠可能獲得與承受的條件，再進入對應的責任挑戰。</p>
        </div>
        <div className={styles.roleHero}><img src="/student/week-one/stray-role-crossroads-full.webp" alt="一隻黑色米克斯犬站在通往家庭、工作場域、校園與街頭的交叉路口" /></div>
        <div className={styles.rolePathGrid}>
          {ROLE_PATHS.map((role) => {
            const done = completedPaths.includes(role.id);
            return <button type="button" key={role.id} className={`${styles.rolePathCard} ${roleChoice === role.id ? styles.rolePathActive : ""} ${done ? styles.rolePathDone : ""}`} onClick={() => chooseRole(role.id)}>
              <span aria-hidden="true">{done ? "✓" : role.icon}</span><strong>{role.title}</strong><small>{done ? "已完成" : "尚未體驗"}</small>
            </button>;
          })}
        </div>
        {reminder && <div className={`${styles.feedback} ${styles.feedbackTry}`}>{reminder}</div>}
        {selectedRole && <div className={styles.tradeoffBoard}>
          <section className={styles.gainPanel}><p className={styles.tradeoffLabel}>牠可能獲得</p><ul>{selectedRole.gain.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className={styles.costPanel}><p className={styles.tradeoffLabel}>牠可能承受</p><ul>{selectedRole.cost.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div>}
        <div className={styles.buttonRow}>
          {allPathsComplete
            ? <PaperButton onClick={() => updateWeekOne({ stage: 4 })}>四項體驗完成，前往影像觀察站</PaperButton>
            : <PaperButton onClick={beginChallenge} disabled={!selectedRole || completedPaths.includes(selectedRole.id)}>下一步，進入這項挑戰</PaperButton>}
        </div>
      </StagePaper>}

      {stage === 2 && challenge && <StagePaper onPrevious={() => updateWeekOne({ stage: 1 })}>
        <div className={styles.stageHeader}>
          <p className={styles.stageLabel}>責任配套挑戰｜{ROLE_PATHS.find((item) => item.id === challengeId)?.title}</p>
          <h2 className={styles.stageTitle}>{challenge.title}</h2>
          <p className={styles.stageLead}>{challenge.intro}</p>
        </div>
        <div className={styles.challengeStatusDock}>
          <div className={styles.heartBar}><span>挑戰愛心</span><strong aria-label={`剩餘 ${hearts} 顆心`}>{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</strong><small>放錯一張卡，扣一顆心；歸零後本關會重置</small></div>
          {feedback && <div role={feedback.title.startsWith("三顆愛心") ? "alert" : "status"} aria-live="polite" className={`${styles.learningFeedback} ${feedback.ok ? styles.learningCorrect : styles.learningWrong}`}><strong>{feedback.title}</strong><p>{feedback.text}</p><small>{feedback.basis}</small></div>}
        </div>
        <div className={styles.repairGame}>
          <section className={styles.planCardPool}>
            <div className={styles.repairHeading}><span>配套資料區</span><small>拖曳卡片，或點一下卡片歸檔</small></div>
            <div className={styles.planCardGrid}>{(challengeOrder.length ? challengeOrder.map((id) => challenge.items.find((item) => item.id === id)!).filter(Boolean) : challenge.items).filter((item) => !filed.includes(item.id)).map((item) => <button type="button" draggable key={item.id} className={styles.planDragCard} onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => fileItem(item.id)}><span className={styles.cardGrip}>⋮⋮</span>{item.label}</button>)}</div>
          </section>
          <section className={`${styles.planDropBox} ${challengeComplete ? styles.planDropComplete : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); fileItem(event.dataTransfer.getData("text/plain")); }}>
            <div className={styles.boxLid}>{challenge.box}</div>
            <p>{challengeComplete ? "必要配套已補齊" : `已歸檔 ${filed.length}／${requiredItems.length}`}</p>
            <div className={styles.filedPlanItems}>{filed.map((id) => { const item = challenge.items.find((entry) => entry.id === id); return item ? <span key={id}>✓ {item.label}</span> : null; })}</div>
          </section>
        </div>
        <div className={styles.buttonRow}><PaperButton onClick={finishChallenge} disabled={!challengeComplete}>{completedPaths.length === 3 ? "完成挑戰，前往影像觀察站" : "完成挑戰，返回路徑選擇"}</PaperButton></div>
      </StagePaper>}

      {stage === 4 && <StagePaper onPrevious={() => updateWeekOne({ stage: 1 })}>
        <div className={styles.stageHeader}>
          <p className={styles.stageLabel}>影像觀察站</p>
          <h2 className={styles.stageTitle}>校犬進入校園後，還需要看見哪些責任？</h2>
          <p className={styles.stageLead}>觀看愛學網《校犬豆豆1》，再完成三題責任檢核。若官方網站限制內嵌播放，可使用播放器下方的官方連結。</p>
        </div>
        <div className={styles.embeddedVideo}>
          <a className={styles.videoLaunch} href="https://stv.naer.edu.tw/watch/344572" target="_blank" rel="noreferrer">
            <span className={styles.videoPoster}>
              <span className={styles.videoPosterMark} aria-hidden="true">校犬</span>
              <span className={styles.videoPlay} aria-hidden="true">▶</span>
              <span className={styles.videoPosterCaption}>校犬豆豆1</span>
            </span>
            <span className={styles.videoMeta}>
              <small>愛學網官方影片 · 04:27</small>
              <strong>校犬豆豆1</strong>
              <span>點擊後直接前往官方播放器，不再顯示被拒絕存取的內嵌頁面。</span>
            </span>
          </a>
          <a className={styles.videoTextLink} href="https://stv.naer.edu.tw/watch/344572" target="_blank" rel="noreferrer">在愛學網直接播放 ↗</a>
        </div>
        <div className={styles.quizPanel}>
          <div className={styles.repairHeading}><span>豆豆的校園責任小測驗</span><small>答對三題即可過關</small></div>
          {QUIZ.map((item, index) => <fieldset key={item.q} className={styles.quizQuestion}>
            <legend><span>{index + 1}</span>{item.q}</legend>
            <div>{quizOptionOrders[index].map((optionIndex) => <button type="button" key={item.options[optionIndex]} className={quizAnswers[index] === optionIndex ? (optionIndex === item.answer ? styles.quizCorrect : styles.quizWrong) : ""} onClick={() => setQuizAnswers((current) => ({ ...current, [index]: optionIndex }))}>{item.options[optionIndex]}</button>)}</div>
            {quizAnswers[index] !== undefined && <p>{quizAnswers[index] === item.answer ? "答對了。" : "再想一想。"} {item.note}</p>}
          </fieldset>)}
        </div>
        <div className={styles.buttonRow}><PaperButton onClick={() => updateWeekOne({ stage: 5 })} disabled={!quizComplete}>完成小測驗，進入政府資料個案</PaperButton></div>
      </StagePaper>}

      {stage === 5 && <StagePaper onPrevious={() => updateWeekOne({ stage: 4 })}>
        <div className={styles.stageHeader}>
          <p className={styles.stageLabel}>{COPY.stages[5].label}</p>
          <h2 className={styles.stageTitle}>{COPY.stages[5].title}</h2>
          <p className={styles.stageLead}>你在認養頁看到一隻黑色犬隻。照片先吸引目光，資料卻只留下幾個欄位。請把單筆個案放回同一份開放資料的群體結果，再分清楚「看見差異」與「解釋原因」。</p>
        </div>
        <div className={styles.revealGrid}>
          <div className={styles.photoFrame}><img src={CASE_RECORD.image} referrerPolicy="no-referrer" loading="lazy" alt="政府動物認領養 Open Data 公開犬隻照片" /></div>
          <div className={styles.dossierGrid}>{CASE_RECORD.displayFields.map(([label, value]) => <div className={styles.dataSlip} key={label}><span className={styles.dataSlipLabel}>{label}</span><strong className={styles.dataSlipValue}>{value}</strong></div>)}</div>
        </div>
        <div className={styles.statFlow} aria-label="毛色留所天數統計摘要"><article className={styles.statCard}><span className={styles.statLabel}>黑色</span><strong className={styles.statValue}>n=2,720</strong><p>留所天數中位數 772.5 天</p></article><article className={styles.statCard}><span className={styles.statLabel}>灰黑色</span><strong className={styles.statValue}>n=31</strong><p>留所天數中位數 1,186 天</p></article></div>
        <p className={styles.stageLead}>統計截止日為 2026-09-05，以公開資料的推定入所日計算仍在公開待認養犬隻的留所天數。兩組樣本數差距很大，數字只能描述這份資料中的分布，不能證明毛色造成留所較久。</p>
        <label className={styles.promptLabel} htmlFor="week-one-reflection">如果有人只看見「灰黑色的中位數較高」就說深色犬一定比較不受歡迎，這個結論漏看了哪些資料？你會再查證什麼？</label>
        <textarea id="week-one-reflection" className={styles.paperInput} value={draft.responsibleRewrite} placeholder="寫下資料支持的現象，以及解釋原因前還需要查證的資料……" onChange={(event) => updateWeekOne({ responsibleRewrite: event.target.value })} />
        <small className={styles.inputHint}>{draft.responsibleRewrite.trim() ? "✓ 已記錄回答" : "不限字數；完成後即可繼續。"}</small>
        <div className={styles.buttonRow}><PaperButton onClick={finish} disabled={draft.responsibleRewrite.trim().length === 0}>完成第一週</PaperButton></div>
      </StagePaper>}

      {stage >= 6 && <StagePaper>
        <div className={styles.stageHeader}><p className={styles.stageLabel}>第一週完成</p><h2 className={styles.stageTitle}>探究工具「{reward.name}」已解鎖</h2><p className={styles.stageLead}>你已完成四種犬隻身分體驗、影像責任檢核與 Open Data 判讀。</p></div>
        <div className={styles.scenePanel}><img src={reward.image} alt={reward.name} style={{ maxWidth: 220, width: "100%" }} /></div>
        <div className={styles.buttonRow}><PaperButton onClick={() => router.push("/student")}>帶著工具返回地圖</PaperButton><PaperButton onClick={resetWeekOne} secondary>重新體驗第一週</PaperButton></div>
      </StagePaper>}
    </div>
    <RewardUnlockModal open={rewardOpen} week={1} onClose={() => { setRewardOpen(false); router.push("/student"); }} />
  </main>;
}
