import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

export function PrivacySettingsScreen() {
  const router = useRouter();

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.DASHBOARD as Href)}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text muted style={styles.subtitle}>
            Control how your data is used and kept safe.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy settings</Text>
        <Text style={styles.body}>
          We protect your profile, preferences, and activity. Use this section to review account privacy guidance and get support for data requests.
        </Text>
        <Text muted style={styles.note}>
          To delete your account or request data export, visit Settings → Privacy or contact support.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 0,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1, gap: spacing.xs },
  subtitle: { color: colors.textMuted },
  card: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  cardTitle: { fontWeight: '700', fontSize: 15, color: colors.text },
  body: { lineHeight: 22, color: colors.text },
  note: { marginTop: spacing.sm, color: colors.textMuted },
});
