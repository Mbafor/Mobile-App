export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
      <p className="text-2xl font-semibold text-primary">{value.toLocaleString()}</p>
      <p className="text-xs text-[var(--color-muted)] mt-1">{label}</p>
    </div>
  );
}
