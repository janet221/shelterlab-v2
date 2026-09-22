import { z } from "zod";
import { FALLBACK_ACTION_ORGANIZATIONS, mergeVerifiedActionResources, PUBLIC_SHELTER_API_URL, PUBLIC_SHELTER_DATASET_URL } from "@/data/action-organizations";
import { OPEN_DATASET_BY_ID } from "@/data/open-data-registry";
import { WEEK_SIX_FALLBACK } from "@/data/week-six-open-data-fallback";
import { WEEK_SIX_SCHOOL_SNAPSHOT, WEEK_SIX_SCHOOL_SNAPSHOT_DATE } from "@/data/week-six-school-snapshot";
import { WEEK_SIX_SHELTER_NEEDS_SNAPSHOT, WEEK_SIX_SHELTER_NEEDS_SNAPSHOT_DATE } from "@/data/week-six-shelter-needs-snapshot";
import { TAIWAN_COUNTIES, type ActionOrganization } from "@/lib/action-opportunities/types";
import { dedupeActionOrganizations, normalizeCountyName } from "@/lib/action-opportunities/repository";
import type { SchoolLevel } from "@/lib/action-opportunities/types";

export const ADOPTION_DATASET_URL = "https://data.moa.gov.tw/open_detail.aspx?id=QcbUEzN6E6DL";
export const ADOPTION_API_URL = "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=QcbUEzN6E6DL";
export const SHELTER_STATS_DATASET_URL = "https://data.gov.tw/dataset/41236";
export const SHELTER_STATS_API_URL = "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=DyplMIk3U1hf";
export const SHELTER_NEEDS_DATASET_URL = "https://data.nat.gov.tw/dataset/73396";
export const SHELTER_NEEDS_API_URL = "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=p9yPwrCs2OtC";
export const SCHOOL_DIRECTORY_DATASET_URL = "https://data.gov.tw/dataset/6089";
export const SCHOOL_DIRECTORY_API_URL = "https://stats.moe.gov.tw/files/school/115/high.json";

const external = z.union([z.string(), z.number(), z.null()]).optional();
export const adoptionRowSchema = z.object({
  animal_id: external, animal_subid: external, animal_area_pkid: external, animal_shelter_pkid: external,
  animal_kind: external, animal_sex: external, animal_bodytype: external, animal_colour: external,
  animal_age: external, animal_status: external, animal_opendate: external, animal_closeddate: external,
  animal_update: external, animal_createtime: external, shelter_name: external, shelter_address: external,
  shelter_tel: external, album_file: external, cDate: external
}).passthrough();
export const shelterStatsRowSchema = z.object({
  rpt_year: external, rpt_country_code: external, rpt_county: external, rpt_month: external,
  accept_count: external, adopt_count: external, adopt_rate: external, adopt_total: external,
  end_count: external, end_rate: external, dead_count: external, dead_rate: external
}).passthrough();
export const publicShelterRowSchema = z.object({
  ID: external, ShelterName: external, CityName: external, Address: external, Phone: external,
  OpenTime: external, Url: external, Longitude: external, Latitude: external, Lon: external, Lat: external
}).passthrough();
export const shelterNeedsRowSchema = z.object({
  rpt_year: external, rpt_county: external, rpt_month: external,
  max_stay_dog_count: external, max_stay_cat_count: external,
  fe_gg_count: external, fe_ms_count: external, fe_sum_count: external,
  in_gg_count: external, in_ms_count: external, in_lv_count: external, in_re_count: external,
  in_lw_count: external, in_els_count: external, in_tot_count: external,
  out_tback_count: external, out_ad_ca_count: external, out_ad_cv_count: external, out_tot_count: external,
}).passthrough();
export const schoolDirectoryRowSchema = z.object({
  學年度: external, 代碼: external, 學校名稱: external, 縣市名稱: external,
  地址: external, 電話: external, 網址: external,
}).passthrough();

const text = (value: unknown) => String(value ?? "").replace(/<br\s*\/?>/gi, "；").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
export const safeNumber = (value: unknown): number | null => {
  const parsed = Number(text(value).replace(/[% ,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

export type AdoptionDog = { animalId: number | null; subId: string; county: string; shelterName: string; sex: string; bodyType: string; colour: string; age: string; openDate: string; updatedAt: string; imageUrl: string };
export type CountyShelterStat = { county: string; year: number; month: number; acceptedCount: number | null; adoptedCount: number | null; adoptionRate: number | null; adoptionTotal: number | null; euthanizedCount: number | null; euthanasiaRate: number | null; diedCount: number | null; deathRate: number | null };
export type CountyShelterNeed = { county:string; year:number; month:number; maxCapacity:number|null; currentShelter:number|null; currentFoster:number|null; currentTotal:number|null; governmentCapture:number|null; foundDelivered:number|null; ownerSurrender:number|null; rescue:number|null; legalSeizure:number|null; otherIntake:number|null; totalIntake:number|null; returned:number|null; publicAdoption:number|null; groupAdoption:number|null; totalOutcome:number|null };
export type SchoolDirectoryEntry = { id:string; name:string; county:string; district?:string; level?:SchoolLevel; publicPrivate?:"public"|"private"; address:string; phone:string; website:string; schoolYear:string; sourceUrl?:string };
export type OpenDataSourceState = { mode: "live" | "fallback"; updatedAt: string; fallbackDate?: string; datasetUrl: string; apiUrl: string; message: string };
export type AdoptionSnapshot = { source: OpenDataSourceState; countyCounts: Record<string, number>; shelterCounts: Record<string, number>; sampleDogs: AdoptionDog[]; organizations: ActionOrganization[] };
export type ShelterStatsSnapshot = { source: OpenDataSourceState; latestByCounty: CountyShelterStat[] };
export type ShelterNeedsSnapshot = { source: OpenDataSourceState; latestByCounty: CountyShelterNeed[] };
export type SchoolDirectorySnapshot = { source: OpenDataSourceState; schools: SchoolDirectoryEntry[] };

function parseArray(schema: z.ZodTypeAny, input: unknown) {
  const parsed = z.array(schema).safeParse(input);
  if (!parsed.success) throw new Error("政府資料格式驗證失敗");
  return parsed.data as Record<string, unknown>[];
}

export function normalizePublicShelters(input: unknown, verifiedAt: string): ActionOrganization[] {
  return dedupeActionOrganizations(parseArray(publicShelterRowSchema, input).flatMap((row) => {
    const latitude = safeNumber(row.Latitude ?? row.Lat);
    const longitude = safeNumber(row.Longitude ?? row.Lon);
    const id = text(row.ID), name = text(row.ShelterName), county = normalizeCountyName(text(row.CityName));
    const address = text(row.Address), phone = text(row.Phone);
    if (!id || !name || !county || !address || !phone || latitude === null || longitude === null) return [];
    return [{ id, name, county, latitude, longitude, address, phone, openingHours: text(row.OpenTime) || undefined,
      officialUrl: text(row.Url) || `https://animal.moa.gov.tw/Frontend/PublicShelter/Detail/${id}`,
      organizationType: (/教育園區|教育中心|關愛園區/.test(name) ? "education_park" : /動物之家/.test(name) ? "animal_home" : "public_shelter") as ActionOrganization["organizationType"],
      managementMode: "platform_curated" as const,
      verificationLevel: "government_official" as const,
      sourceLayer: "government_open_data" as const,
      officialSource: "農業部動物保護資訊網公立收容所資料", sourceUrl: text(row.Url) || `https://animal.moa.gov.tw/Frontend/PublicShelter/Detail/${id}`,
      actionTags: ["visit", "adoption_promotion"] as ActionOrganization["actionTags"],
      studentNotes: ["公開資料可確認據點與認領養服務；學生參與方式仍要向單位確認。"], requiresAdult: true,
      ageLimitNote: "官方公立收容資料未列學生參與年齡；請由教師或家長協助確認。", hasOfficialVolunteerInfo: false,
      evidenceLinks: [{ label: "農業部公立收容所資料", url: text(row.Url) || `https://animal.moa.gov.tw/Frontend/PublicShelter/Detail/${id}` }],
      minorPolicy: "contact_to_confirm" as const,
      participationModes: [], actionTypes: ["詢問認養資訊協助", "詢問學生參與或合作方式"],
      commitmentTypes: [], officialServices: ["公立收容與認領養服務"], volunteerInformation: "not_published" as const, verificationStatus: "official" as const,
      verifiedAt, dataSource: PUBLIC_SHELTER_DATASET_URL, openDogCount: null }];
  }));
}

function countyFrom(row: Record<string, unknown>, countiesByShelter: Map<string, string>) {
  const known = countiesByShelter.get(text(row.shelter_name));
  if (known) return known;
  const address = normalizeCountyName(text(row.shelter_address));
  return address.match(/^(基隆市|臺北市|新北市|桃園市|新竹市|新竹縣|苗栗縣|臺中市|彰化縣|南投縣|雲林縣|嘉義市|嘉義縣|臺南市|高雄市|屏東縣|宜蘭縣|花蓮縣|臺東縣|澎湖縣|金門縣|連江縣)/)?.[1] ?? "未分類";
}

export function normalizeAdoptions(input: unknown, organizations: ActionOrganization[]) {
  const rows = parseArray(adoptionRowSchema, input).filter((row) => text(row.animal_kind) === "狗" && text(row.animal_status).toUpperCase() === "OPEN");
  const countiesByShelter = new Map(organizations.map((item) => [item.name, item.county]));
  const countyCounts: Record<string, number> = {}, shelterCounts: Record<string, number> = {};
  const sampleDogs: AdoptionDog[] = [], samplesPerCounty: Record<string, number> = {};
  let updatedAt = "";
  for (const row of rows) {
    const county = countyFrom(row, countiesByShelter), shelterName = text(row.shelter_name);
    countyCounts[county] = (countyCounts[county] ?? 0) + 1;
    shelterCounts[shelterName] = (shelterCounts[shelterName] ?? 0) + 1;
    const rowUpdated = text(row.cDate || row.animal_update);
    if (rowUpdated > updatedAt) updatedAt = rowUpdated;
    if ((samplesPerCounty[county] ?? 0) < 3 && text(row.animal_subid)) {
      sampleDogs.push({ animalId: safeNumber(row.animal_id), subId: text(row.animal_subid), county, shelterName,
        sex: text(row.animal_sex), bodyType: text(row.animal_bodytype), colour: text(row.animal_colour), age: text(row.animal_age),
        openDate: text(row.animal_opendate), updatedAt: rowUpdated, imageUrl: text(row.album_file) });
      samplesPerCounty[county] = (samplesPerCounty[county] ?? 0) + 1;
    }
  }
  return { countyCounts, shelterCounts, sampleDogs, updatedAt };
}

export function latestShelterStats(input: unknown): CountyShelterStat[] {
  const latest = new Map<string, CountyShelterStat>();
  const currentCounties = new Set<string>(TAIWAN_COUNTIES);
  for (const row of parseArray(shelterStatsRowSchema, input)) {
    const county = normalizeCountyName(text(row.rpt_county)), year = safeNumber(row.rpt_year), month = safeNumber(row.rpt_month);
    if (!currentCounties.has(county) || year === null || month === null) continue;
    const current = latest.get(county);
    if (current && current.year * 100 + current.month >= year * 100 + month) continue;
    latest.set(county, { county, year, month, acceptedCount: safeNumber(row.accept_count), adoptedCount: safeNumber(row.adopt_count),
      adoptionRate: safeNumber(row.adopt_rate), adoptionTotal: safeNumber(row.adopt_total), euthanizedCount: safeNumber(row.end_count),
      euthanasiaRate: safeNumber(row.end_rate), diedCount: safeNumber(row.dead_count), deathRate: safeNumber(row.dead_rate) });
  }
  return [...latest.values()].sort((a, b) => a.county.localeCompare(b.county, "zh-Hant"));
}

export function latestShelterNeeds(input: unknown): CountyShelterNeed[] {
  const latest = new Map<string, CountyShelterNeed>();
  const currentCounties = new Set<string>(TAIWAN_COUNTIES);
  for (const row of parseArray(shelterNeedsRowSchema, input)) {
    const county = normalizeCountyName(text(row.rpt_county));
    const year = safeNumber(row.rpt_year), month = safeNumber(row.rpt_month);
    if (!currentCounties.has(county) || year === null || month === null) continue;
    const current = latest.get(county);
    if (current && current.year * 100 + current.month >= year * 100 + month) continue;
    const dogCapacity = safeNumber(row.max_stay_dog_count), catCapacity = safeNumber(row.max_stay_cat_count);
    latest.set(county, {
      county, year, month,
      maxCapacity: dogCapacity === null && catCapacity === null ? null : (dogCapacity ?? 0) + (catCapacity ?? 0),
      currentShelter: safeNumber(row.fe_gg_count), currentFoster: safeNumber(row.fe_ms_count), currentTotal: safeNumber(row.fe_sum_count),
      governmentCapture: safeNumber(row.in_gg_count), foundDelivered: safeNumber(row.in_ms_count), ownerSurrender: safeNumber(row.in_lv_count),
      rescue: safeNumber(row.in_re_count), legalSeizure: safeNumber(row.in_lw_count), otherIntake: safeNumber(row.in_els_count), totalIntake: safeNumber(row.in_tot_count),
      returned: safeNumber(row.out_tback_count), publicAdoption: safeNumber(row.out_ad_ca_count), groupAdoption: safeNumber(row.out_ad_cv_count), totalOutcome: safeNumber(row.out_tot_count),
    });
  }
  return [...latest.values()].sort((a, b) => a.county.localeCompare(b.county, "zh-Hant"));
}

export function normalizeSchoolDirectory(input: unknown): SchoolDirectoryEntry[] {
  return parseArray(schoolDirectoryRowSchema, input).flatMap((row) => {
    const id = text(row.代碼), name = text(row.學校名稱);
    const county = normalizeCountyName(text(row.縣市名稱).replace(/^\[[^\]]+\]/, ""));
    if (!id || !name || !TAIWAN_COUNTIES.includes(county as (typeof TAIWAN_COUNTIES)[number])) return [];
    const address=text(row.地址).replace(/^\[[^\]]+\]/, "");
    const level:SchoolLevel=/國民中學|國中/.test(name)?"junior_high":/高工|高商|工商|農工|家商|海事|高職/.test(name)?"vocational_high":/綜合高中/.test(name)?"comprehensive":"senior_high";
    return [{ id, name, county, level, publicPrivate:(/私立/.test(name)?"private":"public") as "private"|"public", address, phone: text(row.電話), website: text(row.網址), schoolYear: text(row.學年度), sourceUrl:SCHOOL_DIRECTORY_DATASET_URL }];
  }).sort((a, b) => a.county === b.county ? a.name.localeCompare(b.name, "zh-Hant") : a.county.localeCompare(b.county, "zh-Hant"));
}

async function fetchOfficial(url: string) {
  // The adoption feed can exceed Next's 2 MB fetch-cache item limit. Keep the
  // last successful normalized payload in this server module and cache the API
  // response at the route/CDN layer instead of attempting to persist the raw feed.
  const response = await fetch(url, { signal: AbortSignal.timeout(12_000), cache: "no-store" });
  if (!response.ok) throw new Error(`政府 API 回應 ${response.status}`);
  return response.json() as Promise<unknown>;
}

let cachedAdoptions: AdoptionSnapshot | null = null;
let cachedStats: ShelterStatsSnapshot | null = null;
let cachedNeeds: ShelterNeedsSnapshot | null = null;
let cachedSchools: SchoolDirectorySnapshot | null = null;

export async function getAdoptionSnapshot(): Promise<AdoptionSnapshot> {
  try {
    const [adoptionRows, shelterRows] = await Promise.all([fetchOfficial(ADOPTION_API_URL), fetchOfficial(PUBLIC_SHELTER_API_URL)]);
    const organizations = mergeVerifiedActionResources(normalizePublicShelters(shelterRows, new Date().toISOString().slice(0, 10)));
    const normalized = normalizeAdoptions(adoptionRows, organizations);
    const counts = normalized.shelterCounts;
    const payload: AdoptionSnapshot = { source: { mode: "live", updatedAt: normalized.updatedAt, datasetUrl: ADOPTION_DATASET_URL, apiUrl: ADOPTION_API_URL, message: "使用農業部即時開放資料" },
      countyCounts: normalized.countyCounts, shelterCounts: counts, sampleDogs: normalized.sampleDogs,
      organizations: organizations.map((item) => ({ ...item, openDogCount: counts[item.name] ?? 0 })) };
    cachedAdoptions = payload;
    return payload;
  } catch {
    if (cachedAdoptions) return { ...cachedAdoptions, source: { ...cachedAdoptions.source, mode: "fallback", fallbackDate: cachedAdoptions.source.updatedAt, message: "政府 API 暫時無法使用，目前使用最近一次成功快取" } };
    return { source: { mode: "fallback", updatedAt: WEEK_SIX_FALLBACK.snapshotDate, fallbackDate: WEEK_SIX_FALLBACK.snapshotDate, datasetUrl: ADOPTION_DATASET_URL, apiUrl: ADOPTION_API_URL, message: "目前使用備援資料" },
      countyCounts: { ...WEEK_SIX_FALLBACK.countyCounts }, shelterCounts: { ...WEEK_SIX_FALLBACK.shelterCounts },
      sampleDogs: WEEK_SIX_FALLBACK.sampleDogs.map((dog) => ({ ...dog })), organizations: FALLBACK_ACTION_ORGANIZATIONS };
  }
}

export async function getShelterStatsSnapshot(): Promise<ShelterStatsSnapshot> {
  try {
    const rows = await fetchOfficial(SHELTER_STATS_API_URL);
    const latestByCounty = latestShelterStats(rows);
    const latest = latestByCounty.reduce((value, item) => Math.max(value, item.year * 100 + item.month), 0);
    const updatedAt = latest ? `${Math.floor(latest / 100)} 年 ${latest % 100} 月` : "官方未提供";
    const payload: ShelterStatsSnapshot = { source: { mode: "live", updatedAt, datasetUrl: SHELTER_STATS_DATASET_URL, apiUrl: SHELTER_STATS_API_URL, message: "使用農業部最新可用期間資料" }, latestByCounty };
    cachedStats = payload;
    return payload;
  } catch {
    if (cachedStats) return { ...cachedStats, source: { ...cachedStats.source, mode: "fallback", fallbackDate: cachedStats.source.updatedAt, message: "政府 API 暫時無法使用，目前使用最近一次成功快取" } };
    return { source: { mode: "fallback", updatedAt: WEEK_SIX_FALLBACK.snapshotDate, fallbackDate: WEEK_SIX_FALLBACK.snapshotDate, datasetUrl: SHELTER_STATS_DATASET_URL, apiUrl: SHELTER_STATS_API_URL, message: "目前使用備援資料" }, latestByCounty: WEEK_SIX_FALLBACK.latestStats.map((item) => ({ county: item.county, year: item.year, month: item.month, acceptedCount: item.acceptedCount, adoptedCount: item.adoptedCount, adoptionRate: item.adoptionRate, adoptionTotal: item.adoptionTotal, euthanizedCount: item.euthanizedCount, euthanasiaRate: item.euthanasiaRate, diedCount: item.diedCount, deathRate: item.deathRate })) };
  }
}

export async function getShelterNeedsSnapshot(): Promise<ShelterNeedsSnapshot> {
  try {
    const rows = await fetchOfficial(SHELTER_NEEDS_API_URL);
    const latestByCounty = latestShelterNeeds(rows);
    if (!latestByCounty.length) throw new Error("政府資料沒有可用縣市列");
    const latest = latestByCounty.reduce((value, item) => Math.max(value, item.year * 100 + item.month), 0);
    const updatedAt = `${Math.floor(latest / 100)} 年 ${latest % 100} 月`;
    const payload: ShelterNeedsSnapshot = { source: { mode:"live", updatedAt, datasetUrl:SHELTER_NEEDS_DATASET_URL, apiUrl:SHELTER_NEEDS_API_URL, message:"使用農業部最新可用月份的收容處理細項" }, latestByCounty };
    cachedNeeds = payload;
    return payload;
  } catch {
    if (cachedNeeds) return { ...cachedNeeds, source:{ ...cachedNeeds.source, mode:"fallback", fallbackDate:cachedNeeds.source.updatedAt, message:"政府 API 暫時無法使用，目前使用最近一次成功快取" } };
    return { source:{ mode:"fallback", updatedAt:WEEK_SIX_SHELTER_NEEDS_SNAPSHOT_DATE, fallbackDate:WEEK_SIX_SHELTER_NEEDS_SNAPSHOT_DATE, datasetUrl:SHELTER_NEEDS_DATASET_URL, apiUrl:SHELTER_NEEDS_API_URL, message:"目前使用有日期的政府資料備援快照" }, latestByCounty:WEEK_SIX_SHELTER_NEEDS_SNAPSHOT.map((row)=>({...row})) };
  }
}

export async function getSchoolDirectorySnapshot(): Promise<SchoolDirectorySnapshot> {
  const registryDate = OPEN_DATASET_BY_ID.get("moe-senior-high-directory-6089")?.lastUpdated ?? WEEK_SIX_SCHOOL_SNAPSHOT_DATE;
  try {
    const rows = await fetchOfficial(SCHOOL_DIRECTORY_API_URL);
    const schools = normalizeSchoolDirectory(rows);
    if (!schools.length) throw new Error("教育部學校名錄沒有可用列");
    const schoolYear = schools[0]?.schoolYear || "115";
    const payload: SchoolDirectorySnapshot = { source:{ mode:"live", updatedAt:`${schoolYear} 學年度（資料集詮釋更新 ${registryDate}）`, datasetUrl:SCHOOL_DIRECTORY_DATASET_URL, apiUrl:SCHOOL_DIRECTORY_API_URL, message:"使用教育部一般高級中等學校名錄" }, schools };
    cachedSchools = payload;
    return payload;
  } catch {
    if (cachedSchools) return { ...cachedSchools, source:{ ...cachedSchools.source, mode:"fallback", fallbackDate:cachedSchools.source.updatedAt, message:"教育部檔案暫時無法使用，目前使用最近一次成功快取" } };
    return { source:{ mode:"fallback", updatedAt:`115 學年度（快照 ${WEEK_SIX_SCHOOL_SNAPSHOT_DATE}）`, fallbackDate:WEEK_SIX_SCHOOL_SNAPSHOT_DATE, datasetUrl:SCHOOL_DIRECTORY_DATASET_URL, apiUrl:SCHOOL_DIRECTORY_API_URL, message:"目前使用有日期的教育部名錄備援快照" }, schools:WEEK_SIX_SCHOOL_SNAPSHOT.map((school)=>({...school})) };
  }
}
