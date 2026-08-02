import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { spacing } from '@/constants/theme';
import {
  getMentorAcademicFocus,
  getMentorInterestTags,
} from '@/features/mentorship/utils/mentor-card-tags';
import type { AvailableMentor } from '@/types/domain/mentorship';

type MentorBrowseCardProps = {
  mentor: AvailableMentor;
  onViewProfile: () => void;
  /** Requests this mentor as coach -- the real entry point into booking,
   * since sessions can only be booked once a mentorship is established. */
  onChoose: () => void;
  isChoosing?: boolean;
};

function availabilityBadge(
  mentor: AvailableMentor,
  t: TFunction,
): { label: string; bg: string; fg: string } {
  if (!mentor.isAcceptingStudents) {
    return { label: t('mentorship.student.browseCard.notAccepting'), bg: '#EEF0F2', fg: '#6B7280' };
  }
  if (!mentor.hasCapacity) {
    return { label: t('mentorship.student.browseCard.full'), bg: '#FDECEC', fg: '#B00020' };
  }
  return { label: t('mentorship.student.browseCard.available'), bg: '#E7F6EC', fg: '#1B7F4E' };
}

export function MentorBrowseCard({
  mentor,
  onViewProfile,
  onChoose,
  isChoosing = false,
}: MentorBrowseCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const { profile } = mentor;
  const name = profile.fullName?.trim() || t('mentorship.student.browseCard.nameFallback');
  const academicFocus = getMentorAcademicFocus(mentor);
  const interests = getMentorInterestTags(mentor);
  const allTags = [...academicFocus, ...interests].slice(0, 2);
  const credential = [profile.university, profile.degreeLevel].filter(Boolean).join(' · ');
  const badge = availabilityBadge(mentor, t);
  const canChoose = mentor.isAcceptingStudents && mentor.hasCapacity;

  const onPressIn = () => { scale.value = withTiming(0.98, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 150 }); };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.card}
        onPress={onViewProfile}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
      >
        <View style={styles.cardTop}>
          <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={56} />
          <View style={[styles.availabilityPill, { backgroundColor: badge.bg }]}>
            <Text style={[styles.availabilityPillText, { color: badge.fg }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
        </View>
        {credential ? <Text style={styles.credential} numberOfLines={1}>{credential}</Text> : null}

        {allTags.length > 0 ? (
          <View style={styles.chipRow}>
            {allTags.map((tag) => (
              <View key={tag} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnGhost]}
            onPress={onViewProfile}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnGhostText} numberOfLines={1}>
              {t('mentorship.student.browseCard.viewProfile')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnPrimary, !canChoose && styles.actionBtnDisabled]}
            onPress={onChoose}
            disabled={!canChoose || isChoosing}
            accessibilityRole="button"
          >
            {isChoosing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionBtnPrimaryText} numberOfLines={1}>
                {canChoose
                  ? t('mentorship.student.browseCard.bookSession')
                  : t('mentorship.student.browseCard.full')}
              </Text>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    width: 250,
    height: 248,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  credential: { fontSize: 13, color: colors.textMuted },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surface,
    maxWidth: 140,
  },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  availabilityPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  availabilityPillText: { fontSize: 11, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', gap: 6, marginTop: 'auto', paddingTop: spacing.sm },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  actionBtnGhostText: { fontSize: 12, fontWeight: '700', color: colors.text },
  actionBtnPrimary: { backgroundColor: colors.primary },
  actionBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  actionBtnDisabled: { backgroundColor: colors.textMuted, opacity: 0.5 },
});
}
