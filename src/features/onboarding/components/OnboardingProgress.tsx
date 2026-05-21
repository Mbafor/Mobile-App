import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { colors, spacing } from '@/constants/theme';

type OnboardingProgressProps = {
  currentStep: number;
};

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      <Text variant="caption" muted>
        Step {currentStep} of {ONBOARDING_STEPS.TOTAL}
      </Text>
      <View style={styles.track}>
        {Array.from({ length: ONBOARDING_STEPS.TOTAL }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, i < currentStep ? styles.segmentActive : undefined]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg, gap: spacing.xs },
  track: { flexDirection: 'row', gap: spacing.xs },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  segmentActive: { backgroundColor: colors.primary },
});
