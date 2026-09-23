import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicPageShell } from "@/app/_components/public-shell";
import { RoleSelector } from "@/app/_components/role-selector";
import { isPublicRoleId, type PublicRoleId } from "@/lib/public-site/roles";

export const metadata: Metadata = {
  title: "開始體驗",
  description: "選擇視角，進入 ShelterLab 的體驗。"
};

export default async function StartPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const initialRole: PublicRoleId | null = isPublicRoleId(role) ? role : null;

  return (
    <PublicPageShell>
      {/* 背景層：固定在最底層，與其他頁面使用同一張背景圖 */}
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/b.jpg')",
          backgroundColor: '#F7F4F0' 
        }}
      />

      {/* 內容層：調整 bg 的透明度 (例如 /70)，讓背景顯露更多 */}
      <main className="min-h-screen bg-[linear-gradient(180deg,rgba(255,250,240,0.82),rgba(247,239,223,0.94))]">
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-16 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold tracking-tight text-[#332D28]">
              【請選擇參與視角】
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-[#5D5753]">
              點選角色查看專屬功能與學習路徑。學生與教師可從角色詳情進入對應的登入／註冊介面。
            </p>
            
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <Suspense fallback={<div className="h-64 animate-pulse bg-white/50 rounded-3xl" />}>
            <RoleSelector initialRole={initialRole} />
          </Suspense>
        </section>
      </main>
    </PublicPageShell>
  );
}
