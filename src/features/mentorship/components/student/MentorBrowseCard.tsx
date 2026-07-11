import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';
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
};

function availabilityText(
  mentor: AvailableMentor,
  mutedColor: string,
  t: TFunction,
): { label: string; color: string } {
  if (!mentor.isAcceptingStudents) {
    return { label: t('mentorship.student.browseCard.notAccepting'), color: mutedColor };
  }
  if (!mentor.hasCapacity) {
    return { label: t('mentorship.student.browseCard.full'), color: '#B00020' };
  }
  return { label: t('mentorship.student.browseCard.available'), color: '#1B7F4E' };
}

export function MentorBrowseCard({ mentor, onViewProfile }: MentorBrowseCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { profile } = mentor;
  const name = profile.fullName?.trim() || t('mentorship.student.browseCard.nameFallback');
  const academicFocus = getMentorAcademicFocus(mentor);
  const interests = getMentorInterestTags(mentor);
  const allTags = [...academicFocus, ...interests].slice(0, 4);
  const credential = [profile.university, profile.degreeLevel].filter(Boolean).join(' · ');
  const availability = availabilityText(mentor, colors.textMuted, t);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onViewProfile}
      accessibilityRole="button"
    >
      <UserAvatarDisplay
        displayName={name}
        avatarUrl={profile.avatarUrl ?? null}
        size={48}
      />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
        </View>

        {credential ? (
          <Text style={styles.credential} numberOfLines={1}>{credential}</Text>
        ) : null}

        {allTags.length > 0 ? (
          <Text style={styles.tags} numberOfLines={2}>
            {allTags.join('  ·  ')}
          </Text>
        ) : null}

        <Text style={[styles.availability, { color: availability.color }]}>
          {availability.label}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.border} />
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowPressed: { backgroundColor: colors.surface },

  info: { flex: 1, gap: 3, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  credential: {
    fontSize: 14,
    color: colors.textMuted,
  },
  tags: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  availability: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
}
