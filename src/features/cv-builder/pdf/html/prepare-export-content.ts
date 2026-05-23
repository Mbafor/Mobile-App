import type { CVContent } from '@/types/domain/cv';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { normalizeCVContent } from '@/features/cv-builder/utils/normalize-cv-content';
import { getEnabledSections, getLayoutFromContent } from '@/features/cv-builder/utils/section-config';

/** CV content filtered to enabled sections only — used for PDF export, not preview UI. */
export function prepareContentForPdfExport(raw: CVContent): CVContent {
  const content = normalizeCVContent(raw);
  const layout = getLayoutFromContent(content);
  const enabled = new Set(getEnabledSections(layout));

  return {
    ...content,
    summary: enabled.has('summary') ? content.summary : '',
    experience: enabled.has('experience') ? content.experience : [],
    education: enabled.has('education') ? content.education : [],
    skills: enabled.has('skills') ? content.skills : [],
    certifications: enabled.has('certifications') ? content.certifications : [],
    hobbies: enabled.has('hobbies') ? content.hobbies : [],
    languages: enabled.has('languages') ? content.languages : [],
    voluntaryExperience: enabled.has('voluntary') ? content.voluntaryExperience : [],
    projects: enabled.has('projects') ? content.projects : [],
    achievements: enabled.has('achievements') ? content.achievements : [],
    references: enabled.has('references') ? content.references : [],
  };
}

export function isSectionEnabledForExport(enabled: Set<CVSectionId>, sectionId: CVSectionId): boolean {
  return enabled.has(sectionId);
}

export function getEnabledSectionSet(content: CVContent): Set<CVSectionId> {
  const layout = getLayoutFromContent(content);
  return new Set(getEnabledSections(layout));
}
