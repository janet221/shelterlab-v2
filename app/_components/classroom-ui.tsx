"use client";
import Link from "next/link";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
export const fieldClass = "mt-1 w-full rounded-xl border border-[#d8cfc3] bg-[#fffdf8] px-3 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9b8b7b] disabled:bg-[#f1ede7]";
export const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7f7165] px-5 py-3 font-bold text-white transition hover:bg-[#685c52] disabled:opacity-50";
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function api<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(path, { method: data === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json" }, ...(data === undefined ? {} : { body: JSON.stringify(data) }), cache: "no-store", credentials: "same-origin" });
  const result = await response.json(); if (!response.ok) throw new ApiError(result.error || "連線失敗，請稍後再試。", response.status); return result as T;
}
export function ClassroomNav({ teacher = false }: { teacher?: boolean }) {
  const role = teacher ? "teacher" : "student";
  const home = teacher ? "/teacher/dashboard" : "/student";
  return <nav className="sticky top-0 z-[100] border-b border-[#d8cbb8] bg-[#fffdf8]/95 shadow-[0_8px_28px_rgba(74,58,40,0.08)] backdrop-blur-xl" aria-label="班級導覽"><div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-2 px-5 py-3 text-sm font-bold sm:gap-5 lg:px-8">{teacher?<Link href="/" className="mr-2 inline-flex h-10 w-32 items-center rounded-xl px-1 transition hover:opacity-85" aria-label="ShelterLab 首頁"><Image src="/logo.png" alt="ShelterLab" width={160} height={56} priority className="h-auto w-full object-contain object-left"/></Link>:<Link href={home} className="mr-2 inline-flex items-center rounded-xl px-2 py-2 text-lg font-black tracking-tight text-[#3f554d] transition hover:bg-[#edf3ef]" aria-label="返回學生學習地圖"><span>ShelterLab</span></Link>}{teacher ? <><Link className="rounded-xl px-3 py-2 text-[#655849] transition hover:bg-[#f1eadf] hover:text-[#302820]" href="/teacher/reviews">學習進度追蹤</Link><Link className="rounded-xl px-3 py-2 text-[#655849] transition hover:bg-[#f1eadf] hover:text-[#302820]" href="/teacher/settings">班級設定</Link></> : <Link className="rounded-xl px-3 py-2 text-[#655849] transition hover:bg-[#f1eadf]" href="/student">學習地圖</Link>}<button className="ml-auto inline-flex items-center gap-2 rounded-xl border border-[#b9a78e] bg-white px-4 py-2.5 font-black text-[#594b3d] shadow-sm transition hover:border-[#8f7960] hover:bg-[#f8f1e6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8bd79]/40" onClick={async () => { try { const supabase = createBrowserSupabaseClient(role); const { error } = await supabase.auth.signOut({ scope: "local" }); if (error) throw error; await api(`/api/auth/logout?role=${role}`, {}).catch(() => undefined); window.location.assign(teacher ? "/auth?role=teacher" : "/auth?role=student"); } catch { window.alert("登出失敗，請重試。"); } }}><span aria-hidden="true">↪</span><span>登出</span></button></div></nav>;
}
