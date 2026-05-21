import {
  ALL_SECTION_IDS,
  DEFAULT_SECTION_ORDER,
  OPTIONAL_SECTION_IDS,
  type CVSectionId,
} from '@/features/cv-builder/constants/sections';
import type { CVContent, CVLayoutConfig } from '@/types/domain/cv';

export type CVSectionStatusKind = 'complete' | 'in_progress' | 'action_required' | 'optional';

export type CVSectionStatus = {
  kind: CVSectionStatusKind;
  label: string;
};

export function getDefaultLayout(): CVLayoutConfig {
  return { sectionOrder: [...DEFAULT_SECTION_ORDER], disabledSections: [] };
}

export function normalizeLayout(layout: CVLayoutConfig | undefined): CVLayoutConfig {
  const base = getDefaultLayout();
  if (!layout) return base;

  const order = (layout.sectionOrder ?? []).filter((id): id is CVSectionId =>
    ALL_SECTION_IDS.includes(id as CVSectionId),
  );
  const mergedOrder: CVSectionId[] = [
    ...order,
    ...DEFAULT_SECTION_ORDER.filter((id) => !order.includes(id)),
  ];

  return {
    sectionOrder: mergedOrder,
    disabledSections: (layout.disabledSections ?? []).filter((id): id is CVSectionId =>
      ALL_SECTION_IDS.includes(id as CVSectionId),
    ),
  };
}

export function getLayoutFromContent(content: CVContent): CVLayoutConfig {
  return normalizeLayout(content.layout);
}

export function getEnabledSections(layout: CVLayoutConfig): CVSectionId[] {
  const order = layout.sectionOrder as CVSectionId[];
  const disabled = layout.disabledSections as CVSectionId[];
  return order.filter((id) => !disabled.includes(id));
}

export function isSectionEnabled(layout: CVLayoutConfig, sectionId: CVSectionId): boolean {
  return !(layout.disabledSections as CVSectionId[]).includes(sectionId);
}

function personalComplete(content: CVContent): boolean {
  const p = content.personalInfo;
  return Boolean(p.fullName.trim() && p.email.trim());
}

function summaryComplete(content: CVContent): boolean {
  return content.summary.trim().length >= 40;
}

function experienceComplete(content: CVContent): boolean {
  return content.experience.some((e) => e.company.trim() && e.role.trim());
}

function educationComplete(content: CVContent): boolean {
  return content.education.some((e) => e.school.trim() && e.degree.trim());
}

function skillsComplete(content: CVContent): boolean {
  return content.skills.length >= 2;
}

function certificationsStatus(content: CVContent): CVSectionStatus {
  const filled = content.certifications.filter((c) => c.name.trim()).length;
  if (filled === 0) {
    return { kind: 'optional', label: 'Optional' };
  }
  if (filled >= 1 && content.certifications.every((c) => c.name.trim() && c.year.trim())) {
    return { kind: 'complete', label: 'Completed' };
  }
  return { kind: 'in_progress', label: `${filled}/${content.certifications.length || 1}` };
}

function languagesStatus(content: CVContent): CVSectionStatus {
  const filled = content.languages.filter((l) => l.language.trim()).length;
  if (filled === 0) {
    return { kind: 'action_required', label: 'Add details' };
  }
  if (content.languages.every((l) => l.language.trim() && l.proficiency.trim())) {
    return { kind: 'complete', label: 'Completed' };
  }
  return { kind: 'in_progress', label: `${filled}/${content.languages.length}` };
}

function listExperienceStatus(
  entries: CVContent['experience'],
  required: boolean,
): CVSectionStatus {
  const filled = entries.filter((e) => e.company.trim() && e.role.trim()).length;
  if (filled === 0) {
    return required
      ? { kind: 'action_required', label: 'Add details' }
      : { kind: 'optional', label: 'Optional' };
  }
  const complete = entries.filter(
    (e) => e.company.trim() && e.role.trim() && e.startDate.trim(),
  ).length;
  if (complete >= 1 && complete === entries.length) {
    return { kind: 'complete', label: 'Completed' };
  }
  return { kind: 'in_progress', label: `${filled}/${Math.max(entries.length, 1)}` };
}

function hobbiesStatus(content: CVContent): CVSectionStatus {
  if (content.hobbies.length === 0) {
    return { kind: 'optional', label: 'Optional' };
  }
  return { kind: 'complete', label: 'Completed' };
}

export function getSectionStatus(content: CVContent, sectionId: CVSectionId): CVSectionStatus {
  switch (sectionId) {
    case 'personal':
      return personalComplete(content)
        ? { kind: 'complete', label: 'Completed' }
        : { kind: 'action_required', label: 'Add details' };
    case 'summary':
      return summaryComplete(content)
        ? { kind: 'complete', label: 'Completed' }
        : content.summary.trim()
          ? { kind: 'in_progress', label: 'In progress' }
          : { kind: 'action_required', label: 'Add details' };
    case 'experience':
      return listExperienceStatus(content.experience, true);
    case 'education': {
      const filled = content.education.filter((e) => e.school.trim() && e.degree.trim()).length;
      if (filled === 0) return { kind: 'action_required', label: 'Add details' };
      if (
        content.education.length > 0 &&
        content.education.every((e) => e.school.trim() && e.degree.trim() && e.endDate.trim())
      ) {
        return { kind: 'complete', label: 'Completed' };
      }
      return {
        kind: 'in_progress',
        label: `${filled}/${Math.max(content.education.length, 1)}`,
      };
    }
    case 'skills':
      if (skillsComplete(content)) return { kind: 'complete', label: 'Completed' };
      if (content.skills.length > 0) {
        return { kind: 'in_progress', label: `${content.skills.length}/2` };
      }
      return { kind: 'action_required', label: 'Add details' };
    case 'certifications':
      return certificationsStatus(content);
    case 'hobbies':
      return hobbiesStatus(content);
    case 'languages':
      return languagesStatus(content);
    case 'voluntary':
      return listExperienceStatus(content.voluntaryExperience, false);
    default:
      return { kind: 'action_required', label: 'Add details' };
  }
}

export function isSectionComplete(content: CVContent, sectionId: CVSectionId): boolean {
  return getSectionStatus(content, sectionId).kind === 'complete';
}

export function calculateCVProgress(content: CVContent): number {
  const layout = getLayoutFromContent(content);
  const enabled = getEnabledSections(layout).filter((id) => !OPTIONAL_SECTION_IDS.includes(id));
  if (enabled.length === 0) return 0;

  const completed = enabled.filter((id) => isSectionComplete(content, id)).length;
  return Math.round((completed / enabled.length) * 100);
}

export function getProgressMessage(percent: number): string {
  if (percent >= 100) return 'Your CV is ready to preview and download.';
  if (percent >= 60) return 'Almost there! Finish the remaining sections.';
  if (percent >= 30) return 'Great start! Keep going to build your perfect CV.';
  return 'Begin with personal information and work experience.';
}
