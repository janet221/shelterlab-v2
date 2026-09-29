"use client";

import { useState } from "react";
import RealisticNotebookIntro from "./realistic-notebook-intro";
import WeekOneGame from "./week-one-game";

export default function WeekOneExperience({ auditDemo = false, evaluatorPreview = false, skipIntro = false, completedReview = false }: { auditDemo?: boolean; evaluatorPreview?: boolean; skipIntro?: boolean; completedReview?: boolean }) {
  const [showNotebook, setShowNotebook] = useState(!auditDemo && !skipIntro);

  if (showNotebook) {
    return <RealisticNotebookIntro onComplete={() => setShowNotebook(false)} />;
  }

  return <WeekOneGame auditDemo={auditDemo} evaluatorPreview={evaluatorPreview} completedReview={completedReview} />;
}
