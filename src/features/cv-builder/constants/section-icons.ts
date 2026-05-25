import type { CVSectionId } from '@/features/cv-builder/constants/sections';

export type CVSectionIconName =
  | 'person-outline'
  | 'document-text-outline'
  | 'briefcase-outline'
  | 'folder-open-outline'
  | 'school-outline'
  | 'flash-outline'
  | 'ribbon-outline'
  | 'trophy-outline'
  | 'heart-outline'
  | 'language-outline'
  | 'people-outline'
  | 'call-outline';

export const CV_SECTION_ICONS: Record<CVSectionId, CVSectionIconName> = {
  personal: 'person-outline',
  summary: 'document-text-outline',
  experience: 'briefcase-outline',
  projects: 'folder-open-outline',
  education: 'school-outline',
  skills: 'flash-outline',
  certifications: 'ribbon-outline',
  achievements: 'trophy-outline',
  hobbies: 'heart-outline',
  languages: 'language-outline',
  voluntary: 'people-outline',
  references: 'call-outline',
};

export const CV_SECTION_ICON_BG: Record<CVSectionId, string> = {
  personal: '#F0F4F8',
  summary: '#F0F4F8',
  experience: '#F0F4F8',
  projects: '#F0F4F8',
  education: '#F0F4F8',
  skills: '#F0F4F8',
  certifications: '#F0F4F8',
  achievements: '#F0F4F8',
  hobbies: '#F0F4F8',
  languages: '#F0F4F8',
  voluntary: '#F0F4F8',
  references: '#F0F4F8',
};

export const CV_SECTION_ICON_COLOR: Record<CVSectionId, string> = {
  personal: '#1F73B7',
  summary: '#1F73B7',
  experience: '#1F73B7',
  projects: '#1F73B7',
  education: '#1F73B7',
  skills: '#1F73B7',
  certifications: '#1F73B7',
  achievements: '#1F73B7',
  hobbies: '#1F73B7',
  languages: '#1F73B7',
  voluntary: '#1F73B7',
  references: '#1F73B7',
};
