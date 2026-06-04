import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { CountrySelect, FormField, MultiSelectWithOther, SelectWithOther } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { FundingPicker } from '@/features/onboarding/components';
import { DegreeLevelPicker } from '@/features/onboarding/components/DegreeLevelPicker';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { MentorBioSection } from '@/features/settings/components/MentorBioSection';
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

function SectionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={groupStyles.wrap}>
      <Text style={groupStyles.heading}>{title}</Text>
      <View style={groupStyles.body}>{children}</View>
    </View>
  );
}

const groupStyles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  body: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export function ProfilePreferencesSection() {
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
      setAvatarUrl(profile.avatarUrl ?? authProfile?.avatarUrl ?? null);
    }
  }, [authProfile?.avatarUrl, profile]);

  useEffect(() => {
    if (preferences) {
      setOpportunityTypes(preferences.opportunityTypes ?? []);
      setCountriesText(formatListInput(preferences.preferredCountries));
      setFunding(preferences.fundingPreference ?? 'any');
    }
  }, [preferences]);

  const handleAvatarUpdated = (url: string) => {
    setAvatarUrl(url);
    if (profile && user) {
      const next = mapToUserProfile({ ...profile, avatarUrl: url }, userEmail ?? '');
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
        careerInterests: profile?.careerInterests ?? [],
      },
      { opportunityTypes, preferredCountries, fundingPreference: funding },
    );

    if (ok) {
      await refetch();
      Alert.alert('Saved', 'Your profile and preferences were updated.');
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
    <View style={styles.wrap}>
      {/* Avatar */}
      {user?.id ? (
        <View style={styles.avatarCenter}>
          <ProfileAvatar
            userId={user.id}
            displayName={fullName || authProfile?.displayName || null}
            avatarUrl={avatarUrl}
            onAvatarUpdated={handleAvatarUpdated}
          />
        </View>
      ) : null}

      <SectionGroup title="Personal info">
        <FormField label="Full name *">
          <Input value={fullName} onChangeText={setFullName} placeholder="Your name" />
        </FormField>
        <FormField label="Country *">
          <CountrySelect value={country} onChange={setCountry} placeholder="Select your country" />
        </FormField>
      </SectionGroup>

      <SectionGroup title="Academic info">
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
      </SectionGroup>

      <MentorBioSection />

      <SectionGroup title="Opportunity preferences">
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
      </SectionGroup>

      {error ? <ErrorMessage message={error} /> : null}

      <Button onPress={() => void handleSave()} loading={isLoading} disabled={isLoading}>
        Save profile & preferences
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  avatarCenter: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
