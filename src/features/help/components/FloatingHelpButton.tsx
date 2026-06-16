import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/hooks/useTheme';

export function FloatingHelpButton() {
  const { colors } = useTheme();
  const router = useRouter();

  const bottom = Platform.OS === 'web' ? 20 : 88;

  return (
    <Pressable
      onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as import('expo-router').Href)}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: colors.primary, bottom },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Help & Support"
    >
      <Ionicons name="help" size={20} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
