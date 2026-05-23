import { ATSTemplate } from '@/features/cv-builder/templates/ATSTemplate';
import { ExecutiveTemplate } from '@/features/cv-builder/templates/ExecutiveTemplate';
import { MinimalTemplate } from '@/features/cv-builder/templates/MinimalTemplate';
import { ModernTemplate } from '@/features/cv-builder/templates/ModernTemplate';
import { TechTemplate } from '@/features/cv-builder/templates/TechTemplate';
import {
  DEFAULT_TEMPLATE_ID,
  resolveTemplateId,
} from '@/features/cv-builder/constants/templates';
import type { CVContent } from '@/types/domain/cv';

export type CVTemplateRendererProps = {
  templateId: string;
  content: CVContent;
};

/** On-screen preview only — PDF export uses dedicated HTML templates in pdf/html/. */
export function CVTemplateRenderer({ templateId, content }: CVTemplateRendererProps) {
  const id = resolveTemplateId(templateId || DEFAULT_TEMPLATE_ID);

  switch (id) {
    case 'modern':
      return <ModernTemplate content={content} />;
    case 'tech':
      return <TechTemplate content={content} />;
    case 'executive':
      return <ExecutiveTemplate content={content} />;
    case 'minimal':
      return <MinimalTemplate content={content} />;
    case 'ats':
    default:
      return <ATSTemplate content={content} />;
  }
}
