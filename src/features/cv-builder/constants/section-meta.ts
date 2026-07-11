import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import i18n from '@/i18n';

export type CVSectionMeta = {
  title: string;
  description: string;
  addLabel?: string;
};

const SECTIONS_WITH_ADD_LABEL: CVSectionId[] = [
  'experience',
  'projects',
  'education',
  'skills',
  'certifications',
  'achievements',
  'hobbies',
  'languages',
  'voluntary',
  'references',
];

export function getSectionMeta(sectionId: CVSectionId): CVSectionMeta {
  return {
    title: i18n.t(`cvBuilder.sections.${sectionId}.title`),
    description: i18n.t(`cvBuilder.sections.${sectionId}.description`),
    addLabel: SECTIONS_WITH_ADD_LABEL.includes(sectionId)
      ? i18n.t(`cvBuilder.sections.${sectionId}.addLabel`)
      : undefined,
  };
}
