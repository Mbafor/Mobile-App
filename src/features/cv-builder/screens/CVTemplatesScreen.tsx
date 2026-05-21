import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { CVPreviewModal } from '@/features/cv-builder/components/CVPreviewModal';
import { TemplateSelector } from '@/features/cv-builder/components/TemplateSelector';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { colors, spacing } from '@/constants/theme';

export function CVTemplatesScreen() {
  const { content, templateId, selectTemplate, saveState } = useCVBuilderContext();
  const [previewOpen, setPreviewOpen] = useState(false);
  const isSaving = saveState === 'saving';

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="title" style={styles.title}>
          Templates
        </Text>
        <Text muted style={styles.subtitle}>
          Choose how your CV looks. Premium templates unlock with payment (coming soon).
        </Text>
        <TemplateSelector
          selectedId={templateId}
          onSelect={(id) => void selectTemplate(id)}
          disabled={isSaving}
        />
        <Button onPress={() => setPreviewOpen(true)} style={styles.previewBtn}>
          Preview with selected template
        </Button>
      </ScrollView>

      <CVPreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateId={templateId}
        content={content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.md, lineHeight: 20 },
  previewBtn: { marginTop: spacing.lg },
});
