import { useRouter } from 'expo-router';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { spacing } from '@/constants/theme';

export default function FeatureRequestScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate, isPending } = useSubmitFeatureRequest();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(t('help.common.titleRequired'), t('help.feature.titleRequiredMessage'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('help.common.descriptionRequired'), t('help.feature.descriptionRequiredMessage'));
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
          {t('help.feature.intro')}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>{t('help.common.title')} <Text style={styles.required}>*</Text></Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder={t('help.feature.titlePlaceholder')}
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('help.common.description')} <Text style={styles.required}>*</Text></Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder={t('help.feature.descriptionPlaceholder')}
            minHeight={140}
          />
        </View>

        <Button onPress={handleSubmit} loading={isPending} fullWidth>
          {t('help.feature.submit')}
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
  field: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  required: { color: colors.error },
});
}
