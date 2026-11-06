import { describe, expect, it } from "vitest";
import { filterTeacherActivities, type TeacherActivity } from "@/lib/teacher-activities";

const activity = (id: string, overrides: Partial<TeacherActivity> = {}): TeacherActivity => ({
  id, shelter_id: "test-shelter", title: "教育參訪", summary: "了解收容照護", description: "測試公告",
  activity_type: "visit", status: "published", teacher_group_visit: true,
  shelters: { name: "測試收容所", address: "台北市測試路", contact_email: "test@example.invalid" },
  ...overrides,
});

describe("教師帶班公告篩選", () => {
  it("只顯示已刊登且開放教師帶班的公告", () => {
    const rows = [activity("open"), activity("unflagged", { teacher_group_visit: false }), activity("draft", { status: "draft" })];
    expect(filterTeacherActivities(rows, { county: "臺北市", crossCounty: false, query: "" }).map((row) => row.id)).toEqual(["open"]);
  });
  it("以縣市與搜尋詞篩選，跨縣市模式可顯示其他縣市", () => {
    const rows = [activity("north"), activity("south", { shelters: { name: "南區收容所", address: "高雄市測試路", contact_email: "test@example.invalid" } })];
    expect(filterTeacherActivities(rows, { county: "臺北市", crossCounty: false, query: "南區" })).toHaveLength(0);
    expect(filterTeacherActivities(rows, { county: "臺北市", crossCounty: true, query: "南區" }).map((row) => row.id)).toEqual(["south"]);
  });
});
