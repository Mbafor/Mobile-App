import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { ProfilePreferencesSection } from '@/features/settings/components/ProfilePreferencesSection';
import { spacing } from '@/constants/theme';

export function ProfileScreen() {
  const styles = useThemedStyles(createStyles);
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfilePreferencesSection />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
});
}
