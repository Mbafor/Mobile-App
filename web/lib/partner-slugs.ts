export const RESERVED_PARTNER_SLUGS = new Set(['login', 'signup', 'verify-otp', 'dashboard', 'logout', 'api']);

export function slugifyOrgName(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
