import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { CVPdfDownloadButton } from '@/features/cv-builder/components/preview/CVPdfDownloadButton';
import { CVPdfPreviewPanel } from '@/features/cv-builder/components/preview/CVPdfPreviewPanel';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { useCVPaymentContext } from '@/features/cv-builder/context/CVPaymentContext';
import { useCVTemplateDownload } from '@/features/cv-builder/hooks/useCVTemplateDownload';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import { getEnabledSections, getSectionStatus } from '@/features/cv-builder/utils/section-config';

export function CVEditorPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cv, content, templateId, layout, isLoading, error } = useCVBuilderContext();
  const payment = useCVPaymentContext();
  const { downloadWithTemplate, isDownloading } = useCVTemplateDownload();

  const templateLabel = getTemplateDefinition(templateId)?.label ?? templateId;
  const fileName = useMemo(
    () => `${cv?.title.trim() || 'My-CV'}.pdf`,
    [cv?.title],
  );
  const purchased = payment.isTemplatePurchased(templateId);
  const enabledSections = useMemo(() => getEnabledSections(layout), [layout]);

  const handleDownloadRequest = useCallback(() => {
    downloadWithTemplate(templateId);
  }, [downloadWithTemplate, templateId]);

  const openSection = (sectionId: CVSectionId) => {
    if (!cv) return;
    router.push(ROUTES.MAIN.CV_BUILDER.section(cv.id, sectionId) as Href);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !cv) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={error instanceof Error ? error.message : 'CV not found'} />
      </View>
    );
  }

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.toolbarCopy}>
          <Text style={styles.title} numberOfLines={1}>
            {cv.title}
          </Text>
          <Text muted variant="caption">
            {templateLabel} · live PDF preview
          </Text>
        </View>

        <CVPdfDownloadButton
          data={content}
          templateId={templateId}
          fileName={fileName}
          compact
          label="Download PDF"
          loading={isDownloading}
          disabled={isDownloading}
          purchased={purchased}
          onPress={handleDownloadRequest}
        />
      </View>

      <View style={styles.workspace}>
        <View style={styles.outlinePanel}>
          <Text style={styles.panelTitle}>Sections</Text>
          <ScrollView style={styles.outlineScroll} showsVerticalScrollIndicator={false}>
            {enabledSections.map((sectionId) => {
              const meta = getSectionMeta(sectionId);
              const status = getSectionStatus(content, sectionId);
              return (
                <Pressable
                  key={sectionId}
                  style={styles.outlineRow}
                  onPress={() => openSection(sectionId)}
                >
                  <Text style={styles.outlineRowTitle}>{meta.title}</Text>
                  <Text style={styles.outlineRowMeta}>{status.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.previewPanel}>
          <CVPdfPreviewPanel data={content} templateId={templateId} />
        </View>
      </View>

      {Platform.OS !== 'web' ? (
        <View style={[styles.nativeHint, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text muted variant="caption" style={styles.nativeHintText}>
            Open this CV on web for the inline PDF preview canvas. Download still uses the same PDF
            template on all platforms.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cvDocsTheme.canvasBg,
  },
  toolbarCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '600' },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 0,
  },
  outlinePanel: {
    width: 240,
    maxWidth: '32%',
    backgroundColor: cvDocsTheme.canvasBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cvDocsTheme.divider,
    padding: spacing.sm,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: cvDocsTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  outlineScroll: { flex: 1 },
  outlineRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cvDocsTheme.divider,
  },
  outlineRowTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  outlineRowMeta: { fontSize: 11, color: cvDocsTheme.textSecondary, marginTop: 2 },
  previewPanel: {
    flex: 1,
    minWidth: 0,
    minHeight: 480,
  },
  nativeHint: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: cvDocsTheme.barBg,
    borderTopWidth: 1,
    borderTopColor: cvDocsTheme.divider,
  },
  nativeHintText: { textAlign: 'center', lineHeight: 18 },
});
