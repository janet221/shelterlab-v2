import { getQuestionDrafts } from "@/lib/curriculum-library/demo-store";

export default function TeacherQuestionDraftsPage() {
  const drafts = getQuestionDrafts();
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">AI draft review queue</h1>
      <p className="mt-3 text-sm text-slate-700">AI drafts are never student-visible until teacher/admin approval and explicit publish.</p>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Prompt</th>
            <th className="p-2">Module</th>
            <th className="p-2">Status</th>
            <th className="p-2">Sources</th>
            <th className="p-2">Flags</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr className="border-b" key={draft.id}>
              <td className="p-2">{draft.prompt}</td>
              <td className="p-2">{draft.moduleCode}</td>
              <td className="p-2">{draft.teacherReviewStatus}</td>
              <td className="p-2">{draft.sourceResourceIds.join(", ")}</td>
              <td className="p-2">{draft.riskFlags.join(", ") || "none"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
