import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachDashboardSummaryProps = {
  profile: MentorshipParticipantProfile | null;
  mentor: MentorProfile | null;
  onViewProfile?: () => void;
};

export function CoachDashboardSummary({ profile, mentor, onViewProfile }: CoachDashboardSummaryProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withTiming(0.99, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 150 }); };

  if (!profile) {
    return (
      <View style={styles.card}>
        <Text muted>{t('mentorship.student.coachSummary.loading')}</Text>
      </View>
    );
  }

  const name = profile.fullName?.trim() || t('mentorship.student.coachNameFallback');
  const isVerified = mentor?.status === 'approved';
  const interests = [
    ...new Set([
      ...profile.interests,
      ...(mentor?.mentoringInterests ?? []),
      ...(mentor?.mentoringCareerAreas ?? []),
    ]),
  ].filter(Boolean);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.card}
        onPress={onViewProfile}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={!onViewProfile}
      >
        <View style={styles.row}>
          <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={56} />
          <View style={styles.meta}>
            <Text style={styles.label}>{t('mentorship.student.coachSummary.coachLabel')}</Text>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              {isVerified ? (
                <Ionicons name="checkmark-circle" size={17} color={mentorshipColors.accent} style={styles.verifiedIcon} />
              ) : null}
            </View>
            {profile.university ? <Text style={styles.sub}>{profile.university}</Text> : null}
            {profile.courseMajor ? (
              <Text style={styles.sub}>{profile.courseMajor}</Text>
            ) : null}
          </View>
        </View>
        {interests.length > 0 ? (
          <TagList label={t('mentorship.student.coachSummary.interests')} items={interests.slice(0, 6)} />
        ) : null}
        {onViewProfile ? (
          <View style={styles.linkRow}>
            <Text style={styles.link}>{t('mentorship.student.coachSummary.viewProfile')}</Text>
            <Ionicons name="chevron-forward" size={14} color={mentorshipColors.accent} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meta: { flex: 1, gap: 2 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: mentorshipColors.textMuted,
    letterSpacing: 0.4,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text, flexShrink: 1 },
  verifiedIcon: { marginTop: 1 },
  sub: { fontSize: 13, color: mentorshipColors.textMuted },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  link: { fontSize: 13, fontWeight: '600', color: mentorshipColors.accent },
});
}
