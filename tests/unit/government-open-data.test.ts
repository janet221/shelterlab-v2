import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdoptionSnapshot, latestShelterNeeds, latestShelterStats, normalizeAdoptions, normalizePublicShelters, normalizeSchoolDirectory, safeNumber } from "@/lib/government-open-data";
import { OPEN_DATA_REGISTRY } from "@/data/open-data-registry";

afterEach(() => vi.unstubAllGlobals());

describe("Ministry of Agriculture Open Data normalization", () => {
  const shelterRows = [{ ID: "PS1", ShelterName: "測試動物之家", CityName: "台北市", Address: "臺北市測試路1號", Phone: "02-12345678", OpenTime: "週二<br/>週日", Url: "", Longitude: "121.5", Latitude: "25.0" }];
  it("normalizes Taiwan county names and verified coordinates", () => {
    const [shelter] = normalizePublicShelters(shelterRows, "2026-09-16");
    expect(shelter.county).toBe("臺北市");
    expect(shelter.latitude).toBe(25);
    expect(shelter.openingHours).toContain("；");
  });
  it("deduplicates repeated official shelter records after normalizing their identity", () => {
    const duplicated = [
      { ID: "PS00000017", ShelterName: "彰化縣流浪狗中途之家", CityName: "彰化縣", Address: "彰化縣員林鎮大峰里阿寶巷426號", Phone: "04-8590638", Longitude: "120.624561", Latitude: "23.967646" },
      { ID: "PS00000032", ShelterName: "彰化縣流浪狗中途之家", CityName: "彰化縣", Address: "彰化縣員林市大峰里阿寶巷426號", Phone: "(04)8590638", Longitude: "120.611184", Latitude: "23.965436" }
    ];
    const shelters = normalizePublicShelters(duplicated, "2026-09-16");
    expect(shelters).toHaveLength(1);
    expect(shelters[0].id).toBe("PS00000032");
    expect(shelters[0].address).toContain("員林市");
    expect(shelters[0].officialUrl).toContain("PS00000032");
    expect(shelters.some((shelter) => shelter.id === "PS00000017")).toBe(false);
  });
  it("filters open dogs and never counts closed or non-dog rows", () => {
    const shelters = normalizePublicShelters(shelterRows, "2026-09-16");
    const rows = [
      { animal_id: 1, animal_subid: "A1", animal_kind: "狗", animal_status: "OPEN", shelter_name: "測試動物之家", shelter_address: "台北市測試路1號", cDate: "2026-09-16" },
      { animal_id: 2, animal_subid: "A2", animal_kind: "狗", animal_status: "CLOSED", shelter_name: "測試動物之家" },
      { animal_id: 3, animal_subid: "A3", animal_kind: "貓", animal_status: "OPEN", shelter_name: "測試動物之家" }
    ];
    const result = normalizeAdoptions(rows, shelters);
    expect(result.countyCounts["臺北市"]).toBe(1);
    expect(result.sampleDogs).toHaveLength(1);
  });
  it("selects the latest year and month per county with safe numeric conversion", () => {
    const rows = [
      { rpt_year: "114", rpt_county: "台北市", rpt_month: "12", accept_count: "20", adopt_count: "10", adopt_rate: "50%" },
      { rpt_year: 115, rpt_county: "臺北市", rpt_month: 2, accept_count: 30, adopt_count: 12, adopt_rate: "40%" },
      { rpt_year: 103, rpt_county: "桃園縣", rpt_month: 12, accept_count: 1, adopt_count: 1, adopt_rate: "100%" }
    ];
    const result = latestShelterStats(rows);
    expect(result).toHaveLength(1);
    const [latest] = result;
    expect(latest.year).toBe(115);
    expect(latest.month).toBe(2);
    expect(latest.adoptionRate).toBe(40);
    expect(safeNumber("not-a-number")).toBeNull();
  });
  it("uses the dated fallback instead of fake zeroes when official APIs fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const fallback = await getAdoptionSnapshot();
    expect(fallback.source.mode).toBe("fallback");
    expect(fallback.source.fallbackDate).toMatch(/^2026-/);
    expect(fallback.organizations.length).toBeGreaterThanOrEqual(30);
    expect(fallback.countyCounts["新北市"]).toBeGreaterThan(0);
  });
  it("normalizes the latest shelter capacity and intake fields from dataset 73396", () => {
    const [latest] = latestShelterNeeds([
      { rpt_year: 114, rpt_county: "臺北市", rpt_month: 11, max_stay_dog_count: 10, max_stay_cat_count: 5, fe_sum_count: 8, in_tot_count: 2 },
      { rpt_year: 114, rpt_county: "台北市", rpt_month: 12, max_stay_dog_count: "20", max_stay_cat_count: "7", fe_gg_count: "12", fe_ms_count: "3", fe_sum_count: "15", in_ms_count: "4", in_lv_count: "2", in_lw_count: "1", in_tot_count: "9" },
    ]);
    expect(latest).toMatchObject({ county: "臺北市", year: 114, month: 12, maxCapacity: 27, currentTotal: 15, foundDelivered: 4, ownerSurrender: 2, legalSeizure: 1, totalIntake: 9 });
  });
  it("normalizes the school directory without inventing coordinates", () => {
    const schools = normalizeSchoolDirectory([{ 學年度: "115", 代碼: "000001", 學校名稱: "測試高中", 縣市名稱: "[01]臺北市", 地址: "[01]臺北市測試路1號", 電話: "02-12345678", 網址: "https://example.edu.tw" }]);
    expect(schools).toEqual([{ id: "000001", name: "測試高中", county: "臺北市", level:"senior_high", publicPrivate:"public", address: "臺北市測試路1號", phone: "02-12345678", website: "https://example.edu.tw", schoolYear: "115", sourceUrl:"https://data.gov.tw/dataset/6089" }]);
    expect(schools[0]).not.toHaveProperty("latitude");
  });
  it("registers all required official datasets and keeps TDX optional", () => {
    expect(OPEN_DATA_REGISTRY.map((dataset) => dataset.id)).toEqual(expect.arrayContaining(["moa-animal-adoption", "moa-shelter-statistics-41236", "moa-shelter-statistics-73396", "moe-senior-high-directory-6089", "tdx-transport-optional"]));
    expect(OPEN_DATA_REGISTRY.find((dataset) => dataset.id === "tdx-transport-optional")?.verificationStatus).toBe("optional");
    expect(OPEN_DATA_REGISTRY.filter((dataset) => dataset.verificationStatus === "verified").every((dataset) => Boolean(dataset.provider && dataset.sourceUrl && dataset.lastUpdated && dataset.license))).toBe(true);
  });
});
