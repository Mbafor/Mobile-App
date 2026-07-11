import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ColorScheme } from '@/constants/theme/types';
import { webPressableStyle } from '@/utils/web/pressable';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'expo-router';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

const WHATSAPP_URL =
  process.env.EXPO_PUBLIC_WHATSAPP_CHANNEL_URL ??
  'https://whatsapp.com/channel/0029VbBtgba6xCSPUQdGPO2C';

const SITE_URL = 'https://voila-africa.com';

export function DesktopFooter() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open(`${SITE_URL}/about`, '_blank', 'noopener,noreferrer');
          }}
        >
          <Text style={styles.link}>{t('navigation.footer.about')}</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open(`${SITE_URL}/mentor`, '_blank', 'noopener,noreferrer');
          }}
        >
          <Text style={styles.link}>{t('navigation.footer.becomeMentor')}</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open(`${SITE_URL}/mentor`, '_blank', 'noopener,noreferrer');
          }}
        >
          <Text style={styles.link}>{t('navigation.footer.becomeOpportunityAdmin')}</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.HELP.INDEX)}
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
        >
          <Text style={styles.link}>{t('navigation.footer.reportIssue')}</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => void openExternalUrl(WHATSAPP_URL)}
        >
          <View style={styles.whatsappLink}>
            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
            <Text style={styles.link}>{t('navigation.whatsapp.community')}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.background,
    },
    linksRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 4,
    },
    sep: { color: colors.textMuted, fontSize: 14, paddingHorizontal: 2 },
    link: { color: colors.textMuted, fontSize: 13 },
    linkPressable: { padding: 4, borderRadius: 6 },
    linkPressableHover: { backgroundColor: colors.surface },
    whatsappLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  });
}
