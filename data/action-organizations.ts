import { WEEK_SIX_FALLBACK } from "@/data/week-six-open-data-fallback";
import { WEEK6_VERIFIED_ACTION_RESOURCES } from "@/data/week6ActionResources";
import { type ActionOrganization } from "@/lib/action-opportunities/types";
import { dedupeActionOrganizations } from "@/lib/action-opportunities/repository";

export const PUBLIC_SHELTER_DATASET_URL = "https://data.gov.tw/dataset/134284";
export const PUBLIC_SHELTER_API_URL = "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=2thVboChxuKs";

const isEducationSite = (name: string) => /教育園區|教育中心|關愛園區/.test(name);
const isAnimalHome = (name: string) => /動物之家/.test(name);

export function mergeVerifiedActionResources(base: ActionOrganization[]) {
  const byId = new Map(base.map((item) => [item.id, item]));
  for (const verified of WEEK6_VERIFIED_ACTION_RESOURCES) {
    const existing = byId.get(verified.id);
    byId.set(verified.id, existing ? { ...existing, ...verified, openDogCount: existing.openDogCount ?? verified.openDogCount } : verified);
  }
  return dedupeActionOrganizations([...byId.values()]);
}

const fallbackShelters: ActionOrganization[] = WEEK_SIX_FALLBACK.publicShelters.map((shelter) => ({
  id: shelter.id,
  name: shelter.name,
  county: shelter.county,
  latitude: shelter.latitude,
  longitude: shelter.longitude,
  address: shelter.address,
  phone: shelter.phone,
  openingHours: shelter.openingHours,
  officialUrl: shelter.officialUrl,
  organizationType: isEducationSite(shelter.name) ? "education_park" : isAnimalHome(shelter.name) ? "animal_home" : "public_shelter",
  managementMode: "platform_curated",
  verificationLevel: "government_official",
  sourceLayer: "government_open_data",
  officialSource: "農業部動物保護資訊網公立收容所資料",
  sourceUrl: shelter.officialUrl,
  actionTags: ["visit", "adoption_promotion"],
  studentNotes: ["公開資料可確認據點與認領養服務；學生參與方式仍要向單位確認。"],
  requiresAdult: true,
  ageLimitNote: "官方公立收容資料未列學生參與年齡；請由教師或家長協助確認。",
  hasOfficialVolunteerInfo: false,
  evidenceLinks: [{ label: "農業部公立收容所資料", url: shelter.officialUrl }],
  minorPolicy: "contact_to_confirm",
  participationModes: [],
  actionTypes: ["詢問認養資訊協助", "詢問學生參與或合作方式"],
  commitmentTypes: [],
  officialServices: ["公立收容與認領養服務"],
  volunteerInformation: "not_published",
  verificationStatus: "official",
  verifiedAt: WEEK_SIX_FALLBACK.shelterDatasetVerifiedAt,
  dataSource: PUBLIC_SHELTER_DATASET_URL,
  openDogCount: WEEK_SIX_FALLBACK.shelterCounts[shelter.name as keyof typeof WEEK_SIX_FALLBACK.shelterCounts] ?? 0
}));

export const FALLBACK_ACTION_ORGANIZATIONS: ActionOrganization[] = mergeVerifiedActionResources(fallbackShelters);
