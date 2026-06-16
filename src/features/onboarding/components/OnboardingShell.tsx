import type { ReactNode } from 'react';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';

const STEP_META = [
  { label: 'Basic Info' },
  { label: 'Academic' },
  { label: 'Preferences' },
] as const;

const TOTAL = STEP_META.length;
const DESKTOP_BREAKPOINT = 768;
const DOT_SIZE = 22;

interface OnboardingShellProps {
  children: ReactNode;
  currentStep: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  isLoading?: boolean;
}

export function OnboardingShell({
  children,
  currentStep,
  title,
  subtitle,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  isLoading = false,
}: OnboardingShellProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= DESKTOP_BREAKPOINT;

  // ── Back button ──────────────────────────────────────────────────────────
  const BackBtn = () =>
    onBack ? (
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
        <Ionicons name="chevron-back" size={16} color="#374151" />
        <Text style={styles.backBtnText}>Back</Text>
      </Pressable>
    ) : (
      <View style={styles.backBtnPlaceholder} />
    );

  // ── Horizontal stepper ───────────────────────────────────────────────────
  const Stepper = () => (
    <View style={styles.stepper}>
      {STEP_META.map((step, i) => {
        const num = i + 1;
        const isDone = num < currentStep;
        const isActive = num === currentStep;
        const isLast = i === TOTAL - 1;
        return (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  isDone && styles.stepDotDone,
                  isActive && styles.stepDotActive,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={11} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>
                    {num}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isDone && styles.stepLabelDone,
                  isActive && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>
            {!isLast && (
              <View style={styles.stepConnectorWrap}>
                <View style={[styles.stepConnector, isDone && styles.stepConnectorDone]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ── Inner form content (shared across all layouts) ───────────────────────
  const FormContent = () => (
    <View style={styles.formContent}>
      <BackBtn />
      <Stepper />
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.headingSubtitle}>{subtitle}</Text>
      <View style={styles.fields}>{children}</View>
      <Pressable
        onPress={onContinue}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.cta,
          isLoading && styles.ctaDisabled,
          pressed && !isLoading && styles.ctaPressed,
        ]}
      >
        <Text style={styles.ctaText}>{isLoading ? 'Saving…' : continueLabel}</Text>
        {!isLoading && (
          <Ionicons name="arrow-forward" size={15} color="#fff" style={styles.ctaArrow} />
        )}
      </Pressable>
    </View>
  );

  // ── NATIVE MOBILE ────────────────────────────────────────────────────────
  if (!isWeb) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.mobileScrollContent,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FormContent />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── WEB DESKTOP (≥ 768px) — left-aligned single column ───────────────────
  if (isDesktop) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.desktopScrollContent,
            { paddingBottom: insets.bottom + spacing.xl * 2 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.desktopColumn}>
            <FormContent />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── WEB MOBILE (< 768px) — centered, full-width ───────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.webMobileScrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.webMobileColumn}>
          <FormContent />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    flex: { flex: 1 },

    root: {
      flex: 1,
      backgroundColor: '#fff',
    },

    // ── Native mobile ────────────────────────────────────────────────────────
    mobileScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },

    // ── Web desktop ──────────────────────────────────────────────────────────
    desktopScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingTop: spacing.xl * 2,
      paddingLeft: 80,
    },
    desktopColumn: {
      maxWidth: 520,
      width: '100%',
    },

    // ── Web mobile ───────────────────────────────────────────────────────────
    webMobileScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    webMobileColumn: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
    },

    // ── Form content container ────────────────────────────────────────────────
    formContent: {},

    // ── Back button ───────────────────────────────────────────────────────────
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: '#F9FAFB',
      marginBottom: spacing.xl,
      gap: 4,
    },
    backBtnText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#374151',
    },
    backBtnPlaceholder: {
      height: 32,
      marginBottom: spacing.xl,
    },

    // ── Stepper ───────────────────────────────────────────────────────────────
    stepper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xl,
    },
    stepItem: {
      alignItems: 'center',
      minWidth: 60,
    },
    stepConnectorWrap: {
      flex: 1,
      paddingTop: 11,
      paddingHorizontal: 4,
    },
    stepConnector: {
      height: 1.5,
      backgroundColor: '#E5E7EB',
    },
    stepConnectorDone: {
      backgroundColor: colors.primary,
    },
    stepDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: '#F3F4F6',
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    stepDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepDotDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepNum: {
      fontSize: 10,
      fontWeight: '700',
      color: '#9CA3AF',
    },
    stepNumActive: {
      color: '#fff',
    },
    stepLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: '#9CA3AF',
      textAlign: 'center',
    },
    stepLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    stepLabelDone: {
      color: colors.primary,
    },

    // ── Heading ───────────────────────────────────────────────────────────────
    heading: {
      fontSize: 26,
      fontWeight: '700',
      color: '#111827',
      letterSpacing: -0.3,
      lineHeight: 34,
      marginBottom: spacing.xs,
    },
    headingSubtitle: {
      fontSize: typography.fontSize.sm,
      color: '#6B7280',
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    fields: {},

    // ── Continue button ───────────────────────────────────────────────────────
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      marginTop: spacing.lg,
    },
    ctaDisabled: {
      opacity: 0.5,
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaText: {
      color: '#fff',
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    ctaArrow: {
      marginLeft: spacing.sm,
    },
  });
}
