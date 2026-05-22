import { useRouter } from 'expo-router';
import { Alert, Pressable, Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';

import { REFERRAL_MESSAGE } from '@/constants/app';
import { colors, spacing, typography } from '@/constants/theme';

export function ReferFriendScreen() {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: REFERRAL_MESSAGE,
      });
    } catch {
      Alert.alert(
        'Unable to share',
        'Please try again.'
      );
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.back}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="people"
              size={34}
              color="#166534"
            />
          </View>

          <Text style={styles.title}>
            Refer a Friend
          </Text>

          <Text style={styles.subtitle}>
            Share opportunities with friends and
            help them discover something valuable.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color={colors.primary}
            />

            <Text style={styles.cardTitle}>
              Invite Message
            </Text>
          </View>

          <Text style={styles.message}>
            {REFERRAL_MESSAGE}
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <Button
            fullWidth
            onPress={() => void handleShare()}
          >
            Share Invite
          </Button>

          <Text style={styles.helper}>
            Share through WhatsApp, Messages,
            Email and more.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },

  header: {
    marginBottom: spacing.lg,
  },

  back: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: '#ECFDF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  cardTitle: {
    fontWeight: '600',
  },

  message: {
    lineHeight: 24,
    color: colors.text,
  },

  footer: {
    marginTop: 'auto',
    gap: spacing.md,
  },

  helper: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
  },
});