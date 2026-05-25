import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { AccountSection } from '@/features/settings/components/AccountSection';
import { NotificationPreferencesSection } from '@/features/settings/components/NotificationPreferencesSection';
import { PrivacySection } from '@/features/settings/components/PrivacySection';
import { ProfilePreferencesSection } from '@/features/settings/components/ProfilePreferencesSection';
import { SettingsLogoutFooter } from '@/features/settings/components/SettingsLogoutFooter';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { colors, spacing } from '@/constants/theme';

export function SettingsHomeScreen() {
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
        <Text muted style={styles.intro}>
          Manage your profile, alerts, and account in one place.
        </Text>

        <SettingsSection index={1} title="Profile & Preferences">
          <ProfilePreferencesSection />
        </SettingsSection>

        <SettingsSection index={2} title="Notifications">
          <NotificationPreferencesSection />
        </SettingsSection>

        <SettingsSection index={3} title="Privacy">
          <PrivacySection />
        </SettingsSection>

        <SettingsSection index={4} title="Account">
          <AccountSection />
        </SettingsSection>

        <SettingsLogoutFooter />
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
  },
  intro: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
