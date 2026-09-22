import { StoryModePlayer } from "./story-mode-player";

export default function JudgeStoryModePage() {
  return <main className="mx-auto max-w-6xl p-5 lg:p-8"><header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5"><div><p className="text-xs font-semibold text-cyan-700">評審證據脈絡模式 · SL-EVIDENCE-STORY-1</p><h1 className="mt-1 text-3xl font-semibold">一鍵查看認養資訊的證據脈絡</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">從犬隻、證據脈絡、時間軸、已發布證據與檔案，一路走到固定計算的影響力；全程不建立或變更資料。</p></div><div className="border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">合成示範資料（SYNTHETIC_DEMO）</div></header><StoryModePlayer/></main>;
}
