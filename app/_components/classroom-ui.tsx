"use client";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
export const fieldClass = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-stone-100";
export const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-900 disabled:opacity-50";
export async function api<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(path, { method: data === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json" }, ...(data === undefined ? {} : { body: JSON.stringify(data) }), cache: "no-store" });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || "連線失敗，請稍後再試。"); return result as T;
}
export function ClassroomNav({ teacher = false }: { teacher?: boolean }) {
  return <nav className="flex flex-wrap items-center gap-4 border-b border-stone-200 bg-white px-5 py-4 text-sm font-bold" aria-label="班級導覽"><Link href="/">ShelterLab</Link>{teacher ? <><Link href="/teacher/dashboard">課程工作台</Link><Link href="/teacher/lesson-generator">在地教案產生器</Link><Link href="/teacher/reviews">待審作業</Link><Link href="/teacher/settings">設定</Link></> : <Link href="/student">學習地圖</Link>}<button className="ml-auto underline" onClick={async () => { try { const supabase = createBrowserSupabaseClient(); const { error } = await supabase.auth.signOut(); if (error) throw error; await api("/api/auth/logout", {}).catch(() => undefined); window.location.href = "/auth"; } catch { window.alert("登出失敗，請重試。"); } }}>登出</button></nav>;
}
