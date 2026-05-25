import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ParticipantProfileDetail } from '@/features/mentorship/components/shared/ParticipantProfileDetail';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachProfileCardProps = {
  profile: MentorshipParticipantProfile | null;
  mentor: MentorProfile | null;
  endsAt?: string;
};

export function CoachProfileCard({ profile, mentor, endsAt }: CoachProfileCardProps) {
  if (!profile) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {endsAt ? (
        <Text style={styles.ends}>
          Mentorship ends {new Date(endsAt).toLocaleDateString()}
        </Text>
      ) : null}
      <ParticipantProfileDetail
        profile={profile}
        mentorProfile={mentor}
        roleLabel="Your coach"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  ends: {
    fontSize: 13,
    fontWeight: '600',
    color: mentorshipColors.accent,
    paddingHorizontal: spacing.xs,
  },
});
