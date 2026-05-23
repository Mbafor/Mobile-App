import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { CVPreviewModal } from '@/features/cv-builder/components/CVPreviewModal';
import { TemplateSelector } from '@/features/cv-builder/components/TemplateSelector';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { useCVPaymentContext } from '@/features/cv-builder/context/CVPaymentContext';
import { useCVTemplateDownload } from '@/features/cv-builder/hooks/useCVTemplateDownload';
import { useSelectCVTemplate } from '@/features/cv-builder/hooks/useSelectCVTemplate';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';

export function CVTemplatesScreen() {
  const insets = useSafeAreaInsets();
  const { content, templateId, saveState } = useCVBuilderContext();
  const payment = useCVPaymentContext();
  const { selectCVTemplate } = useSelectCVTemplate();
  const { downloadWithTemplate, isDownloading } = useCVTemplateDownload();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<CVTemplateId>(
    resolveTemplateId(templateId),
  );
  const isSaving = saveState === 'saving';

  const handleSelect = useCallback(
    (id: CVTemplateId) => {
      setPreviewTemplateId(id);
      selectCVTemplate(id);
    },
    [selectCVTemplate],
  );

  const handlePreview = useCallback((id: CVTemplateId) => {
    setPreviewTemplateId(resolveTemplateId(id));
    setPreviewOpen(true);
  }, []);

  useEffect(() => {
    setPreviewTemplateId(resolveTemplateId(templateId));
  }, [templateId]);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Math.max(insets.top, spacing.md) + spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text muted style={styles.heroSubtitle}>
              Preview any layout for free. Download is GHS 100 per template — unlock once, keep
              forever.
            </Text>
          </View>
        </View>

        <TemplateSelector
          selectedId={templateId}
          purchasedTemplateIds={payment.purchasedTemplateIds}
          onSelect={handleSelect}
          onPreview={handlePreview}
          disabled={isSaving}
        />

        <Button
          variant="secondary"
          onPress={() => setPreviewOpen(true)}
          style={styles.previewBtn}
        >
          Full-screen preview
        </Button>
      </ScrollView>

      <CVPreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateId={previewTemplateId}
        content={content}
        templatePurchased={payment.isTemplatePurchased(previewTemplateId)}
        onDownload={() => downloadWithTemplate(previewTemplateId)}
        downloadLoading={isDownloading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  scroll: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  hero: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: cvDocsTheme.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, gap: spacing.sm },
  heroSubtitle: { lineHeight: 20 },
  previewBtn: { marginTop: spacing.sm },
});
