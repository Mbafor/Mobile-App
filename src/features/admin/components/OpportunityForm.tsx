import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  CountrySelect,
  FormField,
  MultiDegreeLevelPicker,
  MultiSelectWithOther,
  SelectWithOther,
} from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import {
  OPPORTUNITY_CATEGORY_OPTIONS,
  OPPORTUNITY_LOCATION_SELECT_OPTIONS,
  OPPORTUNITY_TAG_OPTIONS,
  PREDEFINED_OPPORTUNITY_CATEGORIES,
  PREDEFINED_OPPORTUNITY_COUNTRIES,
  PREDEFINED_OPPORTUNITY_LOCATIONS,
  PREDEFINED_OPPORTUNITY_TAGS,
} from '@/constants/opportunity-fields';
import { FundingPicker } from '@/features/onboarding/components/FundingPicker';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
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

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim() || !organization.trim() || !deadline.trim()) {
      setError('Title, organization, and deadline are required.');
      return;
    }
    if (!category.trim()) {
      setError('Select an opportunity category (same list as user opportunity types).');
      return;
    }
    if (!country.trim()) {
      setError('Select a country.');
      return;
    }
    if (tags.length === 0) {
      setError('Select at least one interest tag (same list as user interests).');
      return;
    }
    if (degreeLevels.length === 0) {
      setError('Select at least one degree level.');
      return;
    }
    if (!locationType) {
      setError('Select a location type.');
      return;
    }
    if (!fundingType || fundingType === 'any') {
      setError('Select a funding type for this listing.');
      return;
    }

    await onSubmit({
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
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
          placeholder="Select interests (for recommendations)"
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

      <FormField label="Degree levels *">
        <MultiDegreeLevelPicker values={degreeLevels} onChange={setDegreeLevels} />
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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button onPress={() => void handleSubmit()} loading={loading}>
        {submitLabel}
      </Button>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  section: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
    marginTop: spacing.sm,
  },
  field: { gap: spacing.xs },
  label: { fontWeight: '600', color: colors.text },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  hint: { marginTop: spacing.xs },
  error: { color: colors.error },
});
