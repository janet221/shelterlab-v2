"use client";
import { learningStorage } from "@/lib/classroom/browser-storage";


import { useEffect, useState } from "react";
import RealisticNotebookIntro from "./realistic-notebook-intro";
import WeekOneGame from "./week-one-game";
import styles from "./week-one-experience.module.css";

const COURSE_INTRO_STORAGE_KEY = "shelterlab-course-intro-v8";

export default function WeekOneExperience() {
  const [showNotebook, setShowNotebook] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setShowNotebook(learningStorage.getItem(COURSE_INTRO_STORAGE_KEY) !== "1");
    } catch {
      setShowNotebook(true);
    }
  }, []);

  const finishNotebook = () => {
    try {
      learningStorage.setItem(COURSE_INTRO_STORAGE_KEY, "1");
    } catch {
      // localStorage 不可用時仍允許繼續課程。
    }
    setShowNotebook(false);
  };

  if (showNotebook === null) {
    return <main className={styles.loading}>正在整理學習紀錄…</main>;
  }

  if (showNotebook) {
    return <RealisticNotebookIntro onComplete={finishNotebook} />;
  }

  return <WeekOneGame />;
}
