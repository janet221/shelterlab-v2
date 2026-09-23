"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";
type AccountRole = "student" | "teacher";
type ClassCodeResult = { classId: string; classCode: string; error?: string };

const fieldClass = "mt-2 w-full rounded-2xl border border-[#d8c8ab] bg-[#fffdf8] px-4 py-3.5 text-[#332a22] shadow-sm outline-none transition placeholder:text-[#a99b89] focus:border-[#a69170] focus:ring-4 focus:ring-[#ebd197]/35 disabled:bg-[#f3eee6]";
const primaryButtonClass = "w-full rounded-2xl border border-[#dec692] bg-[#ebd197] px-5 py-3.5 font-bold text-[#30251b] transition hover:bg-[#f4e4bd] disabled:cursor-not-allowed disabled:opacity-60";

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "電子郵件或密碼不正確。";
  if (normalized.includes("email not confirmed")) return "請先完成電子郵件驗證後再登入。";
  if (normalized.includes("user already registered") || normalized.includes("already been registered")) return "此電子郵件已經註冊，請直接登入。";
  if (normalized.includes("password")) return "密碼未符合安全要求，請改用更長的密碼。";
  return "目前無法完成操作，請稍後再試。";
}

async function validateClassCode(classCode: string) {
  const response = await fetch("/api/auth/class-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classCode }) });
  const result = await response.json() as ClassCodeResult;
  if (!response.ok) throw new Error(result.error || "暫時無法驗證班級代碼，請稍後再試。");
  return result;
}

async function registerTeacher(email: string, password: string, invitationCode: string) {
  const response = await fetch("/api/auth/teacher-signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, invitationCode }) });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error || "目前無法建立教師帳號，請稍後再試。");
}

export default function AuthForm({ role }: { role: AccountRole }) {
  const [mode, setMode] = useState<Mode>("login");
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const roleLabel = role === "teacher" ? "教師" : "學生";

  function changeMode(nextMode: Mode) {
    setMode(nextMode); setRecovery(false); setError(""); setNotice("");
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    try {
      const supabase = createBrowserSupabaseClient();
      if (mode === "signup") {
        if (role === "teacher") {
          await registerTeacher(email, password, String(form.get("invitationCode") || "").trim());
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          window.location.assign("/teacher/settings"); return;
        }
        const validatedClass = await validateClassCode(String(form.get("classCode") || "").trim().toUpperCase());
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { class_code: validatedClass.classCode, class_id: validatedClass.classId } } });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("帳號已建立。請前往信箱完成驗證後，再使用 Email 與密碼登入。"); formElement.reset(); return;
        }
        window.location.assign("/student"); return;
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !data.user) throw loginError || new Error("登入失敗");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profileError || !profile) { await supabase.auth.signOut(); throw new Error("無法讀取帳號資料，請聯絡系統管理員。"); }
      if (profile.role !== role) { await supabase.auth.signOut(); throw new Error(`這不是${roleLabel}帳號，請從正確的角色入口登入。`); }
      window.location.assign(role === "teacher" ? "/teacher/dashboard" : "/student");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      const known = ["班級代碼", "教師邀請碼", "暫時無法", "無法讀取", "這不是", "此電子郵件", "目前無法建立"];
      setError(known.some((prefix) => message.startsWith(prefix)) ? message : authErrorMessage(message));
    } finally { setBusy(false); }
  }

  async function sendRecoveryEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const email = String(new FormData(event.currentTarget).get("email") || "").trim().toLowerCase();
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
      if (resetError) throw resetError;
      setNotice("若此電子郵件已註冊，我們會寄出密碼重設信。請檢查收件匣與垃圾郵件匣。");
    } catch { setError("目前無法寄送重設信，請稍後再試。"); } finally { setBusy(false); }
  }

  return <section className="rounded-[2rem] border border-[#e3cfaa] bg-[#fffdf8] p-5 shadow-[0_24px_70px_-40px_rgba(111,78,34,0.32)] sm:p-7">
    <div className="grid grid-cols-2 rounded-full bg-[#f3eadb] p-1" role="tablist" aria-label="帳號操作">
      {(["login", "signup"] as const).map((tab) => { const selected = mode === tab && !recovery; return <button type="button" role="tab" aria-selected={selected} className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all ${selected ? "bg-white text-[#5f5142] shadow-sm" : "text-[#7f705e] hover:text-[#3c3024]"}`} onClick={() => changeMode(tab)} key={tab}>{tab === "login" ? "登入" : "建立帳號"}</button>; })}
    </div>
    {recovery ? <form className="mt-7 space-y-5" onSubmit={sendRecoveryEmail}>
      <div><h2 className="text-xl font-bold text-stone-900">重設密碼</h2><p className="mt-2 text-sm leading-6 text-stone-600">輸入註冊用電子郵件，我們會寄送安全的密碼重設連結。</p></div>
      <label className="block text-sm font-bold text-stone-700">電子郵件<input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <Status error={error} notice={notice} /><button disabled={busy} className={primaryButtonClass}>{busy ? "寄送中…" : "發送重設信"}</button>
      <button type="button" className="w-full text-sm font-bold text-[#806b49] underline-offset-4 hover:underline" onClick={() => changeMode("login")}>返回登入</button>
    </form> : <form className="mt-7 space-y-5" onSubmit={submitAuth}>
      {mode === "signup" && role === "teacher" && <p className="rounded-2xl border border-[#e1d2b8] bg-[#f8f1e5] px-4 py-3 text-sm leading-6 text-[#5d5145]">教師帳號需使用管理單位提供的邀請碼驗證。註冊完成後，可在教師設定建立學生使用的班級代碼。</p>}
      <label className="block text-sm font-bold text-stone-700">Email<input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label className="block text-sm font-bold text-stone-700"><span className="flex items-end justify-between gap-4"><span>密碼</span>{mode === "login" && <button type="button" className="text-xs font-bold text-[#806b49] underline-offset-4 hover:underline" onClick={() => { setRecovery(true); setError(""); setNotice(""); }}>忘記密碼？</button>}</span><input className={fieldClass} name="password" type="password" minLength={mode === "signup" ? 8 : undefined} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} required />{mode === "signup" && <span className="mt-2 block text-xs font-normal text-stone-500">建議使用 12 字元以上，或一段您容易記憶的長句子</span>}</label>
      {role === "student" && mode === "signup" && <label className="block text-sm font-bold text-stone-700">班級代碼<input className={`${fieldClass} uppercase`} name="classCode" required minLength={8} maxLength={64} pattern="[A-Za-z0-9][A-Za-z0-9-]{7,63}" autoComplete="off" placeholder="SHELTER-2026" spellCheck={false} /><span className="mt-2 block text-xs font-normal text-stone-500">請向授課教師索取；註冊時也會核對帳號所屬班級。</span></label>}
      {role === "teacher" && mode === "signup" && <label className="block text-sm font-bold text-stone-700">教師邀請碼<input className={fieldClass} name="invitationCode" type="password" required maxLength={128} autoComplete="off" placeholder="請輸入管理單位提供的邀請碼" /><span className="mt-2 block text-xs font-normal text-stone-500">邀請碼僅用於驗證教師身分，不會成為學生的班級代碼。</span></label>}
      <Status error={error} notice={notice} /><button disabled={busy} className={primaryButtonClass}>{busy ? "處理中…" : mode === "signup" ? `建立${roleLabel}帳號` : `${roleLabel}登入`}</button>
    </form>}
  </section>;
}

function Status({ error, notice }: { error: string; notice: string }) {
  if (error) return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>;
  if (notice) return <p role="status" className="rounded-xl border border-[#e1d2b8] bg-[#f8f1e5] px-4 py-3 text-sm font-medium text-[#5d5145]">{notice}</p>;
  return null;
}
