import { learningModuleCodes } from "@/lib/research-license/phase2-data";

export default function QuestionEditorPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Question editor</h1>
      <form className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span>Module</span>
          <select aria-label="Module code" className="rounded border p-2" name="moduleCode">
            {learningModuleCodes.map((code) => <option key={code}>{code}</option>)}
          </select>
        </label>
        <label className="grid gap-1">
          <span>Prompt</span>
          <textarea aria-label="Question prompt" className="rounded border p-2" name="prompt" rows={4} />
        </label>
        <label className="grid gap-1">
          <span>Explanation</span>
          <textarea aria-label="Question explanation" className="rounded border p-2" name="explanation" rows={3} />
        </label>
        <button className="rounded border bg-white px-4 py-2" type="submit">Save draft</button>
      </form>
    </main>
  );
}
