import { DemoPlayer } from "./demo-player";

export default function CompetitionDemoPage() {
  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-xs font-semibold text-cyan-700">評審示範模式｜SL-DEMO-1</p>
          <h1 className="mt-1 text-2xl font-semibold">一鍵播放完整證據旅程</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            從學生學習到影響力證據，使用固定且唯讀的資料重播。
          </p>
        </div>
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          已驗證快照（VERIFIED_FIXTURE）＋合成示範資料（SYNTHETIC_DEMO）
        </div>
      </header>
      <div className="mt-5 grid gap-4 border-y py-4 text-sm md:grid-cols-3">
        <div><strong>不寫入正式資料</strong><p className="text-slate-500">只在瀏覽器本機播放</p></div>
        <div><strong>不連接外部 API</strong><p className="text-slate-500">使用已驗證的離線快照</p></div>
        <div><strong>不使用 AI 產生指標</strong><p className="text-slate-500">只採固定公式計算</p></div>
      </div>
      <DemoPlayer />
    </main>
  );
}
