import { useRef, useState, type ReactNode } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  CountrySelect,
  FormField,
  MultiSelectWithOther,
  SelectWithOther,
} from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import {
  OPPORTUNITY_CATEGORY_OPTIONS,
  OPPORTUNITY_DEGREE_OPTIONS,
  OPPORTUNITY_DEGREE_VALUES,
  OPPORTUNITY_LOCATION_SELECT_OPTIONS,
  OPPORTUNITY_TAG_OPTIONS,
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
}: OpportunityFormProps) {
  const styles = useThemedStyles(createStyles);
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
    Alert.alert('Check required fields', message);
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
      const message = e instanceof Error ? e.message : 'Something went wrong';
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
        <Field label="Title *">
          <Input value={title} onChangeText={setTitle} placeholder="Opportunity title" />
        </Field>
        <Field label="Organization *">
          <Input value={organization} onChangeText={setOrganization} placeholder="Organization name" />
        </Field>
        <Field label="Description">
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Full description"
            multiline
            style={styles.multiline}
          />
        </Field>
        <Field label="Image URL">
          <Input value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />
        </Field>
        <Field label="Deadline * (YYYY-MM-DD)">
          <Input value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" autoCapitalize="none" />
        </Field>
        <Field label="Apply URL">
          <Input
            value={applyUrl}
            onChangeText={setApplyUrl}
            placeholder="https://apply.example.com"
            autoCapitalize="none"
          />
        </Field>

        <Text style={styles.section}>Classification (matches user onboarding options)</Text>

        <FormField label="Category *">
          <SelectWithOther
            options={OPPORTUNITY_CATEGORY_OPTIONS}
            predefinedValues={PREDEFINED_OPPORTUNITY_CATEGORIES}
            value={category}
            onChange={setCategory}
            placeholder="Select opportunity type"
          />
        </FormField>

        <FormField label="Interest tags *">
          <MultiSelectWithOther
            options={OPPORTUNITY_TAG_OPTIONS}
            predefinedValues={PREDEFINED_OPPORTUNITY_TAGS}
            values={tags}
            onChange={setTags}
            syncOnChange
            placeholder="Select at least one interest tag"
          />
        </FormField>

        <FormField label="Country *">
          <CountrySelect
            value={country}
            onChange={setCountry}
            placeholder="Select country"
            extraOptions={[{ label: 'Global', value: 'Global' }]}
            extraPredefined={['Global']}
          />
        </FormField>

        <FormField label="Funding type *">
          <FundingPicker
            value={fundingType === 'any' ? 'fully_funded' : fundingType}
            onChange={setFundingType}
            excludeAny
          />
        </FormField>

        <FormField label="Education level *">
          <MultiSelectWithOther
            options={[...OPPORTUNITY_DEGREE_OPTIONS]}
            predefinedValues={OPPORTUNITY_DEGREE_VALUES}
            values={degreeLevels}
            onChange={setDegreeLevels}
            syncOnChange
            placeholder="Select education levels"
          />
        </FormField>

        <FormField label="Location type *">
          <SelectWithOther
            options={OPPORTUNITY_LOCATION_SELECT_OPTIONS}
            predefinedValues={PREDEFINED_OPPORTUNITY_LOCATIONS}
            value={locationType}
            onChange={(v) => setLocationType(v as LocationType | '')}
            placeholder="Select location type"
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
