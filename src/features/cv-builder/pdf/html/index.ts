import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import type { CVContent } from '@/types/domain/cv';

import { renderAtsHtml } from './ats-html';
import { renderExecutiveHtml } from './executive-html';
import { renderMinimalHtml } from './minimal-html';
import { renderModernHtml } from './modern-html';
import { prepareContentForPdfExport } from './prepare-export-content';
import { renderTechHtml } from './tech-html';

/** Renders standalone HTML for one template from structured CV data (PDF export only). */
export function renderCvHtml(templateId: string, content: CVContent): string {
  const exportContent = prepareContentForPdfExport(content);
  const id = resolveTemplateId(templateId) as CVTemplateId;

  switch (id) {
    case 'modern':
      return renderModernHtml(exportContent);
    case 'tech':
      return renderTechHtml(exportContent);
    case 'executive':
      return renderExecutiveHtml(exportContent);
    case 'minimal':
      return renderMinimalHtml(exportContent);
    case 'ats':
    default:
      return renderAtsHtml(exportContent);
  }
}

export { prepareContentForPdfExport } from './prepare-export-content';
