/** Coerce Supabase JSONB list payloads into a plain array for parsing. */
export function normalizeAvailableMentorsPayload(data: unknown): unknown[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;

  if (typeof data === 'string') {
    try {
      const parsed: unknown = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (typeof data === 'object') {
    const row = data as Record<string, unknown>;
    for (const key of ['mentors', 'data', 'items', 'results'] as const) {
      const nested = row[key];
      if (Array.isArray(nested)) return nested;
    }
  }

  return [];
}
