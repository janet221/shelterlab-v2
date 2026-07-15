import { getCurriculumStoreSnapshot } from "@/lib/curriculum-library/demo-store";

export default function AdminCurriculumPage() {
  const { resources, drafts } = getCurriculumStoreSnapshot();
  const unavailable = resources.filter((resource) => resource.availabilityStatus !== "active");
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Curriculum admin dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="border bg-white p-4">
          <h2 className="font-semibold">Provider adapters</h2>
          <p className="mt-2 text-sm">NAER iLearn, GovernmentDatasetResourceAdapter, ManualTeacherResourceAdapter.</p>
        </section>
        <section className="border bg-white p-4">
          <h2 className="font-semibold">Import history</h2>
          <p className="mt-2 text-sm">Mock imports only; no external API calls.</p>
        </section>
        <section className="border bg-white p-4">
          <h2 className="font-semibold">Question audit</h2>
          <p className="mt-2 text-sm">{drafts.length} demo drafts tracked.</p>
        </section>
      </div>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Broken-link report</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {unavailable.length === 0 ? <li className="border bg-white p-3">No unavailable resources in demo store.</li> : null}
          {unavailable.map((resource) => <li className="border bg-white p-3" key={resource.id}>{resource.title}</li>)}
        </ul>
      </section>
    </main>
  );
}
