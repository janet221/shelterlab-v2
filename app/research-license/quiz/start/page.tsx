import { defaultQuizBlueprint } from "@/lib/research-license/phase2-data";

export default function QuizStartPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Start Research License quiz</h1>
      <p className="mt-3 text-slate-700">
        {defaultQuizBlueprint.totalQuestions} questions, {defaultQuizBlueprint.timeLimitMinutes} minutes, maximum {defaultQuizBlueprint.maxAttempts} attempts, {defaultQuizBlueprint.cooldownMinutes}-minute cooldown after failed attempts.
      </p>
      <a className="mt-6 inline-block rounded border bg-white px-4 py-2" href="/research-license/quiz/attempt">Start quiz attempt</a>
    </main>
  );
}
