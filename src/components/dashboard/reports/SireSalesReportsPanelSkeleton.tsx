"use client";

export function SireSalesReportsPanelSkeleton() {
  return (
    <section className="rounded-[20px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
      <div className="animate-pulse space-y-5">
        <div className="space-y-3">
          <div className="h-6 w-32 rounded-full bg-slate-200" />
          <div className="h-7 w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
          <div className="h-4 w-full max-w-xl rounded bg-slate-100" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-5">
            <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 h-20 rounded-xl bg-white" />
                <div className="h-20 rounded-xl bg-white" />
              </div>
              <div className="mt-5 h-11 w-44 rounded-xl bg-slate-200" />
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-20 rounded-xl bg-white md:col-span-1" />
                <div className="h-11 rounded-xl bg-white" />
                <div className="h-11 rounded-xl bg-white" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="h-20 rounded-xl bg-white" />
                <div className="h-20 rounded-xl bg-white" />
                <div className="h-20 rounded-xl bg-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-40 rounded-[18px] border border-slate-200 bg-slate-50/70" />
            <div className="h-48 rounded-[18px] border border-slate-200 bg-slate-50/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
