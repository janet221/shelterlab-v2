export default function StudentLoading() {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f9f0dc_0%,#dfe9e2_42%,#243c36_100%)] px-6 text-[#fdfaf2]" aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="absolute left-[8%] top-[12%] h-64 w-64 animate-pulse rounded-full bg-amber-200/20 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[8%] right-[6%] h-80 w-80 animate-pulse rounded-full bg-emerald-200/20 blur-3xl [animation-delay:500ms]" />
      <section className="relative m-auto w-full max-w-md rounded-[2.25rem] border border-white/30 bg-[#17352f]/75 px-8 py-12 text-center shadow-[0_30px_100px_-35px_rgba(7,24,20,0.9)] backdrop-blur-xl">
        <div className="relative mx-auto h-24 w-24">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border border-amber-100/50" />
          <span aria-hidden="true" className="absolute inset-2 animate-spin rounded-full border-[3px] border-white/20 border-t-amber-200" />
          <span aria-hidden="true" className="absolute inset-7 rounded-full bg-amber-100 shadow-[0_0_35px_rgba(254,243,199,0.75)]" />
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-amber-100">ShelterLab Journey</p>
        <h1 className="mt-3 text-2xl font-bold">正在展開六週探索地圖</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">為你整理學習進度、探究工具與下一段旅程…</p>
        <div aria-hidden="true" className="mx-auto mt-7 flex w-fit gap-2">
          {[0, 1, 2].map((step) => <span key={step} className="h-2 w-2 animate-bounce rounded-full bg-amber-200" style={{ animationDelay: `${step * 140}ms` }} />)}
        </div>
      </section>
    </main>
  );
}
