import Link from "next/link";
import { sprint9ADemoService } from "@/lib/inquiry/demo-data";

export default async function ShelterInquiryReview({ params }: { params: Promise<{ id: string }> }) {
  const project = sprint9ADemoService.getProject((await params).id);
  const recommendations = sprint9ADemoService.state.recommendations.filter((item) => item.projectId === project.id);
  const evidence = sprint9ADemoService.state.evidenceLinks.filter((item) => item.projectId === project.id && ["observation_session", "published_dog_evidence"].includes(item.evidenceType));
  return (
    <main className="mx-auto max-w-5xl p-5 lg:p-8">
      <header className="border-b pb-4">
        <p className="text-xs font-semibold text-cyan-700">SYNTHETIC_DEMO &middot; separate shelter confirmation</p>
        <h1 className="mt-1 text-2xl font-semibold">Shelter Inquiry Review</h1>
        <p className="mt-2 text-sm text-slate-600">{project.title}</p>
      </header>
      <section className="mt-6"><h2 className="font-semibold">Shelter Authority Scope</h2><dl className="mt-3 divide-y border-y text-sm"><div className="py-3"><dt className="text-slate-500">Assigned shelter</dt><dd>{project.shelterId ?? "None"}</dd></div><div className="py-3"><dt className="text-slate-500">Shelter-confirmed evidence</dt><dd>{evidence.length}</dd></div><div className="py-3"><dt className="text-slate-500">Operational recommendations</dt><dd>{recommendations.filter((item) => item.targetActor === "shelter").length}</dd></div></dl></section>
      <section className="mt-6"><h2 className="font-semibold">Recommendation Boundaries</h2>{recommendations.map((item) => <article className="mt-3 border-l-4 border-cyan-700 bg-slate-50 p-4 text-sm" key={item.id}><strong>{item.recommendation}</strong><p className="mt-2 text-slate-600">{item.studentScope}</p><p className="mt-2 text-xs">Evidence strength: {item.evidenceStrength}; proposed only, never automatically implemented.</p></article>)}</section>
      <div className="mt-6 flex flex-wrap gap-3"><button className="border px-4 py-2 text-sm" type="button">Request revision with reason</button><button className="border px-4 py-2 text-sm" type="button">Reject with reason</button><button className="border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-medium text-white" type="button">Confirm shelter scope</button><Link className="border px-4 py-2 text-sm" href="/inquiries/demo">Inspect public-safe report</Link></div>
    </main>
  );
}
