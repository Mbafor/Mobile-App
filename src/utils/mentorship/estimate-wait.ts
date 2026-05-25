/** Rough queue wait estimate for UI (1 position ≈ 1–2 weeks when coaches are full). */
export function estimateWaitLabel(position: number): string {
  if (position <= 1) return 'Usually within 1–2 weeks';
  if (position <= 3) return 'About 2–4 weeks';
  if (position <= 7) return 'About 1–2 months';
  return 'More than 2 months — we will notify you when matched';
}
