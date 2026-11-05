"use client";

import { useEffect, useState } from "react";
import RealisticNotebookIntro from "./realistic-notebook-intro";
import WeekOneGame from "./week-one-game";
import { EVALUATOR_ROLE_PATH_NAVIGATION_EVENT, useEvaluatorStageNavigation } from "./evaluator-stage-navigator";

export default function WeekOneExperience({ auditDemo = false, evaluatorPreview = false, skipIntro = false, completedReview = false }: { auditDemo?: boolean; evaluatorPreview?: boolean; skipIntro?: boolean; completedReview?: boolean }) {
  const [showNotebook, setShowNotebook] = useState(!auditDemo && !skipIntro);
  const [initialStage, setInitialStage] = useState<number | undefined>();
  const [initialRolePath, setInitialRolePath] = useState<string | null | undefined>();

  useEvaluatorStageNavigation(1, evaluatorPreview && showNotebook, (stage) => {
    setInitialStage(stage);
    setShowNotebook(false);
  });

  useEffect(() => {
    if (!evaluatorPreview || !showNotebook) return;
    const selectRolePath = (event: Event) => {
      const detail = (event as CustomEvent<{ week: number; path: string | null }>).detail;
      if (detail?.week !== 1) return;
      setInitialRolePath(detail.path);
      setInitialStage(detail.path ? 2 : 1);
      setShowNotebook(false);
    };
    window.addEventListener(EVALUATOR_ROLE_PATH_NAVIGATION_EVENT, selectRolePath);
    return () => window.removeEventListener(EVALUATOR_ROLE_PATH_NAVIGATION_EVENT, selectRolePath);
  }, [evaluatorPreview, showNotebook]);

  if (showNotebook) {
    return <RealisticNotebookIntro onComplete={() => setShowNotebook(false)} />;
  }

  return <WeekOneGame auditDemo={auditDemo} evaluatorPreview={evaluatorPreview} completedReview={completedReview} initialStage={initialStage} initialRolePath={initialRolePath} />;
}
