"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";
type AccountRole = "student" | "teacher" | "shelter";
type ClassCodeResult = { classId: string; classCode: string; error?: string };
type EvaluatorAccount = { label: string; email: string; password: string };

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

async function loginWithServer(role: AccountRole, email: string, password: string) {
  const response = await fetch(`/api/auth/login?role=${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "same-origin",
    cache: "no-store"
  });
  const result = await response.json() as { account?: { role: AccountRole }; error?: string };
  if (!response.ok || result.account?.role !== role) throw new Error(result.error || "登入憑證未能建立，請重試。");
}

export default function AuthForm({ role, initialMode = "login", evaluatorEnabled = false }: { role: AccountRole; initialMode?: Mode; evaluatorEnabled?: boolean }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [evaluatorOpen, setEvaluatorOpen] = useState(false);
  const [evaluatorAccounts, setEvaluatorAccounts] = useState<EvaluatorAccount[]>([]);
  const roleLabel = role === "teacher" ? "教師" : role === "shelter" ? "收容所" : "學生";

  function changeMode(nextMode: Mode) {
    setMode(nextMode); setRecovery(false); setError(""); setNotice("");
  }

  async function toggleEvaluatorAccounts() {
    if (evaluatorOpen) { setEvaluatorOpen(false); return; }
    setMode("login"); setRecovery(false); setError("");
    if (evaluatorAccounts.length === 0) {
      try {
        const response = await fetch(`/api/auth/evaluator-accounts?role=${role}`, { credentials: "same-origin", cache: "no-store" });
        const result = await response.json() as { accounts?: EvaluatorAccount[]; error?: string };
        if (!response.ok || !result.accounts?.length) throw new Error(result.error || "評審體驗帳號暫時無法載入。");
        setEvaluatorAccounts(result.accounts);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "評審體驗帳號暫時無法載入。");
        return;
      }
    }
    setEvaluatorOpen(true);
  }

  async function selectEvaluatorAccount(account: EvaluatorAccount) {
    setMode("login"); setRecovery(false); setEmailValue(account.email); setPasswordValue(account.password);
    setNotice(`正在登入${account.label}…`); setError(""); setEvaluatorOpen(false); setBusy(true);
    try {
      await loginWithServer(role, account.email, account.password);
      window.location.assign(role === "teacher" ? "/teacher/dashboard" : role === "shelter" ? "/shelter" : "/student");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "評審快速登入失敗，請稍後再試。");
      setNotice("");
      setEvaluatorOpen(true);
    } finally { setBusy(false); }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    try {
      const supabase = createBrowserSupabaseClient(role);
      if (mode === "signup") {
        if (role === "shelter") {
          const response=await fetch("/api/auth/shelter-signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,partnershipCode:String(form.get("partnershipCode")||"").trim()})});
          const result=await response.json() as {error?:string}; if(!response.ok)throw new Error(result.error||"目前無法建立收容所帳號。");
          await loginWithServer(role,email,password); window.location.assign("/shelter"); return;
        }
        if (role === "teacher") {
          await registerTeacher(email, password, String(form.get("invitationCode") || "").trim());
          await loginWithServer(role, email, password);
          window.location.assign("/teacher/settings"); return;
        }
        const validatedClass = await validateClassCode(String(form.get("classCode") || "").trim().toUpperCase());
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { class_code: validatedClass.classCode, class_id: validatedClass.classId } } });
        if (signUpError) throw signUpError;
        setSuccessToast("已成功加入班級");
        if (!data.session) {
          setNotice("帳號已建立。請前往信箱完成驗證後，再使用 Email 與密碼登入。"); formElement.reset(); setEmailValue(""); setPasswordValue(""); return;
        }
        await loginWithServer(role, email, password);
        window.setTimeout(() => window.location.assign("/student"), 1200); return;
      }

      await loginWithServer(role, email, password);
      window.location.assign(role === "teacher" ? "/teacher/dashboard" : role === "shelter" ? "/shelter" : "/student");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      const known = ["班級代碼", "教師邀請碼", "暫時無法", "無法讀取", "這不是", "此電子郵件", "電子郵件或密碼", "登入憑證", "目前無法建立"];
      setError(known.some((prefix) => message.startsWith(prefix)) ? message : authErrorMessage(message));
    } finally { setBusy(false); }
  }

  async function sendRecoveryEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const email = String(new FormData(event.currentTarget).get("email") || "").trim().toLowerCase();
    try {
      const supabase = createBrowserSupabaseClient(role);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password?role=${role}` });
      if (resetError) throw resetError;
      setNotice("若此電子郵件已註冊，我們會寄出密碼重設信。請檢查收件匣與垃圾郵件匣。");
    } catch { setError("目前無法寄送重設信，請稍後再試。"); } finally { setBusy(false); }
  }

  return <section className="rounded-[2rem] border border-[#e3cfaa] bg-[#fffdf8] p-5 shadow-[0_24px_70px_-40px_rgba(111,78,34,0.32)] sm:p-7">
    {successToast && <div role="status" className="fixed right-5 top-24 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border border-[#c9b9a2] bg-[#f7f1e8] px-5 py-4 font-bold text-[#51473e] shadow-xl"><span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#87958e] text-sm text-white">✓</span><span>{successToast}</span><button type="button" className="ml-2 text-[#776b61]" aria-label="關閉成功提示" onClick={() => setSuccessToast("")}>×</button></div>}
    <div className="grid grid-cols-2 rounded-full bg-[#f3eadb] p-1" role="tablist" aria-label="帳號操作">
      {(["login", "signup"] as const).map((tab) => { const selected = mode === tab && !recovery; return <button type="button" role="tab" aria-selected={selected} className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all ${selected ? "bg-white text-[#5f5142] shadow-sm" : "text-[#7f705e] hover:text-[#3c3024]"}`} onClick={() => changeMode(tab)} key={tab}>{tab === "login" ? "登入" : "建立帳號"}</button>; })}
    </div>
    {evaluatorEnabled && !recovery && <div className="mt-5 rounded-2xl border border-[#d8bd79] bg-[#fff8df] p-4 shadow-sm">
      <button type="button" onClick={toggleEvaluatorAccounts} className="flex w-full items-center justify-between gap-3 text-left font-bold text-[#5b4521]" aria-expanded={evaluatorOpen}>
        <span><span aria-hidden="true">⚡</span> 評審快速登入專區</span><span aria-hidden="true">{evaluatorOpen ? "收合" : "選擇帳號"}</span>
      </button>
      {evaluatorOpen && <div className="mt-3 space-y-2 border-t border-[#e4d19e] pt-3">
        <div className="grid gap-2 sm:grid-cols-2">{evaluatorAccounts.map((account, index) => {
          const buttonLabel = account.label === "教師帳號" ? "登入教師帳號" : `登入${account.label.replace(/\s+/g, "")}帳號`;
          const tooltipId = `evaluator-account-${index}`;
          return <div key={account.email} className="group relative">
            <button disabled={busy} type="button" aria-describedby={tooltipId} onClick={() => void selectEvaluatorAccount(account)} className="w-full rounded-xl border border-[#d8bd79] bg-white px-3 py-2.5 text-sm font-bold text-[#5b4521] transition hover:bg-[#fff3c9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8bd79]/40 disabled:opacity-60">{busy ? "登入中…" : buttonLabel}</button>
            <div id={tooltipId} role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-30 hidden w-max max-w-[min(24rem,calc(100vw-4rem))] -translate-x-1/2 rounded-xl border border-[#d8bd79] bg-[#3f3428] px-4 py-3 text-left text-xs font-medium leading-5 text-white shadow-xl group-hover:block group-focus-within:block">
              <strong className="block text-sm text-[#ffe7a8]">{buttonLabel}</strong>
              <span className="mt-1 block break-all">Email：{account.email}</span>
              <span className="block break-all">密碼：{account.password}</span>
              <span aria-hidden="true" className="absolute left-1/2 top-full -translate-x-1/2 border-[7px] border-transparent border-t-[#3f3428]" />
            </div>
          </div>;
        })}</div>
      </div>}
    </div>}
    {recovery ? <form className="mt-7 space-y-5" onSubmit={sendRecoveryEmail}>
      <div><h2 className="text-xl font-bold text-stone-900">重設密碼</h2><p className="mt-2 text-sm leading-6 text-stone-600">輸入註冊用電子郵件，我們會寄送安全的密碼重設連結。</p></div>
      <label className="block text-sm font-bold text-stone-700">電子郵件<input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <Status error={error} notice={notice} /><button disabled={busy} className={primaryButtonClass}>{busy ? "寄送中…" : "發送重設信"}</button>
      <button type="button" className="w-full text-sm font-bold text-[#806b49] underline-offset-4 hover:underline" onClick={() => changeMode("login")}>返回登入</button>
    </form> : <form className="mt-7 space-y-5" onSubmit={submitAuth}>
      <label className="block text-sm font-bold text-stone-700">Email<input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} value={emailValue} onChange={(event) => setEmailValue(event.target.value)} /></label>
      <label className="block text-sm font-bold text-stone-700"><span className="flex items-end justify-between gap-4"><span>密碼</span>{mode === "login" && <button type="button" className="text-xs font-bold text-[#806b49] underline-offset-4 hover:underline" onClick={() => { setRecovery(true); setError(""); setNotice(""); }}>忘記密碼？</button>}</span><input className={fieldClass} name="password" type="password" minLength={mode === "signup" ? 8 : undefined} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={passwordValue} onChange={(event) => setPasswordValue(event.target.value)} /></label>
      {role === "student" && mode === "signup" && <label className="block text-sm font-bold text-stone-700">班級代碼<input className={`${fieldClass} uppercase`} name="classCode" required minLength={8} maxLength={64} pattern="[A-Za-z0-9][A-Za-z0-9-]{7,63}" autoComplete="off" spellCheck={false} /><span className="mt-2 block text-xs font-normal text-stone-500">請向授課教師索取班級代碼以加入班級。</span></label>}
      {role === "teacher" && mode === "signup" && <label className="block text-sm font-bold text-stone-700">教師邀請碼<input className={fieldClass} name="invitationCode" type="password" required maxLength={128} autoComplete="off" placeholder="請輸入管理單位提供的邀請碼" /></label>}
      {role === "shelter" && mode === "signup" && <label className="block text-sm font-bold text-stone-700">收容所合作代碼<input className={fieldClass} name="partnershipCode" type="password" required maxLength={128} autoComplete="off" placeholder="請輸入管理單位提供的機構授權碼" /></label>}
      <Status error={error} notice={notice} /><button disabled={busy} className={primaryButtonClass}>{busy ? "處理中…" : mode === "signup" ? `建立${roleLabel}帳號` : `${roleLabel}登入`}</button>
    </form>}
  </section>;
}

function Status({ error, notice }: { error: string; notice: string }) {
  if (error) return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>;
  if (notice) return <p role="status" className="rounded-xl border border-[#e1d2b8] bg-[#f8f1e5] px-4 py-3 text-sm font-medium text-[#5d5145]">{notice}</p>;
  return null;
}
