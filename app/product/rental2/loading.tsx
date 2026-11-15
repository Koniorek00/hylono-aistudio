const shimmerBlock =
  'animate-pulse rounded-lg border border-white/10 bg-white/[0.045] shadow-none';

export default function ProductRental2Loading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="rental2-loading-title"
      aria-describedby="rental2-loading-description"
      className="min-h-screen bg-slate-950 px-4 pb-20 pt-20 text-white sm:px-6 lg:px-8"
    >
      <h1 id="rental2-loading-title" className="sr-only">
        Preparing upgraded rental page
      </h1>
      <p id="rental2-loading-description" className="sr-only">
        Rental page content, device cards, filters, and action panels are loading.
      </p>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className={`${shimmerBlock} overflow-hidden p-6 sm:p-8 lg:p-10`}>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-4">
              <div className="h-3 w-28 rounded-full bg-cyan-300/25" />
              <div className="h-16 max-w-3xl rounded-lg bg-white/[0.08]" />
              <div className="h-24 max-w-3xl rounded-lg bg-white/[0.08]" />
              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-52 rounded-lg bg-cyan-300/30" />
                <div className="h-12 w-40 rounded-lg border border-white/10 bg-white/[0.045]" />
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6">
              <div className="h-5 w-36 rounded-full bg-white/[0.08]" />
              <div className="mt-5 h-24 rounded-lg bg-white/[0.08]" />
              <div className="mt-4 h-24 rounded-lg bg-white/[0.08]" />
            </div>
          </div>
        </section>

        <section className={`${shimmerBlock} p-6 sm:p-8`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-white/10 bg-slate-950/55 p-5">
                <div className="h-4 w-28 rounded-full bg-white/[0.08]" />
                <div className="mt-4 h-20 rounded-lg bg-white/[0.08]" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className={`${shimmerBlock} p-5 sm:p-6`}>
            <div className="h-5 w-44 rounded-full bg-white/[0.08]" />
            <div className="mt-5 h-12 rounded-lg bg-white/[0.08]" />
            <div className="mt-4 h-12 rounded-lg bg-white/[0.08]" />
          </div>
          <div className={`${shimmerBlock} p-5 sm:p-6`}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/55">
                  <div className="aspect-[16/10] bg-white/[0.08]" />
                  <div className="space-y-4 p-5">
                    <div className="h-6 rounded-full bg-white/[0.08]" />
                    <div className="h-20 rounded-lg bg-white/[0.08]" />
                    <div className="h-12 rounded-lg bg-cyan-300/25" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
