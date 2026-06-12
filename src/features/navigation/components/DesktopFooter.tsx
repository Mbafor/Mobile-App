import React from 'react';
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
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const isScrollable = scrollHeight > clientHeight + 1;
      const atBottom = isScrollable && window.scrollY + clientHeight >= scrollHeight - 20;
      setShow(atBottom);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);

  if (!show) return null;

  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <Pressable style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)} onPress={() => router.push('/(main)/help')}>
          <Text style={styles.link}>About</Text>
        </Pressable>
        <Pressable style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)} onPress={() => router.push('/(main)/help/feature-request')}>
          <Text style={styles.link}>Become a Mentor</Text>
        </Pressable>
        <Pressable style={webPressableStyle(styles.linkPressable, styles.linkPressableHover)} onPress={() => router.push('/(main)/help/feedback')}>
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
        <Text style={styles.brand}>Olives Forum</Text>
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
