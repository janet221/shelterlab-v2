import { phase2LearningModules } from "@/lib/research-license/phase2-data";

export default function ModuleListPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Research License modules</h1>
      <ul className="mt-6 grid gap-3">
        {phase2LearningModules.map((module) => (
          <li key={module.code} className="rounded border bg-white p-4">
            <a className="font-medium" href={`/research-license/modules/${module.code}`}>{module.title}</a>
            <p className="mt-1 text-sm text-slate-700">{module.description}</p>
            <p className="mt-2 text-sm">Estimated minutes: {module.estimatedMinutes}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
