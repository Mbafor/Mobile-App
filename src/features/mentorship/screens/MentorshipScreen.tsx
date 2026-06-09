import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { CoachMentorshipDashboard } from '@/features/mentorship/screens/CoachMentorshipDashboard';
import { StudentMentorshipDashboard } from '@/features/mentorship/screens/StudentMentorshipDashboard';
import { useMentorshipRole } from '@/features/mentorship/hooks/useMentorshipRole';
import { spacing } from '@/constants/theme';

export function MentorshipScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { isCoach, isLoading, error } = useMentorshipRole();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text muted>Loading mentorship…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load role'} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {isCoach ? <CoachMentorshipDashboard /> : <StudentMentorshipDashboard />}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
});
}
