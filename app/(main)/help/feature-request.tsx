import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button, Text } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useSubmitFeatureRequest } from '@/features/help/hooks/useHelpSubmissions';
import { colors, spacing } from '@/constants/theme';

export default function FeatureRequestScreen() {
  const router = useRouter();
  const { mutate, isPending } = useSubmitFeatureRequest();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a short title for your request.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description required', 'Please describe the feature you have in mind.');
      return;
    }
    mutate({ title: title.trim(), description: description.trim() }, {
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
          Have an idea that would make Olives Forum better? We'd love to hear it.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Dark mode support"
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the feature and why it would be useful…"
            minHeight={140}
          />
        </View>

        <Button onPress={handleSubmit} loading={isPending} fullWidth>
          Submit Request
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  field: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  required: { color: colors.error },
});
