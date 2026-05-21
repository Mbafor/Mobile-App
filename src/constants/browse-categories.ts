/** Categories for Browse by Category drawer (matches opportunity `category` / tags). */
export const BROWSE_CATEGORIES = [
  'Internship',
  'Scholarship',
  'Fellowship',
  'Graduate Programme',
  'Job (Full-time)',
  'Job (Part-time)',
  'Volunteer',
  'Research Opportunity',
  'Exchange Programme',
  'Bootcamp & Training',
  'Grant & Funding',
  'Competition & Award',
] as const;

export type BrowseCategory = (typeof BROWSE_CATEGORIES)[number];

export function categoryToSlug(category: string): string {
  return encodeURIComponent(category);
}

export function slugToCategory(slug: string): string {
  return decodeURIComponent(slug);
}
