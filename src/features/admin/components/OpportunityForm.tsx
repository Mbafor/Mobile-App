import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import {
  FILTER_CATEGORIES,
  FILTER_COUNTRIES,
  FILTER_DEGREE_LEVELS,
  FILTER_FUNDING_TYPES,
  FILTER_LOCATION_TYPES,
  FUNDING_TYPE_LABELS,
} from '@/constants/search-filters';
import { colors, spacing } from '@/constants/theme';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { formatListInput, parseListInput } from '@/utils/formatting';
import type { LocationType } from '@/types/domain/opportunity';

const OPPORTUNITY_FUNDING_TYPES = FILTER_FUNDING_TYPES.filter((v) => v !== 'any');

type OpportunityFormProps = {
  initialValues: OpportunityFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: OpportunityFormValues) => void | Promise<void>;
};

function ChipRow({
  options,
  selected,
  onToggle,
  formatLabel,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  formatLabel?: (value: string) => string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {formatLabel ? formatLabel(option) : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SingleChipRow({
  options,
  value,
  onChange,
  formatLabel,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  formatLabel?: (value: string) => string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(active ? '' : option.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {formatLabel ? formatLabel(option.value) : option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
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
  const [tagsText, setTagsText] = useState(formatListInput(initialValues.tags));
  const [country, setCountry] = useState(initialValues.country);
  const [category, setCategory] = useState(initialValues.category);
  const [fundingType, setFundingType] = useState(initialValues.fundingType);
  const [degreeLevels, setDegreeLevels] = useState(initialValues.degreeLevels);
  const [locationType, setLocationType] = useState(initialValues.locationType);
  const [applyUrl, setApplyUrl] = useState(initialValues.applyUrl);
  const [error, setError] = useState<string | null>(null);

  const toggleDegree = (level: string) => {
    setDegreeLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim() || !organization.trim() || !deadline.trim()) {
      setError('Title, organization, and deadline are required.');
      return;
    }

    await onSubmit({
      title,
      organization,
      description,
      imageUrl,
      deadline,
      tags: parseListInput(tagsText),
      country,
      category,
      fundingType,
      degreeLevels,
      locationType: locationType as LocationType | '',
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
      <Field label="Tags (comma-separated)">
        <Input value={tagsText} onChangeText={setTagsText} placeholder="Internship, Technology" />
      </Field>
      <Field label="Country">
        <SingleChipRow
          options={FILTER_COUNTRIES.map((c) => ({ value: c, label: c }))}
          value={country}
          onChange={setCountry}
        />
      </Field>
      <Field label="Category">
        <SingleChipRow
          options={FILTER_CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={setCategory}
        />
      </Field>
      <Field label="Funding type">
        <SingleChipRow
          options={OPPORTUNITY_FUNDING_TYPES.map((c) => ({
            value: c,
            label: FUNDING_TYPE_LABELS[c] ?? c,
          }))}
          value={fundingType}
          onChange={setFundingType}
          formatLabel={(v) => FUNDING_TYPE_LABELS[v] ?? v}
        />
      </Field>
      <Field label="Degree levels">
        <ChipRow options={FILTER_DEGREE_LEVELS} selected={degreeLevels} onToggle={toggleDegree} />
      </Field>
      <Field label="Location type">
        <SingleChipRow
          options={FILTER_LOCATION_TYPES}
          value={locationType}
          onChange={(v) => setLocationType(v as LocationType | '')}
        />
      </Field>
      <Field label="Apply URL">
        <Input
          value={applyUrl}
          onChangeText={setApplyUrl}
          placeholder="https://apply.example.com"
          autoCapitalize="none"
        />
      </Field>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

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
  field: { gap: spacing.xs },
  label: { fontWeight: '600', color: colors.text },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.background },
  error: { color: colors.error },
});
