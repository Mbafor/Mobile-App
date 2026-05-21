import type { CVSectionId } from '@/features/cv-builder/constants/sections';

export type CVSectionMeta = {
  title: string;
  description: string;
  addLabel?: string;
};

export const CV_SECTION_META: Record<CVSectionId, CVSectionMeta> = {
  personal: {
    title: 'Personal Information',
    description: 'Name, email, phone, and location',
  },
  summary: {
    title: 'Professional Summary',
    description: 'A short overview of your background',
  },
  experience: {
    title: 'Experience',
    description: 'Your work history and achievements',
    addLabel: 'Add work experience',
  },
  education: {
    title: 'Education',
    description: 'Schools, degrees, and academic highlights',
    addLabel: 'Add education',
  },
  skills: {
    title: 'Skills',
    description: 'Technical and soft skills',
    addLabel: 'Add skill',
  },
  certifications: {
    title: 'Certificates',
    description: 'Licences and professional credentials',
    addLabel: 'Add certification',
  },
  hobbies: {
    title: 'Hobbies',
    description: 'Interests that add personality',
    addLabel: 'Add hobby',
  },
  languages: {
    title: 'Languages',
    description: 'Languages and proficiency levels',
    addLabel: 'Add language',
  },
  voluntary: {
    title: 'Volunteer',
    description: 'Community and unpaid roles',
    addLabel: 'Add voluntary role',
  },
};

export function getSectionMeta(sectionId: CVSectionId): CVSectionMeta {
  return CV_SECTION_META[sectionId];
}
