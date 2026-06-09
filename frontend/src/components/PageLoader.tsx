export default function PageLoader() {
  return (
    <div className="space-y-6" aria-label="Loading page">
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-slate-100" />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-5 w-24 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-36 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
