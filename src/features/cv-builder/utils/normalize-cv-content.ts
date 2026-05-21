import { normalizeLayout } from '@/features/cv-builder/utils/section-config';
import type {
  CVCertificationEntry,
  CVContent,
  CVEducationEntry,
  CVExperienceEntry,
  CVLanguageEntry,
  CVLayoutConfig,
} from '@/types/domain/cv';
import { EMPTY_CV_CONTENT } from '@/types/domain/cv';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeExperience(raw: unknown): CVExperienceEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVExperienceEntry>;
  return {
    id: e.id ?? newId(),
    company: e.company ?? '',
    role: e.role ?? '',
    location: e.location ?? '',
    startDate: e.startDate ?? '',
    endDate: e.currentlyWorking ? '' : (e.endDate ?? ''),
    currentlyWorking: Boolean(e.currentlyWorking),
    description: e.description ?? '',
  };
}

function normalizeEducation(raw: unknown): CVEducationEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVEducationEntry> & {
    institution?: string;
    description?: string;
  };
  return {
    id: e.id ?? newId(),
    school: e.school ?? e.institution ?? '',
    degree: e.degree ?? '',
    fieldOfStudy: e.fieldOfStudy ?? '',
    startDate: e.startDate ?? '',
    endDate: e.endDate ?? '',
    gpa: e.gpa ?? '',
  };
}

function normalizeCertification(raw: unknown): CVCertificationEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVCertificationEntry> & {
    date?: string;
  };
  return {
    id: e.id ?? newId(),
    name: e.name ?? '',
    issuer: e.issuer ?? '',
    year: e.year ?? e.date?.slice(0, 4) ?? '',
  };
}

function normalizeLanguage(raw: unknown): CVLanguageEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVLanguageEntry>;
  return {
    id: e.id ?? newId(),
    language: e.language ?? '',
    proficiency: e.proficiency ?? '',
  };
}

/** Ensures stored JSON matches the current CVContent shape (handles older saves). */
export function normalizeCVContent(raw: unknown): CVContent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...EMPTY_CV_CONTENT, personalInfo: { ...EMPTY_CV_CONTENT.personalInfo } };
  }

  const partial = raw as Partial<CVContent> & {
    projects?: unknown[];
    references?: string;
  };

  const rawLayout = partial.layout as CVLayoutConfig | undefined;

  return {
    personalInfo: {
      ...EMPTY_CV_CONTENT.personalInfo,
      ...(partial.personalInfo ?? {}),
    },
    summary: partial.summary ?? '',
    experience: (partial.experience ?? []).map(normalizeExperience),
    education: (partial.education ?? []).map(normalizeEducation),
    skills: Array.isArray(partial.skills) ? partial.skills.map(String) : [],
    certifications: (partial.certifications ?? []).map(normalizeCertification),
    hobbies: Array.isArray(partial.hobbies) ? partial.hobbies.map(String) : [],
    languages: (partial.languages ?? []).map(normalizeLanguage),
    voluntaryExperience: (partial.voluntaryExperience ?? []).map(normalizeExperience),
    layout: normalizeLayout(
      rawLayout
        ? {
            sectionOrder: rawLayout.sectionOrder as CVSectionId[],
            disabledSections: rawLayout.disabledSections as CVSectionId[],
          }
        : undefined,
    ),
  };
}

export function createEmptyExperience(): CVExperienceEntry {
  return normalizeExperience({});
}

export function createEmptyEducation(): CVEducationEntry {
  return normalizeEducation({});
}

export function createEmptyCertification(): CVCertificationEntry {
  return normalizeCertification({});
}

export function createEmptyLanguage(): CVLanguageEntry {
  return normalizeLanguage({});
}
