import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { invitationCodeMatches, TEACHER_INVITATION_CODE } from "@/lib/auth/invitation";

const read = (path: string) => readFileSync(path, "utf8");

describe("teacher invitation verification", () => {
  it("accepts only the exact configured invitation code", () => {
    expect(TEACHER_INVITATION_CODE).toBe("shelter2026");
    expect(invitationCodeMatches("shelter2026")).toBe(true);
    expect(invitationCodeMatches("SHELTER2026")).toBe(false);
    expect(invitationCodeMatches("WRONG-CODE")).toBe(false);
  });

  it("preserves refreshed Supabase sessions and handles expired student sessions once", () => {
    const middleware = read("middleware.ts");
    const classroomUi = read("app/_components/classroom-ui.tsx");
    const classroomMap = read("app/student/_components/classroom-map.tsx");
    const learningProgress = read("app/student/_components/student-learning-progress.tsx");
    const browserClient = read("lib/supabase/browser.ts");
    const serverClient = read("lib/supabase/server.ts");
    const authForm = read("app/auth/auth-form.tsx");
    const authRoute = read("app/api/auth/[action]/route.ts");
    const resetPassword = read("app/auth/reset-password/reset-password-form.tsx");

    expect(middleware).toContain("setAll: (cookiesToSet, headers)");
    expect(middleware).toContain("Object.entries(headers)");
    expect(middleware).toContain("supabase.auth.getClaims()");
    expect(middleware).not.toContain("refresh_token_already_used");
    expect(classroomUi).toContain('credentials: "same-origin"');
    expect(classroomMap).toContain("authRedirecting.current");
    expect(classroomMap).toContain('window.location.replace("/auth?role=student")');
    expect(learningProgress).toContain('pathname==="/student"?undefined:setInterval');
    expect(browserClient).toContain("shelterlab-${role}-auth");
    expect(browserClient).toContain("isSingleton: false");
    expect(serverClient).toContain("x-shelterlab-auth-role");
    expect(serverClient).toContain("cookieOptions: { name: authCookieName(role) }");
    expect(middleware).toContain("requestAuthRole(request)");
    expect(middleware).toContain("shelterlab-${role}-auth");
    expect(middleware).toContain('requestHeaders.set("cookie", request.cookies.toString())');
    expect(authForm).toContain('/auth/reset-password?role=${role}');
    expect(authForm).toContain('/api/auth/login?role=${role}');
    expect(authForm).not.toContain("supabase.auth.signInWithPassword");
    expect(authRoute).toContain("supabase.auth.signInWithPassword(credentials)");
    expect(authRoute).toContain('signOut({ scope: "local" })');
    expect(classroomUi).toContain('signOut({ scope: "local" })');
    expect(classroomMap).toContain("cause.status === 401");
    expect(classroomMap).not.toContain("cause.status === 401 || cause.status === 403");
    expect(resetPassword).toContain("createBrowserSupabaseClient(role)");
  });

  it("exposes evaluator shortcuts only with an explicit switch or complete evaluator configuration", () => {
    const authPage = read("app/auth/page.tsx");
    const authForm = read("app/auth/auth-form.tsx");
    const authRoute = read("app/api/auth/[action]/route.ts");
    const auth = read("lib/classroom/auth.ts");

    expect(authPage).toContain("isEvaluatorDemoEnabled()");
    expect(authForm).toContain("評審快速登入專區");
    expect(authForm).toContain("evaluator-accounts?role=${role}");
    expect(authForm).toContain("登入教師帳號");
    expect(authForm).toContain('`登入${account.label.replace(/\\s+/g, "")}帳號`');
    expect(authForm).toContain('role="tooltip"');
    expect(authForm).toContain("Email：{account.email}");
    expect(authForm).toContain("密碼：{account.password}");
    expect(authForm).toContain("await loginWithServer(role, account.email, account.password)");
    expect(authForm).not.toContain("選擇後只會帶入欄位");
    expect(authForm).not.toContain("測試班級：");
    expect(authRoute).toContain('action === "evaluator-accounts"');
    expect(auth).toContain('if (setting === "false") return false');
    expect(auth).toContain('if (setting === "true") return true');
    expect(auth).toContain("process.env.EVALUATOR_SHELTER_PASSWORD");
    expect(auth).toContain("EVALUATOR_STUDENT_EMAILS");
  });
});
