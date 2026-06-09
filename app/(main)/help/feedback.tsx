import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function FeedbackScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { mutate, isPending } = useSubmitFeedback();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
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
          Your feedback helps us build a better experience for every student.
        </Text>

        {/* Star rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.label}>How would you rate your experience?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${star} star`}
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
            <Text style={styles.ratingLabel}>{STAR_LABELS[rating]}</Text>
          ) : null}
        </View>

        {/* Comment */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Comment <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextArea
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us what you liked or what could be better…"
            minHeight={130}
          />
        </View>

        <Button onPress={handleSubmit} loading={isPending} fullWidth>
          Send Feedback
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
