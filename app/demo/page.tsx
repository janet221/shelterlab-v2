import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicPageShell } from "@/app/_components/public-shell";
import { RoleSelector } from "@/app/_components/role-selector";
import { isPublicRoleId, syntheticDemoNotice, type PublicRoleId } from "@/lib/public-site/roles";

export const metadata: Metadata = {
  title: "示範模式",
  description: "選擇一個公開示範視角，進入 ShelterLab 的唯讀合成資料體驗。"
};

export default async function PublicDemoPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const initialRole: PublicRoleId | null = isPublicRoleId(role) ? role : null;

  return (
    <PublicPageShell>
      <main>
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <p className="text-sm font-bold text-teal-800">示範模式</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
              選擇一個展示視角，再進入對應的唯讀體驗。
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              這裡不建立假登入、不授予正式權限，也不修改生產資料。角色選擇只用來降低資訊量，幫助你看見不同使用者在同一條證據鏈中的位置。
            </p>
            <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{syntheticDemoNotice}</p>
              
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <Suspense fallback={<p className="text-sm text-slate-600">角色選擇載入中...</p>}>
            <RoleSelector initialRole={initialRole} source="demo" />
          </Suspense>
        </section>
      </main>
    </PublicPageShell>
  );
}
