import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ProfilePreferencesSection } from '@/features/settings/components/ProfilePreferencesSection';
import { colors, spacing } from '@/constants/theme';

export function ProfileScreen() {
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

const styles = StyleSheet.create({
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
