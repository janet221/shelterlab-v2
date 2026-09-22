"use client";

import Link from "next/link";
import { useStudentLearningProgress } from "@/app/student/_components/student-learning-progress";
import { LEARNING_TOOLS } from "@/lib/student-map";

export default function StudentToolsPage() {
  const { progress, ready } = useStudentLearningProgress();

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#f7f1e8] p-6 text-[#4c443b]">
        <p className="mx-auto max-w-5xl text-sm font-bold">正在整理你的寶物工具箱…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-5 py-7 text-[#4c443b] sm:px-8 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/student"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#6b6259] bg-[#fffaf0] px-4 py-2 text-sm font-black shadow-sm"
          >
            ← 返回六週地圖
          </Link>
          <span className="rounded-full bg-[#e9dfcf] px-4 py-2 text-xs font-black text-[#6b5d50]">
            已取得 {LEARNING_TOOLS.filter((tool) => progress.completedWeeks.includes(tool.week) || progress.unlockedTools.includes(tool.kind)).length}/5
          </span>
        </div>

        <header className="mt-8">
          <p className="text-xs font-black tracking-[0.18em] text-[#8a745d]">ShelterLab</p>
          <h1 className="mt-2 font-serif text-4xl font-black text-[#397673] sm:text-5xl">我的寶物工具箱</h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-[#6d6258]">
            每完成一週，就會取得一件思考工具，並在下一週指定的困難環節使用一次。第五週工具是前五週的最終收藏；這些寶物代表學習歷程，不代表任何價值立場比較正確。
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_TOOLS.map((tool) => {
            const earned =
              progress.completedWeeks.includes(tool.week) ||
              progress.unlockedTools.includes(tool.kind);

            return (
              <article
                key={tool.week}
                className={`rounded-[24px] border-[3px] p-4 shadow-[5px_6px_0_rgba(91,85,76,.10)] ${
                  earned
                    ? "border-[#d6bc79] bg-[#fffaf0]"
                    : "border-[#d9d2c8] bg-[#f0ece6]"
                }`}
              >
                <div
                  className={`mx-auto flex aspect-square max-w-[210px] items-center justify-center overflow-hidden rounded-[22px] border-2 p-2 ${
                    earned ? "border-[#ead8ad] bg-[#fff7df]" : "border-[#ddd6cc] bg-[#e8e4de]"
                  }`}
                >
                  <img
                    src={tool.image}
                    alt={tool.name}
                    draggable={false}
                    className={`h-full w-full object-contain ${earned ? "" : "grayscale opacity-45"}`}
                  />
                </div>

                <p className="mt-4 text-xs font-black text-[#8a745d]">第 {tool.week} 週寶物</p>
                <h2 className="mt-1 text-xl font-black text-[#443a31]">{tool.name}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#6d6258]">
                  {earned ? tool.description : "完成這一週的學習關卡後解鎖。"}
                </p>

                <div className="mt-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                      earned
                        ? "bg-[#dcebdc] text-[#416a4d]"
                        : "bg-[#dedad4] text-[#7d756c]"
                    }`}
                  >
                    {earned ? "已取得" : "尚未解鎖"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
