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

  it("學生地圖提供返回首頁、個人中心與不可略過的首次身分定錨", () => {
    const classroomMap = read("app/student/_components/classroom-map.tsx");
    const studentMap = read("app/student/_components/student-map-dynamic.tsx");
    const profileModal = read("app/student/_components/student-profile-modal.tsx");

    expect(classroomMap).not.toContain("<ClassroomNav");
    expect(classroomMap).toContain("requiresIdentity");
    expect(classroomMap).toContain("schoolName: progress.schoolName");
    expect(studentMap).toContain("<ToolInventory progress={progress} />");
    expect(studentMap).toContain("返回首頁");
    expect(studentMap).toContain("個人中心");
    expect(studentMap).not.toContain("班級代碼：");
    expect(profileModal).toContain("首次登入身分確認");
    expect(profileModal).toContain("完成前無法關閉此視窗");
    expect(profileModal).toContain("學生真實姓名");
    expect(profileModal).toContain("學號");
    expect(profileModal).toContain("所屬班級代碼");
    expect(profileModal).toContain("目前通關進度");
    expect(profileModal).toContain("profile.schoolName");
    expect(profileModal).not.toContain("onMouseDown");
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
    expect(review).toContain("米白色遊戲區塊內");
    expect(review).not.toContain("JSON.stringify(audit.gameState");
  });

  it("教師端只保留學習進度追蹤與設定", () => {
    const nav = read("app/_components/classroom-ui.tsx");
    const settings = read("app/teacher/settings/settings-form.tsx");
    const dashboard = read("app/teacher/dashboard/page.tsx");
    const generator = read("app/teacher/lesson-generator/page.tsx");

    expect(nav).toContain("學習進度追蹤");
    expect(nav).toContain("設定");
    expect(nav).not.toContain("課程工作台");
    expect(nav).not.toContain("在地教案產生器");
    expect(settings).toContain("班級代碼");
    expect(settings).not.toContain("課程週數");
    expect(settings).not.toContain("採固定六週闖關");
    expect(dashboard).toContain('redirect("/teacher/reviews")');
    expect(generator).toContain('redirect("/teacher/reviews")');
  });

  it("資料遷移固定測試班級的學校、縣市並加入學生身分欄位", () => {
    const migration = read("supabase/migrations/202609240002_student_identity_and_default_class.sql");
    expect(migration).toContain("real_name");
    expect(migration).toContain("student_number");
    expect(migration).toContain("SHELTER-TEST-0923");
    expect(migration).toContain("353301");
    expect(migration).toContain("建國中學");
    expect(migration).toContain("臺北市");
  });
});
