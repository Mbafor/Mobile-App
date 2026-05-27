import { formatExperienceDates, hasText } from '@/features/cv-builder/components/preview/preview-shared';
import type {
  CVAchievementEntry,
  CVCertificationEntry,
  CVContent,
  CVEducationEntry,
  CVExperienceEntry,
  CVLanguageEntry,
  CVProjectEntry,
  CVReferenceEntry,
} from '@/types/domain/cv';

export { hasText, formatExperienceDates };

export function getContactItems(content: CVContent): string[] {
  const p = content.personalInfo;
  return [p.email, p.phone, p.location, p.linkedIn, p.website].filter(hasText) as string[];
}

export function getDisplayName(content: CVContent): string {
  return content.personalInfo.fullName.trim() || 'Your Name';
}

export function parseBulletLines(text?: string): string[] {
  if (!hasText(text)) return [];
  return text!
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('•') || line.startsWith('-') ? line.slice(1).trim() : line));
}

export function splitSkills(skills: string[]): { technical: string[]; soft: string[] } {
  const half = Math.ceil(skills.length / 2);
  return { technical: skills.slice(0, half), soft: skills.slice(half) };
}

export function formatEducationTitle(entry: CVEducationEntry): string {
  const field = hasText(entry.fieldOfStudy) ? ` in ${entry.fieldOfStudy}` : '';
  return `${entry.degree}${field}`;
}

export function formatEducationDates(entry: CVEducationEntry): string {
  return [entry.startDate, entry.endDate].filter(hasText).join(' – ');
}

export function experienceDateLine(entry: CVExperienceEntry): string {
  return formatExperienceDates(entry.startDate, entry.endDate, entry.currentlyWorking);
}

export function experienceSubtitle(entry: CVExperienceEntry): string {
  const loc = hasText(entry.location) ? ` — ${entry.location}` : '';
  return `${entry.company}${loc}`;
}

export function hasCertifications(entries: CVCertificationEntry[]): boolean {
  return entries.some((c) => hasText(c.name));
}

export function hasLanguages(entries: CVLanguageEntry[]): boolean {
  return entries.some((l) => hasText(l.language));
}

export function projectDateLine(entry: CVProjectEntry): string {
  return [entry.startDate, entry.endDate].filter(hasText).join(' – ');
}

export function achievementLine(entry: CVAchievementEntry): string {
  return [entry.title, entry.date].filter(hasText).join(' · ');
}

export function referenceBlock(entry: CVReferenceEntry): string {
  const parts = [
    entry.name,
    [entry.position, entry.company].filter(hasText).join(', '),
    [entry.email, entry.phone].filter(hasText).join(' · '),
  ].filter(hasText);
  return parts.join('\n');
}
