export type DatasetVerificationStatus = "verified" | "optional" | "needs_manual_review";

export type OpenDatasetRegistryEntry = {
  id: string;
  title: string;
  provider: string;
  sourceUrl: string;
  resourceUrl?: string;
  dataType: "json_api" | "json_file" | "metadata_only" | "optional_adapter";
  updateFrequency: string;
  lastUpdated: string;
  license: string;
  usedIn: string[];
  verificationStatus: DatasetVerificationStatus;
};

const GOVERNMENT_OPEN_LICENSE = "政府資料開放授權條款－第 1 版";

export const OPEN_DATA_REGISTRY: OpenDatasetRegistryEntry[] = [
  {
    id: "moa-animal-adoption",
    title: "動物認領養",
    provider: "農業部動物保護司",
    sourceUrl: "https://data.moa.gov.tw/open_detail.aspx?id=QcbUEzN6E6DL",
    resourceUrl: "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=QcbUEzN6E6DL",
    dataType: "json_api",
    updateFrequency: "每日",
    lastUpdated: "2026-09-17",
    license: GOVERNMENT_OPEN_LICENSE,
    usedIn: ["Week 6 環節一據點與待認養資料", "學生端動保行動資源地圖"],
    verificationStatus: "verified",
  },
  {
    id: "moa-shelter-statistics-41236",
    title: "全國公立動物收容所收容處理情形統計表",
    provider: "農業部",
    sourceUrl: "https://data.gov.tw/dataset/41236",
    resourceUrl: "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=DyplMIk3U1hf",
    dataType: "json_api",
    updateFrequency: "不定期更新",
    lastUpdated: "2026-06-05",
    license: GOVERNMENT_OPEN_LICENSE,
    usedIn: ["Week 6 環節二認領養情形", "教師端縣市需求摘要"],
    verificationStatus: "verified",
  },
  {
    id: "moa-shelter-statistics-73396",
    title: "全國公立動物收容所收容處理情形統計表二",
    provider: "農業部",
    sourceUrl: "https://data.nat.gov.tw/dataset/73396",
    resourceUrl: "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?IsTransData=1&UnitId=p9yPwrCs2OtC",
    dataType: "json_api",
    updateFrequency: "每月",
    lastUpdated: "2026-06-17",
    license: GOVERNMENT_OPEN_LICENSE,
    usedIn: ["Week 6 環節二容量、在養與入所來源", "教師端縣市需求摘要"],
    verificationStatus: "verified",
  },
  {
    id: "moe-senior-high-directory-6089",
    title: "一般高級中等學校名錄",
    provider: "教育部統計處",
    sourceUrl: "https://data.gov.tw/dataset/6089",
    resourceUrl: "https://stats.moe.gov.tw/files/school/115/high.json",
    dataType: "json_file",
    updateFrequency: "每學年度",
    lastUpdated: "2026-08-10",
    license: GOVERNMENT_OPEN_LICENSE,
    usedIn: ["Week 6 環節一學校選擇", "教師端學校與在地資源"],
    verificationStatus: "verified",
  },
  {
    id: "tdx-transport-optional",
    title: "TDX 交通資料（選用轉接器）",
    provider: "交通部運輸資料流通服務平臺",
    sourceUrl: "https://tdx.transportdata.tw/",
    dataType: "optional_adapter",
    updateFrequency: "依 TDX 資料集",
    lastUpdated: "尚未啟用",
    license: "依 TDX 各資料集授權；本專案目前未申請或保存金鑰",
    usedIn: ["未來交通可達性估算；目前不參與推薦"],
    verificationStatus: "optional",
  },
];

export const OPEN_DATASET_BY_ID = new Map(OPEN_DATA_REGISTRY.map((dataset) => [dataset.id, dataset]));

