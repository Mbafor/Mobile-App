import { PDFViewer } from '@react-pdf/renderer';
import { StyleSheet, View } from 'react-native';

import { ResumeDocument } from '@/features/cv-builder/pdf/resume/ResumeDocument';
import type { CVContent } from '@/types/domain/cv';

type CVPdfPreviewPanelProps = {
  data: CVContent;
  templateId: string;
};

export function CVPdfPreviewPanel({ data, templateId }: CVPdfPreviewPanelProps) {
  // PDFViewer on web uses DOM styles, not React Native styles.
  const viewerStyle = { width: '100%', height: '100%', border: 'none' } as any;

  return (
    <View style={styles.wrap}>
      <PDFViewer style={viewerStyle} showToolbar={false}>
        <ResumeDocument data={data} templateId={templateId} />
      </PDFViewer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 480,
    backgroundColor: '#525659',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
