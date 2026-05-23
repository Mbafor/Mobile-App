import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/feedback';
import { SearchField, Text } from '@/components/ui';
import { CVPreviewModal } from '@/features/cv-builder/components/CVPreviewModal';
import { CVHubDocToolbar } from '@/features/cv-builder/components/hub/CVHubDocToolbar';
import { CVReorderSectionsModal } from '@/features/cv-builder/components/hub/CVReorderSectionsModal';
import { CVSectionRow } from '@/features/cv-builder/components/hub/CVSectionRow';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { useCVPaymentContext } from '@/features/cv-builder/context/CVPaymentContext';
import { useCVTemplateDownload } from '@/features/cv-builder/hooks/useCVTemplateDownload';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import {
  calculateCVProgress,
  getEnabledSections,
  getSectionStatus,
} from '@/features/cv-builder/utils/section-config';

export function CVHubDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cv,
    content,
    layout,
    templateId,
    setSectionOrder,
    saveLayout,
    isLoading,
    error,
  } = useCVBuilderContext();
  const payment = useCVPaymentContext();
  const { downloadWithTemplate, isDownloading } = useCVTemplateDownload();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [sectionQuery, setSectionQuery] = useState('');

  const enabledSections = useMemo(() => getEnabledSections(layout), [layout]);
  const progress = useMemo(() => calculateCVProgress(content), [content]);

  const filteredSections = useMemo(() => {
    const q = sectionQuery.trim().toLowerCase();
    if (!q) return enabledSections;
    return enabledSections.filter((id) => {
      const meta = getSectionMeta(id);
      return (
        meta.title.toLowerCase().includes(q) || meta.description.toLowerCase().includes(q)
      );
    });
  }, [enabledSections, sectionQuery]);

  const openSection = (sectionId: CVSectionId) => {
    if (!cv) return;
    router.push(ROUTES.MAIN.CV_BUILDER.section(cv.id, sectionId) as Href);
  };

  const handleReorderSave = async (order: CVSectionId[]) => {
    const personalFirst = ['personal', ...order.filter((id) => id !== 'personal')] as CVSectionId[];
    setSectionOrder(personalFirst);
    await saveLayout();
  };

  const handleDownload = () => {
    downloadWithTemplate(templateId);
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
    <>
      <View style={[styles.page, { paddingTop: insets.top }]}>
        <CVHubDocToolbar
          title={cv.title}
          progressPercent={progress}
          onPreview={() => setPreviewOpen(true)}
          onDownload={handleDownload}
          downloadLoading={isDownloading}
        />

        <View style={styles.searchStrip}>
          <SearchField
            variant="docs"
            value={sectionQuery}
            onChangeText={setSectionQuery}
            placeholder="Search sections"
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.canvas}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Outline</Text>
              <Pressable onPress={() => setReorderOpen(true)} hitSlop={8}>
                <Text style={styles.panelAction}>Reorder</Text>
              </Pressable>
            </View>

            {filteredSections.length === 0 ? (
              <Text style={styles.emptySections}>No sections match your search.</Text>
            ) : (
              filteredSections.map((sectionId, index) => (
                <CVSectionRow
                  key={sectionId}
                  sectionId={sectionId}
                  status={getSectionStatus(content, sectionId)}
                  onPress={() => openSection(sectionId)}
                  showDivider={index < filteredSections.length - 1}
                />
              ))
            )}
          </View>

          <View style={styles.footerActions}>
            <Pressable style={styles.previewCta} onPress={() => setPreviewOpen(true)}>
              <Text style={styles.previewCtaText}>Open full preview</Text>
            </Pressable>
            <Pressable
              style={[styles.downloadCta, isDownloading && styles.downloadCtaDisabled]}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              <Text style={styles.downloadCtaText}>
                {isDownloading ? 'Generating PDF…' : 'Download PDF'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <CVPreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateId={templateId}
        content={content}
        templatePurchased={payment.isTemplatePurchased(templateId)}
        onDownload={() => downloadWithTemplate(templateId)}
        downloadLoading={isDownloading}
      />

      <CVReorderSectionsModal
        visible={reorderOpen}
        order={layout.sectionOrder as CVSectionId[]}
        disabledSections={layout.disabledSections as CVSectionId[]}
        onClose={() => setReorderOpen(false)}
        onSave={(order) => void handleReorderSave(order)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  searchStrip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.lg },
  canvas: {
    backgroundColor: cvDocsTheme.canvasBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cvDocsTheme.divider,
    overflow: 'hidden',
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: cvDocsTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  panelAction: { fontSize: 13, fontWeight: '600', color: colors.primary },
  emptySections: {
    padding: spacing.lg,
    textAlign: 'center',
    color: cvDocsTheme.textSecondary,
    fontSize: 13,
  },
  footerActions: { marginTop: spacing.md, gap: spacing.sm, alignItems: 'center' },
  previewCta: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  previewCtaText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  downloadCta: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  downloadCtaDisabled: { opacity: 0.6 },
  downloadCtaText: { fontSize: 14, fontWeight: '700', color: colors.background },
});
