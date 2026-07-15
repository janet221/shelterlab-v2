"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicRoleProfile,
  isPublicRoleId,
  publicRoleProfiles,
  type PublicRoleId
} from "@/lib/public-site/roles";

const accentClasses = {
  teal: { card: "bg-white", text: "text-[#332D28]", fill: "bg-[#4D8C7D]", soft: "bg-[#E6F0EE]" },
  amber: { card: "bg-white", text: "text-[#332D28]", fill: "bg-[#C49A6C]", soft: "bg-[#F5EFE6]" },
  rose: { card: "bg-white", text: "text-[#332D28]", fill: "bg-[#B47B7B]", soft: "bg-[#F5E6E6]" },
  sky: { card: "bg-white", text: "text-[#332D28]", fill: "bg-[#7B9BB4]", soft: "bg-[#E6EEF5]" }
} as const;

function RoleIllustration({ role, selected }: { role: PublicRoleId; selected: boolean }) {
  const accent = accentClasses[getPublicRoleProfile(role).accent];
  const bars = role === "student" ? [28, 48, 36] : role === "teacher" ? [44, 30, 52] : role === "shelter" ? [34, 54, 44] : [52, 38, 30];

  return (
    <div className={`relative h-28 overflow-hidden rounded-2xl ${accent.soft}`} role="img">
      <div className="absolute left-5 top-5 h-12 w-12 rounded-full border-2 border-white bg-white/50" />
      <div className={`absolute bottom-5 left-6 h-8 w-20 rounded-t-full ${accent.fill} ${selected ? "opacity-100" : "opacity-60"}`} />
      <div className="absolute right-5 top-6 grid gap-2">
        {bars.map((width, index) => (
          <span className={`block h-2 rounded-full ${selected ? accent.fill : "bg-white/70"}`} key={index} style={{ width }} />
        ))}
      </div>
    </div>
  );
}

export function RoleSelector({ initialRole = null, source = "start" }: { initialRole?: PublicRoleId | null; source?: "start" | "demo" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState<PublicRoleId | null>(initialRole);

  useEffect(() => {
    setSelectedRole(isPublicRoleId(queryRole) ? queryRole : null);
  }, [queryRole]);

  const selectedProfile = useMemo(() => (selectedRole ? getPublicRoleProfile(selectedRole) : null), [selectedRole]);

  function selectRole(role: PublicRoleId) {
    setSelectedRole(role);
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", role);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="w-full space-y-8" aria-label="角色選擇">
      {/* 角色按鈕區塊 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {publicRoleProfiles.map((profile) => {
          const selected = selectedRole === profile.id;
          return (
            <button
              key={profile.id}
              aria-pressed={selected}
              className={`min-h-[17rem] rounded-3xl border border-[#E8E2DD] p-4 text-left transition-all duration-300 ${
                selected 
                  ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] scale-[1.02] border-[#332D28]" 
                  : "bg-white hover:border-[#D7D0CC] hover:shadow-md"
              }`}
              onClick={() => selectRole(profile.id)}
              type="button"
            >
              <RoleIllustration role={profile.id} selected={selected} />
              <span className={`mt-4 block text-xl font-bold ${selected ? "text-[#332D28]" : "text-[#5D5753]"}`}>{profile.title}</span>
              <span className="mt-2 block text-sm leading-6 text-[#A39E9B]">{profile.description}</span>
            </button>
          );
        })}
      </div>

      {/* 詳情預覽區塊：僅在選擇角色後顯示 */}
      {selectedProfile && (
        <div className="rounded-3xl border border-[#E8E2DD] bg-white p-8 shadow-sm" aria-live="polite">
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#A39E9B]">{source === "demo" ? "示範視角" : "角色導覽"}</p>
              <h2 className="mt-3 text-3xl font-bold text-[#332D28]">{selectedProfile.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#5D5753]">{selectedProfile.description}</p>
              
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedProfile.capabilities.map((cap) => (
                  <li className="rounded-xl border border-[#E8E2DD] bg-[#F7F4F0]/50 px-4 py-3 text-sm font-medium text-[#5D5753]" key={cap}>
                    {cap}
                  </li>
                ))}
              </ul>

              <ol className="mt-6 grid gap-4 sm:grid-cols-3">
                {selectedProfile.journey.map((step, index) => (
                  <li className="rounded-xl border border-[#E8E2DD] p-4 text-sm" key={step}>
                    <span className="block font-mono text-xs text-[#A39E9B] mb-2">{String(index + 1).padStart(2, "0")}</span>
                    <strong className="text-[#332D28]">{step}</strong>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <Link
                  className="inline-flex items-center rounded-xl bg-[#332D28] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#4A4440]"
                  href={selectedProfile.primaryHref}
                >
                  {selectedProfile.primaryCta} →
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#E8E2DD] bg-[#F7F4F0] p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A39E9B]">預覽儀表板</p>
              <h3 className="mt-2 text-lg font-bold text-[#332D28]">{selectedProfile.previewTitle}</h3>
              <div className="mt-4 grid gap-2">
                {selectedProfile.previewStats.map((stat) => (
                  <div className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-[#5D5753] shadow-sm" key={stat}>{stat}</div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}