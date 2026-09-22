export type CourseCaseWeek = 1 | 2 | 3 | 4 | 5;

export type OpenDataCourseCase = {
  week: CourseCaseWeek;
  focus: "毛色" | "體型" | "品種" | "性別" | "年齡";
  animalId: number;
  subId: string;
  shelter: string;
  shelterAddress: string;
  shelterTel: string;
  image: string;
  status: "公開";
  openDate: string;
  updateDate: string | null;
  snapshotDate: string;
  rawFields: {
    age: "ADULT" | "CHILD" | "N";
    sex: "M" | "F" | "N";
    bodyType: "BIG" | "MEDIUM" | "SMALL" | "N";
    colour: string;
    variety: string;
    sterilization: "T" | "F" | "N";
  };
  displayFields: ReadonlyArray<readonly [string, string]>;
  sourceRemark: string | null;
  inquiryPrompt: string;
  evidenceBoundary: string;
};

const DATASET = {
  title: "動物認領養",
  provider: "農業部",
  datasetUrl: "https://data.gov.tw/dataset/85903",
  apiUrl:
    "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=QcbUEzN6E6DL",
  snapshotDate: "2026/09/12"
} as const;

/**
 * 五筆課程個案皆取自農業部「動物認領養」開放資料。
 * 統計結論將由後續研究資料補入；這裡只保存單筆公開紀錄，
 * 不用單筆個案推論某類犬隻較難被認養的原因。
 */
export const OPEN_DATA_COURSE_CASES: Record<CourseCaseWeek, OpenDataCourseCase> = {
  1: {
    week: 1,
    focus: "毛色",
    animalId: 423045,
    subId: "AAAIG1140918005",
    shelter: "新北市八里區公立動物之家",
    shelterAddress: "新北市八里區長坑里6鄰長坑道路36號",
    shelterTel: "(02)26194428",
    image: "/student/open-data/week-1.png",
    status: "公開",
    openDate: "2025-09-18",
    updateDate: null,
    snapshotDate: DATASET.snapshotDate,
    rawFields: {
      age: "ADULT",
      sex: "M",
      bodyType: "MEDIUM",
      colour: "黑色",
      variety: "混種犬",
      sterilization: "T"
    },
    displayFields: [
      ["年齡標示", "成年"],
      ["性別", "公"],
      ["體型", "中型"],
      ["毛色", "黑色"],
      ["品種標示", "混種犬"],
      ["目前場域", "八里區公立動物之家"]
    ],
    sourceRemark: null,
    inquiryPrompt: "毛色欄位能告訴我們什麼？它能否證明個性，或解釋未被認養的原因？",
    evidenceBoundary: "資料只記載毛色為黑色；個性、過往經歷與他人選擇牠或不選牠的原因仍未知。"
  },
  2: {
    week: 2,
    focus: "體型",
    animalId: 57961,
    subId: "107072312",
    shelter: "臺北市動物之家",
    shelterAddress: "臺北市內湖區安美街191號",
    shelterTel: "(02)87913254",
    image: "/student/open-data/week-2.png",
    status: "公開",
    openDate: "2021-04-10",
    updateDate: "2026-09-05",
    snapshotDate: DATASET.snapshotDate,
    rawFields: {
      age: "ADULT",
      sex: "M",
      bodyType: "MEDIUM",
      colour: "黑白色",
      variety: "混種犬",
      sterilization: "T"
    },
    displayFields: [
      ["年齡標示", "成年"],
      ["性別", "公"],
      ["體型", "中型"],
      ["毛色", "黑白色"],
      ["品種標示", "混種犬"],
      ["目前場域", "臺北市動物之家"]
    ],
    sourceRemark:
      "資料備註記載這隻犬已在所內完成絕育；其他照護與行為需求仍要向收容單位確認。",
    inquiryPrompt: "「中型」會讓人預先想像哪些空間、活動量與照護條件？哪些需要再向專業人員確認？",
    evidenceBoundary: "資料可確認這筆紀錄標示為中型犬；活動量、個性、健康與家庭適配仍需個別查證。"
  },
  3: {
    week: 3,
    focus: "品種",
    animalId: 194647,
    subId: "AAACG1100206002",
    shelter: "新北市新店區公立動物之家",
    shelterAddress: "新北市新店區安泰路235號",
    shelterTel: "(02)22159462",
    image: "/student/open-data/week-3.png",
    status: "公開",
    openDate: "2021-02-06",
    updateDate: "2026-01-26",
    snapshotDate: DATASET.snapshotDate,
    rawFields: {
      age: "ADULT",
      sex: "F",
      bodyType: "MEDIUM",
      colour: "三花色",
      variety: "混種犬",
      sterilization: "T"
    },
    displayFields: [
      ["年齡標示", "成年"],
      ["性別", "母"],
      ["體型", "中型"],
      ["毛色", "三花色"],
      ["品種標示", "混種犬"],
      ["目前場域", "新店區公立動物之家"]
    ],
    sourceRemark:
      "資料備註記載牠親人、喜歡握手與玩球，面對陌生人較慢熟；原飼主離世後，其他家人未接手照顧而進入收容所，目前由志工代養。",
    inquiryPrompt: "「混種犬」這個分類保留了哪些資訊，又省略了哪些性格、關係與生命經歷？",
    evidenceBoundary: "品種欄位只有「混種犬」；個體行為與經歷來自另列備註，不能由品種標籤自行推得。"
  },
  4: {
    week: 4,
    focus: "性別",
    animalId: 465393,
    subId: "AAAIG1150821005",
    shelter: "新北市八里區公立動物之家",
    shelterAddress: "新北市八里區長坑里6鄰長坑道路36號",
    shelterTel: "(02)26194428",
    image: "/student/open-data/week-4.png",
    status: "公開",
    openDate: "2026-08-21",
    updateDate: null,
    snapshotDate: DATASET.snapshotDate,
    rawFields: {
      age: "ADULT",
      sex: "F",
      bodyType: "MEDIUM",
      colour: "黑黃色",
      variety: "混種犬",
      sterilization: "F"
    },
    displayFields: [
      ["年齡標示", "成年"],
      ["性別", "母"],
      ["體型", "中型"],
      ["毛色", "黑黃色"],
      ["品種標示", "混種犬"],
      ["絕育狀態", "未絕育"],
      ["目前場域", "八里區公立動物之家"]
    ],
    sourceRemark: null,
    inquiryPrompt: "知道牠是母犬且尚未絕育後，可以合理評估哪些照護問題？哪些仍須檢查，不能自行推定？",
    evidenceBoundary: "資料可確認性別與未絕育；沒有懷孕欄位，因此是否懷孕、健康狀況與繁殖史都不能由此判定。"
  },
  5: {
    week: 5,
    focus: "年齡",
    animalId: 36094,
    subId: "AAAHG106020719",
    shelter: "新北市五股區公立動物之家",
    shelterAddress: "新北市五股區外寮路9-9號",
    shelterTel: "(02)82925265",
    image: "/student/open-data/week-5.png",
    status: "公開",
    openDate: "2021-10-05",
    updateDate: "2026-03-07",
    snapshotDate: DATASET.snapshotDate,
    rawFields: {
      age: "ADULT",
      sex: "F",
      bodyType: "MEDIUM",
      colour: "黑白色",
      variety: "混種犬",
      sterilization: "F"
    },
    displayFields: [
      ["年齡標示", "成年"],
      ["性別", "母"],
      ["體型", "中型"],
      ["毛色", "黑白色"],
      ["品種標示", "混種犬"],
      ["目前場域", "五股區公立動物之家"]
    ],
    sourceRemark:
      "資料備註記載牠於 2017 年 2 月 7 日被通報，並在備註撰寫時標為至少 7 歲；也描述牠較膽小、已逐漸願意讓陌生人觸摸。",
    inquiryPrompt: "資料只用「成年」分類時，我們遺漏了哪些生命階段與照護差異？備註又能補充到什麼程度？",
    evidenceBoundary: "「成年」是寬泛分類；年齡線索來自備註且可能隨時間改變，使用時必須保留紀錄日期與不確定性。"
  }
};

export const OPEN_DATA_SOURCE = DATASET;

export function getOpenDataCourseCase(week: CourseCaseWeek) {
  return OPEN_DATA_COURSE_CASES[week];
}
