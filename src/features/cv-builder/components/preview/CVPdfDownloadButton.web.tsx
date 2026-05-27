import { PDFDownloadLink } from '@react-pdf/renderer';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { ResumeDocument } from '@/features/cv-builder/pdf/resume/ResumeDocument';
import type { CVContent } from '@/types/domain/cv';

type CVPdfDownloadButtonProps = {
  data: CVContent;
  templateId: string;
  fileName: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
  purchased?: boolean;
};

export function CVPdfDownloadButton({
  data,
  templateId,
  fileName,
  onPress,
  loading = false,
  disabled = false,
  label = 'Download PDF',
  compact = false,
  purchased = false,
}: CVPdfDownloadButtonProps) {
  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const buttonStyles = [
    compact ? styles.compactBtn : styles.btn,
    (disabled || loading) && styles.btnDisabled,
  ];

  if (!purchased) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading || !onPress}
        style={buttonStyles}
      >
        <Text style={compact ? styles.compactText : styles.btnText}>
          {loading ? 'Generating…' : label}
        </Text>
      </Pressable>
    );
  }

  return (
    <PDFDownloadLink
      document={<ResumeDocument data={data} templateId={templateId} />}
      fileName={safeFileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading: pdfLoading }) => (
        <Pressable
          disabled={disabled || loading || pdfLoading}
          style={[...buttonStyles, (disabled || loading || pdfLoading) && styles.btnDisabled]}
        >
          <Text style={compact ? styles.compactText : styles.btnText}>
            {loading || pdfLoading ? 'Generating…' : label}
          </Text>
        </Pressable>
      )}
    </PDFDownloadLink>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 14, fontWeight: '700', color: colors.background },
  compactText: { fontSize: 13, fontWeight: '600', color: colors.background },
});
