export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type WeekStatus = "locked" | "in_progress" | "pending" | "completed";

export type WeekVisual =
  | "shepherd"
  | "poodle"
  | "corgi"
  | "retriever"
  | "bulldog"
  | "shelter";

export type LearningToolKind =
  | "data-lens"
  | "hypothesis-notes"
  | "care-planner"
  | "label-folder"
  | "observation-lens"
  | "action-resource-booklet";

export interface WeekProgress {
  week: WeekNumber;
  status: WeekStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  feedback?: string;
}

export interface ReviewMilestone {
  id: string;
  week: WeekNumber;
  generation: number;
  feedback: string;
  reviewedAt: string;
}

export interface PendingReward {
  week: WeekNumber;
  earnedAt: string;
}

export interface StudentMapProgress {
  weeks: WeekProgress[];
  reviewHistory?: ReviewMilestone[];
  pendingRewards?: PendingReward[];
}

export interface WeekMapConfig {
  week: WeekNumber;
  label: string;
  title: string;
  route: string;
  x: number;
  y: number;
  visual: WeekVisual;
  roof: string;
}

export interface WeekMapNode extends WeekMapConfig {
  status: WeekStatus;
  needsRevision: boolean;
}

export interface LearningTool {
  week: WeekNumber;
  kind: LearningToolKind;
  name: string;
  shortName: string;
  description: string;
  image: string;
}

/**
 * 通關獎勵採「學習工具」。完成一週後取得該週工具，並在下一週指定環節使用一次。
 * 第六週寶物是結業里程碑，不作為後續關卡的解鎖條件。物品只表示完成學習歷程，
 * 不代表學生的偏好或倫理立場較正確。
 */
export const LEARNING_TOOLS: LearningTool[] = [
  {
    week: 1,
    kind: "data-lens",
    name: "證據放大鏡",
    shortName: "放大鏡",
    description: "放大一句話背後的證據，分辨資料直接支持、根據資料進行的推論，以及仍需查證的資訊。",
    image: "/student-map/rewards/reward-1-evidence-lens.png"
  },
  {
    week: 2,
    kind: "care-planner",
    name: "責任盤點表",
    shortName: "盤點表",
    description: "把喜歡放回自己的時間、家庭、空間、經濟與未來生活變動，確認目前能承擔哪些長期照護責任。",
    image: "/student-map/rewards/reward-2-responsibility-checklist.png"
  },
  {
    week: 3,
    kind: "label-folder",
    name: "分類解碼夾",
    shortName: "解碼夾",
    description: "看到品種與分類時，追問分類依據、用途與限制，再回到個體本身確認標籤沒有說出的資訊。",
    image: "/student-map/rewards/reward-3-classification-decoder-folder.png"
  },
  {
    week: 4,
    kind: "hypothesis-notes",
    name: "源頭追蹤卡",
    shortName: "追蹤卡",
    description: "把遊蕩與收容犬隻持續增加的可能來源拆開，追查繁殖、絕育、棄養、放養與源頭管理之間的關係。",
    image: "/student-map/rewards/reward-4-source-tracker-card.png"
  },
  {
    week: 5,
    kind: "observation-lens",
    name: "多方視角鏡",
    shortName: "視角鏡",
    description: "面對零撲殺與流浪動物公共議題時，同時檢視犬隻福利、居民安全、生態、收容資源與政策條件。",
    image: "/student-map/rewards/reward-5-multi-perspective-lens.png"
  },
  {
    week: 6,
    kind: "action-resource-booklet",
    name: "行動資源手冊",
    shortName: "資源手冊",
    description: "把查證過的需求、聯絡方式、安全條件與替代方案整理成可執行、可追蹤的負責任行動。",
    image: "/student-map/rewards/reward-6-action-resource-booklet.png"
  }
];

export const ACTIVE_TREASURE_BY_WEEK: Record<WeekNumber, LearningToolKind | null> = {
  1: null,
  2: "data-lens",
  3: "care-planner",
  4: "label-folder",
  5: "hypothesis-notes",
  6: null
};

export function getActiveTreasureForWeek(week: WeekNumber) {
  const kind = ACTIVE_TREASURE_BY_WEEK[week];
  return kind ? LEARNING_TOOLS.find((tool) => tool.kind === kind) ?? null : null;
}

export function isTreasureUnlockedForWeek(
  week: WeekNumber,
  completedWeeks: readonly WeekNumber[],
  unlockedTools: readonly LearningToolKind[]
) {
  const tool = getActiveTreasureForWeek(week);
  if (!tool) return false;
  return completedWeeks.includes(tool.week) || unlockedTools.includes(tool.kind);
}

/**
 * 六個節點位置對齊 public/student-map/map-background.webp 的六個木製圓台。
 * 路線由左下角第一週，沿步道依序走到右下角第六週收容所。
 */
export const WEEK_MAP_CONFIG: WeekMapConfig[] = [
  {
    week: 1,
    label: "第一週",
    title: "角色與處境",
    route: "/student/week/1",
    x: 21,
    y: 77,
    visual: "shepherd",
    roof: "#C96F4E"
  },
  {
    week: 2,
    label: "第二週",
    title: "承諾與責任",
    route: "/student/week/2",
    x: 30,
    y: 57,
    visual: "poodle",
    roof: "#B98E67"
  },
  {
    week: 3,
    label: "第三週",
    title: "品種與標籤",
    route: "/student/week/3",
    x: 38,
    y: 41,
    visual: "corgi",
    roof: "#B8795C"
  },
  {
    week: 4,
    label: "第四週",
    title: "數量與源頭",
    route: "/student/week/4",
    x: 67.5,
    y: 39,
    visual: "retriever",
    roof: "#A98B70"
  },
  {
    week: 5,
    label: "第五週",
    title: "政策與兩難",
    route: "/student/week/5",
    x: 73.2,
    y: 60.7,
    visual: "bulldog",
    roof: "#9A7B68"
  },
  {
    week: 6,
    label: "第六週",
    title: "現場與行動",
    route: "/student/week/6",
    x: 82.5,
    y: 81.1,
    visual: "shelter",
    roof: "#7E8D91"
  }
];

export const DEFAULT_STUDENT_MAP_PROGRESS: StudentMapProgress = {
  weeks: [
    { week: 1, status: "in_progress" },
    { week: 2, status: "locked" },
    { week: 3, status: "locked" },
    { week: 4, status: "locked" },
    { week: 5, status: "locked" },
    { week: 6, status: "locked" }
  ]
};

function buildStagePreview(activeWeek: WeekNumber): StudentMapProgress {
  const weeks: WeekProgress[] = ([1, 2, 3, 4, 5, 6] as WeekNumber[]).map((week) => ({
    week,
    status:
      week < activeWeek
        ? "completed"
        : week === activeWeek
          ? "in_progress"
          : "locked"
  }));

  return { weeks };
}

export const MAP_PREVIEW_STATES: Record<string, StudentMapProgress> = {
  initial: DEFAULT_STUDENT_MAP_PROGRESS,
  week1: buildStagePreview(1),
  week2: buildStagePreview(2),
  week3: buildStagePreview(3),
  week4: buildStagePreview(4),
  week5: buildStagePreview(5),
  week6: buildStagePreview(6),
  pending: {
    weeks: [
      { week: 1, status: "pending" },
      { week: 2, status: "locked" },
      { week: 3, status: "locked" },
      { week: 4, status: "locked" },
      { week: 5, status: "locked" },
      { week: 6, status: "locked" }
    ]
  },
  mixed: {
    weeks: [
      { week: 1, status: "completed" },
      { week: 2, status: "completed" },
      { week: 3, status: "pending" },
      { week: 4, status: "locked" },
      { week: 5, status: "locked" },
      { week: 6, status: "locked" }
    ]
  },
  complete: {
    weeks: ([1, 2, 3, 4, 5, 6] as WeekNumber[]).map((week) => ({
      week,
      status: "completed" as const
    }))
  }
};

export function buildWeekMapNodes(progress: WeekProgress[]): WeekMapNode[] {
  const statusByWeek = new Map(progress.map((item) => [item.week, item.status]));
  return WEEK_MAP_CONFIG.map((config) => {
    const recordedStatus = statusByWeek.get(config.week) ?? "locked";

    const source = progress.find((item) => item.week === config.week);
    let needsRevision = false;
    try { needsRevision = recordedStatus === "in_progress" && JSON.parse(source?.feedback || "null")?.decision === "reject"; } catch {}
    return {
      ...config,
      status: recordedStatus,
      needsRevision
    };
  });
}

export function getCompletedCount(progress: WeekProgress[]) {
  return progress.filter((item) => item.status === "completed").length;
}

export function getLearningTool(week: WeekNumber) {
  return LEARNING_TOOLS.find((tool) => tool.week === week)!;
}
