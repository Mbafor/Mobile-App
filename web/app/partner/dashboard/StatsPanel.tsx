export function StatsPanel({ postsCount, clicksCount }: { postsCount: number; clicksCount: number }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-white p-4">
        <p className="text-2xl font-semibold text-[var(--color-forest)]">{postsCount}</p>
        <p className="text-sm text-[var(--color-muted)]">Opportunities posted</p>
      </div>
      <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-white p-4">
        <p className="text-2xl font-semibold text-[var(--color-forest)]">{clicksCount}</p>
        <p className="text-sm text-[var(--color-muted)]">Clicks driven</p>
      </div>
    </div>
  );
}
