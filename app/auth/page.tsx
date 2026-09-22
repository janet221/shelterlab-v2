import { PublicPageShell } from "@/app/_components/public-shell";
import AuthForm from "./auth-form";
export default function AuthPage() { return <PublicPageShell><main className="mx-auto max-w-lg px-5 py-16"><p className="font-bold text-teal-800">ShelterLab 學習帳號</p><h1 className="mt-2 text-3xl font-bold">登入／註冊專區</h1><p className="my-5 text-stone-600">學生與教師使用個人帳號保存學習紀錄。學生加入教師提供的班級後，即可開始第一週。</p><AuthForm /></main></PublicPageShell>; }
