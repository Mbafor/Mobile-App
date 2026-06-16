import { Fragment, type ReactNode } from 'react';
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
const DESKTOP_BREAKPOINT = 768;
const DOT_SIZE = 20;
const DONE_GREEN = '#16A34A';

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

  // ── DESKTOP (≥ 768 px) ────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>

        {/* ── Top step bar ── */}
        <View style={styles.desktopTopBar}>
          <View style={styles.desktopStepRow}>
            {STEP_META.map((step, i) => {
              const num = i + 1;
              const isDone = num < currentStep;
              const isActive = num === currentStep;
              const isLast = i === TOTAL - 1;
              return (
                <Fragment key={num}>
                  <View style={styles.desktopStepItem}>
                    <View
                      style={[
                        styles.sidebarDot,
                        isDone && styles.sidebarDotDone,
                        isActive && styles.sidebarDotActive,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      ) : (
                        <Text
                          style={[
                            styles.sidebarDotNum,
                            isActive && styles.sidebarDotNumActive,
                          ]}
                        >
                          {num}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.desktopStepLabel,
                        isDone && styles.sidebarStepLabelDone,
                        isActive && styles.sidebarStepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.desktopConnector,
                        isDone && styles.sidebarConnectorDone,
                      ]}
                    />
                  )}
                </Fragment>
              );
            })}
          </View>
        </View>

        {/* ── Centered form ── */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.desktopScrollContent,
            { paddingBottom: insets.bottom + spacing.xl * 2 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.desktopFormCard}>
            {onBack && (
              <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
                <Ionicons name="chevron-back" size={16} color="#374151" />
                <Text style={styles.backBtnText}>Back</Text>
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
              <Text style={styles.ctaText}>{isLoading ? 'Saving…' : continueLabel}</Text>
              {!isLoading && (
                <Ionicons name="arrow-forward" size={15} color="#fff" style={styles.ctaArrow} />
              )}
            </Pressable>
          </View>
        </ScrollView>

      </View>
    );
  }

  // ── MOBILE & WEB-MOBILE ───────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Step bar (fixed at top) ── */}
      <View style={styles.mobileHeader}>
        <View style={styles.stepBar}>
          {STEP_META.map((step, i) => {
            const num = i + 1;
            const isDone = num < currentStep;
            const isActive = num === currentStep;
            const isLast = i === TOTAL - 1;
            return (
              <View key={num} style={styles.stepBarRow}>
                <View style={styles.stepBarItem}>
                  <View
                    style={[
                      styles.stepBarDot,
                      isDone && styles.stepBarDotDone,
                      isActive && styles.stepBarDotActive,
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={9} color="#fff" />
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
                    {step.label}
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
              </View>
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
              <Ionicons name="chevron-back" size={16} color="#374151" />
              <Text style={styles.backBtnText}>Back</Text>
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
            <Text style={styles.ctaText}>{isLoading ? 'Saving…' : continueLabel}</Text>
            {!isLoading && (
              <Ionicons name="arrow-forward" size={15} color="#fff" style={styles.ctaArrow} />
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

    root: {
      flex: 1,
      backgroundColor: '#fff',
    },

    // ── Desktop ──────────────────────────────────────────────────────────────
    desktopTopBar: {
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      backgroundColor: '#fff',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
    },
    desktopStepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      maxWidth: 480,
    },
    desktopStepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    desktopStepLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: '#9CA3AF',
    },
    desktopConnector: {
      flex: 1,
      height: 1.5,
      backgroundColor: '#E5E7EB',
      marginHorizontal: spacing.sm,
    },
    desktopScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xl,
    },
    desktopFormCard: {
      width: '100%',
      maxWidth: 480,
    },

    // ── Sidebar ──────────────────────────────────────────────────────────────
    sidebar: {
      width: 200,
      backgroundColor: '#fff',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    sidebarTitle: {
      fontSize: 10,
      fontWeight: '700',
      color: '#9CA3AF',
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      marginBottom: spacing.lg,
    },
    sidebarStepList: {},
    sidebarStepWrapper: {},
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingRight: spacing.sm,
      borderRadius: 8,
    },
    sidebarItemActive: {
      backgroundColor: `${colors.primary}08`,
    },
    sidebarAccent: {
      width: 3,
      height: 36,
      borderRadius: 2,
      backgroundColor: 'transparent',
      marginRight: spacing.sm,
    },
    sidebarAccentActive: {
      backgroundColor: colors.primary,
    },
    sidebarDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: '#F3F4F6',
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    sidebarDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sidebarDotDone: {
      backgroundColor: DONE_GREEN,
      borderColor: DONE_GREEN,
    },
    sidebarDotNum: {
      fontSize: 9,
      fontWeight: '700',
      color: '#9CA3AF',
    },
    sidebarDotNumActive: {
      color: '#fff',
    },
    sidebarTextCol: {
      flex: 1,
    },
    sidebarStepLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: '#9CA3AF',
      lineHeight: 18,
    },
    sidebarStepLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    sidebarStepLabelDone: {
      color: DONE_GREEN,
      fontWeight: '600',
    },
    sidebarStepDesc: {
      fontSize: 11,
      color: '#C4C9CE',
      marginTop: 1,
    },
    sidebarConnectorWrap: {
      paddingLeft: 3 + spacing.sm + DOT_SIZE / 2 + spacing.sm - 1,
      paddingVertical: 2,
    },
    sidebarConnector: {
      width: 1.5,
      height: 20,
      backgroundColor: '#E5E7EB',
    },
    sidebarConnectorDone: {
      backgroundColor: DONE_GREEN,
    },

    // ── Mobile header ─────────────────────────────────────────────────────────
    mobileHeader: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      backgroundColor: '#fff',
    },
    stepBar: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    stepBarItem: {
      alignItems: 'center',
    },
    stepBarConnectorWrap: {
      flex: 1,
      paddingHorizontal: 3,
    },
    stepBarConnector: {
      height: 1.5,
      backgroundColor: '#E5E7EB',
    },
    stepBarConnectorDone: {
      backgroundColor: colors.primary,
    },
    stepBarDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: '#F3F4F6',
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
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
      color: '#9CA3AF',
    },
    stepBarNumActive: {
      color: '#fff',
    },
    stepBarLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: '#9CA3AF',
      textAlign: 'center',
    },
    stepBarLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    stepBarLabelDone: {
      color: DONE_GREEN,
    },

    // ── Mobile scroll body ────────────────────────────────────────────────────
    mobileScrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },

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
      marginBottom: spacing.lg,
      gap: 4,
    },
    backBtnText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#374151',
    },

    // ── Heading ───────────────────────────────────────────────────────────────
    heading: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      letterSpacing: -0.3,
      lineHeight: 32,
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
