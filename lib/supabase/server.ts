import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { ClassroomAuthRole } from "./browser";

function authCookieName(role: ClassroomAuthRole) {
  return `shelterlab-${role}-auth`;
}

export async function createServerSupabaseClient(requestedRole?: ClassroomAuthRole) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase 公開連線設定尚未完成。");
  const headerRole = (await headers()).get("x-shelterlab-auth-role");
  const role = requestedRole ?? (headerRole === "teacher" ? "teacher" : headerRole === "shelter" ? "shelter" : "student");
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { name: authCookieName(role) },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Middleware refreshes them.
        }
      },
    },
  });
}
