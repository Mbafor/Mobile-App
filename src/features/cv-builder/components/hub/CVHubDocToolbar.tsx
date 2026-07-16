import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { CVPdfDownloadButton } from '@/features/cv-builder/components/preview/CVPdfDownloadButton';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
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
  const styles = useAppThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
      <View style={styles.titleRow}>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.CV_BUILDER.DASHBOARD as Href)}
          style={styles.docIcon}
          accessibilityRole="button"
          accessibilityLabel={t('cvBuilder.hub.backToDocuments')}
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
              label={t('cvBuilder.hub.downloadPdf')}
            />
          ) : null}
          <Pressable onPress={onPreview} style={styles.previewBtn}>
            <Ionicons name="eye-outline" size={18} color={colors.textOnPrimary} />
            <Text style={styles.previewText}>{t('cvBuilder.hub.previewLabel')}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: pct }]} />
        <View style={{ flex: 100 - pct }} />
      </View>
      <Text style={styles.progressMeta}>
        {t('cvBuilder.hub.percentComplete', { percent: progressPercent, message: getProgressMessage(progressPercent) })}
      </Text>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: {
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  inner: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
    backgroundColor: colors.primary,
  },
  previewText: { fontSize: 13, fontWeight: '600', color: colors.textOnPrimary },
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
}
