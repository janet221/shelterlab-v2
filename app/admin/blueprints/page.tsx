import { defaultQuizBlueprint } from "@/lib/research-license/phase2-data";

export default function AdminBlueprintManagementPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Admin blueprint management</h1>
      <dl className="mt-6 grid gap-2 bg-white p-4">
        <div><dt className="font-medium">Code</dt><dd>{defaultQuizBlueprint.code}</dd></div>
        <div><dt className="font-medium">Total questions</dt><dd>{defaultQuizBlueprint.totalQuestions}</dd></div>
        <div><dt className="font-medium">Passing score</dt><dd>{defaultQuizBlueprint.passingScore}%</dd></div>
        <div><dt className="font-medium">Module minimum</dt><dd>{defaultQuizBlueprint.minimumModuleScore}%</dd></div>
      </dl>
    </main>
  );
}
