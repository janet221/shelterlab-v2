import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACTIVE_TREASURE_BY_WEEK,
  getActiveTreasureForWeek,
  getLearningTool,
  isTreasureUnlockedForWeek
} from "@/lib/student-map";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("前五週寶物跨週應用", () => {
  it("保留第一週寶物 id 與圖片，只修正名稱和用途", () => {
    expect(getLearningTool(1)).toMatchObject({
      kind: "data-lens",
      name: "證據放大鏡",
      shortName: "放大鏡",
      image: "/student-map/rewards/reward-1-evidence-lens.png"
    });
  });

  it("每週只指定前一週取得的工具，第六週沒有寶物", () => {
    expect(ACTIVE_TREASURE_BY_WEEK).toEqual({
      1: null,
      2: "data-lens",
      3: "care-planner",
      4: "label-folder",
      5: "hypothesis-notes",
      6: null
    });
    expect(getActiveTreasureForWeek(6)).toBeNull();
  });

  it("以前一週完成或既有 unlockedTools 紀錄判定相容解鎖", () => {
    expect(isTreasureUnlockedForWeek(2, [1], [])).toBe(true);
    expect(isTreasureUnlockedForWeek(2, [], ["data-lens"])).toBe(true);
    expect(isTreasureUnlockedForWeek(3, [1], ["data-lens"])).toBe(false);
  });

  it("只在指定週次與環節掛入工作區", () => {
    const weekTwo = read("app/student/week/[week]/_components/week-two-experience.tsx");
    const weekThree = read("app/student/week/[week]/_components/week-three-experience.tsx");
    const weekFour = read("app/student/week/[week]/_components/week-four-experience.tsx");
    const weekFive = read("app/student/week/[week]/_components/week-five-experience.tsx");
    const weekSix = read("app/student/week/[week]/_components/week-six-experience.tsx");

    expect(weekTwo).toContain("week={2}");
    expect(weekThree).toContain("week={3}");
    expect(weekFour).toContain("week={4}");
    expect(weekFive).toContain("week={5}");
    expect(weekSix).not.toContain("TreasureWorkspace");
    expect(weekSix).not.toContain("isTreasureUnlockedForWeek");
  });

  it("學生地圖不再顯示頂部班級橫幅，班級代碼改放在探索工具旁", () => {
    const classroomMap = read("app/student/_components/classroom-map.tsx");
    const studentMap = read("app/student/_components/student-map-dynamic.tsx");

    expect(classroomMap).not.toContain("<ClassroomNav");
    expect(classroomMap).not.toContain("progress.schoolName");
    expect(classroomMap).toContain("classCode={progress.classCode}");
    expect(studentMap).toContain("<ToolInventory progress={progress} />");
    expect(studentMap).toContain("班級代碼：");
  });

  it("六週完整互動內容直接記錄稽核資料且不顯示底部送審區", () => {
    const weekPage = read("app/student/week/[week]/page.tsx");
    const tracker = read("app/student/week/[week]/_components/week-audit-tracker.tsx");

    for (const component of ["WeekOneExperience", "WeekTwoExperience", "WeekThreeExperience", "WeekFourExperience", "WeekFiveExperience", "WeekSixExperience"]) {
      expect(weekPage).toContain(component);
    }
    expect(weekPage).toContain("studentWeek(account.id, weekNumber)");
    expect(weekPage).toContain("<WeekAuditTracker accountId={account.id} week={weekNumber}>");
    expect(weekPage).not.toContain("WeekSubmission");
    expect(tracker).toContain("shelterlab-week-complete");
    expect(tracker).toContain("game-audit");
  });

  it("教師稽核可看完整填答、選擇題與整體完成狀態", () => {
    const review = read("app/teacher/reviews/[id]/review.tsx");

    expect(review).toContain("完整關卡填答稽核");
    expect(review).toContain("整體完成狀態");
    expect(review).toContain("選擇題");
    expect(review).toContain("尚未填答");
    expect(review).toContain("gameAudit");
    expect(review).toContain("完整關卡狀態資料");
  });
});
