import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/ui';
import { ProfileSectionRow } from '@/features/settings/components/ProfileSectionRow';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { getOAuthAvatarUrl, getOAuthDisplayName } from '@/features/auth/utils/oauth-profile-metadata';
import { mentorshipDataApi } from '@/services/api';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { webPressableStyle } from '@/utils/web/pressable';

export function ProfileViewScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { profile: authProfile, user, userEmail } = useAuth();
  const { profile } = useProfileData();

  const oauthMeta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const avatarUrl = profile?.avatarUrl ?? authProfile?.avatarUrl ?? getOAuthAvatarUrl(oauthMeta);
  const displayName =
    profile?.fullName ?? authProfile?.displayName ?? getOAuthDisplayName(oauthMeta) ?? '';
  const email = userEmail ?? '';
  const initial = displayName.charAt(0).toUpperCase() || '?';

  const mentorProfileQuery = useQuery({
    queryKey: ['mentorship', 'myMentorProfile', user?.id ?? ''],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await mentorshipDataApi.getMentorProfile(user.id);
      return result.success ? result.data : null;
    },
    enabled: Boolean(user?.id),
  });
  const mentorProfile = mentorProfileQuery.data ?? null;
  const isVerifiedMentor = mentorProfile?.status === 'approved';

  const goToDashboard = () => router.push(ROUTES.MAIN.DASHBOARD as any);

  return (
    <View style={styles.root}>
      {/* ── Header: back-arrow → Dashboard | "Profile" | 🔔 ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={goToDashboard}
            style={Platform.OS === 'web'
              ? webPressableStyle(styles.backBtn, styles.backBtnHover)
              : styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Text style={[styles.headerTitle, getWebFontStyle('semibold')]} numberOfLines={1}>
          Profile
        </Text>

        <View style={styles.headerRight}>
          <NotificationHeaderButton />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name + email */}
        <View style={styles.identity}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{initial}</Text>
            )}
          </View>

          {displayName ? (
            <View style={styles.nameRow}>
              <Text style={[styles.name, getWebFontStyle('bold')]}>{displayName}</Text>
              {isVerifiedMentor ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} style={styles.verifiedIcon} />
              ) : null}
            </View>
          ) : null}

          {isVerifiedMentor ? (
            <Text style={styles.verifiedLabel}>Verified Mentor</Text>
          ) : null}

          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>

        {/* ── Editable sections ── */}
        <View>
          <ProfileSectionRow
            label="Personal Info"
            onPress={() => router.push(ROUTES.MAIN.PROFILE_PERSONAL_INFO as any)}
          />
          <ProfileSectionRow
            label="Academic Info"
            onPress={() => router.push(ROUTES.MAIN.PROFILE_ACADEMIC_INFO as any)}
          />
          <ProfileSectionRow
            label="Interests"
            onPress={() => router.push(ROUTES.MAIN.PROFILE_INTERESTS as any)}
          />
          <ProfileSectionRow
            label="Opportunity Preferences"
            onPress={() => router.push(ROUTES.MAIN.PROFILE_PREFERENCES as any)}
          />
          <ProfileSectionRow
            label="Bio"
            showDivider={false}
            onPress={() => router.push(ROUTES.MAIN.PROFILE_BIO as any)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    width: 52,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 52,
    justifyContent: 'flex-end',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnHover: Platform.OS === 'web' ? { backgroundColor: colors.border } : {},

  // ─── Content ──────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },

  // Avatar + identity block
  identity: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatarWrap: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: `${colors.primary}12`,
    borderWidth: 3,
    borderColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatarImg: { width: 108, height: 108, borderRadius: 54 },
  avatarInitial: { fontSize: 42, fontWeight: '800', color: colors.primary },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  verifiedIcon: { marginTop: 2 },
  verifiedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
}
