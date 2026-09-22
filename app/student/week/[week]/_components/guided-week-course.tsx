"use client";
import { learningStorage } from "@/lib/classroom/browser-storage";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RewardUnlockModal from "@/app/student/_components/reward-unlock-modal";
import { useStudentLearningProgress } from "@/app/student/_components/student-learning-progress";
import { getLearningTool, type WeekNumber } from "@/lib/student-map";
import { getOpenDataCourseCase, type CourseCaseWeek } from "@/lib/student-open-data-cases";
import { getStudentCourseTitles } from "@/lib/student-course-titles";
import styles from "./guided-week-course.module.css";

type Section = { eyebrow: string; title: string; body: string[] };
type SavedCourse = {
  stage: number;
  notes: Record<string, string>;
  cards: Record<string, string[]>;
};
const EMPTY: SavedCourse = { stage: 0, notes: {}, cards: {} };
const WEEK_NAMES = ["", "第一週", "第二週", "第三週", "第四週", "第五週", "第六週"] as const;

const WEEK_WORLDS: Record<WeekNumber, { icon: string; name: string; instruction: string }> = {
  1: { icon: "🧭", name: "關係觀察站", instruction: "追查場景、關係與責任" },
  2: { icon: "🗓️", name: "生活規劃桌", instruction: "把承諾放進真實生活" },
  3: { icon: "🔬", name: "分類鑑定所", instruction: "拆解品種欄位與標籤" },
  4: { icon: "🕸️", name: "源頭控制室", instruction: "追蹤流入、過程與出口" },
  5: { icon: "⚖️", name: "公共議事廳", instruction: "比較價值、代價與配套" },
  6: { icon: "📓", name: "田野行動站", instruction: "記錄、查證並設計行動" }
};

function clean(value: string) {
  return value
    .replace(/^[-*]\s+/, "")
    .replace(/^\*\*(.+?)\*\*:?\s*/, "$1：")
    .replace(/^\*(.+?)\*$/, "$1")
    .trim();
}

function valueAfterHeading(block: string, heading: string) {
  const pattern = new RegExp(`## ${heading}\\s*\\n+([^\\n]+)`);
  return clean(block.match(pattern)?.[1] ?? "");
}

function parseWeek(markdown: string, week: WeekNumber) {
  const marker = `# ${WEEK_NAMES[week]}｜`;
  const start = markdown.indexOf(marker);
  if (start < 0) return { unitTitle: "", question: "", sections: [] as Section[] };
  const nextName = week < 6 ? WEEK_NAMES[(week + 1) as WeekNumber] : "";
  const next = nextName ? markdown.indexOf(`# ${nextName}｜`, start + marker.length) : -1;
  const block = markdown.slice(start, next < 0 ? markdown.length : next);
  const chunks = block.split(/\n## 環節\s+/).slice(1);

  return {
    unitTitle: valueAfterHeading(block, "單元標題"),
    question: valueAfterHeading(block, "核心提問"),
    sections: chunks.map((chunk, index) => {
      const lines = chunk.replace(/\r/g, "").split("\n");
      const eyebrow = `環節 ${clean(lines.shift() ?? String(index + 1))}`;
      let title = "";
      const body: string[] = [];
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith("**標題：**")) {
          title = clean(line.replace("**標題：**", ""));
          if (!title && lines[i + 1]?.trim()) title = clean(lines[++i]);
          continue;
        }
        body.push(line);
      }
      return { eyebrow, title: title || eyebrow, body };
    })
  };
}

function isMetaLine(line: string) {
  return /^(頁面標示|模組標示|教育重點|學習目標|獲得工具|個案編號|資料欄位|資料備註|統計卡|按鈕)：/.test(clean(line));
}

export default function GuidedWeekCourse({ week, onShowIntro }: { week: WeekNumber; onShowIntro?: () => void }) {
  const router = useRouter();
  const { completeWeek } = useStudentLearningProgress();
  const [markdown, setMarkdown] = useState("");
  const [saved, setSaved] = useState<SavedCourse>(EMPTY);
  const [ready, setReady] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const storageKey = `shelterlab-guided-week-${week}-v2`;
  const parsed = useMemo(() => parseWeek(markdown, week), [markdown, week]);
  const approved = getStudentCourseTitles(week);
  const section = parsed.sections[Math.min(saved.stage, Math.max(0, parsed.sections.length - 1))];
  const reward = getLearningTool(week);
  const world = WEEK_WORLDS[week];
  const caseRecord = week <= 5 ? getOpenDataCourseCase(week as CourseCaseWeek) : null;

  useEffect(() => {
    Promise.all([
      fetch("/course/six-week-copy.md").then((response) => response.text()),
      Promise.resolve().then(() => {
        try {
          const raw = learningStorage.getItem(storageKey);
          if (raw) return JSON.parse(raw) as SavedCourse;
        } catch {}
        return EMPTY;
      })
    ]).then(([text, stored]) => {
      setMarkdown(text);
      setSaved({ ...EMPTY, ...stored });
      setReady(true);
    });
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try { learningStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
  }, [ready, saved, storageKey]);

  const noteKey = `${saved.stage}-reflection`;
  const selectedKey = `${saved.stage}-cards`;
  const selected = saved.cards[selectedKey] ?? [];
  const note = saved.notes[noteKey] ?? "";

  const toggleCard = (value: string) => {
    setSaved((current) => {
      const values = current.cards[selectedKey] ?? [];
      return {
        ...current,
        cards: {
          ...current.cards,
          [selectedKey]: values.includes(value)
            ? values.filter((item) => item !== value)
            : [...values, value]
        }
      };
    });
  };

  const updateNote = (value: string) => {
    setSaved((current) => ({ ...current, notes: { ...current.notes, [noteKey]: value } }));
  };

  const next = () => {
    if (saved.stage < parsed.sections.length - 1) {
      setSaved((current) => ({ ...current, stage: current.stage + 1 }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    completeWeek(week);
    setRewardOpen(true);
  };

  if (!ready || !section) {
    return <main className={styles.loading}>正在展開第 {week} 週課程…</main>;
  }

  const title = approved.stages[saved.stage]?.title || section.title;
  const choiceLines = section.body.filter((line) => /^[-*]\s+/.test(line));
  const proseLines = section.body.filter((line) =>
    !/^[-*]\s+/.test(line) &&
    !line.includes("[文字輸入框]") &&
    !line.includes("[輸入框]") &&
    !isMetaLine(line)
  );
  const requiresNote = section.body.some((line) =>
    line.includes("[文字輸入框]") || line.includes("[輸入框]") || line.includes("＿＿")
  );
  const canContinue = (!requiresNote || note.trim().length >= 8) &&
    (choiceLines.length === 0 || selected.length > 0 || saved.stage === parsed.sections.length - 1);
  const showCase = Boolean(caseRecord && saved.stage === 4);

  return (
    <main className={styles.page} data-theme={week}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.shell}>
        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <Link href="/student" className={styles.navButton}>← 返回六週地圖</Link>
            {onShowIntro && <button type="button" className={styles.navButton} onClick={onShowIntro}>查看課程介紹</button>}
          </div>
          <span>第 {week} 週 · {saved.stage + 1}/{parsed.sections.length}</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.worldBadge}><span>{world.icon}</span><div><small>{world.name}</small><strong>{world.instruction}</strong></div></div>
          <p>WEEK {String(week).padStart(2, "0")} · {approved.theme}</p>
          <h1>{parsed.unitTitle || approved.unitTitle}</h1>
          <div className={styles.progress}><span style={{ width: `${((saved.stage + 1) / parsed.sections.length) * 100}%` }} /></div>
        </header>

        <article className={styles.paper}>
          <div className={styles.stageRail}>
            {parsed.sections.map((item, index) => (
              <button
                type="button"
                key={item.eyebrow}
                className={index === saved.stage ? styles.stageActive : index < saved.stage ? styles.stageDone : ""}
                onClick={() => index <= saved.stage && setSaved((current) => ({ ...current, stage: index }))}
                aria-label={`前往環節 ${index + 1}`}
              >
                {index < saved.stage ? "✓" : index + 1}
              </button>
            ))}
          </div>

          <p className={styles.eyebrow}>{section.eyebrow}</p>
          <h2>{title}</h2>

          {parsed.question && saved.stage === 0 && (
            <div className={styles.mission}><span>本週核心任務</span><p>{parsed.question}</p></div>
          )}

          {showCase && caseRecord && (
            <section className={styles.caseFile}>
              <div className={styles.casePhoto}><img src={caseRecord.image} alt={`政府公開資料個案 ${caseRecord.subId}`} /></div>
              <div>
                <small>政府 Open Data · {caseRecord.subId}</small>
                <h3>{caseRecord.focus}個案檔案</h3>
                <div className={styles.caseFields}>
                  {caseRecord.displayFields.map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}
                </div>
                <p>{caseRecord.evidenceBoundary}</p>
              </div>
            </section>
          )}

          <div className={styles.content}>
            {proseLines.map((raw, index) => {
              const line = clean(raw);
              if (!line || line.startsWith("〔待補")) return null;
              if (/^(說明|操作|任務|情境|核心提問|核心問題|回饋|完成回饋|深度提問|延伸問題|證據問題|單元結語)：/.test(line)) {
                const [label, ...rest] = line.split("：");
                return <div className={styles.brief} key={index}><strong>{label}</strong><p>{rest.join("：")}</p></div>;
              }
              if (/^\d+\.\s*/.test(line)) return <p className={styles.numbered} key={index}>{line}</p>;
              return <p key={index}>{line}</p>;
            })}
          </div>

          {choiceLines.length > 0 && (
            <section className={styles.cardDeck} aria-label="互動任務卡">
              <div className={styles.deckHeader}><span>{world.icon}</span><strong>選取並整理本關線索</strong><small>已選 {selected.length}</small></div>
              <div className={styles.cardGrid}>
                {choiceLines.map((raw) => {
                  const value = clean(raw);
                  const active = selected.includes(value);
                  return (
                    <button type="button" key={value} className={`${styles.gameCard} ${active ? styles.cardActive : ""}`} onClick={() => toggleCard(value)}>
                      <span>{active ? "✓" : "+"}</span>{value}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {requiresNote && (
            <label className={styles.reflection}>
              <span>留下你的判斷與理由</span>
              <textarea value={note} onChange={(event) => updateNote(event.target.value)} placeholder="請根據目前取得的證據作答；無法確認的部分可以明確寫下來。" />
              <small>{note.trim().length < 8 ? "至少寫下 8 個字，讓理由足以被理解。" : "紀錄已保存，你仍可以返回修正。"}</small>
            </label>
          )}

          {saved.stage === parsed.sections.length - 1 && (
            <div className={styles.rewardPreview}>
              <img src={reward.image} alt="" />
              <div><small>完成本週即可取得</small><strong>{reward.name}</strong><p>{reward.description}</p></div>
            </div>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} disabled={saved.stage === 0} onClick={() => setSaved((current) => ({ ...current, stage: Math.max(0, current.stage - 1) }))}>← 上一環節</button>
            <button type="button" className={styles.primary} disabled={!canContinue} onClick={next}>
              {saved.stage === parsed.sections.length - 1 ? `收下${reward.name}` : "完成任務，前往下一關 →"}
            </button>
          </div>
        </article>
      </div>
      <RewardUnlockModal week={week} open={rewardOpen} onClose={() => router.push("/student")} />
    </main>
  );
}
