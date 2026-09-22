"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const fieldClass = "mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-stone-900 shadow-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 disabled:bg-stone-100";

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
  if (complete) return <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm"><p role="status" className="text-sm font-medium text-teal-900">密碼已更新，請使用新密碼登入。</p><Link href="/auth" className="mt-5 inline-flex rounded-2xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-900">返回登入</Link></section>;
  if (!ready) return <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm"><p role="alert" className="text-sm font-medium text-red-800">{error || "重設連結無效或已過期，請重新申請。"}</p><Link href="/auth" className="mt-5 inline-block font-bold text-teal-800 underline-offset-4 hover:underline">重新申請重設信</Link></section>;
  return <form className="space-y-5 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,118,110,0.45)] sm:p-7" onSubmit={updatePassword}><label className="block text-sm font-bold text-stone-700">新密碼<input className={fieldClass} name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /><span className="mt-2 block text-xs font-normal text-stone-500">建議使用 12 字元以上，或一段您容易記憶的長句子</span></label><label className="block text-sm font-bold text-stone-700">再次輸入新密碼<input className={fieldClass} name="confirmation" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>}<button disabled={busy} className="w-full rounded-2xl bg-teal-800 px-5 py-3.5 font-bold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "更新中…" : "更新密碼"}</button></form>;
}
