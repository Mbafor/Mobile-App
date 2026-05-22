import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { colors, spacing } from '@/constants/theme';
import { getProgressMessage } from '@/features/cv-builder/utils/section-config';

type CVHubDocToolbarProps = {
  title: string;
  progressPercent: number;
  onPreview: () => void;
  onDownload?: () => void;
  downloadLoading?: boolean;
};

export function CVHubDocToolbar({
  title,
  progressPercent,
  onPreview,
  onDownload,
  downloadLoading = false,
}: CVHubDocToolbarProps) {
  const pct = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.docIcon}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.actions}>
          {onDownload ? (
            <Pressable
              onPress={onDownload}
              style={[styles.downloadBtn, downloadLoading && styles.btnDisabled]}
              disabled={downloadLoading}
            >
              <Ionicons name="download-outline" size={18} color={colors.background} />
              <Text style={styles.downloadText}>
                {downloadLoading ? '…' : 'Download'}
              </Text>
            </Pressable>
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
    backgroundColor: cvDocsTheme.primaryTint,
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
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  downloadText: { fontSize: 13, fontWeight: '600', color: colors.background },
  btnDisabled: { opacity: 0.6 },
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
