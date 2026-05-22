import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { CVPreviewModal } from '@/features/cv-builder/components/CVPreviewModal';
import { TemplateSelector } from '@/features/cv-builder/components/TemplateSelector';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import {
  getTemplateDefinition,
  resolveTemplateId,
  type CVTemplateId,
} from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';

export function CVTemplatesScreen() {
  const { content, templateId, selectTemplate, saveState } = useCVBuilderContext();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<CVTemplateId>(
    resolveTemplateId(templateId),
  );
  const isSaving = saveState === 'saving';
  const active = getTemplateDefinition(templateId);

  const handleSelect = useCallback(
    (id: CVTemplateId) => {
      setPreviewTemplateId(id);
      void selectTemplate(id);
    },
    [selectTemplate],
  );

  const handlePreview = useCallback((id: CVTemplateId) => {
    setPreviewTemplateId(id);
    setPreviewOpen(true);
  }, []);

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text variant="title">Choose a layout</Text>
            <Text muted style={styles.heroSubtitle}>
              Five designs from your website — tap a card to apply, or preview before switching.
            </Text>
          </View>
        </View>

        {active ? (
          <Text style={styles.savingHint}>
            {isSaving ? 'Saving template…' : `Showing ${active.label} on your CV`}
          </Text>
        ) : null}

        <TemplateSelector
          selectedId={templateId}
          onSelect={handleSelect}
          onPreview={handlePreview}
          disabled={isSaving}
        />

        <Button
          variant="secondary"
          onPress={() => {
            setPreviewTemplateId(resolveTemplateId(templateId));
            setPreviewOpen(true);
          }}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
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
  heroCopy: { flex: 1, gap: spacing.xs },
  heroSubtitle: { lineHeight: 20 },
  savingHint: {
    fontSize: 13,
    color: cvDocsTheme.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  previewBtn: { marginTop: spacing.sm },
});
