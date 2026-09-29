import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClassroomAuthRole = "student" | "teacher" | "shelter";
const browserClients: Partial<Record<ClassroomAuthRole, SupabaseClient>> = {};

export function authCookieName(role: ClassroomAuthRole) {
  return `shelterlab-${role}-auth`;
}

function publicSupabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function createBrowserSupabaseClient(role: ClassroomAuthRole = "student") {
  if (browserClients[role]) return browserClients[role]!;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicSupabaseKey();
  if (!url || !key) throw new Error("Supabase 公開連線設定尚未完成。");
  browserClients[role] = createBrowserClient(url, key, { cookieOptions: { name: authCookieName(role) }, isSingleton: false });
  return browserClients[role]!;
}
