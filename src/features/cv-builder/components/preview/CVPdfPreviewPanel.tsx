import { PDFViewer } from '@react-pdf/renderer';
import { StyleSheet, View } from 'react-native';

import { ResumeDocument } from '@/features/cv-builder/pdf/resume/ResumeDocument';
import type { CVContent } from '@/types/domain/cv';

type CVPdfPreviewPanelProps = {
  data: CVContent;
  templateId: string;
};

/** Native fallback — PDFViewer is web-only; use the editor preview route on web. */
export function CVPdfPreviewPanel(_props: CVPdfPreviewPanelProps) {
  return <View style={styles.placeholder} />;
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, minHeight: 480 },
});

export { PDFViewer, ResumeDocument };
