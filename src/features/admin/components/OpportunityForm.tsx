import { useRef, useState, type ReactNode } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  CountrySelect,
  FormField,
  MultiSelectWithOther,
  SelectWithOther,
} from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import {
  getOpportunityCategoryOptions,
  getOpportunityDegreeOptions,
  getOpportunityTagOptions,
  OPPORTUNITY_DEGREE_VALUES,
  OPPORTUNITY_LOCATION_SELECT_OPTIONS,
  PREDEFINED_OPPORTUNITY_CATEGORIES,
  PREDEFINED_OPPORTUNITY_COUNTRIES,
  PREDEFINED_OPPORTUNITY_LOCATIONS,
  PREDEFINED_OPPORTUNITY_TAGS,
} from '@/constants/opportunity-fields';
import { FundingPicker } from '@/features/onboarding/components/FundingPicker';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { validateOpportunityForm } from '@/features/admin/utils/validate-opportunity-form';
import type { LocationType } from '@/types/domain/opportunity';
import type { FundingPreference } from '@/types/domain/user-preferences';

type OpportunityFormProps = {
  initialValues: OpportunityFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: OpportunityFormValues) => void | Promise<void>;
  secondaryAction?: { label: string; onPress: () => void; destructive?: boolean };
};

function normalizeTags(tags: string[], category: string): string[] {
  const trimmed = tags.map((t) => t.trim()).filter(Boolean);
  if (category.trim() && !trimmed.includes(category.trim())) {
    trimmed.push(category.trim());
  }
  return [...new Set(trimmed)];
}

export function OpportunityForm({
  initialValues,
  submitLabel,
  loading,
  onSubmit,
  secondaryAction,
}: OpportunityFormProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [title, setTitle] = useState(initialValues.title);
  const [organization, setOrganization] = useState(initialValues.organization);
  const [description, setDescription] = useState(initialValues.description);
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl);
  const [deadline, setDeadline] = useState(initialValues.deadline);
  const [tags, setTags] = useState(initialValues.tags);
  const [country, setCountry] = useState(initialValues.country);
  const [category, setCategory] = useState(initialValues.category);
  const [fundingType, setFundingType] = useState(
    (initialValues.fundingType || 'fully_funded') as FundingPreference,
  );
  const [degreeLevels, setDegreeLevels] = useState(initialValues.degreeLevels);
  const [locationType, setLocationType] = useState(initialValues.locationType);
  const [applyUrl, setApplyUrl] = useState(initialValues.applyUrl);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isBusy = loading || submitting;

  const showValidationError = (message: string) => {
    setError(message);
    Alert.alert(t('admin.form.checkRequiredFieldsTitle'), message);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleSubmit = async () => {
    if (isBusy) return;
    Keyboard.dismiss();

    const payload: OpportunityFormValues = {
      title,
      organization,
      description,
      imageUrl,
      deadline,
      tags: normalizeTags(tags, category),
      country,
      category,
      fundingType,
      degreeLevels,
      locationType: locationType as LocationType,
      applyUrl,
    };

    const validation = validateOpportunityForm(payload);
    if (!validation.ok) {
      showValidationError(validation.message);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (e) {
      const message = e instanceof Error ? e.message : t('admin.form.genericSubmitError');
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
        <Field label={t('admin.form.titleLabel')}>
          <Input value={title} onChangeText={setTitle} placeholder={t('admin.form.titlePlaceholder')} />
        </Field>
        <Field label={t('admin.form.organizationLabel')}>
          <Input value={organization} onChangeText={setOrganization} placeholder={t('admin.form.organizationPlaceholder')} />
        </Field>
        <Field label={t('admin.form.descriptionLabel')}>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder={t('admin.form.descriptionPlaceholder')}
            multiline
            style={styles.multiline}
          />
        </Field>
        <Field label={t('admin.form.imageUrlLabel')}>
          <Input value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />
        </Field>
        <Field label={t('admin.form.deadlineLabel')}>
          <Input value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" autoCapitalize="none" />
        </Field>
        <Field label={t('admin.form.applyUrlLabel')}>
          <Input
            value={applyUrl}
            onChangeText={setApplyUrl}
            placeholder={t('admin.form.applyUrlPlaceholder')}
            autoCapitalize="none"
          />
        </Field>

        <Text style={styles.section}>{t('admin.form.classificationSection')}</Text>

        <FormField label={t('admin.form.categoryLabel')}>
          <SelectWithOther
            options={getOpportunityCategoryOptions()}
            predefinedValues={PREDEFINED_OPPORTUNITY_CATEGORIES}
            value={category}
            onChange={setCategory}
            placeholder={t('admin.form.categoryPlaceholder')}
          />
        </FormField>

        <FormField label={t('admin.form.tagsLabel')}>
          <MultiSelectWithOther
            options={getOpportunityTagOptions()}
            predefinedValues={PREDEFINED_OPPORTUNITY_TAGS}
            values={tags}
            onChange={setTags}
            syncOnChange
            placeholder={t('admin.form.tagsPlaceholder')}
          />
        </FormField>

        <FormField label={t('admin.form.countryLabel')}>
          <CountrySelect
            value={country}
            onChange={setCountry}
            placeholder={t('admin.form.countryPlaceholder')}
            extraOptions={[{ label: t('admin.form.countryGlobalOption'), value: 'Global' }]}
            extraPredefined={['Global']}
          />
        </FormField>

        <FormField label={t('admin.form.fundingTypeLabel')}>
          <FundingPicker
            value={fundingType === 'any' ? 'fully_funded' : fundingType}
            onChange={setFundingType}
            excludeAny
          />
        </FormField>

        <FormField label={t('admin.form.degreeLevelLabel')}>
          <MultiSelectWithOther
            options={getOpportunityDegreeOptions()}
            predefinedValues={OPPORTUNITY_DEGREE_VALUES}
            values={degreeLevels}
            onChange={setDegreeLevels}
            syncOnChange
            placeholder={t('admin.form.degreeLevelPlaceholder')}
          />
        </FormField>

        <FormField label={t('admin.form.locationTypeLabel')}>
          <SelectWithOther
            options={OPPORTUNITY_LOCATION_SELECT_OPTIONS}
            predefinedValues={PREDEFINED_OPPORTUNITY_LOCATIONS}
            value={locationType}
            onChange={(v) => setLocationType(v as LocationType | '')}
            placeholder={t('admin.form.locationTypePlaceholder')}
          />
        </FormField>
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
});
}
