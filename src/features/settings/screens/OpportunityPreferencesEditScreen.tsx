import { useEffect, useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { FundingPicker } from '@/features/onboarding/components';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { userPreferencesApi } from '@/services/api';
import {
  OPPORTUNITY_TYPE_OPTIONS,
  PREDEFINED_OPPORTUNITY_TYPES,
} from '@/constants/onboarding-options';
import { spacing } from '@/constants/theme';
import { formatListInput, parseListInput } from '@/utils/formatting';
import type { FundingPreference } from '@/types/domain/user-preferences';
import { parseSupabaseError } from '@/utils/errors';

export function OpportunityPreferencesEditScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { user } = useAuth();
  const { preferences, refetch } = useProfileData();

  const [opportunityTypes, setOpportunityTypes] = useState<string[]>([]);
  const [countriesText, setCountriesText] = useState('');
  const [funding, setFunding] = useState<FundingPreference>('any');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preferences) {
      setOpportunityTypes(preferences.opportunityTypes ?? []);
      setCountriesText(formatListInput(preferences.preferredCountries));
      setFunding(preferences.fundingPreference ?? 'any');
    }
  }, [preferences]);

  const handleSave = async () => {
    setError(null);

    if (!user?.id) return;
    if (opportunityTypes.length === 0) {
      Alert.alert('Required field', 'Select at least one opportunity type.');
      return;
    }

    const preferredCountries = parseListInput(countriesText);
    if (preferredCountries.length === 0) {
      Alert.alert('Required field', 'Add at least one preferred country.');
      return;
    }

    setIsSaving(true);
    const { error: saveError } = await userPreferencesApi.saveFullPreferences(user.id, {
      opportunityTypes,
      preferredCountries,
      fundingPreference: funding,
    });
    setIsSaving(false);

    if (saveError) {
      setError(parseSupabaseError(saveError).message);
      return;
    }

    await refetch();
    router.back();
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
        <FormField label="Opportunity types *">
          <MultiSelectWithOther
            options={OPPORTUNITY_TYPE_OPTIONS}
            predefinedValues={PREDEFINED_OPPORTUNITY_TYPES}
            values={opportunityTypes}
            onChange={setOpportunityTypes}
            placeholder="Types you are looking for"
          />
        </FormField>
        <FormField label="Preferred countries (comma-separated) *">
          <Input
            value={countriesText}
            onChangeText={setCountriesText}
            placeholder="e.g. UK, Germany, Canada"
            multiline
          />
        </FormField>
        <FormField label="Funding preference *">
          <FundingPicker value={funding} onChange={setFunding} />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button onPress={() => void handleSave()} loading={isSaving} disabled={isSaving}>
          Save
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
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
  });
}
