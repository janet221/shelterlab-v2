import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageShell } from "@/app/_components/public-shell";
import { getPublicDemoAccount, isPublicDemoRole, publicDemoRoleIds } from "@/lib/public-demo/engine";
import { roleFromDemoRole, roleModeNotice, syntheticDemoNotice } from "@/lib/public-site/roles";

export function generateStaticParams() {
  return publicDemoRoleIds.map((role) => ({ role }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role } = await params;
  return isPublicDemoRole(role) ? { title: `${getPublicDemoAccount(role).label}示範視角` } : {};
}

export default async function PublicDemoRolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isPublicDemoRole(role)) notFound();
  const account = getPublicDemoAccount(role);
  const publicRole = roleFromDemoRole(role);

  return (
    <PublicPageShell>
      <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-bold text-teal-800">唯讀示範視角</p>
            <h1 className="mt-2 text-4xl font-semibold">{account.label}</h1>
          </div>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href="/demo">
            切換身分
          </Link>
        </div>

        <section className="grid gap-8 py-10 md:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold text-slate-500">這個角色做什麼</p>
            <p className="mt-3 text-lg leading-8 text-slate-700">{account.purpose}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-bold text-slate-500">展示邊界</p>
            <p className="mt-3 text-base leading-7 text-slate-600">{account.contribution}</p>
          </article>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-semibold">進入對應的證據頁</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            此頁只提供公開展示入口。它不會建立登入狀態，不會授予正式權限，也不會修改任何資料。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-md border border-teal-700 bg-teal-700 px-4 py-3 text-sm font-bold text-white" href={account.evidenceHref}>
              {account.evidenceLabel}
            </Link>
            {publicRole && (
              <Link className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800" href={`/start?role=${publicRole}`}>
                返回角色說明
              </Link>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-3 text-sm md:grid-cols-2">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{syntheticDemoNotice}</p>
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700">{roleModeNotice}</p>
        </section>
      </main>
    </PublicPageShell>
  );
}
