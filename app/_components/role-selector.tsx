import Link from "next/link";
import { publicRoleProfiles, type PublicRoleId } from "@/lib/public-site/roles";
export function RoleSelector(_props: { initialRole?: PublicRoleId | null; source?: "start" | "demo" }) {
 return <section aria-label="角色選擇" className="grid gap-5 md:grid-cols-3">{publicRoleProfiles.map((profile,index)=><Link key={profile.id} href={profile.primaryHref} className="group rounded-3xl border border-[#e8e2dd] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-teal-700 hover:shadow-lg"><div aria-hidden="true" className="mb-6 flex h-24 items-center justify-center rounded-2xl bg-teal-50 text-4xl">{["📖","🌱","🏡"][index]}</div><h2 className="text-2xl font-bold text-stone-800">{profile.title}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{profile.description}</p><p className="mt-6 font-bold text-teal-800">{profile.primaryCta} →</p></Link>)}</section>;
}
