import { TAIWAN_COUNTIES, type TaiwanCounty } from "@/lib/action-opportunities/types";
import type { AnimalCase, DataLensMetadata } from "./data-types";
import { analyzeCoa, chooseContrasts, countyOf, loadCoa } from "./coa";

export type LessonChartPoint = { label: string; count: number; percentage: number };
export type ShelterCount = { shelter: string; count: number; share: number };
export type LocalLessonPlan = {
  available: true;
  county: TaiwanCounty;
  generatedFromChecksum: string;
  localOpenCount: number;
  nationalOpenCount: number;
  localShare: number;
  validDateCount: number;
  medianDays: number | null;
  selectedCases: AnimalCase[];
  selectionBasis: string;
  shelterCounts: ShelterCount[];
  bodyDistribution: LessonChartPoint[];
  entryTrend: LessonChartPoint[];
  inquiryQuestions: Array<{ fact: string; prompt: string }>;
  lenses: {
    overview: DataLensMetadata;
    shelters: DataLensMetadata;
    body: DataLensMetadata;
    trend: DataLensMetadata;
    cases: DataLensMetadata;
  };
};
export type EmptyLocalLessonPlan = { available: false; county: TaiwanCounty; message: string };

const lessonCache = new Map<string, Promise<LocalLessonPlan | EmptyLocalLessonPlan>>();
const percent = (part: number, total: number) => total ? Math.round(part / total * 1000) / 10 : 0;
const missing = (value: string) => !value || value === "N" || value === "未提供";

function distribution(values: string[], total: number): LessonChartPoint[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = missing(raw) ? "未提供" : raw;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts].map(([label, count]) => ({ label, count, percentage: percent(count, total) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hant"));
}

function deterministicLessonCases(animals: AnimalCase[], shelters: ShelterCount[]) {
  const byShelter = new Map<string, AnimalCase[]>();
  for (const animal of animals) byShelter.set(animal.shelter, [...(byShelter.get(animal.shelter) || []), animal]);
  const smallest = [...shelters].sort((a, b) => a.count - b.count || a.shelter.localeCompare(b.shelter, "zh-Hant"))[0];
  const targetShelters = [...new Set([...shelters.slice(0, 2).map(item => item.shelter), smallest?.shelter].filter(Boolean))];
  const selected = new Map<string, AnimalCase>();
  for (const shelter of targetShelters) {
    const candidate = [...(byShelter.get(shelter) || [])].sort((a, b) =>
      (b.days ?? -1) - (a.days ?? -1) || a.id.localeCompare(b.id)
    )[0];
    if (candidate) selected.set(candidate.id, candidate);
  }
  for (const candidate of chooseContrasts(animals)) {
    if (selected.size >= 4) break;
    selected.set(candidate.id, candidate);
  }
  if (selected.size < 2) {
    for (const candidate of [...animals].sort((a, b) => a.id.localeCompare(b.id))) {
      if (selected.size >= 2) break;
      selected.set(candidate.id, candidate);
    }
  }
  return [...selected.values()].slice(0, 4);
}

function lens(base: DataLensMetadata, input: Partial<DataLensMetadata>): DataLensMetadata {
  return { ...base, ...input, missingValues: input.missingValues || base.missingValues, formulas: input.formulas || base.formulas };
}

export function buildLocalLessonPlan(rows: Record<string, string>[], checksum: string, county: TaiwanCounty): LocalLessonPlan | EmptyLocalLessonPlan {
  const local = analyzeCoa(rows, county, checksum);
  if (local.animals.length < 2) return { available: false, county, message: "該區間無可用資料，請重新設定條件" };

  const nationalIds = new Set(rows.filter(row => row.animal_status === "OPEN" && row.animal_id && countyOf(row) !== "未知縣市").map(row => row.animal_id));
  const nationalOpenCount = nationalIds.size;
  if (!nationalOpenCount) return { available: false, county, message: "該區間無可用資料，請重新設定條件" };

  const shelterMap = new Map<string, number>();
  for (const animal of local.animals) shelterMap.set(animal.shelter, (shelterMap.get(animal.shelter) || 0) + 1);
  const shelterCounts = [...shelterMap].map(([shelter, count]) => ({ shelter, count, share: percent(count, local.count) }))
    .sort((a, b) => b.count - a.count || a.shelter.localeCompare(b.shelter, "zh-Hant"));
  const bodyDistribution = distribution(local.animals.map(animal => animal.body), local.count);
  const monthCounts = new Map<string, number>();
  for (const animal of local.animals) if (animal.createdDate) {
    const month = animal.createdDate.slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  }
  const allMonths = [...monthCounts].sort(([a], [b]) => a.localeCompare(b));
  const entryTrend = allMonths.slice(-12).map(([label, count]) => ({ label, count, percentage: percent(count, local.validDays) }));
  const selectedCases = deterministicLessonCases(local.animals, shelterCounts);
  const top = shelterCounts[0];
  const bottom = [...shelterCounts].sort((a, b) => a.count - b.count || a.shelter.localeCompare(b.shelter, "zh-Hant"))[0];
  const localShare = percent(local.count, nationalOpenCount);
  const selectionBasis = shelterCounts.length > 1
    ? `先依 OPEN 快照紀錄數選取前二個收容所，再加入紀錄數最少的收容所形成最大量差對照；同一收容所內依有效代理天數由高至低、識別碼由小至大選案。`
    : `此縣市只有一個有 OPEN 紀錄的收容所，改以代理天數差與識別碼排序選取個案。`;
  const missingBody = local.animals.filter(animal => missing(animal.body)).length;
  const missingCreated = local.animals.filter(animal => !animal.createdDate).length;
  const base = local.metadata;

  return {
    available: true,
    county,
    generatedFromChecksum: checksum,
    localOpenCount: local.count,
    nationalOpenCount,
    localShare,
    validDateCount: local.validDays,
    medianDays: local.medianDays,
    selectedCases,
    selectionBasis,
    shelterCounts,
    bodyDistribution,
    entryTrend,
    inquiryQuestions: [
      { fact: `${county}有 ${local.count} 筆符合條件的 OPEN 快照紀錄，占全國 ${nationalOpenCount} 筆的 ${localShare}%。`, prompt: "這個比例描述的是快照紀錄，為什麼不能直接稱為收容量或認養率？" },
      { fact: top && bottom ? `${top.shelter}有 ${top.count} 筆，${bottom.shelter}有 ${bottom.count} 筆，差距為 ${top.count - bottom.count} 筆。` : `${county}目前只有一個有 OPEN 紀錄的收容所。`, prompt: "造成收容所紀錄數差異的可能原因有哪些？還需要哪些資料才能查證？" },
      { fact: `${local.validDays} 筆具有可解析的資料建立日期，${missingCreated} 筆日期缺漏或無效。`, prompt: "若把資料建立日當作入所日代理值，會產生哪些偏差？" },
    ],
    lenses: {
      overview: lens(base, { scope: `${county} OPEN 快照紀錄與全國 OPEN 快照紀錄的比較`, rowCount: local.count, formulas: [`縣市 OPEN 快照占比 ＝ ${county}未重複 OPEN 識別碼數 ÷ 全國已知縣市未重複 OPEN 識別碼數 × 100%`, ...base.formulas] }),
      shelters: lens(base, { scope: `${county}各收容所 OPEN 快照紀錄分布`, rowCount: local.count, formulas: ["各收容所紀錄數 ＝ 依 shelter_name 分組後計算未重複 OPEN 動物識別碼", "收容所占比 ＝ 該收容所 OPEN 快照紀錄數 ÷ 縣市 OPEN 快照紀錄數 × 100%"], missingValues: { shelter_name: local.animals.filter(animal => missing(animal.shelter)).length } }),
      body: lens(base, { scope: `${county} OPEN 快照紀錄的體型分布`, rowCount: local.count, formulas: ["體型筆數 ＝ 依 animal_bodytype 分組計數", "體型占比 ＝ 該體型筆數 ÷ 縣市 OPEN 快照紀錄數 × 100%"], missingValues: { animal_bodytype: missingBody } }),
      trend: lens(base, { scope: `${county}最近最多十二個有紀錄月份的資料建立日趨勢`, rowCount: local.validDays, formulas: ["月份紀錄數 ＝ 將可解析的 animal_createtime 轉為 YYYY-MM 後分組計數", "月份占比 ＝ 該月份紀錄數 ÷ 縣市所有有效資料建立日期筆數 × 100%", "只顯示資料中時間最新的最多十二個月份；這是資料建立趨勢，不是真實入所趨勢"], missingValues: { animal_createtime: missingCreated } }),
      cases: lens(base, { scope: `${county}確定性挑選的 ${selectedCases.length} 個真實對照個案`, rowCount: selectedCases.length, formulas: [selectionBasis], missingValues: { animal_createtime: selectedCases.filter(item => !item.createdDate).length, animal_bodytype: selectedCases.filter(item => missing(item.body)).length } }),
    },
  };
}

export async function generateLocalLessonPlan(county: string) {
  if (!TAIWAN_COUNTIES.includes(county as TaiwanCounty)) throw new Error("Unsupported county");
  const source = await loadCoa();
  const cacheKey = `${source.checksum}:${county}`;
  let pending = lessonCache.get(cacheKey);
  if (!pending) {
    pending = Promise.resolve(buildLocalLessonPlan(source.rows, source.checksum, county as TaiwanCounty));
    lessonCache.set(cacheKey, pending);
  }
  return pending;
}

export const lessonGeneratorCounties = TAIWAN_COUNTIES;
