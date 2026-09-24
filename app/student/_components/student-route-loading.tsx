type StudentRouteLoadingProps = {
  title: string;
  description: string;
};

export default function StudentRouteLoading({ title, description }: StudentRouteLoadingProps) {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fffdf7_0%,#f8edcf_48%,#d4ae62_100%)] px-6 text-[#5b3f1f]" aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="absolute left-[8%] top-[12%] h-64 w-64 animate-pulse rounded-full bg-[#fff8df]/80 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[8%] right-[6%] h-80 w-80 animate-pulse rounded-full bg-[#eacb87]/55 blur-3xl [animation-delay:500ms]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#f5ddaa]/80 to-transparent" />
      <section className="relative m-auto w-full max-w-md rounded-[2.25rem] border border-[#e5c982] bg-[#fffaf0]/90 px-8 py-12 text-center shadow-[0_30px_100px_-38px_rgba(111,75,25,0.58)] backdrop-blur-xl">
        <div className="relative mx-auto h-24 w-24">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border border-[#d8ad55]/45" />
          <span aria-hidden="true" className="absolute inset-2 animate-spin rounded-full border-[3px] border-[#ecd7a5] border-t-[#a9782c]" />
          <span aria-hidden="true" className="absolute inset-7 rounded-full bg-[#f6d98c] shadow-[0_0_38px_rgba(202,151,56,0.65)]" />
          <span aria-hidden="true" className="absolute inset-[2.15rem] rounded-full bg-[#fffaf0]" />
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-[#9b6a26]">ShelterLab Journey</p>
        <h1 className="mt-3 text-2xl font-bold text-[#51391e]">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[#806640]">{description}</p>
        <div aria-hidden="true" className="mx-auto mt-7 flex w-fit gap-2">
          {[0, 1, 2].map((step) => <span key={step} className="h-2 w-2 animate-bounce rounded-full bg-[#bd8731]" style={{ animationDelay: `${step * 140}ms` }} />)}
        </div>
      </section>
    </main>
  );
}
