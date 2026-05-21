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

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { CVPreviewModal } from '@/features/cv-builder/components/CVPreviewModal';
import { CVSectionContent } from '@/features/cv-builder/components/CVSectionContent';
import { SaveIndicator } from '@/features/cv-builder/components/SaveIndicator';
import { SectionTabs } from '@/features/cv-builder/components/SectionTabs';
import { TemplateSelector } from '@/features/cv-builder/components/TemplateSelector';
import { useCVBuilder } from '@/features/cv-builder/hooks/useCVBuilder';
import { colors, spacing } from '@/constants/theme';

export function CVBuilderScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const cvId = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [previewOpen, setPreviewOpen] = useState(false);

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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.toolbar}>
        <View style={styles.toolbarTop}>
          <Text variant="title" style={styles.title} numberOfLines={1}>
            {cv.title}
          </Text>
          <Pressable
            onPress={() => setPreviewOpen(true)}
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
        selectedId={templateId}
        onSelect={(id) => void selectTemplate(id)}
        disabled={isSaving}
      />

      <SectionTabs
        active={activeSection}
        onSelect={(section) => void goToSection(section)}
        disabled={isSaving}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
        templateId={templateId}
        content={content}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    backgroundColor: '#F4F8F5',
  },
  previewText: { fontWeight: '600', color: colors.primary, fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl * 2 },
  formPanel: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
