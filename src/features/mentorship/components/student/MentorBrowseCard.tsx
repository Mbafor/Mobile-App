import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import {
  getMentorAcademicFocus,
  getMentorInterestTags,
} from '@/features/mentorship/utils/mentor-card-tags';
import type { AvailableMentor } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type MentorBrowseCardProps = {
  mentor: AvailableMentor;
  onViewProfile: () => void;
  onChoose: () => void;
  isChoosing?: boolean;
};

function availabilityLabel(mentor: AvailableMentor): { text: string; tone: 'ok' | 'muted' | 'full' } {
  if (!mentor.isAcceptingStudents) {
    return { text: 'Not accepting students', tone: 'muted' };
  }
  if (!mentor.hasCapacity) {
    return { text: 'Currently at capacity', tone: 'full' };
  }
  return { text: 'Available', tone: 'ok' };
}

export function MentorBrowseCard({
  mentor,
  onViewProfile,
  onChoose,
  isChoosing,
}: MentorBrowseCardProps) {
  const { profile, mentor: mp } = mentor;
  const name = profile.fullName?.trim() || 'Coach';
  const academicFocus = getMentorAcademicFocus(mentor);
  const interests = getMentorInterestTags(mentor);
  const availability = availabilityLabel(mentor);
  const canChoose = mentor.isAcceptingStudents && mentor.hasCapacity;

  return (
    <View style={styles.card}>
      <Pressable onPress={onViewProfile} style={styles.pressable}>
        <View style={styles.row}>
          <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={56} />
          <View style={styles.meta}>
            <Text style={styles.name}>{name}</Text>
            {profile.university ? <Text style={styles.sub}>{profile.university}</Text> : null}
            <Text
              style={[
                styles.availability,
                availability.tone === 'ok' && styles.availabilityOk,
                availability.tone === 'full' && styles.availabilityFull,
              ]}
            >
              {availability.text}
            </Text>
          </View>
        </View>

        {academicFocus.length > 0 ? (
          <TagList label="Academic focus" items={academicFocus.slice(0, 6)} />
        ) : null}
        {interests.length > 0 ? (
          <TagList label="Interests" items={interests.slice(0, 6)} />
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        <Button variant="secondary" onPress={onViewProfile}>
          View profile
        </Button>
        {canChoose ? (
          <Button onPress={onChoose} loading={isChoosing}>
            Choose Coach
          </Button>
        ) : (
          <View style={styles.capacityBlock}>
            <Text style={styles.capacityText}>Currently at capacity</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
  },
  pressable: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  meta: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
  sub: { fontSize: 13, color: mentorshipColors.textMuted },
  availability: { fontSize: 12, fontWeight: '600', color: mentorshipColors.textMuted, marginTop: 4 },
  availabilityOk: { color: mentorshipColors.accent },
  availabilityFull: { color: '#C62828' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  capacityBlock: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#FDECEC',
  },
  capacityText: { fontSize: 13, fontWeight: '600', color: '#C62828' },
});
