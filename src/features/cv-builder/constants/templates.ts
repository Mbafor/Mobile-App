export type CVTemplateId = 'ats' | 'modern' | 'tech' | 'executive' | 'minimal';

export type CVTemplateDefinition = {
  id: CVTemplateId;
  label: string;
  description: string;
  isFree: boolean;
};

/** Matches website CV builder templates (ATS, Modern, Tech, Executive/Jessica, Minimal/Elite). */
/** Every layout requires a one-time GHS 100 unlock per template. */
export const CV_TEMPLATES: CVTemplateDefinition[] = [
  {
    id: 'ats',
    label: 'ATS Elite',
    description: 'Single-column, ATS-optimized layout',
    isFree: false,
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Blue accents with structured sections',
    isFree: false,
  },
  {
    id: 'tech',
    label: 'Tech',
    description: 'Navy sidebar with timeline experience',
    isFree: false,
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Top banner with left-rail section headers',
    isFree: false,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Swiss two-column professional layout',
    isFree: false,
  },
];

const LEGACY_TEMPLATE_IDS: Record<string, CVTemplateId> = {
  classic: 'ats',
  creative: 'tech',
};

export function resolveTemplateId(templateId: string): CVTemplateId {
  if (CV_TEMPLATES.some((t) => t.id === templateId)) {
    return templateId as CVTemplateId;
  }
  return LEGACY_TEMPLATE_IDS[templateId] ?? 'ats';
}

export function isTemplateFree(templateId: string): boolean {
  const id = resolveTemplateId(templateId);
  return CV_TEMPLATES.find((t) => t.id === id)?.isFree ?? false;
}

export function getTemplateDefinition(templateId: string): CVTemplateDefinition | undefined {
  const id = resolveTemplateId(templateId);
  return CV_TEMPLATES.find((t) => t.id === id);
}

export const DEFAULT_TEMPLATE_ID: CVTemplateId = 'ats';
