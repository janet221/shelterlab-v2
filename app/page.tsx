"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { PublicPageShell } from "./_components/public-shell";

/**
 * 針對 TypeScript 優化的 Hook
 */
function useOnScreen(options: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return { ref, isVisible };
}

export default function HomePage() {
  const { ref: ctaRef, isVisible } = useOnScreen({ threshold: 0.2 });

  return (
    <PublicPageShell>
      {/* 1. 全域背景層 */}
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/tour.png')",
          backgroundColor: '#F7F4F0' 
        }}
      />

      {/* 2. SECTION 1: HERO */}
      <section className="relative w-full h-[90vh] overflow-hidden">
        <img 
          src="/Shelter-Dog.png" 
          alt="Shelter Dog running" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-0 left-0 w-full pb-20 pt-32 px-10 md:px-20 z-10 bg-gradient-to-t from-[#332a22]/90 via-[#332a22]/30 to-transparent">
          <div className="max-w-7xl mx-auto flex flex-col justify-end items-start h-full">
            <span className="mb-4 inline-block px-3 py-1 border border-[#ebd197]/50 rounded-full text-[9px] font-bold tracking-[0.3em] uppercase text-[#ebd197]">
              One Health Education Initiative
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight max-w-[850px] drop-shadow-md">
              ShelterLab:青少年科學實驗室
              <span className="text-[#ebd197] text-xl md:text-2xl lg:text-3xl font-medium block mt-5 leading-snug drop-shadow-sm">
                校園+政府+收容所的動物科學資訊協作平台
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80 max-w-[500px] leading-relaxed font-normal drop-shadow-sm">
              透過數位協作，將收容所轉化為真實的科學探究場域。讓每一位青少年的觀察，都成為提升動物認養品質的關鍵數據資產。
            </p>
            <div className="mt-8">
              <Link className="inline-block bg-[#ebd197] text-[#332a22] px-8 py-3 text-sm md:text-base font-bold tracking-wider transition hover:bg-white shadow-xl rounded-full" href="/#vision">
                了解專案願景
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: 完整文案內容 */}
      <section className="py-24 px-8">
        <div className="mx-auto max-w-6xl text-[#4a3f35]">
          <div className="bg-white/80 backdrop-blur-sm p-12 md:p-20 rounded-[2.5rem] shadow-xl border border-white/60">
            
            <h2 id="vision" className="text-3xl font-bold mb-10 border-l-8 border-[#ebd197] pl-6 scroll-mt-24">
              【專案願景：讓學生探究成為社會改變的動力】
            </h2>
            
            <div className="space-y-6 leading-8 text-lg mb-16">
              <p>在數位化時代的浪潮下，動物收容所不僅是生命的避風港，更是社會公共衛生、城市生態與動物福利治理的核心場域。長期以來，台灣的動物福利議題往往受限於單向的愛心救助模式，缺乏數據支持的透明度與科學論證，這導致了民眾參與意願與實際需求之間的落差。ShelterLab 應運而生，我們致力於將傳統收容所轉化為青少年的「科學探究實驗室」。</p>
              <p>我們不僅是建立一個認養平台，而是在構建一個橫跨校園、政府機關與收容所的數位協作生態系。我們將冷冰冰的資訊轉化為有溫度的生命數據，並引導學生以公民科學家的身分，透過結構化的觀察與科學分析，實質參與城市的動物福利治理。在這裡，學習不再只是課本上的理論，而是推動社會向善的真實行動。</p>
            </div>

            <h3 className="text-2xl font-bold mb-6">1. 核心使命：打破圍牆，共築科學協作網絡</h3>
            <ul className="list-disc pl-6 mb-12 space-y-4 text-lg">
              <li><strong>賦能教育革新：</strong>我們將自然科學的探究精神落實於真實社會問題，將 108 課綱要求的科學素養轉化為具備社會影響力的實踐報告。</li>
              <li><strong>深耕數位治理：</strong>我們填補公部門開放資料中關於「行為特徵」與「家庭適配度」的空白，提升治理效能。</li>
              <li><strong>推動專業共融：</strong>讓收容所、教師與學生在同一個數據平台上共同努力，打破機構間的資訊壁壘。</li>
            </ul>

            <h3 className="text-2xl font-bold mb-6">2. 科學實踐：四階段嚴謹協作流程</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { title: "研究資格認證", desc: "通過動物行為學課程與安全規範考核。" },
                { title: "標準化科學觀察", desc: "執行非接觸式觀察，量化行為數據。" },
                { title: "雙層審核與 AI 品管", desc: "經 AI 初審與專業人工複審，確保品質。" },
                { title: "資訊回流與適配", desc: "產出犬隻適配卡，降低認養障礙。" }
              ].map((step, i) => (
                <div key={i} className="p-8 border-2 border-[#5b86a6] rounded-full text-center hover:bg-[#5b86a6] hover:text-white transition-all cursor-default">
                  <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm opacity-80">{step.desc}</p>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold mb-6">3. 功能亮點：數據驅動的影響力儀表板</h3>
            <p className="mb-12 text-lg">透過 AI 認養推薦摘要、研究可信度分數、犬隻生命故事軸，以及社會影響力指標，讓所有的努力都有跡可循。</p>

            <h3 className="text-2xl font-bold mb-6">4. 與 108 課綱的深度對話</h3>
            <div className="overflow-hidden border border-[#f0eae1] rounded-3xl mb-16">
              <table className="w-full text-left text-sm md:text-base">
                <thead>
                  <tr className="bg-[#f0eae1] text-[#332a22]">
                    <th className="p-4 border-b">探究主軸</th>
                    <th className="p-4 border-b">科學探究內容</th>
                    <th className="p-4 border-b">協作產出</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-4 border-b">動物行為科學</td><td className="p-4 border-b">刺激與反應、壓力適應</td><td className="p-4 border-b">行為代碼序列、分析圖表</td></tr>
                  <tr><td className="p-4 border-b">都市生態分析</td><td className="p-4 border-b">環境因子與族群分佈</td><td className="p-4 border-b">環境觀察紀錄、生態分析</td></tr>
                  <tr><td className="p-4 border-b">公共衛生實踐</td><td className="p-4 border-b">防疫資料治理</td><td className="p-4 border-b">防疫科普、數據解讀</td></tr>
                </tbody>
              </table>
            </div>

            {/* CTA 區塊 */}
            <div 
              ref={ctaRef}
              className={`
                mt-20 relative overflow-hidden bg-[#f4f2ef]/90 backdrop-blur-md p-20 rounded-[2.5rem] text-center shadow-inner border border-[#e5e2de]
                transition-all duration-1000 ease-out transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
              `}
            >
              <h3 className="text-[#a69888] text-base font-black tracking-[0.4em] uppercase mb-8">
                READY TO START?
              </h3>
              <p className="relative z-10 mb-16 text-2xl md:text-3xl text-[#4a3f35] max-w-3xl mx-auto leading-relaxed font-bold">
                我們深信，當教育的熱情與數據的理性結合，改變就會發生。
                <span className="block mt-4 text-[#c5a059]">讓我們攜手建立一個更開放、更科學、更溫暖的動物友善城市。</span>
              </p>
              <div className="relative z-10 flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Link href="/tour/welcome" className="px-12 py-5 font-bold border-2 border-[#4a3f35]/20 text-[#4a3f35] rounded-full hover:border-[#c5a059] hover:bg-white transition-all duration-300">
                  如何運作
                </Link>
                <Link href="/start" className="px-12 py-5 font-bold bg-[#4a3f35] text-white rounded-full hover:bg-[#332a22] hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
                  開始體驗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}