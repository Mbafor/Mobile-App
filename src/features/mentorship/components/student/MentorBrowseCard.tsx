import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';
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
  /** Fixed-width card for a horizontal-scrolling section vs a full-width row
   * in the "All coaches" list. Same data, same tap target either way. */
  variant?: 'row' | 'card';
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

export function MentorBrowseCard({ mentor, onViewProfile, variant = 'row' }: MentorBrowseCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const { profile } = mentor;
  const name = profile.fullName?.trim() || t('mentorship.student.browseCard.nameFallback');
  const academicFocus = getMentorAcademicFocus(mentor);
  const interests = getMentorInterestTags(mentor);
  const allTags = [...academicFocus, ...interests].slice(0, variant === 'card' ? 3 : 4);
  const credential = [profile.university, profile.degreeLevel].filter(Boolean).join(' · ');
  const badge = availabilityBadge(mentor, t);
  const bio = mentor.mentor.bio?.trim();

  const onPressIn = () => { scale.value = withTiming(0.98, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 150 }); };

  if (variant === 'card') {
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
          {bio ? <Text style={styles.cardBio} numberOfLines={2}>{bio}</Text> : null}

          {allTags.length > 0 ? (
            <View style={styles.chipRow}>
              {allTags.map((tag) => (
                <View key={tag} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.cardFooter}>
            <Ionicons name="people-outline" size={13} color={colors.textMuted} />
            <Text style={styles.capacityText}>
              {t('mentorship.student.browseCard.capacity', {
                count: mentor.activeMenteeCount,
                max: mentor.maxStudents,
              })}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onViewProfile}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
      >
        <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={52} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
          </View>

          {credential ? (
            <Text style={styles.credential} numberOfLines={1}>{credential}</Text>
          ) : null}

          {allTags.length > 0 ? (
            <View style={styles.chipRow}>
              {allTags.map((tag) => (
                <View key={tag} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <View style={[styles.availabilityPill, { backgroundColor: badge.bg }]}>
              <Text style={[styles.availabilityPillText, { color: badge.fg }]}>{badge.label}</Text>
            </View>
            <Text style={styles.capacityText}>
              {t('mentorship.student.browseCard.capacity', {
                count: mentor.activeMenteeCount,
                max: mentor.maxStudents,
              })}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  // ─── Row variant (full-width "All coaches" list) ─────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.background,
  },
  rowPressed: { backgroundColor: colors.surface },

  info: { flex: 1, gap: 4, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  credential: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },

  // ─── Card variant (horizontal-scrolling sections) ────────────────────────
  card: {
    width: 250,
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
  cardBio: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  // ─── Shared bits ──────────────────────────────────────────────────────────
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
  capacityText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
});
}
