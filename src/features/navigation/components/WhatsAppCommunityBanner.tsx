import { useState, useEffect } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { getItem, setItem } from '@/utils/storage/async-storage';

const STORAGE_KEY = 'whatsapp_community_banner_dismissed';
const WHATSAPP_URL =
  process.env.EXPO_PUBLIC_WHATSAPP_CHANNEL_URL ??
  'https://whatsapp.com/channel/0029VbBtgba6xCSPUQdGPO2C';

export function WhatsAppCommunityBanner() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void getItem(STORAGE_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const dismiss = async () => {
    setVisible(false);
    await setItem(STORAGE_KEY, 'true');
  };

  const join = async () => {
    await dismiss();
    await Linking.openURL(WHATSAPP_URL);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.left}>
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          <Text style={styles.message}>Join our WhatsApp community</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={join} style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}>
            <Text style={styles.joinText}>Join</Text>
          </Pressable>
          <Pressable onPress={dismiss} hitSlop={10} accessibilityLabel="Dismiss">
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      bottom: 90,
      left: 16,
      right: 16,
      zIndex: 9999,
      alignItems: 'center',
      pointerEvents: 'box-none',
    } as object,
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      maxWidth: 480,
      width: '100%',
      gap: 12,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    message: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      flexShrink: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    joinBtn: {
      backgroundColor: '#25D366',
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    pressed: { opacity: 0.8 },
    joinText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
