import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button, Text } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import {
  uploadScreenshot,
  useSubmitBug,
} from '@/features/help/hooks/useHelpSubmissions';
import { spacing } from '@/constants/theme';

export default function ReportBugScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate, isPending } = useSubmitBug();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickScreenshot = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('help.bug.permissionTitle'), t('help.bug.permissionMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('help.common.titleRequired'), t('help.bug.titleRequiredMessage'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('help.common.descriptionRequired'), t('help.bug.descriptionRequiredMessage'));
      return;
    }

    let screenshot_url: string | undefined;
    if (screenshotUri) {
      setUploading(true);
      screenshot_url = (await uploadScreenshot(screenshotUri)) ?? undefined;
      setUploading(false);
    }

    mutate({ title: title.trim(), description: description.trim(), screenshot_url }, {
      onSuccess: () => router.back(),
    });
  };

  const busy = isPending || uploading;

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
        <View style={styles.field}>
          <Text style={styles.label}>{t('help.common.title')} <Text style={styles.required}>*</Text></Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder={t('help.bug.titlePlaceholder')}
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('help.common.description')} <Text style={styles.required}>*</Text></Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder={t('help.bug.descriptionPlaceholder')}
            minHeight={140}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('help.bug.screenshot')} <Text style={styles.optional}>{t('help.common.optional')}</Text></Text>
          {screenshotUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: screenshotUri }} style={styles.preview} resizeMode="cover" />
              <Pressable
                onPress={() => setScreenshotUri(null)}
                style={styles.removeBtn}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => void pickScreenshot()}
              style={({ pressed }) => [styles.imagePicker, pressed && styles.imagePickerPressed]}
            >
              <Ionicons name="image-outline" size={24} color={colors.primary} />
              <Text style={styles.imagePickerText}>{t('help.bug.attachScreenshot')}</Text>
            </Pressable>
          )}
        </View>

        <Button onPress={() => void handleSubmit()} loading={busy} fullWidth>
          {t('help.bug.submit')}
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
  field: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  required: { color: colors.error },
  optional: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
  previewWrap: { position: 'relative', alignSelf: 'flex-start' },
  preview: { width: 160, height: 120, borderRadius: 8, backgroundColor: colors.surface },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  imagePickerPressed: { opacity: 0.7 },
  imagePickerText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
});
}
