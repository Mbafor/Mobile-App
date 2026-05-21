import type { CVSectionId } from '@/features/cv-builder/constants/sections';

export type CVSectionIconName =
  | 'person-outline'
  | 'document-text-outline'
  | 'briefcase-outline'
  | 'school-outline'
  | 'flash-outline'
  | 'ribbon-outline'
  | 'heart-outline'
  | 'language-outline'
  | 'people-outline';

export const CV_SECTION_ICONS: Record<CVSectionId, CVSectionIconName> = {
  personal: 'person-outline',
  summary: 'document-text-outline',
  experience: 'briefcase-outline',
  education: 'school-outline',
  skills: 'flash-outline',
  certifications: 'ribbon-outline',
  hobbies: 'heart-outline',
  languages: 'language-outline',
  voluntary: 'people-outline',
};

export const CV_SECTION_ICON_BG: Record<CVSectionId, string> = {
  personal: '#E8F0EB',
  summary: '#E8EEF5',
  experience: '#EDE8F5',
  education: '#F5F0E8',
  skills: '#E8F5EE',
  certifications: '#F5E8E8',
  hobbies: '#F0E8F5',
  languages: '#E8F2F5',
  voluntary: '#F5EDE8',
};

export const CV_SECTION_ICON_COLOR: Record<CVSectionId, string> = {
  personal: '#2D5A3D',
  summary: '#3D5A7A',
  experience: '#4A3D6B',
  education: '#6B5A2D',
  skills: '#2D6B4A',
  certifications: '#6B3D3D',
  hobbies: '#5A3D6B',
  languages: '#2D5A6B',
  voluntary: '#6B4A3D',
};
