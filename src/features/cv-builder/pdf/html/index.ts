import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import type { CVContent } from '@/types/domain/cv';

import { renderAtsHtml } from './ats-html';
import { renderExecutiveHtml } from './executive-html';
import { renderMinimalHtml } from './minimal-html';
import { renderModernHtml } from './modern-html';
import { renderTechHtml } from './tech-html';

export function renderCvHtml(templateId: string, content: CVContent): string {
  const id = resolveTemplateId(templateId) as CVTemplateId;

  switch (id) {
    case 'modern':
      return renderModernHtml(content);
    case 'tech':
      return renderTechHtml(content);
    case 'executive':
      return renderExecutiveHtml(content);
    case 'minimal':
      return renderMinimalHtml(content);
    case 'ats':
    default:
      return renderAtsHtml(content);
  }
}
