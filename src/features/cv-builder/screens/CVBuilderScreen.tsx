import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { CVPreviewModal } from '@/features/cv-builder/components/CVPreviewModal';
import { CVSectionContent } from '@/features/cv-builder/components/CVSectionContent';
import { SaveIndicator } from '@/features/cv-builder/components/SaveIndicator';
import { SectionTabs } from '@/features/cv-builder/components/SectionTabs';
import { TemplateSelector } from '@/features/cv-builder/components/TemplateSelector';
import { useCVBuilder } from '@/features/cv-builder/hooks/useCVBuilder';
import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';

export function CVBuilderScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const cvId = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<CVTemplateId>('ats');

  const {
    cv,
    content,
    templateId,
    updateContent,
    selectTemplate,
    activeSection,
    goToSection,
    saveState,
    saveError,
    isLoading,
    error,
  } = useCVBuilder(cvId);

  if (!cvId) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message="No CV selected. Go back and open a CV from your list." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text muted style={styles.loadingText}>
          Loading your CV…
        </Text>
      </View>
    );
  }

  if (error || !cv) {
    return (
      <View style={styles.centered}>
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Could not load this CV'}
        />
      </View>
    );
  }

  const isSaving = saveState === 'saving';
  const headerTopInset = Math.max(insets.top, spacing.md);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.toolbar, { paddingTop: headerTopInset }]}>
        <View style={styles.toolbarTop}>
          <Text variant="title" style={styles.title} numberOfLines={1}>
            {cv.title}
          </Text>
          <Pressable
            onPress={() => {
              setPreviewTemplateId(resolveTemplateId(templateId));
              setPreviewOpen(true);
            }}
            style={styles.previewBtn}
            accessibilityRole="button"
            accessibilityLabel="Preview CV"
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
            <Text style={styles.previewText}>Preview</Text>
          </Pressable>
        </View>
        <SaveIndicator state={saveState} errorMessage={saveError} />
      </View>

      <TemplateSelector
        variant="compact"
        selectedId={templateId}
        onSelect={(id) => void selectTemplate(id)}
        onPreview={(id) => {
          setPreviewTemplateId(id);
          setPreviewOpen(true);
        }}
        disabled={isSaving}
      />

      <SectionTabs
        active={activeSection}
        onSelect={(section) => void goToSection(section)}
        disabled={isSaving}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formPanel}>
          <CVSectionContent
            section={activeSection}
            content={content}
            onChange={updateContent}
          />
        </View>
      </ScrollView>

      <CVPreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateId={previewTemplateId}
        content={content}
        fileName={`${cv.title.trim() || 'My-CV'}.pdf`}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  loadingText: { marginTop: spacing.sm },
  toolbar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  toolbarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { flex: 1 },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#F0F4F8',
  },
  previewText: { fontWeight: '600', color: colors.primary, fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: spacing.md,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  formPanel: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
