import { Document } from '@react-pdf/renderer';

import {
  DEFAULT_TEMPLATE_ID,
  resolveTemplateId,
  type CVTemplateId,
} from '@/features/cv-builder/constants/templates';
import { prepareContentForPdfExport } from '@/features/cv-builder/pdf/prepare-export-content';
import { AtsResumePage } from '@/features/cv-builder/pdf/resume/templates/ats-page';
import { ExecutiveResumePage } from '@/features/cv-builder/pdf/resume/templates/executive-page';
import { MinimalResumePage } from '@/features/cv-builder/pdf/resume/templates/minimal-page';
import { ModernResumePage } from '@/features/cv-builder/pdf/resume/templates/modern-page';
import { TechResumePage } from '@/features/cv-builder/pdf/resume/templates/tech-page';
import type { CVContent } from '@/types/domain/cv';

export type ResumeDocumentProps = {
  data: CVContent;
  templateId: string;
};

function ResumePage({ data, templateId }: { data: CVContent; templateId: CVTemplateId }) {
  switch (templateId) {
    case 'modern':
      return <ModernResumePage data={data} />;
    case 'tech':
      return <TechResumePage data={data} />;
    case 'executive':
      return <ExecutiveResumePage data={data} />;
    case 'minimal':
      return <MinimalResumePage data={data} />;
    case 'ats':
    default:
      return <AtsResumePage data={data} />;
  }
}

/** Single source of truth for CV preview and PDF download. */
export function ResumeDocument({ data, templateId }: ResumeDocumentProps) {
  const resolvedTemplateId = resolveTemplateId(templateId || DEFAULT_TEMPLATE_ID);
  const exportData = prepareContentForPdfExport(data);

  return (
    <Document title={exportData.personalInfo.fullName.trim() || 'CV'}>
      <ResumePage data={exportData} templateId={resolvedTemplateId} />
    </Document>
  );
}

export function createResumeDocumentElement(data: CVContent, templateId: string) {
  return <ResumeDocument data={data} templateId={templateId} />;
}
