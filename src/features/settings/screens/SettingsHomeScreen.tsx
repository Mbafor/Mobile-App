import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { AccountSection } from '@/features/settings/components/AccountSection';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { NotificationPreferencesSection } from '@/features/settings/components/NotificationPreferencesSection';
import { PrivacySection } from '@/features/settings/components/PrivacySection';
import { SettingsLogoutFooter } from '@/features/settings/components/SettingsLogoutFooter';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export function SettingsHomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{title}</Text>
        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader title="Settings" onBack={() => router.push(ROUTES.MAIN.DASHBOARD as any)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Appearance">
          <AppearanceSection />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <NotificationPreferencesSection />
        </SettingsSection>

        <SettingsSection title="Privacy">
          <PrivacySection />
        </SettingsSection>

        <SettingsSection title="Account">
          <AccountSection />
        </SettingsSection>

        <SettingsLogoutFooter />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl * 2,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textMuted,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    sectionContent: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  });
}
