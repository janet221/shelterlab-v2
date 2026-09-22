import { expect,test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function seedStudentProfile(page:Page){
  await page.addInitScript(()=>localStorage.setItem("shelterlab-student-action-profile-v1",JSON.stringify({studentId:"e2e-student",displayName:"測試學生",age:16,county:"高雄市",schoolId:"school-khh-001",schoolName:"國立高雄高級中學",schoolLevel:"senior_high",grade:"高二",gmail:"student.test@gmail.com",skills:["data_analysis"],interests:["data_support"],availableTimes:["假日白天"],transportation:["由成人陪同"],guardianConsent:true,adultSupportAvailable:true,guardianConsentAvailable:true,adultCompanionAvailable:true,schoolParticipationAvailable:true,youthGroupParticipationAvailable:false,acceptsOnlineAction:true,acceptsCampusAction:true,updatedAt:new Date().toISOString()})));
}

test("student can search a linked demo opportunity and open the action inbox",async({page})=>{
  await seedStudentProfile(page);
  await page.goto("/student/opportunities");
  await expect(page.getByRole("heading",{name:"動保活動布告欄"})).toBeVisible();
  await expect(page.getByText("功能示範",{exact:false}).first()).toBeVisible();
  await page.getByLabel("搜尋行動機會").fill("校園認養資訊");
  await expect(page.getByRole("heading",{name:/校園認養資訊整理/})).toBeVisible();
  await page.getByRole("button",{name:"我要申請",exact:true}).click();
  await page.getByLabel("申請動機").fill("我想協助整理可查核的認養資訊。");
  await page.getByText("我同意把這份申請快照",{exact:false}).click();
  await page.getByRole("button",{name:"確認送出站內申請"}).click();
  await page.goto("/student/action-inbox");
  await expect(page.getByRole("heading",{name:"行動信箱"})).toBeVisible();
  await expect(page.getByText("申請已送出",{exact:false}).first()).toBeVisible();
  await expect(page.getByText("指定申請",{exact:true}).first()).toBeVisible();
});

test("under-age official opportunity stays disabled and narrow layout remains usable",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/student/opportunities");
  await page.getByLabel("搜尋行動機會").fill("查詢官方志工");
  await expect(page.getByText("仍可查看替代行動",{exact:false})).toBeVisible();
  await expect(page.getByRole("button",{name:"查看其他行動"}).first()).toBeEnabled();
  await expect(page.getByText("尚未進駐",{exact:false}).first()).toBeVisible();
  await expect(page.getByRole("button",{name:"查看地圖"})).toBeVisible();
});

test("partner workspace exposes eight sections and a persistent demo warning",async({page})=>{
  await page.goto("/shelter");
  await expect(page).toHaveURL(/\/shelter$/);
  await expect(page.getByRole("heading",{name:"ShelterLab 動保夥伴工作台"})).toBeVisible();
  await expect(page.getByText("展示資料，非真實合作或招募。",{exact:false}).first()).toBeVisible();
  await expect(page.getByRole("heading",{name:"今天的工作摘要"})).toBeVisible();
  await expect(page.getByText("organization → opportunity → application → message／notification → activity result",{exact:true})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"申請與資格（學生）"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"參訪與訊息（老師）"})).toBeVisible();
  for(const label of ["工作台","行動機會","學生媒合","申請管理","參訪與課程","訊息中心","成果報告","單位資料"]){await expect(page.getByRole("button",{name:new RegExp(label)}).first()).toBeVisible()}
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole("button",{name:/工作台/})).toBeVisible();
  await expect(page.getByRole("button",{name:"申請管理",exact:true})).toBeVisible();
});

test("organization registration stays pending and cannot impersonate a directory organization",async({page})=>{
  await page.goto("/shelter/register");
  await expect(page.getByRole("heading",{name:"動保機構註冊與身分確認"})).toBeVisible();
  await page.locator("form select").first().selectOption("高雄市");
  await page.getByText("找不到我的機構／申請新增機構").click();
  await page.getByLabel("機構正式名稱").fill("測試動保教育協會");
  await page.getByLabel("地址").fill("高雄市測試區測試路1號");
  await page.getByLabel("官方網站或正式社群頁面").fill("https://example.org/organization");
  await page.getByLabel("資料來源網址").fill("https://example.org/source");
  await page.getByLabel("申請人姓名").fill("測試申請人");
  await page.getByLabel("職稱").fill("活動專員");
  await page.getByLabel("官方 Email").fill("office@example.org");
  await page.getByLabel("官方電話").fill("07-1234567");
  await page.getByRole("button",{name:"送出機構確認申請"}).click();
  await expect(page.getByRole("heading",{name:"等待平台確認"})).toBeVisible();
  await expect(page.getByText("不能發布活動",{exact:false})).toBeVisible();
});

test("one partner receives its application, another cannot see it, and acceptance reaches the student",async({page})=>{
  await seedStudentProfile(page);
  await page.goto("/student/opportunities");
  await page.getByLabel("搜尋行動機會").fill("校園認養資訊");
  await page.getByRole("button",{name:"我要申請",exact:true}).click();
  await page.getByText("我同意把這份申請快照",{exact:false}).click();
  await page.getByRole("button",{name:"確認送出站內申請"}).click();
  await page.goto("/shelter/opportunities");
  await page.getByRole("button",{name:/^✓ 申請管理$/}).click();
  await expect(page.getByText("指定申請",{exact:true})).toBeVisible();
  await page.getByLabel("單位帳號").selectOption("shelterlab-partner-demo-secondary");
  await expect(page.getByText("目前沒有符合條件、且送到此單位的申請。")).toBeVisible();
  await page.getByLabel("單位帳號").selectOption("shelterlab-partner-demo");
  await page.getByRole("button",{name:"錄取",exact:true}).click();
  await page.reload();
  await page.getByRole("button",{name:/^✓ 申請管理$/}).click();
  await expect(page.locator("article").filter({hasText:"校園認養資訊整理協作"}).getByText("已錄取",{exact:true}).first()).toBeVisible();
  await page.goto("/student/action-inbox");
  await expect(page.getByText("單位已錄取申請",{exact:true})).toBeVisible();
  await expect(page.getByText("目前狀態：已錄取",{exact:false}).first()).toBeVisible();
});

test("partner completes the six-step publishing flow and students can find the new activity",async({page})=>{
  await page.goto("/shelter/opportunities");
  await page.getByRole("button",{name:/^＋ 行動機會$/}).click();
  await page.getByLabel("活動名稱").fill("學生資料校對新活動");
  await page.getByLabel("活動說明").fill("驗證合作端發布後，學生端會讀到同一筆活動。");
  await page.getByRole("button",{name:"下一步"}).click();
  await page.getByLabel("工作內容").fill("資料整理、公開資訊校對");
  await page.getByRole("button",{name:"下一步"}).click();
  await page.getByRole("button",{name:"下一步"}).click();
  await expect(page.getByText("工作風險",{exact:true})).toHaveCount(0);
  await expect(page.getByText("年齡規定來源",{exact:true})).toHaveCount(0);
  await expect(page.getByText("資格來源網址",{exact:true})).toHaveCount(0);
  await expect(page.getByText("最後確認日期",{exact:true})).toHaveCount(0);
  await page.getByLabel("安全注意").fill("不處理個資，依教師指引完成。");
  await page.getByRole("button",{name:"加入參加途徑"}).click();
  await page.getByRole("button",{name:"下一步"}).click();
  await page.getByRole("button",{name:"下一步"}).click();
  await expect(page.getByText("學生端預覽",{exact:false})).toBeVisible();
  await page.getByRole("button",{name:"發布功能示範機會"}).click();
  await expect(page.getByText("已發布「學生資料校對新活動」",{exact:false})).toBeVisible();
  await page.goto("/student/opportunities");
  await page.getByLabel("搜尋行動機會").fill("學生資料校對新活動");
  await expect(page.getByRole("heading",{name:"學生資料校對新活動"})).toBeVisible();
  await page.getByRole("button",{name:"查看地圖"}).click();
  await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();
});

test("anonymous matching creates no application until the student accepts",async({page})=>{
  await page.goto("/student/opportunities");
  await page.getByText("我的條件、學校與聯絡資料",{exact:false}).click();
  await page.getByRole("button",{name:"開放匿名媒合"}).click();
  await page.goto("/shelter/opportunities");
  await page.getByRole("button",{name:/^◇ 學生媒合$/}).click();
  await expect(page.getByText("匿名公開",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"送出匿名邀請"}).click();
  await page.getByRole("button",{name:/^✓ 申請管理$/}).click();
  await expect(page.getByText("目前沒有符合條件、且送到此單位的申請。")).toBeVisible();
  await page.goto("/student/action-inbox");
  await expect(page.getByText("匿名媒合邀請",{exact:true}).first()).toBeVisible();
  await page.getByRole("button",{name:"接受並建立申請"}).click();
  await expect(page.getByText("系統已建立一筆正式申請",{exact:false})).toBeVisible();
});

test("visit request is received and updated through the dedicated visit flow",async({page})=>{
  await page.goto("/student/opportunities");
  await page.getByText("我的條件、學校與聯絡資料",{exact:false}).click();
  await page.getByRole("button",{name:"提出參訪需求"}).click();
  await page.goto("/shelter/opportunities");
  await page.getByRole("button",{name:/^▦ 參訪與課程$/}).click();
  await expect(page.getByText("希望由教師協助洽詢團體參訪。")).toBeVisible();
  await page.getByRole("button",{name:"接受日期"}).click();
  await page.goto("/student/action-inbox");
  await expect(page.getByText("參訪需求有新進度",{exact:true})).toBeVisible();
  await expect(page.getByText("已接受",{exact:true}).first()).toBeVisible();
});

test("student home keeps the map and one action opportunity shortcut",async({page})=>{
  await page.goto("/student");
  await expect(page.getByRole("link",{name:"行動機會",exact:true})).toBeVisible();
  await expect(page.getByRole("link",{name:"行動信箱",exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:/活動布告欄/})).toHaveCount(0);
  await expect(page.locator('img[src^="/student-map/map-background.webp"]')).toBeVisible();
});
