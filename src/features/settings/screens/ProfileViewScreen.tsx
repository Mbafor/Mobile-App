import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { Text } from '@/components/ui';
import { ProfilePreferencesSection } from '@/features/settings/components/ProfilePreferencesSection';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { getOAuthAvatarUrl, getOAuthDisplayName } from '@/features/auth/utils/oauth-profile-metadata';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { webPressableStyle } from '@/utils/web/pressable';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal}>{value}</Text>
    </View>
  );
}

const FUNDING_LABELS: Record<string, string> = {
  any: 'Any funding',
  fully_funded: 'Fully funded',
  partially_funded: 'Partially funded',
  self_funded: 'Self-funded',
};

export function ProfileViewScreen() {
  const router = useRouter();
  const { profile: authProfile, user, userEmail } = useAuth();
  const { profile, preferences } = useProfileData();
  const [editOpen, setEditOpen] = useState(false);

  const oauthMeta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const avatarUrl = profile?.avatarUrl ?? authProfile?.avatarUrl ?? getOAuthAvatarUrl(oauthMeta);
  const displayName =
    profile?.fullName ?? authProfile?.displayName ?? getOAuthDisplayName(oauthMeta) ?? '';
  const email = userEmail ?? '';
  const initial = displayName.charAt(0).toUpperCase() || '?';

  const goToDashboard = () => router.push(ROUTES.MAIN.DASHBOARD as any);

  const hasAcademic =
    !!profile?.university || !!profile?.country || !!profile?.courseMajor || !!profile?.degreeLevel;
  const hasInterests = (profile?.interests?.length ?? 0) > 0;
  const hasPreferences =
    (preferences?.opportunityTypes?.length ?? 0) > 0 ||
    (preferences?.preferredCountries?.length ?? 0) > 0 ||
    !!preferences?.fundingPreference;

  const fundingLabel = preferences?.fundingPreference
    ? (FUNDING_LABELS[preferences.fundingPreference] ?? preferences.fundingPreference)
    : null;

  return (
    <View style={styles.root}>
      {/* ── Header: back-arrow → Dashboard | "Profile" | 🔔 Edit ── */}
      <View style={styles.header}>
        {/* Left: back arrow → Dashboard */}
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

        {/* Center: title */}
        <Text style={[styles.headerTitle, getWebFontStyle('semibold')]} numberOfLines={1}>
          Profile
        </Text>

        {/* Right: notification bell + Edit */}
        <View style={styles.headerRight}>
          <NotificationHeaderButton />
          <Pressable
            onPress={() => setEditOpen(true)}
            style={styles.editBtn}
            accessibilityRole="button"
          >
            <Text style={[styles.editBtnText, getWebFontStyle('semibold')]}>Edit</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Read-only profile content ── */}
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
            <Text style={[styles.name, getWebFontStyle('bold')]}>{displayName}</Text>
          ) : null}

          {/* Email — shown directly below profile image / name */}
          {email ? (
            <Text style={styles.email}>{email}</Text>
          ) : null}
        </View>

        {/* Academic info */}
        {hasAcademic ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Academic</Text>
            {profile?.university ? (
              <InfoRow label="University" value={profile.university} />
            ) : null}
            {profile?.degreeLevel ? (
              <InfoRow label="Degree" value={profile.degreeLevel} />
            ) : null}
            {profile?.courseMajor ? (
              <InfoRow label="Course / Major" value={profile.courseMajor} />
            ) : null}
            {profile?.country ? (
              <InfoRow label="Country" value={profile.country} />
            ) : null}
          </View>
        ) : null}

        {/* Interests */}
        {hasInterests ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Interests</Text>
            <Text style={styles.infoVal}>
              {(profile?.interests ?? []).join('  ·  ')}
            </Text>
          </View>
        ) : null}

        {/* Opportunity Preferences */}
        {hasPreferences ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Opportunity Preferences</Text>
            {(preferences?.opportunityTypes?.length ?? 0) > 0 ? (
              <InfoRow
                label="Opportunity types"
                value={(preferences?.opportunityTypes ?? []).join('  ·  ')}
              />
            ) : null}
            {(preferences?.preferredCountries?.length ?? 0) > 0 ? (
              <InfoRow
                label="Preferred countries"
                value={(preferences?.preferredCountries ?? []).join('  ·  ')}
              />
            ) : null}
            {fundingLabel ? (
              <InfoRow label="Funding" value={fundingLabel} />
            ) : null}
          </View>
        ) : null}

        {!hasAcademic && !hasInterests && !hasPreferences ? (
          <View style={styles.emptyHint}>
            <Text muted style={styles.emptyText}>
              Tap Edit to fill in your profile details.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Edit modal ── */}
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.modalRoot}>
          <PageHeader title="Edit Profile" onBack={() => setEditOpen(false)} />
          <KeyboardAvoidingView
            style={styles.modalFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ProfilePreferencesSection />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  editBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editBtnText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },

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
    marginBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: colors.primary },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ─── Sections ─────────────────────────────────────────────────────────────
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoKey: { width: 130, fontSize: 14, color: colors.textMuted, flexShrink: 0 },
  infoVal: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
  emptyHint: { alignItems: 'center', paddingTop: spacing.xl },
  emptyText: { fontSize: 15, textAlign: 'center' },

  // ─── Edit modal ───────────────────────────────────────────────────────────
  modalRoot: { flex: 1, backgroundColor: colors.background },
  modalFlex: { flex: 1 },
  modalScroll: { flex: 1 },
  modalContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
});
