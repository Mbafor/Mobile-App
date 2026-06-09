import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { spacing } from '@/constants/theme';
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
  /** When true, native download uses the shared react-pdf export path on press. */
  purchased?: boolean;
};

/** Native download uses programmatic export via useCVDownload. */
export function CVPdfDownloadButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Download PDF',
  compact = false,
}: CVPdfDownloadButtonProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading || !onPress}
      style={[
        compact ? styles.compactBtn : styles.btn,
        (disabled || loading) && styles.btnDisabled,
      ]}
    >
      <Text style={compact ? styles.compactText : styles.btnText}>
        {loading ? 'Generating…' : label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
}
