"use client";

import { useState } from "react";
import RealisticNotebookIntro from "./realistic-notebook-intro";
import WeekOneGame from "./week-one-game";

export default function WeekOneExperience() {
  const [showNotebook, setShowNotebook] = useState(true);

  if (showNotebook) {
    return <RealisticNotebookIntro onComplete={() => setShowNotebook(false)} />;
  }

  return <WeekOneGame />;
}
