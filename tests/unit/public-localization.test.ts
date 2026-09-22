import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatTaiwanDate,
  formatTaiwanDateTime,
  formatTaiwanNumber,
  PUBLIC_LOCALE,
  PUBLIC_TIME_ZONE,
  publicLabel
} from "@/lib/public-site/locale";
import { getPublicRoleProfile, publicRoleProfiles, syntheticDemoNotice } from "@/lib/public-site/roles";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const publicSources = [
  "app/page.tsx",
  "app/_components/public-shell.tsx",
  "app/_components/role-selector.tsx",
  "app/start/page.tsx",
  "app/tour/[step]/page.tsx",
  "app/demo/page.tsx",
  "app/demo/demo-accounts.tsx",
  "app/demo/[role]/page.tsx",
  "app/competition/impact/page.tsx",
  "app/competition/demo/page.tsx",
  "app/competition/demo/demo-player.tsx"
];

describe("Release 1.0.2 role-based public experience", () => {
  it("sets the document and metadata locale to Taiwan Traditional Chinese", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain('<html lang="zh-TW">');
    expect(layout).toContain('locale: "zh_TW"');
    expect(PUBLIC_LOCALE).toBe("zh-TW");
    expect(PUBLIC_TIME_ZONE).toBe("Asia/Taipei");
  });

  it("uses Taiwan date, time-zone, and number formatting", () => {
    expect(formatTaiwanNumber(12345)).toBe("12,345");
    expect(formatTaiwanDate("2026-07-14T16:00:00.000Z")).toMatch(/2026.*7.*15/);
    expect(formatTaiwanDateTime("2026-07-14T16:00:00.000Z")).toMatch(/2026.*7.*15.*(00:00|12:00)/);
  });

  it("retains required technical provenance with a Chinese explanation", () => {
    expect(publicLabel("SYNTHETIC_DEMO")).toBe("合成示範資料（SYNTHETIC_DEMO）");
    expect(publicLabel("UNKNOWN")).toBe("尚無資料（UNKNOWN）");
    expect(publicLabel("VERIFIED_FIXTURE")).toBe("已驗證資料快照（VERIFIED_FIXTURE）");
  });

  it("defines the three direct public roles and routes", () => {
    expect(publicRoleProfiles).toHaveLength(3);
    expect(getPublicRoleProfile("student")).toMatchObject({ title: "我是學生", primaryHref: "/student" });
    expect(getPublicRoleProfile("teacher")).toMatchObject({ title: "我是教師", primaryHref: "/teacher" });
    expect(getPublicRoleProfile("shelter")).toMatchObject({ title: "我是收容所人員", primaryHref: "/shelter" });
  });

  it("keeps the approved homepage and synthetic-demo notice copy", () => {
    expect(read("app/page.tsx")).toContain("讓每一位青少年的觀察，都成為提升動物認養品質的關鍵數據資產");
    expect(read("app/page.tsx")).toContain("構建一個橫跨校園、政府機關與收容所的數位協作生態系");
    expect(syntheticDemoNotice).toBe("競賽原型｜合成示範資料｜尚未宣稱正式合作或實證認養成效");
  });

  it("contains no known English UI fallback in the role-based public release sources", () => {
    const unintendedEnglish = [
      "Try Demo",
      "Judge Mode",
      "Guided Tour",
      "Watch Demo",
      "Open live evidence page",
      "Run Guided Demo",
      "Reset Demo",
      "Tour progress",
      "Public demo privacy notice"
    ];
    for (const path of publicSources) {
      const source = read(path);
      for (const phrase of unintendedEnglish) expect(source, `${path}: ${phrase}`).not.toContain(phrase);
    }
  });
});
