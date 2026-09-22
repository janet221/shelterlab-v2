import Link from "next/link";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";

export default function AdoptionReadinessDashboard() {
  const profiles = sprint10ADemoService.getReadinessDashboard();
  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-8">
      <header className="border-b pb-5"><p className="text-xs font-semibold text-cyan-700">SYNTHETIC_DEMO &middot; Shelter</p><h1 className="mt-1 text-2xl font-semibold">Adoption Readiness</h1><p className="mt-2 text-sm text-slate-600">Readiness means evidence coverage only. It is not adoption probability, temperament, or a recommendation.</p></header>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[850px] border-collapse text-sm"><thead><tr className="border-y text-left"><th className="p-3">Dog</th><th>Evidence</th><th>Profile</th><th>Timeline</th><th>Media</th><th>Unknown disclosure</th><th>Needs update</th><th>Action</th></tr></thead><tbody>{profiles.map((profile) => <tr className="border-b" key={profile.dogId}><td className="p-3"><strong>{profile.publicName}</strong><p className="font-mono text-xs text-slate-500">{profile.dogId}</p></td><td>{profile.evidenceCompleteness}%</td><td>{profile.profileCompleteness}%</td><td>{profile.timelineCompleteness}%</td><td>{profile.mediaCompleteness}%</td><td>{profile.unknownCoverage}%</td><td>{profile.needsUpdate ? `YES (${profile.missingGapCount})` : "NO"}</td><td><Link className="text-cyan-800 underline" href={`/adoption-profile/${profile.dogId}`}>Inspect profile</Link></td></tr>)}</tbody></table></div>
      <p className="mt-5 border-l-4 border-cyan-700 bg-slate-50 p-4 text-sm">Profiles needing updates receive one recommendation only: COLLECT MORE EVIDENCE.</p>
    </main>
  );
}
