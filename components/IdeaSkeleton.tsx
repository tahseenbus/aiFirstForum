export function IdeaSkeleton() {
  return (
    <article className="animate-pulse rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="h-4 w-28 rounded-full bg-slate-700/70" />
      <div className="mt-4 space-y-3">
        <div className="h-5 w-full rounded-full bg-slate-700/70" />
        <div className="h-5 w-5/6 rounded-full bg-slate-700/60" />
        <div className="h-24 rounded-2xl bg-slate-800/80" />
        <div className="h-10 rounded-2xl bg-slate-800/80" />
      </div>
    </article>
  );
}
