import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

const SUPPORT_EMAIL = 'olivesforum@gmail.com';

type HelpItem = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  onPress?: () => void;
};

const items: HelpItem[] = [
  {
    label: 'Report a Bug',
    subtitle: 'Found something broken? Let us know.',
    icon: 'bug-outline',
    route: ROUTES.MAIN.HELP.REPORT_BUG,
  },
  {
    label: 'Feature Request',
    subtitle: 'Suggest an improvement or new feature.',
    icon: 'bulb-outline',
    route: ROUTES.MAIN.HELP.FEATURE_REQUEST,
  },
  {
    label: 'Leave Feedback',
    subtitle: 'Rate your experience and share your thoughts.',
    icon: 'chatbubble-ellipses-outline',
    route: ROUTES.MAIN.HELP.FEEDBACK,
  },
  {
    label: 'Contact Support',
    subtitle: `Email us at ${SUPPORT_EMAIL}`,
    icon: 'mail-outline',
    onPress: () =>
      void Linking.openURL(
        `mailto:${SUPPORT_EMAIL}?subject=Support Request — Olives Forum`,
      ),
  },
];

export default function HelpIndexScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>
        How can we help you? Choose an option below.
      </Text>

      <View style={styles.list}>
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.row,
              i < items.length - 1 && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
            onPress={item.route ? () => router.push(item.route as Href) : item.onPress}
            accessibilityRole="button"
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.rowMeta}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  intro: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.surface },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMeta: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
