import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  if (!profile) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {endsAt ? (
        <Text style={styles.ends}>
          {t('mentorship.student.coachProfileCard.endsOn', {
            date: new Date(endsAt).toLocaleDateString(),
          })}
        </Text>
      ) : null}
      <ParticipantProfileDetail
        profile={profile}
        mentorProfile={mentor}
        roleLabel={t('mentorship.student.coachSummary.coachLabel')}
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
