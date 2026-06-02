import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { PropsWithChildren } from 'react';

import { Text } from '@/components/ui';
import { AccountSection } from '@/features/settings/components/AccountSection';
import { NotificationPreferencesSection } from '@/features/settings/components/NotificationPreferencesSection';
import { PrivacySection } from '@/features/settings/components/PrivacySection';
import { SettingsLogoutFooter } from '@/features/settings/components/SettingsLogoutFooter';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

type SectionProps = PropsWithChildren<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}>;

function SettingSection({ icon, title, children }: SectionProps) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.header}>
        <View style={sectionStyles.iconWrap}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <View style={sectionStyles.card}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: 'hidden',
  },
});

export function SettingsHomeScreen() {
  const router = useRouter();
  const { profile, userEmail } = useAuth();

  const displayName = profile?.displayName || userEmail || 'Your Account';
  const avatarUrl = profile?.avatarUrl;
  const initial = displayName.charAt(0).toUpperCase();

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
        {/* Profile summary — tap to edit profile */}
        <Pressable
          style={({ pressed }) => [styles.profileCard, pressed && styles.profileCardPressed]}
          onPress={() => router.push(ROUTES.MAIN.SETTINGS_PROFILE as Href)}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{initial}</Text>
            )}
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName} numberOfLines={1}>
              {displayName}
            </Text>
            {userEmail ? (
              <Text style={styles.profileEmail} numberOfLines={1}>
                {userEmail}
              </Text>
            ) : null}
            <Text style={styles.editHint}>Tap to edit profile & preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>

        <SettingSection icon="notifications-outline" title="Notifications">
          <NotificationPreferencesSection />
        </SettingSection>

        <SettingSection icon="shield-checkmark-outline" title="Privacy">
          <PrivacySection />
        </SettingSection>

        <SettingSection icon="person-circle-outline" title="Account">
          <AccountSection />
        </SettingSection>

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
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  profileCardPressed: { opacity: 0.85 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 54, height: 54, borderRadius: 27 },
  avatarInitial: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  profileMeta: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  editHint: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
});
