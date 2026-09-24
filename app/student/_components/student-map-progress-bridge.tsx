"use client";

import { useMemo } from "react";
import StudentMapDynamic from "./student-map-dynamic";
import { useStudentLearningProgress } from "./student-learning-progress";
import type { StudentMapProgress } from "@/lib/student-map";

export default function StudentMapProgressBridge({
  progress,
  previewMode = false
}: {
  progress: StudentMapProgress;
  previewMode?: boolean;
}) {
  const { progress: learningProgress, ready } = useStudentLearningProgress();

  const effectiveProgress = useMemo<StudentMapProgress>(() => {
    if (previewMode || !ready) return progress;

    const completed = new Set(learningProgress.completedWeeks);
    const nextWeek = ([1, 2, 3, 4, 5, 6] as const).find((week) => !completed.has(week));

    return {
      weeks: progress.weeks.map((item) => {
        if (completed.has(item.week)) return { ...item, status: "completed" as const };
        if (item.week === nextWeek && item.status === "locked") {
          return { ...item, status: "in_progress" as const };
        }
        return item;
      })
    };
  }, [learningProgress.completedWeeks, previewMode, progress, ready]);

  return <StudentMapDynamic
    profile={{ realName: "體驗學生", studentNumber: "DEMO", classCode: "DEMO-CLASS", schoolName: "體驗學校", county: "", grade: "", requiresIdentity: false }}
    progress={effectiveProgress}
    onIdentitySaved={() => undefined}
  />;
}
