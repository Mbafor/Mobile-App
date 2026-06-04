import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipDataApi } from '@/services/api';
import { colors, spacing } from '@/constants/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
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

export function MentorBioSection() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const mentorQuery = useQuery({
    queryKey: ['mentorship', 'myMentorProfile', userId],
    queryFn: async () => {
      const result = await mentorshipDataApi.getMentorProfile(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  const mentorProfile = mentorQuery.data;

  useEffect(() => {
    setBio(mentorProfile?.bio ?? '');
  }, [mentorProfile?.bio]);

  if (!mentorProfile) {
    return null;
  }

  const handleSaveBio = async () => {
    setSaving(true);
    const result = await mentorshipDataApi.updateMentorBio(userId, bio);
    setSaving(false);

    if (!result.success) {
      Alert.alert('Could not save', result.error.message);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ['mentorship'] });
    Alert.alert('Saved', 'Your coach bio was updated.');
  };

  return (
    <SectionGroup title="Coach profile">
      <Text muted style={styles.hint}>
        Students see this when browsing coaches. Add a short introduction about your experience and
        how you mentor.
      </Text>
      <FormField label="About you">
        <Input
          value={bio}
          onChangeText={setBio}
          placeholder="e.g. I mentor students in tech careers and scholarship applications…"
          multiline
          style={styles.bioInput}
        />
      </FormField>
      <Button variant="secondary" onPress={() => void handleSaveBio()} loading={saving}>
        Save bio
      </Button>
    </SectionGroup>
  );
}

const styles = StyleSheet.create({
  hint: { lineHeight: 20, marginBottom: spacing.xs },
  bioInput: { minHeight: 120, textAlignVertical: 'top' },
});
