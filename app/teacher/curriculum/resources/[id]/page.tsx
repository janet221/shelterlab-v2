import { getResourceById, getTraceability } from "@/lib/curriculum-library/demo-store";
import Link from "next/link";

export default async function TeacherCurriculumResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = getResourceById(id);
  if (!resource) {
    return <main className="p-8">Resource not found.</main>;
  }
  const traceability = getTraceability(id);
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link className="text-sm underline" href="/teacher/curriculum/resources">Back to resources</Link>
      <h1 className="mt-4 text-2xl font-semibold">{resource.title}</h1>
      <dl className="mt-6 grid gap-3 bg-white p-4 text-sm">
        <div><dt className="font-medium">Provider</dt><dd>{resource.providerName}</dd></div>
        <div><dt className="font-medium">Source URL</dt><dd>{resource.sourceUrl}</dd></div>
        <div><dt className="font-medium">Verification</dt><dd>{resource.verificationStatus}</dd></div>
        <div><dt className="font-medium">Copyright</dt><dd>{resource.copyrightNote}</dd></div>
      </dl>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Verification workflow</h2>
        <div className="mt-3 grid gap-3 text-sm">
          <div className="border bg-white p-3">Metadata verification requires title, provider, source, license note, and copyright note.</div>
          <div className="border bg-white p-3">Educational relevance review requires curriculum fit, copyright check, student safety check, and notes.</div>
          <div className="border bg-white p-3">Rejected or unavailable resources stay in audit history and are hidden from students.</div>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Traceability</h2>
        <pre className="mt-3 overflow-auto bg-slate-950 p-4 text-xs text-white">{JSON.stringify(traceability, null, 2)}</pre>
      </section>
    </main>
  );
}
