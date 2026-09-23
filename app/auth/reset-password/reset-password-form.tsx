"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const fieldClass = "mt-2 w-full rounded-2xl border border-[#d8c8ab] bg-[#fffdf8] px-4 py-3.5 text-[#332a22] shadow-sm outline-none transition focus:border-[#a69170] focus:ring-4 focus:ring-[#ebd197]/35 disabled:bg-[#f3eee6]";

export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabaseClient();
    const callbackError = new URLSearchParams(window.location.hash.slice(1)).get("error_description");
    if (callbackError) {
      setError("重設連結無效或已過期，請重新申請。");
      setChecking(false);
      return;
    }
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) {
        setReady(true);
        setChecking(false);
      }
    });
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError("無法驗證重設連結，請重新申請。");
      setReady(Boolean(data.session));
      setChecking(false);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) {
      setError("兩次輸入的密碼不一致。");
      setBusy(false);
      return;
    }
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut({ scope: "local" });
      setComplete(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message.toLowerCase() : "";
      setError(message.includes("password") ? "新密碼未符合安全要求，請改用更長的密碼。" : "目前無法更新密碼，請重新申請重設連結。");
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <section className="rounded-[2rem] border border-stone-200 bg-white p-7 text-stone-600 shadow-sm" aria-live="polite">正在驗證重設連結…</section>;
  if (complete) return <section className="rounded-[2rem] border border-[#e3cfaa] bg-[#fffdf8] p-7 shadow-sm"><p role="status" className="text-sm font-medium text-[#5d4729]">密碼已更新，請使用新密碼登入。</p><Link href="/auth" className="mt-5 inline-flex rounded-2xl border border-[#dec692] bg-[#ebd197] px-5 py-3 font-bold text-[#30251b] hover:bg-[#f4e4bd]">返回登入</Link></section>;
  if (!ready) return <section className="rounded-[2rem] border border-[#e3cfaa] bg-[#fffdf8] p-7 shadow-sm"><p role="alert" className="text-sm font-medium text-red-800">{error || "重設連結無效或已過期，請重新申請。"}</p><Link href="/auth" className="mt-5 inline-block font-bold text-[#8f6725] underline-offset-4 hover:underline">重新申請重設信</Link></section>;
  return <form className="space-y-5 rounded-[2rem] border border-[#e3cfaa] bg-[#fffdf8] p-5 shadow-[0_24px_70px_-40px_rgba(111,78,34,0.35)] sm:p-7" onSubmit={updatePassword}><label className="block text-sm font-bold text-stone-700">新密碼<input className={fieldClass} name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /><span className="mt-2 block text-xs font-normal text-stone-500">建議使用 12 字元以上，或一段您容易記憶的長句子</span></label><label className="block text-sm font-bold text-stone-700">再次輸入新密碼<input className={fieldClass} name="confirmation" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>}<button disabled={busy} className="w-full rounded-2xl border border-[#dec692] bg-[#ebd197] px-5 py-3.5 font-bold text-[#30251b] transition hover:bg-[#f4e4bd] disabled:cursor-not-allowed disabled:opacity-60">{busy ? "更新中…" : "更新密碼"}</button></form>;
}
