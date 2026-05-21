import { ClassicTemplatePreview } from '@/features/cv-builder/components/preview/ClassicTemplatePreview';
import { CreativeTemplatePreview } from '@/features/cv-builder/components/preview/CreativeTemplatePreview';
import { ExecutiveTemplatePreview } from '@/features/cv-builder/components/preview/ExecutiveTemplatePreview';
import { MinimalTemplatePreview } from '@/features/cv-builder/components/preview/MinimalTemplatePreview';
import { ModernTemplatePreview } from '@/features/cv-builder/components/preview/ModernTemplatePreview';
import type { CVTemplateId } from '@/features/cv-builder/constants/templates';
import { DEFAULT_TEMPLATE_ID } from '@/features/cv-builder/constants/templates';
import type { CVContent } from '@/types/domain/cv';

type CVPreviewViewProps = {
  templateId: string;
  content: CVContent;
};

export function CVPreviewView({ templateId, content }: CVPreviewViewProps) {
  const id = (templateId as CVTemplateId) || DEFAULT_TEMPLATE_ID;

  switch (id) {
    case 'modern':
      return <ModernTemplatePreview content={content} />;
    case 'minimal':
      return <MinimalTemplatePreview content={content} />;
    case 'executive':
      return <ExecutiveTemplatePreview content={content} />;
    case 'creative':
      return <CreativeTemplatePreview content={content} />;
    case 'classic':
    default:
      return <ClassicTemplatePreview content={content} />;
  }
}
