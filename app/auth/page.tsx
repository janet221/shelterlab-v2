import { PublicHeader } from "@/app/_components/public-shell";
import { PublicGridBackground, publicGridOverlay } from "@/app/_components/public-grid-background";
import AuthForm from "./auth-form";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ role?: string; mode?: string }> }) {
  const { role, mode } = await searchParams;
  const accountRole = role === "teacher" ? "teacher" : "student";
  const roleLabel = accountRole === "teacher" ? "教師" : "學生";
  return (
    <div className="relative min-h-screen text-[#4a3f35]">
      <PublicGridBackground />
      <div data-testid="auth-page" className={`flex min-h-screen flex-col ${publicGridOverlay}`}>
        <PublicHeader />
        <main data-testid="auth-shell" className="flex-grow px-5 py-12 sm:py-16">
          <div data-testid="auth-content" className="mx-auto max-w-lg">
            <p className="font-bold tracking-wide text-[#8f7c5e]">ShelterLab · {roleLabel}</p>
            <h1 className="mt-2 text-3xl font-bold text-[#332a22]">登入／註冊專區</h1>
            <div className="mt-7"><AuthForm role={accountRole} initialMode={mode === "signup" ? "signup" : "login"} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
