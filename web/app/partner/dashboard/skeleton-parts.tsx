import type { ReactNode } from 'react';

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

export function SkeletonStatsRow() {
  return (
    <div className="flex gap-4 mb-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <SkeletonBar className="h-7 w-12 mb-2" />
          <SkeletonBar className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSection({ children }: { children: ReactNode }) {
  return (
    <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
      {children}
    </section>
  );
}

export function SkeletonListRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-4 w-1/2 mb-2" />
            <SkeletonBar className="h-3 w-1/3" />
          </div>
          <SkeletonBar className="h-4 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFormFields({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <SkeletonBar className="h-3 w-24 mb-2" />
          <SkeletonBar className="h-10 w-full" />
        </div>
      ))}
      <SkeletonBar className="h-10 w-32" />
    </div>
  );
}

export function SkeletonGridCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <SkeletonBar className="h-4 w-3/4 mb-3" />
          <SkeletonBar className="h-3 w-1/2 mb-2" />
          <SkeletonBar className="h-3 w-2/3 mb-4" />
          <SkeletonBar className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
