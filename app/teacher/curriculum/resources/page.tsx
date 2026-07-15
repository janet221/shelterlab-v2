import { getTeacherResources } from "@/lib/curriculum-library/demo-store";

export default function TeacherCurriculumResourcesPage() {
  const resources = getTeacherResources();
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Curriculum resource library</h1>
      <nav className="mt-4 flex flex-wrap gap-3 text-sm">
        <a className="rounded border bg-white px-3 py-2" href="/teacher/curriculum/studio">Question studio</a>
        <a className="rounded border bg-white px-3 py-2" href="/teacher/curriculum/coverage">Competency coverage</a>
        <a className="rounded border bg-white px-3 py-2" href="/teacher/curriculum/course-weeks">Course weeks</a>
        <a className="rounded border bg-white px-3 py-2" href="/teacher/curriculum/blueprints">Blueprint editor</a>
        <a className="rounded border bg-white px-3 py-2" href="/teacher/curriculum/drafts">AI draft review queue</a>
        <a className="rounded border bg-white px-3 py-2" href="/teacher/curriculum/questions">Published question bank</a>
      </nav>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Provider</th>
            <th className="p-2">Type</th>
            <th className="p-2">Verification</th>
            <th className="p-2">Availability</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr className="border-b" key={resource.id}>
              <td className="p-2"><a className="underline" href={`/teacher/curriculum/resources/${resource.id}`}>{resource.title}</a></td>
              <td className="p-2">{resource.providerName}</td>
              <td className="p-2">{resource.resourceType}</td>
              <td className="p-2">{resource.verificationStatus}</td>
              <td className="p-2">{resource.availabilityStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
