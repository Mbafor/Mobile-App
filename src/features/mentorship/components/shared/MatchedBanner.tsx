import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { spacing } from '@/constants/theme';

type MatchedBannerProps = {
  endsAt: string;
};

export function MatchedBanner({ endsAt }: MatchedBannerProps) {
  const endLabel = new Date(endsAt).toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={styles.banner}>
      <Ionicons name="checkmark-circle" size={20} color={mentorshipColors.accent} />
      <Text style={styles.text}>
        You are matched with a coach until {endLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: mentorshipColors.bannerBg,
    borderRadius: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: mentorshipColors.text,
    lineHeight: 20,
  },
});
