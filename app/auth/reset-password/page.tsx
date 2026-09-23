import { PublicPageShell } from "@/app/_components/public-shell";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return <PublicPageShell><main className="min-h-[70vh] bg-[linear-gradient(180deg,#fffaf0,#f6eddc)] px-5 py-12 sm:py-16"><div className="mx-auto max-w-lg"><p className="font-bold text-[#9b7130]">ShelterLab 帳號救援</p><h1 className="mt-2 text-3xl font-bold text-[#332a22]">設定新密碼</h1><div className="mt-7"><ResetPasswordForm /></div></div></main></PublicPageShell>;
}
