import { PublicPageShell } from "@/app/_components/public-shell";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return <PublicPageShell><main className="mx-auto max-w-lg px-5 py-12 sm:py-16"><p className="font-bold text-teal-800">ShelterLab 帳號救援</p><h1 className="mt-2 text-3xl font-bold text-stone-900">設定新密碼</h1><div className="mt-7"><ResetPasswordForm /></div></main></PublicPageShell>;
}
