import { getStudentResources } from "@/lib/curriculum-library/demo-store";
import { recommendRemediationResources } from "@/lib/curriculum-library/services";

export default function StudentResourcesPage() {
  const resources = getStudentResources();
  const recommendations = recommendRemediationResources({ URBAN_ECOLOGY: 60 });
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Approved learning resources</h1>
      <ul className="mt-6 grid gap-3">
        {resources.map((resource) => (
          <li className="border bg-white p-4" key={resource.id}>
            <h2 className="font-semibold">{resource.title}</h2>
            <p className="mt-1 text-sm text-slate-700">{resource.description}</p>
            <a className="mt-3 inline-block rounded border px-3 py-2 text-sm" href={resource.sourceUrl}>Open approved resource</a>
          </li>
        ))}
      </ul>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Remediation recommendations</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {recommendations.map((item) => (
            <li className="border bg-white p-3" key={`${item.moduleCode}-${item.resource.id}`}>
              <div className="font-semibold">{item.moduleCode}: {item.resource.title}</div>
              <div className="mt-1 text-xs text-slate-600">Priority {item.resource.id === "res_teacher_urban_ecology_primer" ? "1" : "2"} · {item.resource.providerName} · {item.resource.evidenceVerificationState ?? "SYNTHETIC_DEMO"}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
