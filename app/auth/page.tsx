import { PublicPageShell } from "@/app/_components/public-shell";
import { PublicGridBackground } from "@/app/_components/public-grid-background";
import AuthForm from "./auth-form";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ role?: string; mode?: string }> }) {
  const { role, mode } = await searchParams;
  const accountRole = role === "teacher" ? "teacher" : "student";
  const roleLabel = accountRole === "teacher" ? "教師" : "學生";
  return (
    <PublicPageShell>
      <div className="relative isolate">
        <PublicGridBackground />
        <section data-testid="auth-shell" className="min-h-[calc(100svh-4.5rem)] px-5 py-12 sm:py-16">
        <div data-testid="auth-content" className="mx-auto max-w-lg">
          <p className="font-bold tracking-wide text-[#8f7c5e]">ShelterLab · {roleLabel}</p>
          <h1 className="mt-2 text-3xl font-bold text-[#332a22]">登入／註冊專區</h1>
          <p className="mt-3 leading-7 text-[#6f604f]">登入後保存課程進度與學習紀錄；第一次使用可直接建立帳號。</p>
          <div className="mt-7"><AuthForm role={accountRole} initialMode={mode === "signup" ? "signup" : "login"} /></div>
        </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
