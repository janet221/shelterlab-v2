import { phase2Questions } from "@/lib/research-license/phase2-data";
import { getQuestionDrafts } from "@/lib/curriculum-library/demo-store";

export default function TeacherPublishedQuestionBankPage() {
  const publishedDrafts = getQuestionDrafts().filter((draft) => draft.teacherReviewStatus === "published");
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Published question bank</h1>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Project seed questions</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {phase2Questions.slice(0, 10).map((question) => (
            <li className="border bg-white p-3" key={question.id}>{question.moduleCode}: {question.prompt}</li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Published demo drafts</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {publishedDrafts.map((draft) => (
            <li className="border bg-white p-3" key={draft.id}>{draft.id}: {draft.prompt}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
