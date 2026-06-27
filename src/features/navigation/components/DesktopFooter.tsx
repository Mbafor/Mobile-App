import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ColorScheme } from '@/constants/theme/types';
import { webPressableStyle } from '@/utils/web/pressable';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'expo-router';

const SITE_URL = 'https://voila-africa.com';

export function DesktopFooter() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <Image
        source={require('@/assets/images/main_logo.png')}
        style={styles.logoImg}
        resizeMode="contain"
      />
      <View style={styles.linksRow}>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open(`${SITE_URL}/about`, '_blank');
          }}
        >
          <Text style={styles.link}>About</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open(`${SITE_URL}/mentor`, '_blank');
          }}
        >
          <Text style={styles.link}>Become a Mentor</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open(`${SITE_URL}/mentor`, '_blank');
          }}
        >
          <Text style={styles.link}>Become an Opportunity admin</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.HELP.INDEX)}
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
        >
          <Text style={styles.link}>Report an issue</Text>
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
    logoImg: { width: 80, height: 24, transform: [{ scale: 1.45 }] },
  });
}
