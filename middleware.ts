import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type AuthRole = "student" | "teacher" | "shelter";

function requestAuthRole(request: NextRequest): AuthRole {
  const path = request.nextUrl.pathname;
  const queryRole = request.nextUrl.searchParams.get("role");
  if (path.startsWith("/teacher") || path.startsWith("/api/teacher")) return "teacher";
  if (path.startsWith("/shelter") || path.startsWith("/api/shelter")) return "shelter";
  if (path.startsWith("/student")) return "student";
  if (path.startsWith("/api/classroom/progress") || path.startsWith("/api/classroom/weeks/") || path.startsWith("/api/classroom/profile") || path.startsWith("/api/classroom/rewards/")) return "student";
  if (path.startsWith("/api/classroom/")) return "teacher";
  return queryRole === "teacher" ? "teacher" : queryRole === "shelter" ? "shelter" : "student";
}

export async function middleware(request: NextRequest) {
  const role = requestAuthRole(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-shelterlab-auth-role", role);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookieOptions: { name: `shelterlab-${role}-auth` },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set("cookie", request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
