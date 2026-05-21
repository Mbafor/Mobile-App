/** Read display name / avatar from Supabase Auth user_metadata (Google, Apple, etc.). */
export function getOAuthAvatarUrl(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) return null;
  const raw = metadata.avatar_url ?? metadata.picture;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getOAuthDisplayName(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) return null;

  const direct = metadata.full_name ?? metadata.name ?? metadata.display_name;
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }

  const given = metadata.given_name;
  const family = metadata.family_name;
  if (typeof given === 'string' && given.trim()) {
    const parts = [given.trim(), typeof family === 'string' ? family.trim() : ''].filter(Boolean);
    return parts.join(' ');
  }

  return null;
}
