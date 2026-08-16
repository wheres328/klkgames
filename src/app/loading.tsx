export default function Loading() {
  return (
    <div className="relative flex min-h-[50vh] items-start justify-center">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-border/40">
        <div className="loading-bar h-full w-1/3 bg-accent" />
      </div>
      <div className="mt-16 grid w-full max-w-5xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-card border border-border bg-surface/60 p-5"
          >
            <div className="h-4 w-2/3 rounded bg-foreground/10" />
            <div className="mt-3 h-3 w-full rounded bg-foreground/5" />
            <div className="mt-2 h-3 w-4/5 rounded bg-foreground/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
