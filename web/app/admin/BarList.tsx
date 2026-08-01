export interface BarListItem {
  label: string;
  value: number;
}

/** Horizontal magnitude bars for a ranked breakdown (opportunities by category/
 * country/funding type, most-saved/most-applied). One sequential hue (the brand
 * accent) since these are single-series rankings, not series to tell apart --
 * see the dataviz skill's "compare magnitude" guidance. Mirrors AdminBarChart /
 * AdminTopList from the mobile app (src/features/admin/components), reusing one
 * component for both instead of the mobile app's three separate ones. */
export function BarList({
  title,
  items,
  emptyLabel,
  limit = 8,
}: {
  title: string;
  items: BarListItem[];
  emptyLabel: string;
  limit?: number;
}) {
  const top = items.slice(0, limit);
  const max = Math.max(1, ...top.map((item) => item.value));

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
      <p className="text-sm font-semibold mb-3">{title}</p>
      {top.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2.5">
          {top.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <span
                className="w-[38%] max-w-[220px] shrink-0 truncate text-sm text-[var(--color-muted)]"
                title={item.label}
              >
                {item.label}
              </span>
              <span className="flex-1 h-2 rounded-sm bg-[var(--color-border)] overflow-hidden">
                <span
                  className="block h-full rounded-r-[4px] bg-[var(--color-forest)]"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right text-sm font-semibold [font-variant-numeric:tabular-nums]">
                {item.value.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
