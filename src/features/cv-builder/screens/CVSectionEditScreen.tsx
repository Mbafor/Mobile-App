import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { CVSectionContent } from '@/features/cv-builder/components/CVSectionContent';
import { SaveIndicator } from '@/features/cv-builder/components/SaveIndicator';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { spacing } from '@/constants/theme';

export function CVSectionEditScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sectionId?: string }>();
  const sectionId = (typeof params.sectionId === 'string'
    ? params.sectionId
    : params.sectionId?.[0]) as CVSectionId | undefined;

  const { content, updateContent, saveNow, saveState, saveError, isLoading, error } =
    useCVBuilderContext();

  const [localSaving, setLocalSaving] = useState(false);

  if (!sectionId) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message="Unknown section." />
      </View>
    );
  }

  const meta = getSectionMeta(sectionId);

  const handleSaveAndBack = async () => {
    setLocalSaving(true);
    await saveNow();
    setLocalSaving(false);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={error instanceof Error ? error.message : 'Could not load CV'} />
      </View>
    );
  }

  const headerTopInset = Math.max(insets.top, spacing.md);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.toolbar, { paddingTop: headerTopInset }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.toolbarCopy}>
          <Text variant="title" numberOfLines={1}>
            {meta.title}
          </Text>
          <SaveIndicator state={saveState} errorMessage={saveError} />
        </View>
        <Pressable
          onPress={() => void handleSaveAndBack()}
          disabled={localSaving || saveState === 'saving'}
          style={styles.saveBtn}
        >
          <Text style={styles.saveBtnText}>{localSaving ? '…' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
            paddingBottom: insets.bottom + spacing.lg,
            maxWidth: 1280,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CVSectionContent section={sectionId} content={content} onChange={updateContent} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  toolbarCopy: { flex: 1, gap: 2 },
  saveBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 14 },
  scroll: {
    flexGrow: 1,
  },
});
}
