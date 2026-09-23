"use client";

import Link from "next/link";
import Image from "next/image";

export const githubUrl = "https://github.com/oysunny752-maker/shelterlab";
// @/app/_components/public-shell.tsx
export function PublicPageShell({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  // 移除 bg-[#f9f6ee]
  return (
    <div className="min-h-screen text-[#4a3f35]">
      <PublicHeader />
      <main>{children}</main>
      {!hideFooter && <PublicFooter />}
    </div>
  );
}

const primaryNav = [
  ["首頁", "/"],
  ["專案願景", "/#vision"],
  ["如何運作", "/tour/welcome"],
  ["開始體驗", "/start"]
  
] as const;

/* =========================================================================
   🎯 BRAND 元件：極致貼左調整
   ========================================================================= */
export function Brand({ inverse = false, gold = false, href = "/" }: { inverse?: boolean; gold?: boolean; href?: string }) {
  return (
    <Link className="inline-flex shrink-0 items-center transition-all duration-200 hover:opacity-85 active:scale-98" href={href} aria-label="ShelterLab 首頁">
      {/* 🚀 用 object-left 確保圖片內的手寫字體從最左像素點開始渲染 */}
      <div className="relative h-10 w-28 sm:w-32 lg:h-14 lg:w-40">
        <Image
          src="/logo.png"
          alt="ShelterLab"
          fill
          className={`object-contain object-left transition-all ${
            gold ? "brightness-0 invert-[.78] sepia saturate-[1.7] hue-rotate-[356deg]" : inverse ? "invert brightness-200" : ""
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
          : "border-b border-[#dec692]/30 bg-[#f9f6ee]/80 backdrop-blur-md sticky top-0 z-50"
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
                        : "border border-[#dec692] bg-[#ebd197] text-[#332a22] hover:bg-[#f4e4bd]"
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
          <Brand gold href="/#top" />
          <p className="mt-4 max-w-md text-xs leading-6 text-[#cdbfae]/80">
            ShelterLab 連結校園學習、政府開放資料與收容實務，引導青少年閱讀證據、辨識偏見、理解不同立場，讓關心轉化為有依據的判斷與能負責完成的行動。
          </p>
        </div>

        {/* 導覽列 */}
        <nav className="grid content-start gap-2.5 text-sm" aria-label="核心功能">
          <strong className="mb-1 text-[#ebd197] font-bold">探索實驗室</strong>
          <Link className="hover:text-white transition-colors" href="/#vision">專案願景</Link>
          <Link className="hover:text-white transition-colors" href="/tour/welcome">如何運作</Link>
          <Link className="hover:text-white transition-colors" href="/start">開始體驗</Link>
        </nav>

        <nav className="grid content-start gap-2.5 text-sm" aria-label="補充資訊">
          <strong className="mb-1 text-[#ebd197] font-bold">延伸資源</strong>
          <Link className="hover:text-white transition-colors" href="/government-data">政府開放資料</Link>
        </nav>
      </div>

      {/* 底部版權說明 */}
      <div className="border-t border-white/5 px-5 py-4 text-center text-xs text-[#cdbfae]/40">
        © {new Date().getFullYear()} ShelterLab Education Initiative
      </div>
    </footer>
  );
}
