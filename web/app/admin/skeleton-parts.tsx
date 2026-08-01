export function SkeletonBar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--color-border)] ${className}`} />;
}

export function SkeletonPageHeader({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div>
        <SkeletonBar className="h-7 w-48 mb-2" />
        <SkeletonBar className="h-4 w-64" />
      </div>
      {withAction && <SkeletonBar className="h-9 w-32 shrink-0" />}
    </div>
  );
}

export function SkeletonStatsSection({ tiles = 5 }: { tiles?: number }) {
  return (
    <div className="mb-8">
      <SkeletonBar className="h-4 w-32 mb-3" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: tiles }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
            <SkeletonBar className="h-6 w-12 mb-2" />
            <SkeletonBar className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonListRows({ count = 6 }: { count?: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] divide-y divide-[var(--color-border)] overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <SkeletonBar className="h-10 w-10 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-4 w-1/2 mb-2" />
            <SkeletonBar className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
