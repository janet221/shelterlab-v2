export type GovernmentDatasetSeed = {
  datasetId: string;
  name: string;
  agency: string;
  sourceUrl: string;
  updateFrequency: string;
  licenseNote: string;
};

const license = "政府資料開放授權條款第 1 版；使用時應標示來源。";

export const governmentDatasetSeeds: GovernmentDatasetSeed[] = [
  { datasetId: "41236", name: "全國公立動物收容所收容處理情形統計表", agency: "農業部", sourceUrl: "https://data.gov.tw/dataset/41236", updateFrequency: "每月", licenseNote: license },
  { datasetId: "6318", name: "國家教育研究院愛學網", agency: "國家教育研究院", sourceUrl: "https://data.gov.tw/dataset/6318", updateFrequency: "每年不定期", licenseNote: license },
  { datasetId: "29027", name: "國家教育研究院全國中小學題庫網", agency: "國家教育研究院", sourceUrl: "https://data.gov.tw/dataset/29027", updateFrequency: "停止更新（原網站已關閉）", licenseNote: license },
  { datasetId: "15391", name: "國中教育會考各科試題通過率", agency: "教育部國民及學前教育署", sourceUrl: "https://data.gov.tw/dataset/15391", updateFrequency: "每年", licenseNote: license },
  { datasetId: "6089", name: "一般高級中等學校名錄", agency: "教育部統計處", sourceUrl: "https://data.gov.tw/dataset/6089", updateFrequency: "每學年", licenseNote: license },
  { datasetId: "40121", name: "各級學校縣市別學生人數", agency: "教育部統計處", sourceUrl: "https://data.gov.tw/dataset/40121", updateFrequency: "每學年", licenseNote: license }
];
