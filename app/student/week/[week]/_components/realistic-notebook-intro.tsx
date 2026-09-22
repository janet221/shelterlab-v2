"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./realistic-notebook-intro.module.css";
import beige from "./realistic-notebook-beige.module.css";
import goals from "./realistic-notebook-goals.module.css";

type PageFlipEvent = { data: number | string };

type PageFlipInstance = {
  loadFromHTML: (items: HTMLElement[]) => void;
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
  on: (event: "flip", callback: (event: PageFlipEvent) => void) => void;
  destroy: () => void;
};

type PageFlipConstructor = new (
  root: HTMLElement,
  settings: Record<string, string | number | boolean>
) => PageFlipInstance;

declare global {
  interface Window {
    St?: { PageFlip: PageFlipConstructor };
  }
}

const WEEKS = [
  {
    title: "第 1 週｜先入為主與證據",
    question: "我看到的是客觀資料、社會常見說法，還是自己補上的推論？",
    skill: "證據界線與第一印象"
  },
  {
    title: "第 2 週｜飼養責任與自我條件",
    question: "當我喜歡一隻犬隻，我的生活條件能不能承擔長期照護責任？",
    skill: "自我了解與責任決策"
  },
  {
    title: "第 3 週｜分類、標籤與生命",
    question: "人類為什麼替犬隻分類？分類帶來便利時，也可能留下哪些影響？",
    skill: "分類思辨與個體理解"
  },
  {
    title: "第 4 週｜流浪動物如何持續產生",
    question: "為什麼新的遊蕩犬與收容犬仍會持續出現？問題的源頭在哪裡？",
    skill: "原因分析與源頭管理"
  },
  {
    title: "第 5 週｜零撲殺與公共兩難",
    question: "生命保護、動物福利、公共安全、生態與收容資源同時存在時，要如何思考政策？",
    skill: "多方觀點與公共議題思辨"
  },
  {
    title: "第 6 週｜理解之後，我能做什麼",
    question: "走進真實收容場域後，我可以如何結合個人行動與社會資源回應同伴動物的處境？",
    skill: "場域理解與公民行動"
  }
] as const;

const GOALS = [
  {
    title: "認知｜理解與分析",
    text: "能閱讀政府開放資料與可靠證據，分辨客觀資訊、推論與未知；進一步理解分類、流浪動物形成原因，以及公共政策需要權衡的條件。",
    practice: "讀資料 → 查證證據 → 分析原因與政策條件"
  },
  {
    title: "情意｜自我覺察與同理",
    text: "能察覺自己的第一印象、偏好、文化與生活經驗如何參與判斷；理解飼養責任，並設身處地思考流浪動物、居民、收容工作者與其他生命的處境。",
    practice: "看見自己的判斷 → 理解不同生命與人的處境"
  },
  {
    title: "行動｜責任與參與",
    text: "把理解轉成可執行的回應，包括負責任飼養、資訊查證、源頭減量、專業提問，以及連結政府、收容機構、民間團體與社區資源。",
    practice: "評估自己能做什麼 → 找到資源 → 採取合適行動"
  }
] as const;

const OUTCOMES = [
  {
    title: "資料判讀",
    text: "能閱讀政府開放資料與可靠來源，分辨客觀事實、個人推論與未知資訊，理解一份數據的證據界線。"
  },
  {
    title: "自我覺察",
    text: "能察覺第一印象、個人偏好及生活經驗如何影響判斷，釐清自身選擇的來源。"
  },
  {
    title: "責任評估",
    text: "面對飼養或認養時，能將時間、家庭共識、空間、經濟條件、未來生活變動與長期照護責任一併納入評估。"
  },
  {
    title: "議題解析",
    text: "理解未絕育繁殖、棄養、放養與源頭管理等因素，如何導致遊蕩與收容犬隻持續產生。"
  },
  {
    title: "思辨公共兩難",
    text: "理解零撲殺政策同時牽涉犬隻福利、收容資源、居民安全與生態保育，能客觀比較不同立場各自面臨的影響與代價。"
  },
  {
    title: "實踐公民行動",
    text: "從自身可行的行動出發，連結政府、收容機構、民間團體與社區資源，針對同伴動物的真實處境提出具體回應。"
  }
] as const;

function WeekItem({ index }: { index: number }) {
  const week = WEEKS[index];
  return (
    <section className={styles.weekItem}>
      <h3>{week.title}</h3>
      <p><b>核心提問：</b>{week.question}</p>
      <small>目標能力｜{week.skill}</small>
    </section>
  );
}

function GoalItem({ index }: { index: number }) {
  const goal = GOALS[index];
  return (
    <section className={`${styles.goalItem} ${goals.goalCard}`}>
      <h3>{goal.title}</h3>
      <p>{goal.text}</p>
      <small>實務操作｜{goal.practice}</small>
    </section>
  );
}

function OutcomeItem({ index }: { index: number }) {
  const outcome = OUTCOMES[index];
  return (
    <section className={goals.outcomeItem}>
      <span className={goals.outcomeNumber}>{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>{outcome.title}</h3>
        <p>{outcome.text}</p>
      </div>
    </section>
  );
}

function PaperPage({
  side,
  children
}: {
  side: "left" | "right" | "single";
  children: React.ReactNode;
}) {
  const sideClass = side === "left" ? styles.leftPaper : side === "right" ? styles.rightPaper : styles.singlePaper;
  const beigeSideClass = side === "left" ? beige.leftPaper : side === "right" ? beige.rightPaper : "";

  return (
    <div
      data-notebook-page
      className={`${styles.paperPage} ${beige.paperPage} ${sideClass} ${beigeSideClass}`}
    >
      <div className={styles.paperInner}>{children}</div>
    </div>
  );
}

function WidePages() {
  return (
    <>
      <PaperPage side="left">
        <div className={styles.titlePage}>
          <p className={styles.eyebrow}>從真實議題出發</p>
          <h1>一筆資料的背後，<br />是一個真實的生命</h1>
          <p className={styles.subtitle}>黑色米克斯，為什麼較少被詢問？</p>
        </div>
      </PaperPage>
      <PaperPage side="right">
        <div className={styles.prosePage}>
          <p>
            2023 年，新北市政府動物保護防疫處曾提出一項公共探究議題：「如何提升公立動物之家黑色米克斯成犬的認養率」。官方統計數據指出，在公立動物之家中，黑色米克斯犬隻的認養詢問度普遍較低；而在等待認養超過一年的個體中，黑色米克斯占比超過四成。
          </p>
          <p className={styles.closingLine}>這項客觀數據呈現了一個值得深入追問的社會現象。</p>
          <p>
            當一隻犬隻登錄於政府公開資料與認養平台時，大眾首先接觸到的是年齡、體型、毛色、品種標示、照片與所在場域等客觀欄位。這些數據究竟能提供多少資訊？又有哪些判斷，其實是在閱讀資料後才由我們自行補上的？
          </p>
          <p className={styles.closingLine}>接下來六週，我們會從真實資料與真實議題出發，練習看懂證據、認識自己的判斷、理解飼養責任與臺灣流浪動物問題，最後把理解帶進真實場域與行動。</p>
          <p className={styles.source}>資料來源｜新北市政府動物保護防疫處（2023）</p>
        </div>
      </PaperPage>

      <PaperPage side="left">
        <div className={styles.compactPage}>
          <p className={styles.eyebrow}>探究進程</p>
          <h2>六週探究軸線</h2>
          <p className={styles.lead}>
            每週都會使用政府開放資料中的真實犬隻紀錄作為練習情境。毛色、體型、品種、性別與年齡會帶學生進入資料；六週真正累積的是證據判讀、責任、自我理解、分類思辨、公共議題理解與行動能力。
          </p>
          <div className={styles.weekList}>
            <WeekItem index={0} />
            <WeekItem index={1} />
            <WeekItem index={2} />
          </div>
        </div>
      </PaperPage>
      <PaperPage side="right">
        <div className={`${styles.compactPage} ${styles.continuationPage}`}>
          <div className={styles.weekList}>
            <WeekItem index={3} />
            <WeekItem index={4} />
            <WeekItem index={5} />
          </div>
        </div>
      </PaperPage>

      <PaperPage side="left">
        <div className={`${styles.compactPage} ${goals.goalIntro}`}>
          <p className={styles.eyebrow}>核心學習目標</p>
          <h2>認知．情意．行動</h2>
          <p className={`${styles.lead} ${goals.goalIntroText}`}>
            毛色、體型、品種、性別與年齡會作為每週的資料練習情境；課程真正要累積的，是理解與分析、自我覺察與同理，以及負責任的行動與參與。
          </p>
        </div>
      </PaperPage>
      <PaperPage side="right">
        <div className={`${styles.compactPage} ${styles.continuationPage}`}>
          <div className={goals.goalCards}>
            {GOALS.map((_, index) => <GoalItem index={index} key={GOALS[index].title} />)}
          </div>
          <div className={`${styles.noticeBox} ${goals.noticeBox}`}>
            <strong>宣告</strong>
            <p>系統將完整記錄個人的思考歷程，不對任何價值選擇進行評分。</p>
          </div>
        </div>
      </PaperPage>

      <PaperPage side="left">
        <div className={`${styles.compactPage} ${goals.outcomePage}`}>
          <p className={styles.eyebrow}>六週學習成果</p>
          <h2>我們想培養怎樣的學生？</h2>
          <p className={`${styles.lead} ${goals.outcomeLead}`}>
            能分析資料、自我覺察、對生命與選擇負責，並看見臺灣流浪動物問題背後的社會與制度條件。
          </p>
          <div className={goals.outcomeList}>
            <OutcomeItem index={0} />
            <OutcomeItem index={1} />
            <OutcomeItem index={2} />
          </div>
        </div>
      </PaperPage>
      <PaperPage side="right">
        <div className={`${styles.compactPage} ${styles.continuationPage} ${goals.outcomePage}`}>
          <div className={goals.outcomeList}>
            <OutcomeItem index={3} />
            <OutcomeItem index={4} />
            <OutcomeItem index={5} />
          </div>
          <div className={goals.outcomeClosing}>
            <strong>結語</strong>
            <p>經歷六週的學習，期許學生能以具備證據基礎的方式解讀資料與自我，理解同伴動物所處的環境，並知道如何結合個人行動與社會資源，做出實際回應。</p>
          </div>
          <p className={styles.tags}>自主學習｜探究與實作｜資料判讀｜公民行動｜學習歷程</p>
        </div>
      </PaperPage>
    </>
  );
}

function MobilePages() {
  return (
    <>
      <PaperPage side="single">
        <div className={styles.compactPage}>
          <p className={styles.eyebrow}>從真實議題出發</p>
          <h2>一筆資料的背後，是一個真實的生命</h2>
          <p className={styles.subtitle}>黑色米克斯，為什麼較少被詢問？</p>
          <p className={styles.lead}>
            2023 年，新北市政府動物保護防疫處曾提出一項公共探究議題：「如何提升公立動物之家黑色米克斯成犬的認養率」。官方統計數據指出，在公立動物之家中，黑色米克斯犬隻的認養詢問度普遍較低；而在等待認養超過一年的個體中，黑色米克斯占比超過四成。
          </p>
          <p className={styles.lead}>這項客觀數據呈現了一個值得深入追問的社會現象。</p>
          <p className={styles.lead}>
            當一隻犬隻登錄於政府公開資料與認養平台時，大眾首先接觸到的是年齡、體型、毛色、品種標示、照片與所在場域等客觀欄位。這些數據究竟能提供多少資訊？又有哪些判斷，其實是在閱讀資料後才由我們自行補上的？
          </p>
          <p className={styles.closingLine}>接下來六週，我們會從真實資料與真實議題出發，練習看懂證據、認識自己的判斷、理解飼養責任與臺灣流浪動物問題，最後把理解帶進真實場域與行動。</p>
          <p className={styles.source}>資料來源｜新北市政府動物保護防疫處（2023）</p>
        </div>
      </PaperPage>
      <PaperPage side="single">
        <div className={styles.compactPage}>
          <p className={styles.eyebrow}>探究進程</p>
          <h2>六週探究軸線</h2>
          <p className={styles.lead}>
            每週都會使用政府開放資料中的真實犬隻紀錄作為練習情境。毛色、體型、品種、性別與年齡會帶學生進入資料；六週真正累積的是證據判讀、責任、自我理解、分類思辨、公共議題理解與行動能力。
          </p>
          <div className={styles.mobileWeekGrid}>
            {WEEKS.map((_, index) => <WeekItem index={index} key={WEEKS[index].title} />)}
          </div>
        </div>
      </PaperPage>
      <PaperPage side="single">
        <div className={styles.compactPage}>
          <p className={styles.eyebrow}>核心學習目標</p>
          <h2>認知．情意．行動</h2>
          <div className={goals.mobileGoalCards}>
            {GOALS.map((_, index) => <GoalItem index={index} key={GOALS[index].title} />)}
          </div>
          <div className={`${styles.noticeBox} ${goals.noticeBox}`}>
            <strong>宣告</strong>
            <p>系統將完整記錄個人的思考歷程，不對任何價值選擇進行評分。</p>
          </div>
        </div>
      </PaperPage>
      <PaperPage side="single">
        <div className={`${styles.compactPage} ${goals.mobileOutcomePage}`}>
          <p className={styles.eyebrow}>六週學習成果</p>
          <h2>我們想培養怎樣的學生？</h2>
          <p className={styles.lead}>
            能分析資料、自我覺察、對生命與選擇負責，並看見臺灣流浪動物問題背後的社會與制度條件。
          </p>
          <div className={goals.mobileOutcomeList}>
            {OUTCOMES.map((_, index) => <OutcomeItem index={index} key={OUTCOMES[index].title} />)}
          </div>
          <div className={goals.outcomeClosing}>
            <strong>結語</strong>
            <p>經歷六週的學習，期許學生能以具備證據基礎的方式解讀資料與自我，理解同伴動物所處的環境，並知道如何結合個人行動與社會資源，做出實際回應。</p>
          </div>
          <p className={styles.tags}>自主學習｜探究與實作｜資料判讀｜公民行動｜學習歷程</p>
        </div>
      </PaperPage>
    </>
  );
}

export default function RealisticNotebookIntro({ onComplete }: { onComplete: () => void }) {
  const bookRef = useRef<HTMLDivElement | null>(null);
  const flipRef = useRef<PageFlipInstance | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [logicalPage, setLogicalPage] = useState(0);
  const [bookReady, setBookReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!scriptReady || !bookRef.current || !window.St?.PageFlip) return;

    const root = bookRef.current;
    const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-notebook-page]"));
    if (!pages.length) return;

    const instance = new window.St.PageFlip(root, {
      width: compact ? 430 : 520,
      height: compact ? 650 : 680,
      size: "stretch",
      minWidth: compact ? 285 : 360,
      maxWidth: compact ? 470 : 540,
      minHeight: compact ? 430 : 500,
      maxHeight: compact ? 720 : 710,
      showCover: false,
      usePortrait: true,
      autoSize: true,
      drawShadow: true,
      maxShadowOpacity: 0.16,
      flippingTime: 820,
      mobileScrollSupport: true,
      swipeDistance: 28,
      clickEventForward: true,
      disableFlipByClick: true,
      useMouseEvents: true,
      showPageCorners: false,
      startPage: compact ? logicalPage : logicalPage * 2
    });

    instance.on("flip", (event) => {
      const index = Number(event.data);
      if (!Number.isFinite(index)) return;
      const page = compact ? index : Math.floor(index / 2);
      setLogicalPage(Math.max(0, Math.min(3, page)));
    });

    instance.loadFromHTML(pages);
    flipRef.current = instance;
    setBookReady(true);

    return () => {
      setBookReady(false);
      flipRef.current = null;
      try {
        instance.destroy();
      } catch {
        // React 會在重新配置版面時重建根節點。
      }
    };
  }, [scriptReady, compact]);

  const next = () => {
    if (logicalPage >= 3) {
      onComplete();
      return;
    }
    if (flipRef.current) {
      flipRef.current.flipNext("bottom");
    } else {
      setLogicalPage((page) => Math.min(3, page + 1));
    }
  };

  const previous = () => {
    if (logicalPage <= 0) return;
    if (flipRef.current) {
      flipRef.current.flipPrev("bottom");
    } else {
      setLogicalPage((page) => Math.max(0, page - 1));
    }
  };

  return (
    <main className={`${styles.scene} ${beige.scene}`}>
      <Script
        src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />

      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="六週學習前導">
          <div className={styles.navLeft}>
            <Link href="/student" className={styles.navButton}>← 返回遊戲地圖</Link>
            <button className={styles.navButton} type="button" onClick={previous} disabled={logicalPage === 0}>
              ← 上一頁
            </button>
          </div>
          <span className={styles.pageNumber}>{logicalPage + 1} / 4</span>
        </nav>

        <div className={styles.desk}>
          <div className={`${styles.bookBacking} ${beige.bookBacking}`} aria-hidden="true" />
          <div
            key={compact ? "compact-book" : "wide-book"}
            ref={bookRef}
            className={`${styles.book} ${beige.book} ${bookReady ? styles.bookReady : styles.bookLoading}`}
          >
            {compact ? <MobilePages /> : <WidePages />}
          </div>
          {!bookReady && <div className={styles.loadingText}>正在展開筆記本…</div>}
        </div>

        <div className={styles.actions}>
          <span>六週學習前導</span>
          <button type="button" className={styles.nextButton} onClick={next}>
            {logicalPage === 3 ? "進入第一週" : "下一頁 →"}
          </button>
        </div>
      </div>
    </main>
  );
}
