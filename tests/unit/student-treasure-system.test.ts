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
    expect(studentMap).not.toContain("已取得・待教師審核");
    expect(studentMap).not.toContain("查看完整寶物工具箱");
    expect(profileModal).toContain("首次登入身分確認");
    expect(profileModal).toContain("請填寫真實姓名與學號。");
    expect(profileModal).not.toContain("完成前無法關閉此視窗");
    expect(profileModal).toContain("學生真實姓名");
    expect(profileModal).toContain("學號");
    expect(profileModal).toContain("所屬班級代碼");
    expect(profileModal).toContain("目前通關進度");
    expect(profileModal).toContain("profile.schoolName");
    expect(profileModal).not.toContain("onMouseDown");
  });

  it("第一週會重新顯示完整翻書教案，並在完成後才進入遊戲", () => {
    const experience = read("app/student/week/[week]/_components/week-one-experience.tsx");
    const notebook = read("app/student/week/[week]/_components/realistic-notebook-intro.tsx");
    const game = read("app/student/week/[week]/_components/week-one-game.tsx");

    expect(experience).toContain("useState(true)");
    expect(experience).not.toContain("localStorage");
    expect(experience).toContain("<RealisticNotebookIntro onComplete={() => setShowNotebook(false)} />");
    expect(notebook).toContain("第 1 週｜先入為主與證據");
    expect(notebook).toContain("進入第一週");
    expect(game).toContain("帶著工具返回地圖");
    expect(game).toContain("重新體驗第一週");
    expect(game).toContain('primaryLabel="收下工具並返回地圖"');
    expect(game).toContain("submissionRef.current = completeWeekOne()");
    expect(game).toContain('router.push("/student")');
    expect(game).toContain("stage: 6, completed: true");
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
    expect(tracker).toContain("detail.resolve?.(saved)");
    expect(tracker).toContain('work.status === "pending" || work.status === "completed"');

    const map = read("app/student/_components/student-map-dynamic.tsx");
    expect(map).toContain('item.status === "pending" || item.status === "completed"');
    expect(map).toContain("闖關進度 {submitted}/6");

    const learningProgress = read("app/student/_components/student-learning-progress.tsx");
    expect(learningProgress).toContain('w.status==="pending"||w.status==="completed"');
    expect(learningProgress).toContain("unlockedTools:earnedWeeks");
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
    expect(nav).toContain('teacher ? "/auth?role=teacher" : "/auth?role=student"');
    expect(settings).toContain("教師姓名 / 稱謂");
    expect(settings).toContain("班級代碼");
    expect(settings).toContain("學生首次註冊時會使用此碼，且不可與其他班級重複。");
    expect(settings).not.toContain("由學校名錄鎖定");
    expect(settings).not.toContain("8–64 個英文字母");
    expect(settings).not.toContain("課程週數");
    expect(settings).not.toContain("採固定六週闖關");
    expect(dashboard).toContain('redirect("/teacher/reviews")');
    expect(generator).toContain('redirect("/teacher/reviews")');
  });

  it("進度追蹤頁最上方提供動態授課教師專區與班級代碼複製", () => {
    const dashboard = read("app/teacher/workbench.tsx");
    const loading = read("app/student/loading.tsx");
    const loadingVisual = read("app/student/_components/student-route-loading.tsx");
    const classroomMap = read("app/student/_components/classroom-map.tsx");

    expect(dashboard).toContain("授課教師專區");
    expect(dashboard).toContain("dashboard.teacherName");
    expect(dashboard).toContain("dashboard.classroom.schoolName");
    expect(dashboard).toContain("dashboard.classroom.county");
    expect(dashboard).toContain("dashboard.classroom.grade");
    expect(dashboard).toContain("一鍵複製班級代碼");
    expect(dashboard).toContain("navigator.clipboard.writeText");
    expect(loading).toContain("正在載入關卡");
    expect(classroomMap).toContain("正在讀取地圖進度");
    expect(loadingVisual).toContain("animate-spin");
    expect(loadingVisual).toContain("animate-pulse");
    expect(loadingVisual).toContain("#fffefa");
    expect(loadingVisual).not.toContain("#d4ae62");
    expect(loadingVisual).not.toContain("green");
    expect(loadingVisual).not.toContain("emerald");
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

  it("允許教師更新已有學生班級的學校，學生個人中心會讀取最新班級資料", () => {
    const migration = read("supabase/migrations/202609240003_allow_teacher_school_updates.sql");
    const service = read("lib/classroom/service.ts");
    const classroomMap = read("app/student/_components/classroom-map.tsx");

    expect(migration).not.toContain("Cannot change enrolled school");
    expect(migration).toContain("school_id=p_school_id");
    expect(migration).toContain("school_name=p_school_name");
    expect(migration).toContain("county=p_county");
    expect(service).toContain('select("name,school_name,county,grade,class_code")');
    expect(service).toContain("schoolName: classroom.school_name");
    expect(classroomMap).toContain("setInterval(refresh, 5000)");
    expect(classroomMap).toContain('schoolName: progress.schoolName');
  });

  it("班級已有學生後鎖定班級代碼，但不鎖定學校設定", () => {
    const migration = read("supabase/migrations/202609240004_lock_enrolled_class_code.sql");
    const settings = read("app/teacher/settings/settings-form.tsx");
    const service = read("lib/classroom/service.ts");

    expect(migration).toContain("Cannot change enrolled class code");
    expect(migration).not.toContain("Cannot change enrolled school");
    expect(settings).toContain("readOnly={classCodeLocked}");
    expect(settings).toContain("已有學生加入，班級代碼已鎖定。");
    expect(service).toContain("已有學生加入，班級代碼不可更改。");
  });
});
