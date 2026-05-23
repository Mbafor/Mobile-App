import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { CountrySelect, FormField, MultiSelectWithOther, SelectWithOther } from '@/components/forms';
import { Screen } from '@/components/layout';
import { Button, Input, Text } from '@/components/ui';
import { FundingPicker } from '@/features/onboarding/components';
import { DegreeLevelPicker } from '@/features/onboarding/components/DegreeLevelPicker';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { mapToUserProfile } from '@/services/api/mappers/profile.mapper';
import {
  COURSE_MAJOR_OPTIONS,
  INTEREST_OPTIONS,
  OPPORTUNITY_TYPE_OPTIONS,
  PREDEFINED_COURSE_MAJORS,
  PREDEFINED_INTERESTS,
  PREDEFINED_OPPORTUNITY_TYPES,
} from '@/constants/onboarding-options';
import { colors, spacing } from '@/constants/theme';
import { formatListInput, parseListInput } from '@/utils/formatting';
import type { FundingPreference } from '@/types/domain/user-preferences';

export function EditProfilePreferencesScreen() {
  const router = useRouter();
  const { user, profile: authProfile, userEmail } = useAuth();
  const setAuthProfile = useAuthStore((s) => s.setProfile);
  const { profile, preferences, isLoading: loadingData, refetch } = useProfileData();
  const { saveAllForEdit, isLoading, error, clearError } = useOnboardingActions();

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('bachelors');
  const [courseMajor, setCourseMajor] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [careerText, setCareerText] = useState('');
  const [opportunityTypes, setOpportunityTypes] = useState<string[]>([]);
  const [countriesText, setCountriesText] = useState('');
  const [funding, setFunding] = useState<FundingPreference>('any');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setCountry(profile.country ?? '');
      setUniversity(profile.university ?? '');
      setDegreeLevel(profile.degreeLevel ?? 'bachelors');
      setCourseMajor(profile.courseMajor ?? '');
      setInterests(profile.interests ?? []);
      setCareerText(formatListInput(profile.careerInterests));
      setAvatarUrl(profile.avatarUrl ?? authProfile?.avatarUrl ?? null);
    }
  }, [authProfile?.avatarUrl, profile]);

  const handleAvatarUpdated = (url: string) => {
    setAvatarUrl(url);
    if (profile && user) {
      const next = mapToUserProfile({ ...profile, avatarUrl: url }, userEmail);
      setAuthProfile(next);
    }
  };

  const handleSave = async () => {
    clearError();

    if (!fullName.trim() || !country.trim()) {
      Alert.alert('Required fields', 'Please enter your name and country.');
      return;
    }
    if (!university.trim() || !courseMajor.trim()) {
      Alert.alert('Required fields', 'Please enter your university and course/major.');
      return;
    }
    if (interests.length === 0) {
      Alert.alert('Required fields', 'Select at least one interest.');
      return;
    }
    if (opportunityTypes.length === 0) {
      Alert.alert('Required fields', 'Select at least one opportunity type.');
      return;
    }

    const preferredCountries = parseListInput(countriesText);
    if (preferredCountries.length === 0) {
      Alert.alert('Required fields', 'Add at least one preferred country.');
      return;
    }

    const ok = await saveAllForEdit(
      { fullName: fullName.trim(), country: country.trim() },
      {
        university: university.trim(),
        degreeLevel,
        courseMajor: courseMajor.trim(),
        interests,
        careerInterests: parseListInput(careerText),
      },
      { opportunityTypes, preferredCountries, fundingPreference: funding },
    );

    if (ok) {
      await refetch();
      Alert.alert('Saved', 'Your profile and preferences were updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (loadingData && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {user?.id ? (
            <ProfileAvatar
              userId={user.id}
              displayName={fullName || authProfile?.displayName || null}
              avatarUrl={avatarUrl}
              onAvatarUpdated={handleAvatarUpdated}
            />
          ) : null}

          <View style={styles.header}>
            <Text muted>Update your details to improve recommendations.</Text>
          </View>

          {userEmail ? (
            <View style={styles.emailBlock}>
              <Text variant="caption" muted>
                Email
              </Text>
              <Text>{userEmail}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>About you</Text>
          <FormField label="Full name *">
            <Input value={fullName} onChangeText={setFullName} placeholder="Your name" />
          </FormField>
          <FormField label="Country *">
            <CountrySelect value={country} onChange={setCountry} placeholder="Select your country" />
          </FormField>
          <FormField label="University *">
            <Input value={university} onChangeText={setUniversity} placeholder="Institution" />
          </FormField>
          <FormField label="Degree level *">
            <DegreeLevelPicker value={degreeLevel} onChange={setDegreeLevel} />
          </FormField>
          <FormField label="Course / major *">
            <SelectWithOther
              options={COURSE_MAJOR_OPTIONS}
              predefinedValues={PREDEFINED_COURSE_MAJORS}
              value={courseMajor}
              onChange={setCourseMajor}
              placeholder="Select course or major"
            />
          </FormField>
          <FormField label="Interests *">
            <MultiSelectWithOther
              options={INTEREST_OPTIONS}
              predefinedValues={PREDEFINED_INTERESTS}
              values={interests}
              onChange={setInterests}
              placeholder="Select interests"
            />
          </FormField>

          <Text style={styles.sectionLabel}>Opportunity preferences</Text>
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
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={() => void handleSave()} loading={isLoading} disabled={isLoading}>
            Save changes
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  emailBlock: { gap: spacing.xs, marginBottom: spacing.sm },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
