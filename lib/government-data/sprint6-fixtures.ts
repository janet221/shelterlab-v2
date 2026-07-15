import type { DatasetAdapterFixture, GovernmentDatasetRecord } from "./evidence-types";

const verifiedAt = new Date("2026-07-11T06:00:00.000Z");
const checkedAt = new Date("2026-07-11T02:00:00.000Z");
const licenseNote = "政府資料開放授權條款第 1 版；使用時應標示資料來源。";
const licenseUrl = "https://data.gov.tw/license";

type OfficialRecordInput = Omit<GovernmentDatasetRecord, "verificationState" | "licenseNote" | "retrievalStatus" | "validationStatus" | "lastCheckedAt" | "lastSuccessfulSyncAt" | "verificationTimestamp" | "verifier" | "displayMode" | "assessmentUseAllowed" | "restrictions"> & {
  metadataModifiedAt: string;
  sourceContentHash: string;
  assessmentUseAllowed?: boolean;
  restrictions?: string[];
};

function officialRecord(input: OfficialRecordInput): GovernmentDatasetRecord {
  return {
    ...input,
    verificationState: "VERIFIED",
    licenseNote,
    retrievalStatus: input.active ? "SUCCESS" : "READY",
    validationStatus: "PASSED",
    lastCheckedAt: verifiedAt,
    lastSuccessfulSyncAt: input.active ? verifiedAt : undefined,
    verificationTimestamp: verifiedAt,
    verifier: "ShelterLab Sprint 6.1 verification process",
    displayMode: "VERIFIED_FIXTURE",
    assessmentUseAllowed: input.assessmentUseAllowed ?? false,
    restrictions: input.restrictions ?? []
  };
}

export const syntheticEducationDataset: GovernmentDatasetRecord = {
  datasetId: "SYNTHETIC_EDUOD_001",
  name: "ShelterLab Synthetic Education Participation Dataset",
  agency: "ShelterLab Synthetic Demo",
  sourceUrl: "internal://shelterlab/synthetic/education-participation-v1",
  verificationState: "SYNTHETIC_DEMO",
  licenseNote: "Synthetic fixture created for competition demonstration; not government data.",
  attribution: "ShelterLab SYNTHETIC_DEMO",
  updateFrequency: "Static deterministic fixture",
  schemaVersion: "synthetic-education-v1",
  retrievalStatus: "SUCCESS",
  validationStatus: "PASSED",
  active: true,
  adapterKey: "synthetic-demo",
  lastCheckedAt: checkedAt,
  lastSuccessfulSyncAt: checkedAt,
  displayMode: "SYNTHETIC",
  assessmentUseAllowed: true,
  allowedUsageModules: ["QUESTION_GENERATION", "REMEDIATION", "COMPETITION_EVIDENCE"],
  restrictions: ["Demo mode only", "Must never be presented as government data"]
};

export const dataset6318 = officialRecord({
  datasetId: "6318",
  name: "國家教育研究院愛學網",
  agency: "國家教育研究院",
  sourceUrl: "https://data.gov.tw/dataset/6318",
  officialResourceUrl: "https://opendata.naer.edu.tw/stvlist20251226.csv",
  resourceFormat: "CSV",
  encoding: "UTF-8",
  updateFrequency: "每年不定期",
  metadataModifiedAt: "2026-01-19 10:07:11",
  attribution: "資料來源：國家教育研究院愛學網（data.gov.tw 資料集 6318）",
  schemaVersion: "6318-csv-20251226-normalized-v1",
  active: true,
  adapterKey: "ilearn-metadata",
  sourceContentHash: "efd583cab84602b9298b0cf301242134a7db90f9fd73eac6107675a850d895e5",
  allowedUsageModules: ["CURRICULUM_DISCOVERY", "LEARNING_RESOURCE_MAPPING", "REMEDIATION", "COMPETITION_EVIDENCE"],
  restrictions: ["Metadata and official outbound links only", "No video download, embed, transcript, mirror, or redistribution", "Blank curriculum fields remain blank"]
});

export const dataset29027 = officialRecord({
  datasetId: "29027",
  name: "國家教育研究院全國中小學題庫網",
  agency: "國家教育研究院",
  sourceUrl: "https://data.gov.tw/dataset/29027",
  officialResourceUrl: "https://opendata.naer.edu.tw/%E5%85%A8%E5%9C%8B%E4%B8%AD%E5%B0%8F%E5%AD%B8%E9%A1%8C%E5%BA%AB%E7%B6%B2/examnaer20230412.csv",
  resourceFormat: "CSV",
  encoding: "UTF-8",
  updateFrequency: "停止更新（原網站已關閉）",
  metadataModifiedAt: "2025-06-11 15:45:05",
  attribution: "資料來源：國家教育研究院全國中小學題庫網歷史索引（data.gov.tw 資料集 29027）",
  schemaVersion: "29027-csv-20230412-normalized-v1",
  active: false,
  adapterKey: "question-bank-index",
  sourceContentHash: "8c3b69c00101244b95f71439dad08b7920feee09e736f724f0b9f60aa5ecd0b7",
  allowedUsageModules: [],
  restrictions: ["Historical index analytics only", "Contains no question text, answer keys, explanations, or exam-file URLs", "Cannot supply Research License questions"]
});

export const dataset41236 = officialRecord({
  datasetId: "41236",
  name: "全國公立動物收容所收容處理情形統計表",
  agency: "農業部",
  sourceUrl: "https://data.gov.tw/dataset/41236",
  officialResourceUrl: "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=DyplMIk3U1hf&IsTransData=1",
  resourceFormat: "JSON",
  encoding: "UTF-8",
  updateFrequency: "每月",
  metadataModifiedAt: "2026-06-05 16:21:52",
  attribution: "資料來源：農業部（data.gov.tw 資料集 41236）",
  schemaVersion: "41236-json-normalized-v1",
  active: true,
  adapterKey: "moa-shelter-statistics",
  sourceContentHash: "fbe498e0f22b49e875246081ca6556fdba392f59671011c9423d258f70dcabff",
  assessmentUseAllowed: true,
  allowedUsageModules: ["INQUIRY_CONTEXT", "QUESTION_GENERATION", "COMPETITION_EVIDENCE"],
  restrictions: ["Aggregate county-month statistics only", "No individual-dog inference", "Rates require denominator and time-context explanation"]
});

export const dataset40121 = officialRecord({
  datasetId: "40121",
  name: "各級學校縣市別學生人數",
  agency: "教育部統計處",
  sourceUrl: "https://data.gov.tw/dataset/40121",
  officialResourceUrl: "https://stats.moe.gov.tw/files/opendata/edu_B_1_4.json",
  resourceFormat: "JSON",
  encoding: "UTF-8",
  updateFrequency: "每學年",
  metadataModifiedAt: "2026-07-01 10:37:01",
  attribution: "資料來源：教育部統計處（data.gov.tw 資料集 40121）",
  schemaVersion: "40121-json-normalized-v1",
  active: true,
  adapterKey: "moe-student-population",
  sourceContentHash: "53b912357cdf899102ea35029d73091390a2de28ce3c96a6664f8252055fb0fe",
  assessmentUseAllowed: true,
  allowedUsageModules: ["COMPETENCY_CONTEXT", "QUESTION_GENERATION", "COMPETITION_EVIDENCE"],
  restrictions: ["Aggregate county-level student counts only", "No school or student inference"]
});

export const dataset15391 = officialRecord({
  datasetId: "15391", name: "國中教育會考各科試題通過率", agency: "教育部國民及學前教育署", sourceUrl: "https://data.gov.tw/dataset/15391",
  officialResourceUrl: "https://www.k12ea.gov.tw/files/common_unit/e7ec3b11-6c2e-40d1-87ae-36503a4180a1/doc/114%E5%B9%B4%E5%9C%8B%E4%B8%AD%E6%95%99%E8%82%B2%E6%9C%83%E8%80%83%E5%90%84%E7%A7%91%E8%A9%A6%E9%A1%8C%E9%80%9A%E9%81%8E%E7%8E%87.csv",
  resourceFormat: "CSV", encoding: "UTF-8", updateFrequency: "每年", metadataModifiedAt: "2025-12-16 11:30:19", attribution: "資料來源：教育部國民及學前教育署（data.gov.tw 資料集 15391）", schemaVersion: "15391-114-csv-v1", active: false, adapterKey: "data-gov-tw", sourceContentHash: "58f74e3a371954147770451891a7f406da85940be2b508cc12ea713cddb0ab99", allowedUsageModules: [], restrictions: ["Pass-rate statistics only; no question text", "Not activated in Sprint 6.1"]
});

export const dataset6089 = officialRecord({
  datasetId: "6089", name: "一般高級中等學校名錄", agency: "教育部統計處", sourceUrl: "https://data.gov.tw/dataset/6089", officialResourceUrl: "https://stats.moe.gov.tw/files/school/114/high.json", resourceFormat: "JSON", encoding: "UTF-8", updateFrequency: "每學年", metadataModifiedAt: "2025-08-01 16:29:44", attribution: "資料來源：教育部統計處（data.gov.tw 資料集 6089）", schemaVersion: "6089-114-json-v1", active: false, adapterKey: "data-gov-tw", sourceContentHash: "e03a9d353034cca36f2c25aae6251926bab9e8764d48f1a4c11cd428e2304d69", allowedUsageModules: [], restrictions: ["Directory metadata contains addresses and phone numbers not needed by the current demo", "Not activated in Sprint 6.1"]
});

export const syntheticEducationFixture: DatasetAdapterFixture = {
  dataset: syntheticEducationDataset,
  rows: [
    { demoRegion: "Demo Region A", moduleCode: "URBAN_ECOLOGY", participants: 24, completed: 20 },
    { demoRegion: "Demo Region B", moduleCode: "URBAN_ECOLOGY", participants: 18, completed: 12 },
    { demoRegion: "Demo Region C", moduleCode: "URBAN_ECOLOGY", participants: 30, completed: 27 }
  ],
  provenance: { mode: "LOCAL_FIXTURE", fixtureId: "synthetic-education-v1", externalNetworkCalled: false, copyrightContentIncluded: false }
};

function provenance(dataset: GovernmentDatasetRecord, fixtureId: string): DatasetAdapterFixture["provenance"] {
  return { mode: "VERIFIED_FIXTURE", fixtureId, externalNetworkCalled: false, copyrightContentIncluded: false, officialMetadataUrl: dataset.sourceUrl, officialResourceUrl: dataset.officialResourceUrl, officialRetrievedAt: verifiedAt.toISOString(), sourceContentHash: dataset.sourceContentHash, resourceFormat: dataset.resourceFormat, encoding: dataset.encoding, attribution: dataset.attribution, licenseUrl };
}

export const iLearnMetadataFixture: DatasetAdapterFixture = {
  dataset: dataset6318,
  rows: [
    { recordId: "224", title: "生物多樣性", resourceType: "video", productionYear: "2006", learningArea: "", learningStage: "", learningContent: "", learningPerformance: "", issue: "", coreCompetency: "", resourceLicense: "cc4_BY_NC_ND", outboundUrl: "https://stv.naer.edu.tw/watch/1735" },
    { recordId: "308", title: "由鎘米事件看臺灣的環境問題(上)：平原區的環境問題", resourceType: "video", productionYear: "2007", learningArea: "", learningStage: "", learningContent: "", learningPerformance: "", issue: "", coreCompetency: "", resourceLicense: "cc4_BY_NC_ND", outboundUrl: "https://stv.naer.edu.tw/watch/2571" }
  ],
  provenance: provenance(dataset6318, "6318-verified-metadata-20260711")
};

export const studentPopulationFixture: DatasetAdapterFixture = {
  dataset: dataset40121,
  rows: [
    { schoolYear: 114, county: "新北市", elementaryStudents: 194670, juniorHighStudents: 96668, seniorGeneralStudents: 36359, seniorVocationalStudents: 23972 },
    { schoolYear: 114, county: "臺北市", elementaryStudents: 117650, juniorHighStudents: 68231, seniorGeneralStudents: 53020, seniorVocationalStudents: 21069 },
    { schoolYear: 114, county: "臺中市", elementaryStudents: 161332, juniorHighStudents: 82767, seniorGeneralStudents: 36484, seniorVocationalStudents: 29330 },
    { schoolYear: 114, county: "高雄市", elementaryStudents: 127327, juniorHighStudents: 65631, seniorGeneralStudents: 30498, seniorVocationalStudents: 25072 }
  ],
  provenance: provenance(dataset40121, "40121-verified-fixture-20260711")
};

export const shelterStatisticsFixture: DatasetAdapterFixture = {
  dataset: dataset41236,
  rows: [
    { recordId: 1150515, rocYear: 115, countyCode: "City000015", county: "高雄市", month: 5, intakeCount: 142, adoptedCount: 93, adoptionRate: "65%", euthanasiaCount: 1, deathCount: 13 },
    { recordId: 1150509, rocYear: 115, countyCode: "City000009", county: "臺中市", month: 5, intakeCount: 243, adoptedCount: 101, adoptionRate: "42%", euthanasiaCount: 13, deathCount: 15 },
    { recordId: 1150502, rocYear: 115, countyCode: "City000002", county: "臺北市", month: 5, intakeCount: 204, adoptedCount: 188, adoptionRate: "92%", euthanasiaCount: 2, deathCount: 22 },
    { recordId: 1150503, rocYear: 115, countyCode: "City000003", county: "新北市", month: 5, intakeCount: 333, adoptedCount: 319, adoptionRate: "96%", euthanasiaCount: 0, deathCount: 9 }
  ],
  provenance: provenance(dataset41236, "41236-verified-fixture-20260711")
};

export const questionBankIndexFixture: DatasetAdapterFixture = {
  dataset: dataset29027,
  rows: [
    { recordId: 1, rocYear: 106, semester: "上學期", county: "新北市", school: "市立八里國中", grade: "七年級", subject: "公民", examType: "第一次段考(期中考)", viewCount: 0 },
    { recordId: 2, rocYear: 106, semester: "上學期", county: "新北市", school: "市立八里國中", grade: "九年級", subject: "英文", examType: "第一次段考(期中考)", viewCount: 0 }
  ],
  provenance: provenance(dataset29027, "29027-verified-index-20260711")
};

export const configuredGovernmentDatasets = [dataset15391, dataset6089, dataset29027, dataset6318, dataset40121, dataset41236];
export const sprint6DatasetRegistry = [syntheticEducationDataset, ...configuredGovernmentDatasets];
export const activatedOfficialDatasets = configuredGovernmentDatasets.filter((dataset) => dataset.active);
export const verifiedDatasetFixtures = new Map<string, DatasetAdapterFixture>([["6318", iLearnMetadataFixture], ["40121", studentPopulationFixture], ["41236", shelterStatisticsFixture], ["29027", questionBankIndexFixture]]);
