import { useEffect, useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { CountrySelect, FormField } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { mapToUserProfile } from '@/services/api/mappers/profile.mapper';
import { spacing } from '@/constants/theme';

export function PersonalInfoEditScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { user, profile: authProfile, userEmail } = useAuth();
  const setAuthProfile = useAuthStore((s) => s.setProfile);
  const { profile, refetch } = useProfileData();
  const { saveBasicInfo, isLoading, error, clearError } = useOnboardingActions();

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setCountry(profile.country ?? '');
      setAvatarUrl(profile.avatarUrl ?? authProfile?.avatarUrl ?? null);
    }
  }, [authProfile?.avatarUrl, profile]);

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

    const ok = await saveBasicInfo({ fullName: fullName.trim(), country: country.trim() });
    if (ok) {
      await refetch();
      router.back();
    }
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

        <FormField label="Full name *">
          <Input value={fullName} onChangeText={setFullName} placeholder="Your name" />
        </FormField>
        <FormField label="Country *">
          <CountrySelect value={country} onChange={setCountry} placeholder="Select your country" />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button onPress={() => void handleSave()} loading={isLoading} disabled={isLoading}>
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
    avatarCenter: { alignItems: 'center', paddingVertical: spacing.sm },
  });
}
