export default function ProductLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading product page"
      className="min-h-[40vh] w-full bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="animate-pulse rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:p-8">
          <div className="h-3 w-32 rounded-sm bg-cyan-300/25" />
          <div className="mt-5 h-14 max-w-3xl rounded-lg bg-white/[0.08]" />
          <div className="mt-4 h-20 max-w-2xl rounded-lg bg-white/[0.08]" />
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="h-11 w-44 rounded-lg bg-cyan-300/30" />
            <div className="h-11 w-36 rounded-lg border border-white/10 bg-white/[0.045]" />
          </div>
        </div>
        <div className="animate-pulse rounded-lg border border-white/10 bg-white/[0.045] p-6">
          <div className="h-5 w-40 rounded-sm bg-white/[0.08]" />
          <div className="mt-5 h-24 rounded-lg bg-white/[0.08]" />
          <div className="mt-4 h-24 rounded-lg bg-white/[0.08]" />
        </div>
      </div>
    </section>
  );
}
