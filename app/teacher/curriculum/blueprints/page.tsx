import { getCurriculumStoreSnapshot } from "@/lib/curriculum-library/demo-store";

export default function TeacherQuestionBlueprintsPage() {
  const { blueprints } = getCurriculumStoreSnapshot();
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Question generation blueprints</h1>
      <p className="mt-3 text-sm text-slate-700">Draft generation is deterministic DEMO_AI_DRAFT only. No LLM is connected.</p>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Code</th>
            <th className="p-2">Module</th>
            <th className="p-2">Bloom</th>
            <th className="p-2">Questions</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {blueprints.map((blueprint) => (
            <tr className="border-b" key={blueprint.id}>
              <td className="p-2">{blueprint.code}</td>
              <td className="p-2">{blueprint.moduleCode}</td>
              <td className="p-2">{blueprint.bloomLevel}</td>
              <td className="p-2">{blueprint.numberOfQuestions}</td>
              <td className="p-2">{blueprint.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
