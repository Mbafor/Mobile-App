import type { ReactNode } from 'react';
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
  { label: 'Basic Info', description: 'Name & location' },
  { label: 'Academic', description: 'University & studies' },
  { label: 'Preferences', description: 'Opportunity interests' },
] as const;

const TOTAL = STEP_META.length;
const SIDEBAR_BREAKPOINT = 768;
const ICON_SIZE = 24;
const DONE_GREEN = '#16A34A';
const CTA_DARK = '#111111';

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
  const showSidebar = isWeb && width >= SIDEBAR_BREAKPOINT;

  // ── Step icon ──────────────────────────────────────────────────────────────

  function StepIcon({ num, isDone, isActive }: { num: number; isDone: boolean; isActive: boolean }) {
    if (isDone) {
      return (
        <View style={[styles.stepIcon, { backgroundColor: DONE_GREEN, borderColor: DONE_GREEN }]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      );
    }
    if (isActive) {
      return (
        <View style={[styles.stepIcon, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <View style={styles.stepActiveDot} />
        </View>
      );
    }
    return (
      <View style={[styles.stepIcon, styles.stepIconUpcoming]}>
        <Text style={styles.stepIconNum}>{num}</Text>
      </View>
    );
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────

  const SidebarSteps = () => (
    <View style={styles.sidebarInner}>
      <Text style={styles.sidebarHeader}>Profile Setup</Text>
      <View style={styles.stepList}>
        {STEP_META.map((step, i) => {
          const num = i + 1;
          const isDone = num < currentStep;
          const isActive = num === currentStep;
          const isLast = i === TOTAL - 1;
          return (
            <View key={num} style={styles.stepRow}>
              {/* Left: icon + connector */}
              <View style={styles.stepIconCol}>
                <StepIcon num={num} isDone={isDone} isActive={isActive} />
                {!isLast && (
                  <View style={[styles.stepConnector, isDone && styles.stepConnectorDone]} />
                )}
              </View>
              {/* Right: labels */}
              <View style={[styles.stepTextCol, !isLast && styles.stepTextColSpaced]}>
                <Text
                  style={[
                    styles.stepLabel,
                    isDone && styles.stepLabelDone,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  // ── Mobile compact progress bar ────────────────────────────────────────────

  const CompactProgress = () => (
    <View style={styles.compactProgress}>
      <View style={styles.compactProgressRow}>
        <Text style={styles.compactStepText}>
          Step {currentStep} of {TOTAL}
        </Text>
        <Text style={styles.compactStepName}>
          {STEP_META[currentStep - 1]?.label}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        {STEP_META.map((_, i) => (
          <View
            key={i}
            style={[styles.progressSeg, i < currentStep && styles.progressSegActive]}
          />
        ))}
      </View>
    </View>
  );

  // ── Shared form body (heading + subtitle + form + CTA) ─────────────────────

  const FormBody = ({ wide }: { wide?: boolean }) => (
    <View style={[styles.formBody, wide && styles.formBodyWide]}>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.headingSubtitle}>{subtitle}</Text>
      <View style={styles.formFields}>{children}</View>
      <Pressable
        onPress={onContinue}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.cta,
          wide && styles.ctaWide,
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

  // ── Back button ────────────────────────────────────────────────────────────

  const BackBtn = ({ light }: { light?: boolean }) =>
    onBack ? (
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
        <View style={[styles.backBtnInner, light && styles.backBtnLight]}>
          <Ionicons name="arrow-back" size={18} color={light ? '#111' : colors.text} />
        </View>
      </Pressable>
    ) : null;

  // ── NATIVE MOBILE ──────────────────────────────────────────────────────────

  if (!isWeb) {
    return (
      <View style={[styles.mobileRoot, { paddingTop: insets.top }]}>
        <View style={styles.mobileTopBar}>
          <BackBtn />
          <CompactProgress />
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.mobileScrollContent, { paddingBottom: insets.bottom + 40 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FormBody />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── WEB DESKTOP (sidebar layout) ───────────────────────────────────────────

  if (showSidebar) {
    return (
      <View style={styles.webRoot}>
        {/* Gradient accent layer */}
        <View style={styles.gradientAccent} pointerEvents="none" />

        {/* Top bar: back button only */}
        <View style={[styles.webTopBar, { paddingTop: insets.top + spacing.md }]}>
          <BackBtn light />
        </View>

        {/* Body: sidebar + content */}
        <View style={styles.webBody}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <SidebarSteps />
          </View>

          {/* Right: form content */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.webScrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.webFormWrap}>
              <FormBody wide />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // ── WEB MOBILE (< 768px) ───────────────────────────────────────────────────

  return (
    <View style={styles.webRoot}>
      <View style={styles.gradientAccent} pointerEvents="none" />
      <View style={[styles.webTopBar, { paddingTop: insets.top + spacing.md }]}>
        <BackBtn light />
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.webMobileScrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CompactProgress />
        <View style={styles.webMobileFormWrap}>
          <FormBody />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    flex: { flex: 1 },

    // ── Native mobile root ──────────────────────────────────────────────────
    mobileRoot: {
      flex: 1,
      backgroundColor: '#F4F7F5',
    },
    mobileTopBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    mobileScrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },

    // ── Web root ────────────────────────────────────────────────────────────
    webRoot: {
      flex: 1,
      backgroundColor: '#F4F7F5',
    },
    gradientAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 320,
      backgroundColor: 'rgba(11,102,35,0.035)',
      pointerEvents: 'none',
    },
    webTopBar: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    webBody: {
      flex: 1,
      flexDirection: 'row',
    },
    webScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    webFormWrap: {
      maxWidth: 560,
      width: '100%',
      alignSelf: 'flex-start',
    },
    webMobileScrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    webMobileFormWrap: {
      marginTop: spacing.md,
    },

    // ── Sidebar ─────────────────────────────────────────────────────────────
    sidebar: {
      width: 240,
      backgroundColor: '#fff',
      borderRightWidth: 1,
      borderRightColor: '#E8EDE9',
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    sidebarInner: {
      paddingHorizontal: spacing.lg,
    },
    sidebarHeader: {
      fontSize: 10,
      fontWeight: '700',
      color: '#9CA3AF',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: spacing.lg,
    },
    stepList: {
      gap: 0,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    stepIconCol: {
      alignItems: 'center',
      width: ICON_SIZE,
    },
    stepIcon: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      borderRadius: ICON_SIZE / 2,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    stepIconUpcoming: {
      backgroundColor: '#F3F4F6',
      borderColor: '#D1D5DB',
    },
    stepActiveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    stepIconNum: {
      fontSize: 10,
      fontWeight: '700',
      color: '#9CA3AF',
    },
    stepConnector: {
      width: 2,
      height: 32,
      backgroundColor: '#E5E7EB',
      marginTop: 2,
    },
    stepConnectorDone: {
      backgroundColor: DONE_GREEN,
    },
    stepTextCol: {
      flex: 1,
      paddingLeft: 12,
      paddingTop: 2,
    },
    stepTextColSpaced: {
      paddingBottom: 32,
    },
    stepLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: '#9CA3AF',
      lineHeight: 18,
    },
    stepLabelDone: {
      color: DONE_GREEN,
      fontWeight: '600',
    },
    stepLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    stepDesc: {
      fontSize: 11,
      color: '#C4C9CE',
      marginTop: 1,
    },

    // ── Compact progress (mobile + web-mobile) ──────────────────────────────
    compactProgress: {
      flex: 1,
      gap: spacing.xs,
    },
    compactProgressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    compactStepText: {
      fontSize: 12,
      color: '#9CA3AF',
    },
    compactStepName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    progressTrack: {
      flexDirection: 'row',
      gap: 4,
    },
    progressSeg: {
      flex: 1,
      height: 3,
      borderRadius: 2,
      backgroundColor: '#E5E7EB',
    },
    progressSegActive: {
      backgroundColor: colors.primary,
    },

    // ── Back button ─────────────────────────────────────────────────────────
    backBtn: {},
    backBtnInner: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backBtnLight: {
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },

    // ── Form body ───────────────────────────────────────────────────────────
    formBody: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    formBodyWide: {
      shadowOpacity: 0,
      elevation: 0,
      backgroundColor: 'transparent',
      padding: 0,
      borderRadius: 0,
    },
    heading: {
      fontSize: 28,
      fontWeight: '800',
      color: '#111111',
      letterSpacing: -0.4,
      lineHeight: 36,
      marginBottom: spacing.xs,
    },
    headingSubtitle: {
      fontSize: typography.fontSize.sm,
      color: '#6B7280',
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    formFields: {},

    // ── CTA button ──────────────────────────────────────────────────────────
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CTA_DARK,
      borderRadius: 12,
      height: 50,
      marginTop: spacing.lg,
    },
    ctaWide: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.lg,
      minWidth: 160,
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
