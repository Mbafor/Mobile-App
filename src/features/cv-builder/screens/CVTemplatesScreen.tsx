import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { TemplateSelector } from '@/features/cv-builder/components/TemplateSelector';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { useCVPaymentContext } from '@/features/cv-builder/context/CVPaymentContext';
import { useSelectCVTemplate } from '@/features/cv-builder/hooks/useSelectCVTemplate';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function CVTemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cv, templateId, saveState } = useCVBuilderContext();
  const payment = useCVPaymentContext();
  const { selectCVTemplate } = useSelectCVTemplate();
  const isSaving = saveState === 'saving';

  const openPreview = useCallback(
    (id?: CVTemplateId) => {
      if (!cv) return;
      if (id) {
        selectCVTemplate(id);
      }
      router.push(ROUTES.MAIN.CV_BUILDER.preview(cv.id) as Href);
    },
    [cv, router, selectCVTemplate],
  );

  const handleSelect = useCallback(
    (id: CVTemplateId) => {
      openPreview(id);
    },
    [openPreview],
  );

  const handlePreview = useCallback(
    (id: CVTemplateId) => {
      openPreview(resolveTemplateId(id));
    },
    [openPreview],
  );

  useEffect(() => {
    if (!cv) return;
  }, [templateId, cv]);

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
              Choose a layout to open the live PDF editor preview. Download is GHS 100 per template
              — unlock once, keep forever.
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
      </ScrollView>
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
});
