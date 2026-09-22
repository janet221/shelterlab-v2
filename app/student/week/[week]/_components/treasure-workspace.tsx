"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getActiveTreasureForWeek, type WeekNumber } from "@/lib/student-map";
import styles from "./treasure-workspace.module.css";

export type TreasureCategory = {
  id: string;
  label: string;
};

export type TreasureItem = {
  id: string;
  label: string;
  explanation: string;
  correctCategory?: string;
};

type Attempt = {
  categoryId: string;
  correct: boolean;
  message: string;
};

type TreasureWorkspaceProps = {
  week: WeekNumber;
  objective: string;
  instruction: string;
  categories: readonly TreasureCategory[];
  items: readonly TreasureItem[];
  assignments: Record<string, string>;
  completed: boolean;
  unlocked: boolean;
  onAssign: (item: TreasureItem, categoryId: string, correct: boolean) => void;
};

export default function TreasureWorkspace({
  week,
  objective,
  instruction,
  categories,
  items,
  assignments,
  completed,
  unlocked,
  onAssign
}: TreasureWorkspaceProps) {
  const tool = getActiveTreasureForWeek(week);
  const [open, setOpen] = useState(completed || Object.keys(assignments).length > 0);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});

  useEffect(() => {
    if (completed) setOpen(true);
  }, [completed]);

  if (!tool) return null;

  const assign = (item: TreasureItem, categoryId: string) => {
    if (!unlocked || completed || assignments[item.id]) return;
    const correct = !item.correctCategory || item.correctCategory === categoryId;
    const category = categories.find((choice) => choice.id === categoryId);
    const message = correct
      ? item.explanation
      : `「${category?.label ?? "這個分類"}」還不能完整說明這張卡。${item.explanation}`;
    setAttempts((current) => ({ ...current, [item.id]: { categoryId, correct, message } }));
    onAssign(item, categoryId, correct);
  };

  return (
    <section className={styles.workspace} aria-labelledby={`treasure-title-${week}`}>
      <div className={styles.summary}>
        <div className={styles.toolImage}>
          <Image src={tool.image} alt={tool.name} width={92} height={92} draggable={false} />
        </div>
        <div className={styles.summaryCopy}>
          <span>本週指定工具</span>
          <h3 id={`treasure-title-${week}`}>{tool.name}</h3>
          <p>{objective}</p>
        </div>
        <div className={styles.summaryAction}>
          <strong>{completed ? "已完成" : `${Object.keys(assignments).length} / ${items.length}`}</strong>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            disabled={!unlocked}
            aria-expanded={open}
            aria-controls={`treasure-panel-${week}`}
          >
            {!unlocked ? "尚未解鎖" : open ? "收起工作區" : `取出${tool.shortName}`}
          </button>
        </div>
      </div>

      {!unlocked && (
        <p className={styles.lockedNote} role="status">
          完成第 {tool.week} 週後才能取得「{tool.name}」。請依六週地圖的進度順序完成前一週。
        </p>
      )}

      {open && unlocked && (
        <div className={styles.panel} id={`treasure-panel-${week}`}>
          <div className={styles.instructions}>
            <strong>這次要用它完成什麼</strong>
            <p>{instruction}</p>
          </div>

          <div className={styles.items}>
            {items.map((item, index) => {
              const assignedCategory = assignments[item.id];
              const attempt = attempts[item.id];
              return (
                <fieldset key={item.id} className={styles.item}>
                  <legend><span>{index + 1}</span>{item.label}</legend>
                  <div className={styles.categories}>
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        disabled={completed || Boolean(assignedCategory)}
                        aria-pressed={assignedCategory === category.id}
                        className={
                          assignedCategory === category.id
                            ? styles.assigned
                            : attempt?.categoryId === category.id && !attempt.correct
                              ? styles.incorrect
                              : ""
                        }
                        onClick={() => assign(item, category.id)}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                  {(assignedCategory || attempt) && (
                    <p
                      className={assignedCategory ? styles.explanation : styles.correction}
                      role="status"
                    >
                      <strong>{assignedCategory ? "整理完成" : "再檢查一次"}</strong>
                      {assignedCategory ? item.explanation : attempt?.message}
                    </p>
                  )}
                </fieldset>
              );
            })}
          </div>

          {completed && (
            <p className={styles.completedNote} role="status">
              ✓ 本週指定寶物任務已完成，結果已保存在這台裝置上。
            </p>
          )}
        </div>
      )}
    </section>
  );
}
