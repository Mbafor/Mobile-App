import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input, Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import type { ColorScheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { surveyApi } from '@/features/survey/services/survey.api';
import { useSurveyStore } from '@/features/survey/store/survey.store';
import type { MostUsedFeature, SurveyAnswers } from '@/features/survey/types/survey.types';

const TOTAL_QUESTIONS = 4;
const THANKS_STEP = TOTAL_QUESTIONS;
const AUTO_DISMISS_MS = 1500;

const FEATURE_OPTIONS: { key: MostUsedFeature; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'opportunities', labelKey: 'survey.mostUsed.opportunities', icon: 'compass-outline' },
  { key: 'cv-builder', labelKey: 'survey.mostUsed.cvBuilder', icon: 'document-text-outline' },
  { key: 'mentorship', labelKey: 'survey.mostUsed.mentorship', icon: 'people-outline' },
];

type DraftAnswers = {
  experienceRating: number;
  mostUsedFeature: MostUsedFeature | null;
  excitedAbout: string;
  featureRequest: string;
};

const EMPTY_ANSWERS: DraftAnswers = {
  experienceRating: 0,
  mostUsedFeature: null,
  excitedAbout: '',
  featureRequest: '',
};

export function FeatureSurveyModal() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const isOpen = useSurveyStore((s) => s.isOpen);
  const close = useSurveyStore((s) => s.close);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<DraftAnswers>(EMPTY_ANSWERS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const stepFade = useRef(new Animated.Value(1)).current;
  const mountedStepRef = useRef(false);

  // Reset to question 1 whenever the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers(EMPTY_ANSWERS);
      setSubmitError(false);
      mountedStepRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mountedStepRef.current) {
      mountedStepRef.current = true;
      return;
    }
    Animated.sequence([
      Animated.timing(stepFade, { toValue: 0, duration: 120, useNativeDriver: false }),
      Animated.timing(stepFade, { toValue: 1, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [step, stepFade]);

  useEffect(() => {
    if (step !== THANKS_STEP) return;
    const timer = setTimeout(() => close(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [step, close]);

  const submit = async (finalAnswers: DraftAnswers) => {
    if (!user || !finalAnswers.mostUsedFeature) return;
    setIsSubmitting(true);
    setSubmitError(false);
    const payload: SurveyAnswers = {
      experienceRating: finalAnswers.experienceRating,
      mostUsedFeature: finalAnswers.mostUsedFeature,
      excitedAbout: finalAnswers.excitedAbout.trim(),
      featureRequest: finalAnswers.featureRequest.trim(),
    };
    const { error } = await surveyApi.submitResponse(user.id, payload);
    setIsSubmitting(false);
    if (error) {
      setSubmitError(true);
      return;
    }
    setStep(THANKS_STEP);
  };

  const goNext = () => {
    if (step === TOTAL_QUESTIONS - 1) {
      void submit(answers);
      return;
    }
    setStep((s) => s + 1);
  };

  const selectFeature = (feature: MostUsedFeature) => {
    setAnswers((a) => ({ ...a, mostUsedFeature: feature }));
    setStep((s) => s + 1);
  };

  const canProceed =
    (step === 0 && answers.experienceRating > 0) ||
    (step === 2 && answers.excitedAbout.trim().length > 0) ||
    (step === 3 && answers.featureRequest.trim().length > 0);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Pressable
            onPress={close}
            style={styles.closeBtn}
            hitSlop={12}
            accessibilityLabel={t('survey.close')}
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>

          {step < THANKS_STEP ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_QUESTIONS) * 100}%` }]} />
            </View>
          ) : null}
          {step < THANKS_STEP ? (
            <Text style={styles.progressLabel}>
              {t('survey.progress', { current: step + 1, total: TOTAL_QUESTIONS })}
            </Text>
          ) : null}

          <Animated.View style={{ opacity: stepFade }}>
            {step === 0 && (
              <View style={styles.questionBlock}>
                <Text style={styles.question}>{t('survey.rating.question')}</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setAnswers((a) => ({ ...a, experienceRating: star }))}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t('survey.rating.starA11y', { count: star })}
                    >
                      <Ionicons
                        name={star <= answers.experienceRating ? 'star' : 'star-outline'}
                        size={38}
                        color={star <= answers.experienceRating ? '#F5A623' : colors.border}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === 1 && (
              <View style={styles.questionBlock}>
                <Text style={styles.question}>{t('survey.mostUsed.question')}</Text>
                <View style={styles.optionList}>
                  {FEATURE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={() => selectFeature(option.key)}
                      style={({ pressed }) => [
                        styles.optionCard,
                        pressed && styles.optionCardPressed,
                      ]}
                    >
                      <Ionicons name={option.icon} size={22} color={colors.primary} />
                      <Text style={styles.optionLabel}>{t(option.labelKey)}</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.questionBlock}>
                <Text style={styles.question}>{t('survey.excitedAbout.question')}</Text>
                <Input
                  value={answers.excitedAbout}
                  onChangeText={(text) => setAnswers((a) => ({ ...a, excitedAbout: text }))}
                  placeholder={t('survey.placeholder')}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => canProceed && goNext()}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.questionBlock}>
                <Text style={styles.question}>{t('survey.featureRequest.question')}</Text>
                <Input
                  value={answers.featureRequest}
                  onChangeText={(text) => setAnswers((a) => ({ ...a, featureRequest: text }))}
                  placeholder={t('survey.placeholder')}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => canProceed && goNext()}
                />
                {submitError ? (
                  <View style={styles.errorRow}>
                    <Text style={styles.errorText}>{t('survey.submitError')}</Text>
                    <Pressable onPress={() => void submit(answers)}>
                      <Text style={styles.retryText}>{t('survey.retry')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            )}

            {step === THANKS_STEP && (
              <View style={styles.thanksBlock}>
                <Ionicons name="checkmark-circle" size={56} color={colors.success} />
                <Text style={styles.thanksText}>{t('survey.thanks')}</Text>
                <Button onPress={close} variant="secondary" style={styles.doneBtn}>
                  {t('survey.done')}
                </Button>
              </View>
            )}
          </Animated.View>

          {step < THANKS_STEP && step !== 1 ? (
            <Button
              onPress={goNext}
              disabled={!canProceed}
              loading={isSubmitting}
              style={styles.nextBtn}
            >
              {step === TOTAL_QUESTIONS - 1 ? t('survey.submit') : t('survey.next')}
            </Button>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: spacing.lg,
      paddingTop: spacing.xl,
    },
    closeBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      zIndex: 1,
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    questionBlock: {
      gap: spacing.md,
      minHeight: 120,
    },
    question: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 26,
    },
    stars: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      paddingVertical: spacing.sm,
    },
    optionList: {
      gap: spacing.sm,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
    },
    optionCardPressed: {
      backgroundColor: `${colors.primary}10`,
      borderColor: colors.primary,
    },
    optionLabel: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    errorText: {
      fontSize: 13,
      color: colors.error,
      flex: 1,
    },
    retryText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    nextBtn: {
      marginTop: spacing.lg,
    },
    thanksBlock: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    thanksText: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    doneBtn: {
      marginTop: spacing.xs,
      minWidth: 120,
    },
  });
}
