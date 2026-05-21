export type CVTemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative';

export type CVTemplateDefinition = {
  id: CVTemplateId;
  label: string;
  description: string;
  isFree: boolean;
};

export const CV_TEMPLATES: CVTemplateDefinition[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Traditional layout',
    isFree: false,
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean two-tone style',
    isFree: false,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Light and spacious',
    isFree: false,
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Bold professional header',
    isFree: false,
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Colourful accents',
    isFree: false,
  },
];

export function isTemplateFree(templateId: string): boolean {
  return CV_TEMPLATES.find((t) => t.id === templateId)?.isFree ?? false;
}

export function getTemplateDefinition(templateId: string): CVTemplateDefinition | undefined {
  return CV_TEMPLATES.find((t) => t.id === templateId);
}

export const DEFAULT_TEMPLATE_ID: CVTemplateId = 'classic';
