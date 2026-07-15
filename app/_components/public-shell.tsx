"use client";

import Link from "next/link";
import Image from "next/image";

export const githubUrl = "https://github.com/oysunny752-maker/shelterlab";
// @/app/_components/public-shell.tsx
export function PublicPageShell({ children }: { children: React.ReactNode }) {
  // 移除 bg-[#f9f6ee]
  return (
    <div className="min-h-screen text-[#4a3f35]">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}

const primaryNav = [
  ["首頁", "/"],
  ["專案願景", "/#vision"],
  ["如何運作", "/tour/welcome"],
  ["開始體驗", "/start"]
  
] as const;

const footerLinks = [
  ["隱私權", "/privacy"],
  ["研究聲明", "/research-notice"],
  ["GitHub", githubUrl],
  ["聯絡我們", "/contact"],
  ["政府開放資料", "/government-data"],
  ["技術文件", githubUrl]
] as const;

/* =========================================================================
   🎯 BRAND 元件：極致貼左調整
   ========================================================================= */
export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="inline-flex items-center transition-all duration-200 hover:opacity-85 active:scale-98 shrink-0" href="/">
      {/* 🚀 用 object-left 確保圖片內的手寫字體從最左像素點開始渲染 */}
      <div className="relative h-10 w-28 sm:w-32 lg:h-14 lg:w-40">
        <Image
          src="/logo.png"
          alt="ShelterLab"
          fill
          className={`object-contain object-left transition-all ${
            inverse ? "invert brightness-200" : ""
          }`}
          priority
        />
      </div>
    </Link>
  );
}

/* =========================================================================
   PUBLIC HEADER：破格極致對齊版
   ========================================================================= */
export function PublicHeader({ inverse = false }: { inverse?: boolean }) {
  return (
    <header 
      className={
        inverse 
          ? "relative z-20 border-b border-white/25" 
          : "border-b border-[#e3b85a]/10 bg-[#f9f6ee]/80 backdrop-blur-md sticky top-0 z-50"
      }
    >
      {/* 🛠️ 透過 w-full 與左右全開的布局，讓左側 Logo 完全打破限制往最左邊靠攏 */}
      <div className="w-full flex items-center justify-between gap-5 pl-2 sm:pl-4 lg:pl-6 pr-5 lg:pr-8 py-2.5 lg:py-2">
        
        {/* 左側 Logo：現在它已經不受限於中央常規區塊，實現最左極致貼齊 */}
        <Brand inverse={inverse} />
        
        {/* 右側選單導覽 */}
        <nav
          aria-label="主要導覽"
          className={`flex max-w-[72vw] flex-wrap items-center justify-end gap-x-1 sm:gap-x-2 gap-y-2 text-xs sm:text-sm font-medium ${
            inverse ? "text-white" : "text-[#4a3f35]"
          }`}
        >
          {primaryNav.map(([label, href]) => (
            <Link
              className={
                label === "開始體驗"
                  ? `rounded-full px-4 py-1.5 sm:px-5 sm:py-2 font-bold shadow-xs transition transform hover:-translate-y-0.5 ${
                      inverse 
                        ? "border border-white bg-white text-slate-950" 
                        : "bg-[#e3b85a] text-white hover:bg-[#d4a746]"
                    }`
                  : `rounded-md px-2 py-1.5 sm:px-3 sm:py-2 transition ${
                      inverse ? "hover:bg-white/10" : "hover:bg-[#ebd197]/30 hover:text-[#7c5f2b]"
                    }`
              }
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* =========================================================================
   PUBLIC FOOTER - 優化文字版
   ========================================================================= */
export function PublicFooter() {
  return (
    <footer className="border-t border-[#4a3f35]/20 bg-[#332a22] text-[#cdbfae]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        
        {/* 品牌與核心說明 */}
        <div>
          <Brand inverse />
          <p className="mt-4 max-w-md text-xs leading-6 text-[#cdbfae]/80">
            ShelterLab 是青少年動物科學教育的領航平台，透過整合政府開放資料與收容所行為科學數據，賦能下一代以公民科學家的身份，實踐證據治理，為動物共融城市貢獻科學力量。
          </p>
          {/* 免責聲明：保留專業嚴謹感 */}
          <p className="mt-4 text-xs font-semibold leading-5 text-[#ebd197]">
            競賽原型展示｜所有內容均使用模擬資料｜尚未與收容所進行實質合作或宣稱任何認養成效
          </p>
        </div>

        {/* 導覽列 */}
        <nav className="grid content-start gap-2.5 text-sm" aria-label="核心功能">
          <strong className="mb-1 text-[#ebd197] font-bold">探索實驗室</strong>
          <Link className="hover:text-white transition-colors" href="/start">立即開始體驗</Link>
          <Link className="hover:text-white transition-colors" href="/tour/welcome">協作流程說明</Link>
          <Link className="hover:text-white transition-colors" href="/demo">系統示範展示</Link>
          <Link className="hover:text-white transition-colors" href="/competition/judge">評審專屬導覽</Link>
        </nav>

        <nav className="grid content-start gap-2.5 text-sm" aria-label="補充資訊">
          <strong className="mb-1 text-[#ebd197] font-bold">延伸資源</strong>
          {footerLinks.map(([label, href]) =>
            href.startsWith("http") ? (
              <a className="hover:text-white transition-colors" href={href} key={label} rel="noreferrer" target="_blank">
                {label}
              </a>
            ) : (
              <Link className="hover:text-white transition-colors" href={href} key={label}>
                {label}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* 底部版權說明 */}
      <div className="border-t border-white/5 px-5 py-4 text-center text-xs text-[#cdbfae]/40">
        © {new Date().getFullYear()} ShelterLab Education Initiative. 本站僅供專案演示與科學教育交流使用。
      </div>
    </footer>
  );
}