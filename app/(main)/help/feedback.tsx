import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button, Text } from '@/components/ui';
import { TextArea } from '@/components/ui/TextArea';
import { useSubmitFeedback } from '@/features/help/hooks/useHelpSubmissions';
import { spacing } from '@/constants/theme';

export default function FeedbackScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate, isPending } = useSubmitFeedback();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert(t('help.feedbackForm.ratingRequired'), t('help.feedbackForm.ratingRequiredMessage'));
      return;
    }
    mutate({ rating, comment: comment.trim() }, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          {t('help.feedbackForm.intro')}
        </Text>

        {/* Star rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.label}>{t('help.feedbackForm.ratingQuestion')}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('help.feedbackForm.starA11y', { count: star })}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#F5A623' : colors.border}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 ? (
            <Text style={styles.ratingLabel}>{t(`help.feedbackForm.stars.${rating}`)}</Text>
          ) : null}
        </View>

        {/* Comment */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t('help.feedbackForm.comment')} <Text style={styles.optional}>{t('help.common.optional')}</Text>
          </Text>
          <TextArea
            value={comment}
            onChangeText={setComment}
            placeholder={t('help.feedbackForm.commentPlaceholder')}
            minHeight={130}
          />
        </View>

        <Button onPress={handleSubmit} loading={isPending} fullWidth>
          {t('help.feedbackForm.submit')}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  intro: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  ratingSection: { gap: spacing.sm },
  stars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5A623',
  },
  field: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  optional: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
});
}
