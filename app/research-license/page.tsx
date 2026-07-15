import { defaultQuizBlueprint, phase2LearningModules } from "@/lib/research-license/phase2-data";
import Link from "next/link";

export default function ResearchLicensePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">研究觀察資格總覽</h1>
      <p className="mt-3 text-slate-700">
        第一級研究觀察資格包含五個科學與安全單元，以及 {defaultQuizBlueprint.totalQuestions} 題測驗；總分須達 {defaultQuizBlueprint.passingScore}%，每個單元也須達 {defaultQuizBlueprint.minimumModuleScore}%。
      </p>
      <section className="mt-6">
        <h2 className="text-lg font-medium">學習進度</h2>
        <progress aria-label="研究觀察資格單元進度" className="mt-2 h-3 w-full" max={phase2LearningModules.length} value={0} />
      </section>
      <nav className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded border bg-white px-4 py-2" href="/research-license/modules">查看課程單元</Link>
        <Link className="rounded border bg-white px-4 py-2" href="/research-license/quiz/start">開始測驗</Link>
        <Link className="rounded border bg-white px-4 py-2" href="/research-license/certificate">查看資格狀態</Link>
      </nav>
    </main>
  );
}
