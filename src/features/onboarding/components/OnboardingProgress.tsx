import { Fragment } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { colors, spacing } from '@/constants/theme';

const STEP_LABELS = ['Basic info', 'Academic', 'Preferences'] as const;
const TOTAL = ONBOARDING_STEPS.TOTAL;

type Props = { currentStep: number };

export function OnboardingProgress({ currentStep }: Props) {
  return Platform.OS === 'web' ? (
    <WebStepper currentStep={currentStep} />
  ) : (
    <NativeStepper currentStep={currentStep} />
  );
}

/* ── Web: dot stepper with labels ──────────────────────────────────────────── */

function WebStepper({ currentStep }: Props) {
  return (
    <View style={web.container}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isDone = num < currentStep;
        const isActive = num === currentStep;

        return (
          <Fragment key={num}>
            <View style={web.step}>
              <View style={[web.dot, isDone && web.dotDone, isActive && web.dotActive]}>
                <Text style={[web.dotText, (isActive || isDone) && web.dotTextFilled]}>
                  {isDone ? '✓' : num}
                </Text>
              </View>
              <Text
                style={[
                  web.label,
                  isActive && web.labelActive,
                  isDone && web.labelDone,
                ]}
              >
                {label}
              </Text>
            </View>

            {i < TOTAL - 1 && (
              <View style={[web.connector, isDone && web.connectorDone]} />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

/* ── Mobile: segmented progress bar ────────────────────────────────────────── */

function NativeStepper({ currentStep }: Props) {
  return (
    <View style={native.container}>
      <View style={native.header}>
        <Text variant="caption" muted>
          Step {currentStep} of {TOTAL}
        </Text>
        <Text variant="caption" style={native.stepName}>
          {STEP_LABELS[currentStep - 1]}
        </Text>
      </View>
      <View style={native.track}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <View
            key={i}
            style={[native.segment, i < currentStep && native.segmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */

const web = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dotDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dotTextFilled: {
    color: '#fff',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  labelDone: {
    color: colors.success,
    fontWeight: '600',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
    borderRadius: 1,
  },
  connectorDone: {
    backgroundColor: colors.success,
  },
});

const native = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepName: {
    color: colors.primary,
    fontWeight: '600',
  },
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
});
