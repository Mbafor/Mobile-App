import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type ParticipantProfileDetailProps = {
  profile: MentorshipParticipantProfile;
  mentorProfile?: MentorProfile | null;
  roleLabel?: string;
  compact?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  const styles = useAppThemedStyles(createStyles);
  if (!value?.trim()) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function ParticipantProfileDetail({
  profile,
  mentorProfile,
  roleLabel,
  compact = false,
}: ParticipantProfileDetailProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const name = profile.fullName?.trim() || t('mentorship.profile.nameFallback');
  const interests = [...new Set([...profile.interests, ...(mentorProfile?.mentoringInterests ?? [])])];
  const career = [
    ...new Set([...profile.careerInterests, ...(mentorProfile?.mentoringCareerAreas ?? [])]),
  ];
  const majors = [
    ...new Set([
      ...(profile.courseMajor ? [profile.courseMajor] : []),
      ...(mentorProfile?.mentoringMajors ?? []),
    ]),
  ];
  const skills = [...new Set([...(mentorProfile?.mentoringDegreeLevels ?? []), ...majors])];

  return (
    <View style={styles.flat}>
      <View style={styles.hero}>
        <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={compact ? 56 : 72} />
        <View style={styles.heroMeta}>
          {roleLabel ? <Text style={styles.role}>{roleLabel}</Text> : null}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {mentorProfile?.status === 'approved' ? (
              <Ionicons name="checkmark-circle" size={18} color={mentorshipColors.accent} style={styles.verifiedIcon} />
            ) : null}
          </View>
          {mentorProfile?.status === 'approved' ? (
            <Text style={styles.verifiedLabel}>{t('mentorship.profile.verifiedMentor')}</Text>
          ) : null}
          {profile.email ? <Text style={styles.sub}>{profile.email}</Text> : null}
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow label={t('mentorship.profile.country')} value={profile.country} />
        <DetailRow label={t('mentorship.profile.university')} value={profile.university} />
        <DetailRow label={t('mentorship.profile.major')} value={profile.courseMajor} />
        <DetailRow label={t('mentorship.profile.degreeLevel')} value={profile.degreeLevel} />
      </View>

      {majors.length > 0 ? <TagList label={t('mentorship.profile.academicFocus')} items={majors.slice(0, 12)} /> : null}
      {career.length > 0 ? <TagList label={t('mentorship.profile.careerInterests')} items={career.slice(0, 12)} /> : null}
      {interests.length > 0 ? <TagList label={t('mentorship.profile.interests')} items={interests.slice(0, 12)} /> : null}
      {skills.length > 0 && !compact ? (
        <TagList label={t('mentorship.profile.skills')} items={skills.slice(0, 12)} />
      ) : null}

      {(mentorProfile?.bio || profile.bio) ? (
        <View style={styles.bioBlock}>
          <Text style={styles.bioLabel}>{t('mentorship.profile.about')}</Text>
          <Text style={styles.bio}>{mentorProfile?.bio ?? profile.bio}</Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  flat: {
    gap: spacing.md,
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroMeta: { flex: 1, gap: 4 },
  role: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: mentorshipColors.accent,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '700', color: mentorshipColors.text },
  verifiedIcon: { marginTop: 2 },
  verifiedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: mentorshipColors.accent,
    letterSpacing: 0.3,
  },
  sub: { fontSize: 13, color: mentorshipColors.textMuted },
  details: { gap: spacing.sm },
  row: { gap: 2 },
  rowLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: mentorshipColors.textMuted,
  },
  rowValue: { fontSize: 15, color: mentorshipColors.text, fontWeight: '500' },
  bioBlock: { gap: spacing.xs },
  bioLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: mentorshipColors.textMuted,
  },
  bio: { fontSize: 15, lineHeight: 22, color: mentorshipColors.text },
});
}
