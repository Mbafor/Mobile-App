import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
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

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_META = [
  { labelKey: 'onboarding.shell.steps.basic' },
  { labelKey: 'onboarding.shell.steps.academic' },
  { labelKey: 'onboarding.shell.steps.preferences' },
] as const;

// Per-step left-panel content: heading + description keys, illustration, floating icons
const STEP_PANEL: {
  headingKey: string;
  descriptionKey: string;
  illustration: number;
  icons: (keyof typeof Ionicons.glyphMap)[];
}[] = [
  {
    headingKey: 'onboarding.shell.panels.basic.heading',
    descriptionKey: 'onboarding.shell.panels.basic.description',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    illustration: require('@/assets/images/basic-info.png') as number,
    icons: ['person-outline', 'location-outline', 'mail-outline', 'phone-portrait-outline'],
  },
  {
    headingKey: 'onboarding.shell.panels.academic.heading',
    descriptionKey: 'onboarding.shell.panels.academic.description',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    illustration: require('@/assets/images/acadmic.png') as number,
    icons: ['school-outline', 'book-outline', 'business-outline', 'document-outline'],
  },
  {
    headingKey: 'onboarding.shell.panels.preferences.heading',
    descriptionKey: 'onboarding.shell.panels.preferences.description',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    illustration: require('@/assets/images/preferences.png') as number,
    icons: ['globe-outline', 'briefcase-outline', 'school-outline', 'cash-outline'],
  },
];

// Floating badge positions around illustration (absolute, relative to container)
const BADGE_POSITIONS = [
  { top: 4, left: -10 },
  { top: 4, right: -10 },
  { bottom: 4, left: -10 },
  { bottom: 4, right: -10 },
] as const;

const TOTAL = STEP_META.length;
const DESKTOP_BREAKPOINT = 768;
const DOT_SIZE = 20;
const DESK_DOT_SIZE = 26;

// ─── Props ────────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingShell({
  children,
  currentStep,
  title,
  subtitle,
  onBack,
  onContinue,
  continueLabel,
  isLoading = false,
}: OnboardingShellProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const resolvedContinueLabel = continueLabel ?? t('onboarding.shell.continue');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= DESKTOP_BREAKPOINT;

  // Fade animation for left-panel content on step change
  const panelFade = useRef(new Animated.Value(1)).current;
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    Animated.sequence([
      Animated.timing(panelFade, { toValue: 0, duration: 150, useNativeDriver: false }),
      Animated.timing(panelFade, { toValue: 1, duration: 220, useNativeDriver: false }),
    ]).start();
  }, [currentStep, panelFade]);

  const panelMeta = STEP_PANEL[Math.min(currentStep - 1, STEP_PANEL.length - 1)];

  // ── DESKTOP (≥ 768 px) ──────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={[styles.dRoot, { paddingTop: insets.top }]}>

        {/* ── Left panel: illustration ─────────────────────────────────────── */}
        <View style={styles.leftPanel}>
          {/* Background decorations */}
          <View style={styles.decoBigCircle} />
          <View style={styles.decoMedCircle} />
          <View style={styles.decoSmallDot1} />
          <View style={styles.decoSmallDot2} />
          <View style={styles.decoSmallDot3} />

          {/* Animated content */}
          <Animated.View style={[styles.leftContent, { opacity: panelFade }]}>
            <Text style={styles.panelHeading}>{t(panelMeta.headingKey)}</Text>
            <Text style={styles.panelDesc}>{t(panelMeta.descriptionKey)}</Text>

            {/* Illustration + floating icon badges */}
            <View style={styles.illustrationWrap}>
              <Image
                source={panelMeta.illustration}
                style={styles.illustration}
                resizeMode="contain"
              />
              {panelMeta.icons.map((icon, idx) => (
                <View
                  key={idx}
                  style={[styles.iconBadge, BADGE_POSITIONS[idx] as object]}
                >
                  <Ionicons name={icon} size={18} color={colors.primary} />
                </View>
              ))}
            </View>

            {/* Decorative dot row */}
            <View style={styles.dotRow}>
              {[6, 10, 6, 10, 6].map((size, i) => (
                <View
                  key={i}
                  style={[
                    styles.dotBase,
                    {
                      width: size,
                      height: 6,
                      borderRadius: 3,
                      opacity: i % 2 === 0 ? 0.25 : 0.45,
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* ── Right panel: step indicator + form ──────────────────────────── */}
        <View style={styles.rightPanel}>

          {/* Step indicator bar */}
          <View style={styles.deskStepBar}>
            {STEP_META.map((step, i) => {
              const num = i + 1;
              const isDone = num < currentStep;
              const isActive = num === currentStep;
              const isLast = i === TOTAL - 1;
              return (
                <Fragment key={num}>
                  <View style={styles.deskStepItem}>
                    <View
                      style={[
                        styles.deskDot,
                        isDone && styles.deskDotDone,
                        isActive && styles.deskDotActive,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={13} color={colors.textOnPrimary} />
                      ) : (
                        <Text
                          style={[
                            styles.deskDotNum,
                            isActive && styles.deskDotNumActive,
                          ]}
                        >
                          {num}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.deskStepLabel,
                        isDone && styles.deskStepLabelDone,
                        isActive && styles.deskStepLabelActive,
                      ]}
                    >
                      {t(step.labelKey)}
                    </Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.deskConnector,
                        isDone && styles.deskConnectorDone,
                      ]}
                    />
                  )}
                </Fragment>
              );
            })}
          </View>

          {/* Form area */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.deskFormScroll,
              { paddingBottom: insets.bottom + spacing.xl * 2 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.deskFormCard}>
              {onBack && (
                <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
                  <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
                  <Text style={styles.backBtnText}>{t('onboarding.shell.back')}</Text>
                </Pressable>
              )}
              <View style={styles.fields}>{children}</View>
              <Pressable
                onPress={onContinue}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.cta,
                  styles.ctaDesktop,
                  isLoading && styles.ctaDisabled,
                  pressed && !isLoading && styles.ctaPressed,
                ]}
              >
                <Text style={styles.ctaText}>
                  {isLoading ? t('onboarding.shell.saving') : resolvedContinueLabel}
                </Text>
                {!isLoading && (
                  <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} style={styles.ctaArrow} />
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>

      </View>
    );
  }

  // ── MOBILE & WEB-MOBILE ───────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Step bar (top) ── */}
      <View style={styles.mobileHeader}>
        <View style={styles.stepBar}>
          {STEP_META.map((step, i) => {
            const num = i + 1;
            const isDone = num < currentStep;
            const isActive = num === currentStep;
            const isLast = i === TOTAL - 1;
            return (
              <Fragment key={num}>
                <View style={styles.stepBarItem}>
                  <View
                    style={[
                      styles.stepBarDot,
                      isDone && styles.stepBarDotDone,
                      isActive && styles.stepBarDotActive,
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={9} color={colors.textOnPrimary} />
                    ) : (
                      <Text
                        style={[styles.stepBarNum, isActive && styles.stepBarNumActive]}
                      >
                        {num}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepBarLabel,
                      isDone && styles.stepBarLabelDone,
                      isActive && styles.stepBarLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t(step.labelKey)}
                  </Text>
                </View>
                {!isLast && (
                  <View style={styles.stepBarConnectorWrap}>
                    <View
                      style={[
                        styles.stepBarConnector,
                        isDone && styles.stepBarConnectorDone,
                      ]}
                    />
                  </View>
                )}
              </Fragment>
            );
          })}
        </View>
      </View>

      {/* ── Scrollable form body ── */}
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
          {onBack && (
            <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
              <Text style={styles.backBtnText}>{t('onboarding.shell.back')}</Text>
            </Pressable>
          )}
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
            <Text style={styles.ctaText}>{isLoading ? t('onboarding.shell.saving') : resolvedContinueLabel}</Text>
            {!isLoading && (
              <Ionicons name="arrow-forward" size={15} color={colors.textOnPrimary} style={styles.ctaArrow} />
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    flex: { flex: 1 },

    // ── Desktop root ──────────────────────────────────────────────────────────
    dRoot: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.background,
    },

    // ── Left panel ────────────────────────────────────────────────────────────
    leftPanel: {
      width: '38%',
      backgroundColor: colors.surface,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
    },

    // Decorative circles (positioned absolutely inside left panel)
    decoBigCircle: {
      position: 'absolute',
      width: 420,
      height: 420,
      borderRadius: 210,
      backgroundColor: 'rgba(22, 163, 74, 0.07)',
      top: -130,
      left: -130,
    },
    decoMedCircle: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: 'rgba(22, 163, 74, 0.05)',
      bottom: -80,
      right: -80,
    },
    decoSmallDot1: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(22, 163, 74, 0.2)',
      top: 60,
      right: 32,
    },
    decoSmallDot2: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(22, 163, 74, 0.15)',
      bottom: 80,
      left: 28,
    },
    decoSmallDot3: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(22, 163, 74, 0.12)',
      top: 140,
      left: 20,
    },

    // Content inside left panel (faded)
    leftContent: {
      alignItems: 'center',
      gap: spacing.md,
      zIndex: 1,
      width: '100%',
    },
    panelHeading: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    panelDesc: {
      fontSize: 13.5,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 21,
      maxWidth: 300,
    },

    // Illustration container + floating badges
    illustrationWrap: {
      width: 260,
      height: 220,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
    },
    illustration: {
      width: 220,
      height: 200,
    },
    iconBadge: {
      position: 'absolute',
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    // Decorative dot row
    dotRow: {
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    dotBase: {
      backgroundColor: colors.primary,
    },

    // ── Right panel ───────────────────────────────────────────────────────────
    rightPanel: {
      flex: 1,
      backgroundColor: colors.background,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },

    // Step indicator at top of right panel
    deskStepBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl + spacing.md,
      paddingVertical: spacing.md + 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deskStepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    deskDot: {
      width: DESK_DOT_SIZE,
      height: DESK_DOT_SIZE,
      borderRadius: DESK_DOT_SIZE / 2,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deskDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    deskDotDone: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    deskDotNum: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    deskDotNumActive: {
      color: colors.textOnPrimary,
    },
    deskStepLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
    },
    deskStepLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    deskStepLabelDone: {
      color: colors.success,
      fontWeight: '600',
    },
    deskConnector: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
      borderRadius: 1,
    },
    deskConnectorDone: {
      backgroundColor: colors.success,
    },

    // Form scroll + card
    deskFormScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
    },
    deskFormCard: {
      width: '100%',
      maxWidth: 500,
    },

    // ── Mobile root ───────────────────────────────────────────────────────────
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── Mobile step bar ───────────────────────────────────────────────────────
    mobileHeader: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    stepBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBarItem: {
      flex: 1,
      alignItems: 'center',
    },
    stepBarConnectorWrap: {
      flex: 0.6,
      paddingHorizontal: 3,
    },
    stepBarConnector: {
      height: 1.5,
      backgroundColor: colors.border,
    },
    stepBarConnectorDone: {
      backgroundColor: colors.primary,
    },
    stepBarDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    stepBarDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepBarDotDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepBarNum: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textMuted,
    },
    stepBarNumActive: {
      color: colors.textOnPrimary,
    },
    stepBarLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textMuted,
      textAlign: 'center',
    },
    stepBarLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    stepBarLabelDone: {
      color: colors.success,
    },

    // ── Mobile scroll body ────────────────────────────────────────────────────
    mobileScrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },

    // ── Shared: heading (mobile only on desktop) ──────────────────────────────
    heading: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
      lineHeight: 32,
      marginBottom: spacing.xs,
    },
    headingSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    fields: {},

    // ── Back button ───────────────────────────────────────────────────────────
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
      gap: 4,
    },
    backBtnText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
    },

    // ── CTA button ────────────────────────────────────────────────────────────
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      marginTop: spacing.lg,
    },
    ctaDesktop: {
      height: 54,
      borderRadius: 14,
      marginTop: spacing.xl,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 5,
    },
    ctaDisabled: {
      opacity: 0.5,
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.md,
      fontWeight: '600',
    },
    ctaArrow: {
      marginLeft: spacing.sm,
    },
  });
}
