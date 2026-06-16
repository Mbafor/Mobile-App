import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ColorScheme } from '@/constants/theme/types';
import { webPressableStyle } from '@/utils/web/pressable';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'expo-router';

export function DesktopFooter() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open('/about', '_blank');
          }}
        >
          <Text style={styles.link}>About</Text>
        </Pressable>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open('/mentor', '_blank');
          }}
        >
          <Text style={styles.link}>Become a Mentor</Text>
        </Pressable>
        <Pressable
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
          onPress={() => {
            if (typeof window !== 'undefined') window.open('/mentor', '_blank');
          }}
        >
          <Text style={styles.link}>Become an Opportunity admin</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.HELP.INDEX)}
          style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)}
        >
          <Text style={styles.link}>Report an issue</Text>
        </Pressable>
      </View>

      <View style={styles.brandRow}>
        <Text style={styles.brand}>Voila</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    footer: {
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 20,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
    },
    linksRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
    link: { color: colors.text, fontSize: 14 },
    linkPressable: { padding: 4, borderRadius: 6 },
    linkPressableHover: { backgroundColor: colors.surface },
    brandRow: {},
    brand: { color: colors.text, fontWeight: '700' },
  });
}
