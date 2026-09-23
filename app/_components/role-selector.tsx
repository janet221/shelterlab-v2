"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getPublicRoleProfile, isPublicRoleId, publicRoleProfiles, type PublicRoleId } from "@/lib/public-site/roles";

const roleVisuals = {
  student: { fill: "bg-[#d9b45b]", soft: "bg-[#fbf3df]", bars: [28, 48, 36] },
  teacher: { fill: "bg-[#b8893e]", soft: "bg-[#f6ead0]", bars: [44, 30, 52] },
  shelter: { fill: "bg-[#8b6a3f]", soft: "bg-[#efe2ca]", bars: [34, 54, 44] }
} as const;

function RoleIllustration({ role, selected }: { role: PublicRoleId; selected: boolean }) {
  const visual = roleVisuals[role];
  return (
    <div className={`relative h-28 overflow-hidden rounded-2xl ${visual.soft}`} role="img" aria-label={`${getPublicRoleProfile(role).title}圖示`}>
      <div className="absolute left-5 top-5 h-12 w-12 rounded-full border-2 border-white bg-white/60" />
      <div className={`absolute bottom-5 left-6 h-8 w-20 rounded-t-full ${visual.fill} ${selected ? "opacity-100" : "opacity-65"}`} />
      <div className="absolute right-5 top-6 grid gap-2">
        {visual.bars.map((width, index) => <span className={`block h-2 rounded-full ${selected ? visual.fill : "bg-white/80"}`} key={index} style={{ width }} />)}
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

  useEffect(() => setSelectedRole(isPublicRoleId(queryRole) ? queryRole : null), [queryRole]);

  const selectedProfile = useMemo(() => selectedRole ? getPublicRoleProfile(selectedRole) : null, [selectedRole]);

  function selectRole(role: PublicRoleId) {
    setSelectedRole(role);
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", role);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="w-full space-y-8" aria-label="角色選擇">
      <div className="grid gap-5 md:grid-cols-3">
        {publicRoleProfiles.map((profile) => {
          const selected = selectedRole === profile.id;
          return (
            <button
              key={profile.id}
              aria-pressed={selected}
              className={`min-h-[17rem] rounded-3xl border p-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8893e] ${selected ? "scale-[1.02] border-[#b8893e] bg-white shadow-[0_18px_50px_-30px_rgba(111,78,34,0.5)]" : "border-[#e7d8ba] bg-white/95 hover:-translate-y-1 hover:border-[#d9b45b] hover:shadow-lg"}`}
              onClick={() => selectRole(profile.id)}
              type="button"
            >
              <RoleIllustration role={profile.id} selected={selected} />
              <span className="mt-4 block text-xl font-bold text-[#3c3024]">{profile.title}</span>
              <span className="mt-2 block text-sm leading-6 text-[#766858]">{profile.description}</span>
            </button>
          );
        })}
      </div>

      {selectedProfile && (
        <div className="rounded-3xl border border-[#e3cfaa] bg-[#fffdf8] p-6 shadow-[0_24px_70px_-45px_rgba(111,78,34,0.5)] sm:p-8" aria-live="polite">
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a37b35]">{source === "demo" ? "示範視角" : "角色導覽"}</p>
              <h2 className="mt-3 text-3xl font-bold text-[#332a22]">{selectedProfile.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#665848]">{selectedProfile.description}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedProfile.capabilities.map((capability) => <li className="rounded-xl border border-[#eadcbc] bg-[#fbf4e5] px-4 py-3 text-sm font-medium text-[#665848]" key={capability}>{capability}</li>)}
              </ul>
              <ol className="mt-6 grid gap-4 sm:grid-cols-3">
                {selectedProfile.journey.map((step, index) => <li className="rounded-xl border border-[#e7d8ba] bg-white p-4 text-sm" key={step}><span className="mb-2 block font-mono text-xs text-[#a37b35]">{String(index + 1).padStart(2, "0")}</span><strong className="text-[#3c3024]">{step}</strong></li>)}
              </ol>
              <Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#c99d45] px-7 py-3 text-sm font-bold text-[#30251b] shadow-sm transition hover:bg-[#ddb85f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f6725]" href={selectedProfile.primaryHref}>{selectedProfile.primaryCta} →</Link>
            </div>
            <aside className="rounded-2xl border border-[#e7d8ba] bg-[#f8edda] p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9b793d]">預覽儀表板</p>
              <h3 className="mt-2 text-lg font-bold text-[#332a22]">{selectedProfile.previewTitle}</h3>
              <div className="mt-4 grid gap-2">{selectedProfile.previewStats.map((stat) => <div className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-[#665848] shadow-sm" key={stat}>{stat}</div>)}</div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}
