type StudentRouteLoadingProps = {
  title: string;
  description: string;
};

export default function StudentRouteLoading({ title, description }: StudentRouteLoadingProps) {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fffefa_0%,#fbf4e5_54%,#eadfc9_100%)] px-6 text-[#5f4c35]" aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="absolute left-[8%] top-[12%] h-64 w-64 animate-pulse rounded-full bg-white/80 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[8%] right-[6%] h-80 w-80 animate-pulse rounded-full bg-[#f2e5ca]/70 blur-3xl [animation-delay:500ms]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#eadbbd]/70 to-transparent" />
      <section className="relative m-auto w-full max-w-md rounded-[2.25rem] border border-[#e8dcc5] bg-[#fffdf8]/94 px-8 py-12 text-center shadow-[0_30px_100px_-42px_rgba(103,82,53,0.38)] backdrop-blur-xl">
        <div className="relative mx-auto h-24 w-24">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border border-[#cdb88f]/40" />
          <span aria-hidden="true" className="absolute inset-2 animate-spin rounded-full border-[3px] border-[#eee3cf] border-t-[#b28d50]" />
          <span aria-hidden="true" className="absolute inset-7 rounded-full bg-[#f3dfb3] shadow-[0_0_34px_rgba(188,151,83,0.38)]" />
          <span aria-hidden="true" className="absolute inset-[2.15rem] rounded-full bg-[#fffdf8]" />
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-[#9a7b4b]">ShelterLab Journey</p>
        <h1 className="mt-3 text-2xl font-bold text-[#574630]">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[#81715c]">{description}</p>
        <div aria-hidden="true" className="mx-auto mt-7 flex w-fit gap-2">
          {[0, 1, 2].map((step) => <span key={step} className="h-2 w-2 animate-bounce rounded-full bg-[#b89b6b]" style={{ animationDelay: `${step * 140}ms` }} />)}
        </div>
      </section>
    </main>
  );
}
