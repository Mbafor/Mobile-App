import * as ImagePicker from 'expo-image-picker';
import { useRef, useState, type ReactNode } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { EventFormValues } from '@/features/admin/types/event-form';
import { validateEventForm } from '@/features/admin/utils/validate-event-form';
import { eventImageApi } from '@/services/api/event-image.api';
import type { EventLocationType } from '@/types/domain/event';

type EventFormProps = {
  initialValues: EventFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  secondaryAction?: { label: string; onPress: () => void; destructive?: boolean };
};

export function EventForm({
  initialValues,
  submitLabel,
  loading,
  onSubmit,
  secondaryAction,
}: EventFormProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [eventDate, setEventDate] = useState(initialValues.eventDate);
  const [locationType, setLocationType] = useState<EventLocationType>(initialValues.locationType);
  const [locationOrLink, setLocationOrLink] = useState(initialValues.locationOrLink);
  const [registerLink, setRegisterLink] = useState(initialValues.registerLink);
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl);
  const [category, setCategory] = useState(initialValues.category);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isBusy = loading || submitting;

  const showValidationError = (message: string) => {
    setError(message);
    Alert.alert(t('events.admin.form.checkRequiredFieldsTitle'), message);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handlePickImage = async () => {
    if (!user?.id) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t('events.admin.form.imagePermissionTitle'),
        t('events.admin.form.imagePermissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setUploadingImage(true);
    try {
      const { publicUrl, error: uploadError } = await eventImageApi.uploadFromUri(
        user.id,
        result.assets[0].uri,
      );
      if (uploadError || !publicUrl) {
        Alert.alert(
          t('events.admin.form.imageUploadFailedTitle'),
          uploadError?.message ?? t('events.admin.form.imageUploadFailedMessage'),
        );
        return;
      }
      setImageUrl(publicUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (isBusy) return;
    Keyboard.dismiss();

    const payload: EventFormValues = {
      title,
      description,
      eventDate,
      locationType,
      locationOrLink,
      registerLink,
      imageUrl,
      category,
    };

    const validation = validateEventForm(payload);
    if (!validation.ok) {
      showValidationError(validation.message);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (e) {
      const message = e instanceof Error ? e.message : t('events.admin.form.genericSubmitError');
      setError(message);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator
      >
        <Field label={t('events.admin.form.titleLabel')}>
          <Input value={title} onChangeText={setTitle} placeholder={t('events.admin.form.titlePlaceholder')} />
        </Field>
        <Field label={t('events.admin.form.descriptionLabel')}>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder={t('events.admin.form.descriptionPlaceholder')}
            multiline
            style={styles.multiline}
          />
        </Field>
        <Field label={t('events.admin.form.eventDateLabel')}>
          <Input
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="2026-12-31T18:00"
            autoCapitalize="none"
          />
        </Field>
        <Field label={t('events.admin.form.registerLinkLabel')}>
          <Input
            value={registerLink}
            onChangeText={setRegisterLink}
            placeholder={t('events.admin.form.registerLinkPlaceholder')}
            autoCapitalize="none"
          />
        </Field>

        <Text style={styles.section}>{t('events.admin.form.locationSection')}</Text>

        <FormField label={t('events.admin.form.locationTypeLabel')}>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleOption, locationType === 'virtual' && styles.toggleOptionActive]}
              onPress={() => setLocationType('virtual')}
            >
              <Text
                style={[styles.toggleOptionText, locationType === 'virtual' && styles.toggleOptionTextActive]}
              >
                {t('events.common.virtual')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleOption, locationType === 'in_person' && styles.toggleOptionActive]}
              onPress={() => setLocationType('in_person')}
            >
              <Text
                style={[styles.toggleOptionText, locationType === 'in_person' && styles.toggleOptionTextActive]}
              >
                {t('events.common.inPerson')}
              </Text>
            </Pressable>
          </View>
        </FormField>

        <Field
          label={
            locationType === 'in_person'
              ? t('events.admin.form.locationOrLinkLabelInPerson')
              : t('events.admin.form.locationOrLinkLabelVirtual')
          }
        >
          <Input
            value={locationOrLink}
            onChangeText={setLocationOrLink}
            placeholder={
              locationType === 'in_person'
                ? t('events.admin.form.locationOrLinkPlaceholderInPerson')
                : t('events.admin.form.locationOrLinkPlaceholderVirtual')
            }
            autoCapitalize="none"
          />
        </Field>

        <Text style={styles.section}>{t('events.admin.form.classificationSection')}</Text>

        <Field label={t('events.admin.form.categoryLabel')}>
          <Input
            value={category}
            onChangeText={setCategory}
            placeholder={t('events.admin.form.categoryPlaceholder')}
          />
        </Field>

        <Text style={styles.section}>{t('events.admin.form.imageSection')}</Text>

        <Field label={t('events.admin.form.imageUrlLabel')}>
          <Input value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />
        </Field>

        <View style={styles.imagePickerRow}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} contentFit="cover" />
          ) : null}
          <Button
            variant="secondary"
            onPress={() => void handlePickImage()}
            disabled={uploadingImage}
            loading={uploadingImage}
          >
            {t('events.admin.form.pickImage')}
          </Button>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          onPress={() => void handleSubmit()}
          loading={isBusy}
          disabled={isBusy}
          fullWidth
        >
          {submitLabel}
        </Button>
        {secondaryAction ? (
          <Button
            variant="ghost"
            onPress={secondaryAction.onPress}
            disabled={isBusy}
            fullWidth
            textStyle={secondaryAction.destructive ? { color: colors.error } : undefined}
          >
            {secondaryAction.label}
          </Button>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.md },
  footer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  section: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
    marginTop: spacing.sm,
  },
  field: { gap: spacing.xs },
  label: { fontWeight: '600', color: colors.text },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  error: { color: colors.error, fontSize: 13 },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleOptionActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  toggleOptionText: { fontWeight: '600', color: colors.textMuted },
  toggleOptionTextActive: { color: colors.primary },
  imagePickerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  imagePreview: { width: 72, height: 48, borderRadius: 8, backgroundColor: colors.border },
});
}
