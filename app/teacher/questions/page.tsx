import { phase2Questions } from "@/lib/research-license/phase2-data";

export default function TeacherQuestionBankPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Teacher question bank</h1>
      <nav className="mt-4 flex gap-3">
        <a className="rounded border bg-white px-4 py-2" href="/teacher/questions/new">Create question</a>
        <a className="rounded border bg-white px-4 py-2" href="/teacher/questions/pending">Pending review</a>
        <a className="rounded border bg-white px-4 py-2" href="/teacher/licenses">Class license status</a>
        <a className="rounded border bg-white px-4 py-2" href="/teacher/local-resources">學校與在地資源</a>
      </nav>
      <table className="mt-6 w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Module</th>
            <th className="p-2">Prompt</th>
            <th className="p-2">Status</th>
            <th className="p-2">Version</th>
          </tr>
        </thead>
        <tbody>
          {phase2Questions.slice(0, 12).map((question) => (
            <tr className="border-b" key={question.id}>
              <td className="p-2">{question.moduleCode}</td>
              <td className="p-2">{question.prompt}</td>
              <td className="p-2">{question.status}</td>
              <td className="p-2">{question.version}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
