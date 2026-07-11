import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/layout/PageHeader';
import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';

const SUPPORT_EMAIL = 'Voila@gmail.com';

type HelpItem = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  onPress?: () => void;
};

export default function HelpIndexScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const items: HelpItem[] = [
    {
      label: t('help.index.reportBug.label'),
      subtitle: t('help.index.reportBug.subtitle'),
      icon: 'bug-outline',
      route: ROUTES.MAIN.HELP.REPORT_BUG,
    },
    {
      label: t('help.index.featureRequest.label'),
      subtitle: t('help.index.featureRequest.subtitle'),
      icon: 'bulb-outline',
      route: ROUTES.MAIN.HELP.FEATURE_REQUEST,
    },
    {
      label: t('help.index.feedback.label'),
      subtitle: t('help.index.feedback.subtitle'),
      icon: 'chatbubble-ellipses-outline',
      route: ROUTES.MAIN.HELP.FEEDBACK,
    },
    {
      label: t('help.index.contact.label'),
      subtitle: t('help.index.contact.subtitle', { email: SUPPORT_EMAIL }),
      icon: 'mail-outline',
      onPress: () =>
        void Linking.openURL(
          `mailto:${SUPPORT_EMAIL}?subject=Support Request — Voila`,
        ),
    },
  ];

  return (
    <View style={styles.root}>
      <PageHeader title={t('help.title')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          {t('help.index.intro')}
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
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    maxWidth: 1200,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
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
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowMeta: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
}
