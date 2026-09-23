import { phase2LearningStandards } from "@/lib/research-license/phase2-data";
import { learningStandardStatusLabel } from "@/lib/curriculum-library/services";

export default function TeacherLearningStandardsPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Learning standard references</h1>
      <p className="mt-2 text-sm text-slate-700">Official status is evidence-based. Demonstration labels are never presented as official curriculum codes.</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="border border-[#d8cfc3] bg-[#f3eee7] px-2 py-1">OFFICIAL_VERIFIED</span>
        <span className="border bg-amber-50 px-2 py-1">DEMO_REFERENCE</span>
        <span className="border bg-slate-100 px-2 py-1">UNVERIFIED</span>
      </div>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <thead><tr className="border-b text-left"><th className="p-2">Status</th><th className="p-2">Code</th><th className="p-2">Description</th><th className="p-2">Source</th></tr></thead>
        <tbody>
          {phase2LearningStandards.map((standard) => (
            <tr className="border-b align-top" key={standard.id}>
              <td className="p-2 font-semibold">{learningStandardStatusLabel(standard.status)}</td>
              <td className="p-2">{standard.learningContentCode}</td>
              <td className="p-2">{standard.learningContentText}</td>
              <td className="p-2">{standard.sourceAgency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
