import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Text } from '@/components/ui';
import { REFERRAL_MESSAGE } from '@/constants/app';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';

export function ReferFriendScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const handleShare = async () => {
    try {
      await Share.share({ message: REFERRAL_MESSAGE });
    } catch {
      Alert.alert(t('menu.refer.shareErrorTitle'), t('menu.refer.shareErrorMessage'));
    }
  };

  return (
    <View style={styles.root}>
      <PageHeader title={t('menu.items.referFriend')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="people" size={34} color={colors.primary} />
          </View>
          <Text style={[styles.title, getWebFontStyle('bold')]}>
            {t('menu.refer.heroTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t('menu.refer.heroSubtitle')}
          </Text>
        </View>

        {/* Message preview */}
        <View style={styles.messageSection}>
          <Text style={styles.sectionLabel}>{t('menu.refer.messageLabel')}</Text>
          <Text style={styles.message}>{REFERRAL_MESSAGE}</Text>
        </View>

        {/* CTA */}
        <Button fullWidth onPress={() => void handleShare()}>
          {t('menu.refer.shareButton')}
        </Button>
        <Text style={styles.helper}>
          {t('menu.refer.shareHelper')}
        </Text>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  messageSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  message: {
    lineHeight: 24,
    color: colors.text,
    fontSize: 15,
  },
  helper: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
  },
});
}
