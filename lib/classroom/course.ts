export const COURSE_WEEK_TITLES = [
  "角色與處境",
  "承諾與責任",
  "品種與標籤",
  "數量與源頭",
  "政策與兩難",
  "現場與行動",
] as const;

const CHINESE_WEEK_NUMBERS = ["一", "二", "三", "四", "五", "六"] as const;

export function courseWeekLabel(week: number) {
  if (!Number.isInteger(week) || week < 1 || week > 6) return `第 ${week} 週`;
  return `第${CHINESE_WEEK_NUMBERS[week - 1]}週｜${COURSE_WEEK_TITLES[week - 1]}`;
}
