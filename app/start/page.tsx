import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicPageShell } from "@/app/_components/public-shell";
import { RoleSelector } from "@/app/_components/role-selector";
import { PublicGridBackground, publicGridOverlay } from "@/app/_components/public-grid-background";

export const metadata: Metadata = {
  title: "開始探究",
  description: "選擇您的身份，進入 ShelterLab 的探究歷程。"
};

export default function StartPage() {
  return (
    <PublicPageShell>
      <PublicGridBackground />
      <main className={`min-h-screen ${publicGridOverlay}`}>
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-16 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold tracking-tight text-[#332D28]">
              【請選擇登入身份】
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-[#5D5753]">
              點選身份即可進入對應的系統介面或實務工作臺。
            </p>
            
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <Suspense fallback={<div className="h-64 animate-pulse bg-white/50 rounded-3xl" />}>
            <RoleSelector />
          </Suspense>
        </section>
      </main>
    </PublicPageShell>
  );
}
