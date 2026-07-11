import i18n from '@/i18n';

export type CVTemplateId = 'ats' | 'modern' | 'tech' | 'executive' | 'minimal';

export type CVTemplateDefinition = {
  id: CVTemplateId;
  label: string;
  description: string;
  isFree: boolean;
};

/** Matches website CV builder templates (ATS, Modern, Tech, Executive/Jessica, Minimal/Elite). */
/** All layouts can be selected and previewed freely; PDF download is paid separately. */
const ACTIVE_TEMPLATES: { id: CVTemplateId; isFree: boolean }[] = [
  { id: 'ats', isFree: true },
  { id: 'modern', isFree: true },
  /* { id: 'tech', isFree: true }, */
  { id: 'executive', isFree: true },
  /* { id: 'minimal', isFree: true }, */
];

export function getCVTemplates(): CVTemplateDefinition[] {
  return ACTIVE_TEMPLATES.map(({ id, isFree }) => ({
    id,
    label: i18n.t(`cvBuilder.templateDefs.${id}.label`),
    description: i18n.t(`cvBuilder.templateDefs.${id}.description`),
    isFree,
  }));
}

const LEGACY_TEMPLATE_IDS: Record<string, CVTemplateId> = {
  classic: 'ats',
  creative: 'tech',
};

export function resolveTemplateId(templateId: string): CVTemplateId {
  if (ACTIVE_TEMPLATES.some((t) => t.id === templateId)) {
    return templateId as CVTemplateId;
  }
  return LEGACY_TEMPLATE_IDS[templateId] ?? 'ats';
}

export function isTemplateFree(templateId: string): boolean {
  const id = resolveTemplateId(templateId);
  return ACTIVE_TEMPLATES.find((t) => t.id === id)?.isFree ?? false;
}

export function getTemplateDefinition(templateId: string): CVTemplateDefinition | undefined {
  const id = resolveTemplateId(templateId);
  return getCVTemplates().find((t) => t.id === id);
}

export const DEFAULT_TEMPLATE_ID: CVTemplateId = 'ats';
