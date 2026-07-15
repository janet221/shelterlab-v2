import Link from "next/link";
import { buildCompetitionEvidenceChain } from "@/lib/competition/evidence";
import { phase4QuestionDrafts } from "@/lib/curriculum-library/phase4-data";

const workflow = ["AI_DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED"];

export default function TeacherReviewStudioPage() {
  const chain = buildCompetitionEvidenceChain();
  const published = phase4QuestionDrafts.find((draft) => draft.teacherReviewStatus === "published")!;
  return (
    <main className="mx-auto max-w-7xl p-6 lg:p-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold text-cyan-700">Teacher-governed authoring</p>
        <h1 className="mt-1 text-2xl font-semibold">Research License question studio</h1>
        <p className="mt-2 text-sm text-slate-600">Deterministic and mock providers create drafts only. A different teacher or admin approves; publication is a separate authorized action.</p>
      </header>
      <nav className="mt-5 flex flex-wrap gap-2 text-sm">
        <Link className="border bg-white px-3 py-2" href="/government-data">Source browser</Link>
        <Link className="border bg-white px-3 py-2" href="/teacher/curriculum/resources">Resource browser</Link>
        <Link className="border bg-white px-3 py-2" href="/teacher/curriculum/coverage">Competency coverage</Link>
        <Link className="border bg-white px-3 py-2" href="/teacher/curriculum/blueprints">Blueprint editor</Link>
        <Link className="border bg-white px-3 py-2" href="/teacher/curriculum/drafts">Review queue</Link>
      </nav>

      <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Governance state</h2>
          <ol className="mt-4 grid gap-2">
            {workflow.map((state, index) => <li className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-0" key={state}><span className="flex h-7 w-7 items-center justify-center border border-slate-300 text-xs font-semibold">{index + 1}</span><span className="font-mono text-sm">{state}</span></li>)}
          </ol>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Author</dt><dd className="font-medium">teacher_demo_001</dd></div><div><dt className="text-slate-500">Independent reviewer</dt><dd className="font-medium">admin_demo_001</dd></div><div><dt className="text-slate-500">Provider</dt><dd className="font-medium">deterministic</dd></div><div><dt className="text-slate-500">Prompt version</dt><dd className="font-medium">shelterlab-s6-v1</dd></div></dl>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Published demo lineage</h2><span className="border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">SYNTHETIC_DEMO</span></div>
          <p className="mt-4 font-medium">{published.prompt}</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><span className="text-slate-500">Resources</span><p className="mt-1 font-mono text-xs">{published.sourceResourceIds.join(", ")}</p></div><div><span className="text-slate-500">Standards</span><p className="mt-1 font-mono text-xs">{published.learningStandardIds.join(", ")}</p></div><div><span className="text-slate-500">Quality flags</span><p className="mt-1">{published.riskFlags.join(", ")}</p></div><div><span className="text-slate-500">Audit state</span><p className="mt-1">Approval and publication recorded separately</p></div></div>
          <Link className="mt-5 inline-block border border-slate-300 px-3 py-2 text-sm font-medium" href="/competition/evidence#traceability">Open full traceability</Link>
        </div>
      </section>
      <p className="mt-5 text-xs text-slate-500">Chain integrity: {chain.complete ? "complete" : "incomplete"}. This view uses synthetic competition fixtures, not real students or schools.</p>
    </main>
  );
}
