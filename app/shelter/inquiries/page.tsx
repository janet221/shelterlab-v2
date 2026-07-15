import Link from "next/link";
import { sprint9ADemoService } from "@/lib/inquiry/demo-data";

export default function ShelterInquiryQueue() {
  const projects = [...sprint9ADemoService.state.projects.values()].filter(
    (project) => project.shelterId || sprint9ADemoService.requiresShelterReview(project.id)
  );
  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-8">
      <p className="text-xs font-semibold text-cyan-700">SYNTHETIC_DEMO &middot; Shelter authority</p>
      <h1 className="mt-1 text-2xl font-semibold">Inquiry Confirmation Queue</h1>
      <p className="mt-2 text-sm text-slate-600">Operational recommendations and shelter-confirmed evidence require a separate shelter decision after teacher approval.</p>
      <div className="mt-6 divide-y border-y">
        {projects.map((project) => (
          <article className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_180px_180px]" key={project.id}>
            <div><strong>{project.title}</strong><p className="text-slate-500">{project.shelterId ?? "Evidence-scoped review"}</p></div>
            <span className="font-mono text-xs">{project.status.toUpperCase()}</span>
            <Link className="border px-3 py-2 text-center" href={`/shelter/inquiries/${project.id}`}>Inspect authority scope</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
