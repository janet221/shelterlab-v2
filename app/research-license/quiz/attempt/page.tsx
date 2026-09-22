import { phase2Questions } from "@/lib/research-license/phase2-data";

const attemptQuestions = phase2Questions.filter((question) => question.status === "published").slice(0, 20);

export default function QuizAttemptPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Quiz attempt</h1>
      <p className="mt-3 text-slate-700">Correct answers and explanations are hidden until final submission.</p>
      <form className="mt-6 grid gap-5" action="/research-license/quiz/result">
        {attemptQuestions.map((question, questionIndex) => (
          <fieldset className="rounded border bg-white p-4" key={question.id}>
            <legend className="font-medium">{questionIndex + 1}. {question.prompt}</legend>
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => (
                <label className="flex gap-2" key={option.id}>
                  <input aria-label={`Question ${questionIndex + 1} option ${option.optionKey}`} name={question.id} type="radio" value={option.id} />
                  <span>{option.optionText}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="rounded border bg-white px-4 py-2" type="submit">Submit attempt</button>
      </form>
    </main>
  );
}
