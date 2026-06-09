import { Alert, StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import type { MenteeSummary } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type MenteeCardProps = {
  mentee: MenteeSummary;
  onRemove: (mentorshipId: string) => void;
  isRemoving?: boolean;
};

export function MenteeCard({ mentee, onRemove, isRemoving }: MenteeCardProps) {
  const styles = useThemedStyles(createStyles);
  const { profile, mentorship, progressPercent } = mentee;
  const name = profile.fullName ?? 'Student';

  const confirmRemove = () => {
    Alert.alert(
      'Remove student',
      `Remove ${name} from your mentorship roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            onRemove(mentorship.id),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl} size={48} />
        <View style={styles.meta}>
          <Text style={styles.name}>{name}</Text>
          {profile.courseMajor ? <Text muted variant="caption">{profile.courseMajor}</Text> : null}
          {profile.university ? <Text muted variant="caption">{profile.university}</Text> : null}
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <Text variant="caption" muted>
        {progressPercent}% of 3-month mentorship · ends{' '}
        {new Date(mentorship.endsAt).toLocaleDateString()}
      </Text>
      <Button variant="ghost" onPress={confirmRemove} loading={isRemoving} textStyle={styles.remove}>
        Remove student
      </Button>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  meta: { flex: 1, gap: 2 },
  name: { fontWeight: '600', fontSize: 16 },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  remove: { color: colors.error, alignSelf: 'flex-start' },
});
}
