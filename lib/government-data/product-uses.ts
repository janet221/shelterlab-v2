import { activatedOfficialDatasets, shelterStatisticsFixture, studentPopulationFixture } from "./sprint6-fixtures";
import type { DatasetUsageModule } from "./evidence-types";

export type ActivatedDatasetProductUse = {
  datasetId: string;
  fieldsUsed: string[];
  transformation: string;
  productFeature: string;
  educationalOutcome: string;
  evidenceGenerated: string;
  usageModules: DatasetUsageModule[];
  entityIds: string[];
};

export const activatedDatasetProductUses: ActivatedDatasetProductUse[] = [
  {
    datasetId: "6318",
    fieldsUsed: ["NO", "標題", "類型", "製作年份", "學習領域", "學習階段", "學習內容", "學習表現", "議題", "核心素養", "授權方式", "影片網址"],
    transformation: "正規化已驗證的中繼資料，保留空白課程欄位，且只保存官方外部連結。",
    productFeature: "課程資源探索與選用的學習補強連結",
    educationalOutcome: "學生與教師可找到官方生物多樣性資源，ShelterLab 不複製或散布其影片。",
    evidenceGenerated: "課程資源 res_dataset_6318 已對應為都市生態選用資源。",
    usageModules: ["CURRICULUM_DISCOVERY", "LEARNING_RESOURCE_MAPPING", "REMEDIATION", "COMPETITION_EVIDENCE"],
    entityIds: ["res_dataset_6318", "course_week_06"]
  },
  {
    datasetId: "40121",
    fieldsUsed: ["學年度", "縣市別", "國小[人]", "國中[人]", "高級中等學校-普通科[人]", "高級中等學校-專業群科[人]"],
    transformation: "將官方數字字串解析為縣市層級人數，並保留學年度脈絡。",
    productFeature: "由教師治理的教育開放資料出題藍圖",
    educationalOutcome: "學生使用已驗證的教育統計，練習留意分母的比較方法。",
    evidenceGenerated: "課程資源 res_dataset_40121 與都市生態出題藍圖的對應紀錄。",
    usageModules: ["COMPETENCY_CONTEXT", "QUESTION_GENERATION", "COMPETITION_EVIDENCE"],
    entityIds: ["res_dataset_40121", "qgb_urban_ecology_v1"]
  },
  {
    datasetId: "41236",
    fieldsUsed: ["rpt_year", "rpt_county", "rpt_month", "accept_count", "adopt_count", "adopt_rate", "end_count", "dead_count"],
    transformation: "正規化民國年與縣市月份彙總數量；比較比率時，不推論個別犬隻。",
    productFeature: "都市生態與 One Health 的區域收容所比較",
    educationalOutcome: "學生針對區域差異、分母、時間與可能的情境變項形成研究問題。",
    evidenceGenerated: "連結官方快照的縣市比較圖與探究提問。",
    usageModules: ["INQUIRY_CONTEXT", "QUESTION_GENERATION", "COMPETITION_EVIDENCE"],
    entityIds: ["res_dataset_41236", "inquiry_41236_county_comparison"]
  }
];

export function validateActivatedDatasetUsage(): string[] {
  return activatedOfficialDatasets.flatMap((dataset) => {
    const use = activatedDatasetProductUses.find((item) => item.datasetId === dataset.datasetId);
    if (!use) return [`ACTIVE_DATASET_WITHOUT_PRODUCT_USE:${dataset.datasetId}`];
    if (!use.usageModules.every((usage) => dataset.allowedUsageModules.includes(usage))) return [`PRODUCT_USE_OUTSIDE_ALLOWLIST:${dataset.datasetId}`];
    return [];
  });
}

export const shelterCountyComparison = shelterStatisticsFixture.rows.map((row) => ({
  county: String(row.county),
  intakeCount: Number(row.intakeCount),
  adoptedCount: Number(row.adoptedCount),
  adoptionRate: String(row.adoptionRate)
}));

export const educationPopulationComparison = studentPopulationFixture.rows.map((row) => ({
  county: String(row.county),
  juniorHighStudents: Number(row.juniorHighStudents),
  seniorStudents: Number(row.seniorGeneralStudents) + Number(row.seniorVocationalStudents)
}));

export const shelterInquiryPrompt = "資料顯示的是縣市單月彙總，而非個別犬隻。比較認養率時，還需要哪些跨月份、收容容量或地區條件，才能避免把相關誤當成因果？";
