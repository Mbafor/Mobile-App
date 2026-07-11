import {
  ALL_SECTION_IDS,
  DEFAULT_SECTION_ORDER,
  OPTIONAL_SECTION_IDS,
  type CVSectionId,
} from '@/features/cv-builder/constants/sections';
import type { CVContent, CVLayoutConfig } from '@/types/domain/cv';
import i18n from '@/i18n';

const completed = () => ({ kind: 'complete' as const, label: i18n.t('cvBuilder.status.completed') });
const optional = () => ({ kind: 'optional' as const, label: i18n.t('cvBuilder.status.optional') });
const addDetails = () => ({ kind: 'action_required' as const, label: i18n.t('cvBuilder.status.addDetails') });
const inProgress = () => ({ kind: 'in_progress' as const, label: i18n.t('cvBuilder.status.inProgress') });
const fraction = (filled: number, total: number) => ({
  kind: 'in_progress' as const,
  label: i18n.t('cvBuilder.status.fraction', { filled, total }),
});

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
    return optional();
  }
  if (filled >= 1 && content.certifications.every((c) => c.name.trim() && c.year.trim())) {
    return completed();
  }
  return fraction(filled, content.certifications.length || 1);
}

function languagesStatus(content: CVContent): CVSectionStatus {
  const filled = content.languages.filter((l) => l.language.trim()).length;
  if (filled === 0) {
    return addDetails();
  }
  if (content.languages.every((l) => l.language.trim() && l.proficiency.trim())) {
    return completed();
  }
  return fraction(filled, content.languages.length);
}

function listExperienceStatus(
  entries: CVContent['experience'],
  required: boolean,
): CVSectionStatus {
  const filled = entries.filter((e) => e.company.trim() && e.role.trim()).length;
  if (filled === 0) {
    return required ? addDetails() : optional();
  }
  const complete = entries.filter(
    (e) => e.company.trim() && e.role.trim() && e.startDate.trim(),
  ).length;
  if (complete >= 1 && complete === entries.length) {
    return completed();
  }
  return fraction(filled, Math.max(entries.length, 1));
}

function hobbiesStatus(content: CVContent): CVSectionStatus {
  if (content.hobbies.length === 0) {
    return optional();
  }
  return completed();
}

export function getSectionStatus(content: CVContent, sectionId: CVSectionId): CVSectionStatus {
  switch (sectionId) {
    case 'personal':
      return personalComplete(content) ? completed() : addDetails();
    case 'summary':
      return summaryComplete(content)
        ? completed()
        : content.summary.trim()
          ? inProgress()
          : addDetails();
    case 'experience':
      return listExperienceStatus(content.experience, true);
    case 'education': {
      const filled = content.education.filter((e) => e.school.trim() && e.degree.trim()).length;
      if (filled === 0) return addDetails();
      if (
        content.education.length > 0 &&
        content.education.every((e) => e.school.trim() && e.degree.trim() && e.endDate.trim())
      ) {
        return completed();
      }
      return fraction(filled, Math.max(content.education.length, 1));
    }
    case 'skills':
      if (skillsComplete(content)) return completed();
      if (content.skills.length > 0) {
        return fraction(content.skills.length, 2);
      }
      return addDetails();
    case 'certifications':
      return certificationsStatus(content);
    case 'hobbies':
      return hobbiesStatus(content);
    case 'languages':
      return languagesStatus(content);
    case 'voluntary':
      return listExperienceStatus(content.voluntaryExperience, false);
    case 'projects': {
      const filled = content.projects.filter((p) => p.name.trim()).length;
      if (filled === 0) return optional();
      if (content.projects.every((p) => p.name.trim() && p.description.trim())) {
        return completed();
      }
      return fraction(filled, content.projects.length);
    }
    case 'achievements': {
      const filled = content.achievements.filter((a) => a.title.trim()).length;
      if (filled === 0) return optional();
      if (content.achievements.every((a) => a.title.trim())) {
        return completed();
      }
      return fraction(filled, content.achievements.length);
    }
    case 'references': {
      const filled = content.references.filter((r) => r.name.trim()).length;
      if (filled === 0) return optional();
      if (content.references.every((r) => r.name.trim() && r.company.trim())) {
        return completed();
      }
      return fraction(filled, content.references.length);
    }
    default:
      return addDetails();
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
  if (percent >= 100) return i18n.t('cvBuilder.progress.ready');
  if (percent >= 60) return i18n.t('cvBuilder.progress.almostThere');
  if (percent >= 30) return i18n.t('cvBuilder.progress.greatStart');
  return i18n.t('cvBuilder.progress.begin');
}
