import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { CVPdfDownloadButton } from '@/features/cv-builder/components/preview/CVPdfDownloadButton';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { getProgressMessage } from '@/features/cv-builder/utils/section-config';
import type { CVContent } from '@/types/domain/cv';

type CVHubDocToolbarProps = {
  title: string;
  progressPercent: number;
  onPreview: () => void;
  downloadProps?: {
    data: CVContent;
    templateId: string;
    fileName: string;
    purchased: boolean;
    onDownloadRequest: () => void;
    loading?: boolean;
  };
};

export function CVHubDocToolbar({
  title,
  progressPercent,
  onPreview,
  downloadProps,
}: CVHubDocToolbarProps) {
  const router = useRouter();
  const pct = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.CV_BUILDER.DASHBOARD as Href)}
          style={styles.docIcon}
          accessibilityRole="button"
          accessibilityLabel="Back to all documents"
          hitSlop={8}
        >
          <Ionicons name="document-text" size={20} color={colors.background} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.actions}>
          {downloadProps ? (
            <CVPdfDownloadButton
              data={downloadProps.data}
              templateId={downloadProps.templateId}
              fileName={downloadProps.fileName}
              purchased={downloadProps.purchased}
              onPress={downloadProps.onDownloadRequest}
              loading={downloadProps.loading}
              disabled={downloadProps.loading}
              compact
              label="Download PDF"
            />
          ) : null}
          <Pressable onPress={onPreview} style={styles.previewBtn}>
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
            <Text style={styles.previewText}>Preview</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: pct }]} />
        <View style={{ flex: 100 - pct }} />
      </View>
      <Text style={styles.progressMeta}>
        {progressPercent}% complete · {getProgressMessage(progressPercent)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: cvDocsTheme.barBg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    backgroundColor: cvDocsTheme.primaryTint,
  },
  previewText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  progressTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: cvDocsTheme.searchBg,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressMeta: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: cvDocsTheme.textSecondary,
  },
});
