import { PublicPageShell } from "@/app/_components/public-shell";
import AuthForm from "./auth-form";
export default function AuthPage() { return <PublicPageShell><main className="mx-auto max-w-lg px-5 py-12 sm:py-16"><p className="font-bold text-teal-800">ShelterLab 學習帳號</p><h1 className="mt-2 text-3xl font-bold text-stone-900">登入／註冊專區</h1><div className="mt-7"><AuthForm /></div></main></PublicPageShell>; }
