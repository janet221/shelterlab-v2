import { notFound } from "next/navigation";
import { phase2LearningModules } from "@/lib/research-license/phase2-data";

export default async function ModuleDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const learningModule = phase2LearningModules.find((item) => item.code === code);

  if (!learningModule) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">{learningModule.title}</h1>
      <p className="mt-3 text-slate-700">{learningModule.description}</p>
      <dl className="mt-6 grid gap-2 text-sm">
        <div><dt className="font-medium">Module code</dt><dd>{learningModule.code}</dd></div>
        <div><dt className="font-medium">Passing score</dt><dd>{learningModule.passingScore}%</dd></div>
        <div><dt className="font-medium">Version</dt><dd>{learningModule.version}</dd></div>
      </dl>
      <a className="mt-6 inline-block rounded border bg-white px-4 py-2" href="/research-license/quiz/start">Continue to quiz</a>
    </main>
  );
}
