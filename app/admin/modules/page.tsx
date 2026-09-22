import { phase2LearningModules } from "@/lib/research-license/phase2-data";

export default function AdminModuleManagementPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Admin module management</h1>
      <p className="mt-3 text-slate-700">Only admins may archive modules. Teachers or admins may publish educational content.</p>
      <ul className="mt-6 grid gap-3">
        {phase2LearningModules.map((module) => (
          <li className="rounded border bg-white p-4" key={module.code}>
            {module.code}: {module.title} ({module.status})
          </li>
        ))}
      </ul>
    </main>
  );
}
