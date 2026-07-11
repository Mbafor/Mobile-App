import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { spacing } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';
import { useWebDesktop } from '@/hooks/useWebDesktop';

export function FloatingHelpButton() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isDesktopWeb = useWebDesktop();

  if (!isDesktopWeb) return null;

  const bottom = spacing.xl;

  return (
    <Pressable
      onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as Href)}
      style={({ pressed }) => [styles.fab, { bottom }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t('help.title')}
      hitSlop={8}
    >
      <Ionicons name="help" size={22} color={colors.textOnPrimary} />
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.md + spacing.xs,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 999,
  },
  pressed: { opacity: 0.8 },
});
}
