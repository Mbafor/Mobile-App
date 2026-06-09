import { StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';

import { Text } from '@/components/ui';
import { ParticipantProfileDetail } from '@/features/mentorship/components/shared/ParticipantProfileDetail';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachProfileCardProps = {
  profile: MentorshipParticipantProfile | null;
  mentor: MentorProfile | null;
  endsAt?: string;
};

export function CoachProfileCard({ profile, mentor, endsAt }: CoachProfileCardProps) {
  const styles = useAppThemedStyles(createStyles);
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

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  ends: {
    fontSize: 13,
    fontWeight: '600',
    color: mentorshipColors.accent,
    paddingHorizontal: spacing.xs,
  },
});
}
