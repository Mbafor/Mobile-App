export function formatRelativeDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}
