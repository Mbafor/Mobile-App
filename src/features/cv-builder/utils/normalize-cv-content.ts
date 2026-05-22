import { normalizeLayout } from '@/features/cv-builder/utils/section-config';
import type {
  CVAchievementEntry,
  CVCertificationEntry,
  CVContent,
  CVEducationEntry,
  CVExperienceEntry,
  CVLanguageEntry,
  CVLayoutConfig,
  CVProjectEntry,
  CVReferenceEntry,
} from '@/types/domain/cv';
import { EMPTY_CV_CONTENT } from '@/types/domain/cv';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeExperience(raw: unknown): CVExperienceEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVExperienceEntry> & {
    position?: string;
    company?: string;
  };
  return {
    id: e.id ?? newId(),
    company: e.company ?? '',
    role: e.role ?? e.position ?? '',
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
    field?: string;
    description?: string;
  };
  return {
    id: e.id ?? newId(),
    school: e.school ?? e.institution ?? '',
    degree: e.degree ?? '',
    fieldOfStudy: e.fieldOfStudy ?? e.field ?? '',
    startDate: e.startDate ?? '',
    endDate: e.endDate ?? '',
    gpa: e.gpa ?? '',
    description: e.description ?? '',
  };
}

function normalizeCertification(raw: unknown): CVCertificationEntry {
  if (typeof raw === 'string') {
    return { id: newId(), name: raw, issuer: '', year: '', description: '' };
  }
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVCertificationEntry> & {
    date?: string;
  };
  return {
    id: e.id ?? newId(),
    name: e.name ?? '',
    issuer: e.issuer ?? '',
    year: e.year ?? e.date?.slice(0, 4) ?? '',
    description: e.description ?? '',
  };
}

function normalizeLanguage(raw: unknown): CVLanguageEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVLanguageEntry> & {
    name?: string;
    level?: string;
  };
  return {
    id: e.id ?? newId(),
    language: e.language ?? e.name ?? '',
    proficiency: e.proficiency ?? e.level ?? '',
  };
}

function normalizeProject(raw: unknown): CVProjectEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVProjectEntry>;
  const tech = e.technologies;
  return {
    id: e.id ?? newId(),
    name: e.name ?? '',
    description: e.description ?? '',
    startDate: e.startDate ?? '',
    endDate: e.endDate ?? '',
    technologies: Array.isArray(tech) ? tech.join(', ') : (tech ?? ''),
    link: e.link ?? '',
  };
}

function normalizeAchievement(raw: unknown): CVAchievementEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVAchievementEntry>;
  return {
    id: e.id ?? newId(),
    title: e.title ?? '',
    date: e.date ?? '',
    description: e.description ?? '',
  };
}

function normalizeReference(raw: unknown): CVReferenceEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Partial<CVReferenceEntry>;
  return {
    id: e.id ?? newId(),
    name: e.name ?? '',
    position: e.position ?? '',
    company: e.company ?? '',
    email: e.email ?? '',
    phone: e.phone ?? '',
  };
}

/** Ensures stored JSON matches the current CVContent shape (handles older saves). */
export function normalizeCVContent(raw: unknown): CVContent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...EMPTY_CV_CONTENT, personalInfo: { ...EMPTY_CV_CONTENT.personalInfo } };
  }

  const partial = raw as Partial<CVContent> & {
    volunteerWork?: unknown[];
    achievements?: unknown[];
  };

  const rawLayout = partial.layout as CVLayoutConfig | undefined;
  const volunteerRaw = partial.voluntaryExperience ?? partial.volunteerWork ?? [];

  return {
    personalInfo: {
      ...EMPTY_CV_CONTENT.personalInfo,
      ...(partial.personalInfo ?? {}),
      linkedIn:
        (partial.personalInfo as { linkedIn?: string; linkedin?: string })?.linkedIn ??
        (partial.personalInfo as { linkedin?: string })?.linkedin ??
        '',
    },
    summary:
      partial.summary ??
      (partial.personalInfo as { summary?: string })?.summary ??
      '',
    experience: (partial.experience ?? []).map(normalizeExperience),
    education: (partial.education ?? []).map(normalizeEducation),
    skills: Array.isArray(partial.skills)
      ? partial.skills.map((s) =>
          typeof s === 'string' ? s : ((s as { name?: string }).name ?? ''),
        )
      : [],
    certifications: (partial.certifications ?? []).map(normalizeCertification),
    hobbies: Array.isArray(partial.hobbies) ? partial.hobbies.map(String) : [],
    languages: (partial.languages ?? []).map(normalizeLanguage),
    voluntaryExperience: volunteerRaw.map(normalizeExperience),
    projects: (partial.projects ?? []).map(normalizeProject),
    achievements: (partial.achievements ?? []).map(normalizeAchievement),
    references: (partial.references ?? []).map(normalizeReference),
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

export function createEmptyProject(): CVProjectEntry {
  return normalizeProject({});
}

export function createEmptyAchievement(): CVAchievementEntry {
  return normalizeAchievement({});
}

export function createEmptyReference(): CVReferenceEntry {
  return normalizeReference({});
}
