"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";
type ClassCodeResult = { classId: string; classCode: string; error?: string };

const fieldClass = "mt-2 w-full rounded-2xl border border-[#dbc69f] bg-[#fffdf8] px-4 py-3.5 text-[#332a22] shadow-sm outline-none transition placeholder:text-[#a99b89] focus:border-[#b8893e] focus:ring-4 focus:ring-[#d9b45b]/20 disabled:bg-[#f3eadc]";

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "電子郵件或密碼不正確。";
  if (normalized.includes("email not confirmed")) return "請先完成電子郵件驗證後再登入。";
  if (normalized.includes("user already registered")) return "此電子郵件已經註冊，請直接登入。";
  if (normalized.includes("password")) return "密碼未符合安全要求，請改用更長的密碼。";
  if (normalized.includes("database error")) return "班級代碼無效或已過期";
  return "目前無法完成操作，請稍後再試。";
}

async function validateClassCode(classCode: string) {
  const response = await fetch("/api/auth/class-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classCode }),
  });
  const result = await response.json() as ClassCodeResult;
  if (!response.ok) throw new Error(result.error || "暫時無法驗證班級代碼，請稍後再試。");
  return result;
}

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setRecovery(false);
    setError("");
    setNotice("");
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    try {
      const supabase = createBrowserSupabaseClient();
      if (mode === "signup") {
        const classCode = String(form.get("classCode") || "").trim().toUpperCase();
        const validatedClass = await validateClassCode(classCode);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { class_code: validatedClass.classCode, class_id: validatedClass.classId } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("帳號已建立。請前往信箱完成驗證後再登入。");
          event.currentTarget.reset();
          return;
        }
        window.location.assign("/student");
        return;
      }
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !data.user) throw loginError || new Error("登入失敗");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("無法讀取帳號資料，請聯絡系統管理員。");
      }
      const destination = profile.role === "teacher" ? "/teacher/dashboard" : profile.role === "shelter" ? "/shelter" : "/student";
      window.location.assign(destination);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message.startsWith("班級代碼") || message.startsWith("暫時無法") || message.startsWith("無法讀取") ? message : authErrorMessage(message));
    } finally {
      setBusy(false);
    }
  }

  async function sendRecoveryEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const email = String(new FormData(event.currentTarget).get("email") || "").trim().toLowerCase();
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setNotice("若此電子郵件已註冊，我們會寄出密碼重設信。請檢查收件匣與垃圾郵件匣。");
    } catch {
      setError("目前無法寄送重設信，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  return <section className="rounded-[2rem] border border-[#e3cfaa] bg-[#fffdf8] p-5 shadow-[0_24px_70px_-40px_rgba(111,78,34,0.45)] sm:p-7">
    <div className="grid grid-cols-2 rounded-full bg-[#f3e7d0] p-1" role="tablist" aria-label="帳號操作">
      {(["login", "signup"] as const).map((tab) => { const selected = mode === tab && !recovery; return <button type="button" role="tab" aria-selected={selected} className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all ${selected ? "bg-white text-[#5f451e] shadow-sm" : "text-[#7f705e] hover:text-[#3c3024]"}`} onClick={() => changeMode(tab)} key={tab}>{tab === "login" ? "登入" : "建立帳號"}</button>; })}
    </div>
    {recovery ? <form className="mt-7 space-y-5" onSubmit={sendRecoveryEmail}>
      <div><h2 className="text-xl font-bold text-stone-900">重設密碼</h2><p className="mt-2 text-sm leading-6 text-stone-600">輸入註冊用電子郵件，我們會寄送安全的密碼重設連結。</p></div>
      <label className="block text-sm font-bold text-stone-700">電子郵件<input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <Status error={error} notice={notice} />
      <button disabled={busy} className="w-full rounded-2xl bg-[#c99d45] px-5 py-3.5 font-bold text-[#30251b] transition hover:bg-[#ddb85f] disabled:cursor-not-allowed disabled:opacity-60">{busy ? "寄送中…" : "發送重設信"}</button>
      <button type="button" className="w-full text-sm font-bold text-[#8f6725] underline-offset-4 hover:underline" onClick={() => changeMode("login")}>返回登入</button>
    </form> : <form className="mt-7 space-y-5" onSubmit={submitAuth}>
      {mode === "signup" && <p className="rounded-2xl border border-[#ead7ae] bg-[#fbf1dc] px-4 py-3 text-sm leading-6 text-[#5d4729]">學生與教師使用個人帳號保存學習紀錄。請輸入教師提供的班級代碼後完成註冊，即可展開第一週探究任務。</p>}
      <label className="block text-sm font-bold text-stone-700">Email<input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label className="block text-sm font-bold text-stone-700"><span className="flex items-end justify-between gap-4"><span>密碼</span>{mode === "login" && <button type="button" className="text-xs font-bold text-[#8f6725] underline-offset-4 hover:underline" onClick={() => { setRecovery(true); setError(""); setNotice(""); }}>忘記密碼？</button>}</span><input className={fieldClass} name="password" type="password" minLength={mode === "signup" ? 8 : undefined} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} required />{mode === "signup" && <span className="mt-2 block text-xs font-normal text-stone-500">建議使用 12 字元以上，或一段您容易記憶的長句子</span>}</label>
      {mode === "signup" && <label className="block text-sm font-bold text-stone-700">班級代碼<input className={`${fieldClass} uppercase`} name="classCode" required maxLength={64} autoComplete="off" placeholder="SHELTER-2026" spellCheck={false} /></label>}
      <Status error={error} notice={notice} />
      <button disabled={busy} className="w-full rounded-2xl bg-[#c99d45] px-5 py-3.5 font-bold text-[#30251b] transition hover:bg-[#ddb85f] disabled:cursor-not-allowed disabled:opacity-60">{busy ? "處理中…" : mode === "signup" ? "建立帳號" : "登入"}</button>
    </form>}
  </section>;
}

function Status({ error, notice }: { error: string; notice: string }) {
  if (error) return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>;
  if (notice) return <p role="status" className="rounded-xl bg-[#fbf1dc] px-4 py-3 text-sm font-medium text-[#5d4729]">{notice}</p>;
  return null;
}
