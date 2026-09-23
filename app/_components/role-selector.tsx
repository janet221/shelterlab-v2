"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getPublicRoleProfile, isPublicRoleId, publicRoleProfiles, type PublicRoleId } from "@/lib/public-site/roles";

const roleVisuals = {
  student: { fill: "bg-[#7f918d]", soft: "bg-[#e9eeeb]", border: "border-[#7f918d]", hover: "hover:border-[#9caaa6]", bars: [28, 48, 36] },
  teacher: { fill: "bg-[#aa9175]", soft: "bg-[#f1ece4]", border: "border-[#aa9175]", hover: "hover:border-[#bba991]", bars: [44, 30, 52] },
  shelter: { fill: "bg-[#a7847e]", soft: "bg-[#f1e8e6]", border: "border-[#a7847e]", hover: "hover:border-[#b89c97]", bars: [34, 54, 44] }
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
          const visual = roleVisuals[profile.id];
          const cardClassName = `min-h-[17rem] rounded-3xl border p-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f8175] ${selected ? `scale-[1.02] ${visual.border} bg-white shadow-[0_18px_50px_-30px_rgba(87,76,67,0.4)]` : `border-[#ded7cc] bg-white/95 hover:-translate-y-1 ${visual.hover} hover:shadow-lg`}`;
          const cardContent = (
            <>
              <RoleIllustration role={profile.id} selected={selected} />
              <span className="mt-4 block text-xl font-bold text-[#3c3024]">{profile.title}</span>
              <span className="mt-2 block text-sm leading-6 text-[#766858]">{profile.description}</span>
            </>
          );

          if (source === "start") {
            return (
              <Link className={cardClassName} href={profile.primaryHref} key={profile.id}>
                {cardContent}
              </Link>
            );
          }

          return (
            <button
              key={profile.id}
              aria-pressed={selected}
              className={cardClassName}
              onClick={() => selectRole(profile.id)}
              type="button"
            >
              {cardContent}
            </button>
          );
        })}
      </div>

      {source === "demo" && selectedProfile && (
        <div className="rounded-3xl border border-[#e3cfaa] bg-[#fffdf8] p-6 shadow-[0_24px_70px_-45px_rgba(111,78,34,0.5)] sm:p-8" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8f7c5e]">{source === "demo" ? "示範視角" : "角色導覽"}</p>
          <h2 className="mt-3 text-3xl font-bold text-[#332a22]">{selectedProfile.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#665848]">{selectedProfile.description}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {selectedProfile.capabilities.map((capability) => <li className="rounded-xl border border-[#eadcbc] bg-[#fbf4e5] px-4 py-3 text-sm font-medium text-[#665848]" key={capability}>{capability}</li>)}
          </ul>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {selectedProfile.journey.map((step, index) => <li className="rounded-xl border border-[#e7d8ba] bg-white p-4 text-sm" key={step}><span className="mb-2 block font-mono text-xs text-[#8f7c5e]">{String(index + 1).padStart(2, "0")}</span><strong className="text-[#3c3024]">{step}</strong></li>)}
          </ol>
          <Link className={`mt-8 inline-flex min-h-12 items-center rounded-full px-7 py-3 text-sm font-bold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f8175] ${roleVisuals[selectedProfile.id].fill} hover:brightness-90`} href={selectedProfile.primaryHref}>{selectedProfile.primaryCta} →</Link>
        </div>
      )}
    </section>
  );
}
