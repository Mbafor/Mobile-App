import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';

/** Header right cluster — search then notification bell, flush right. */
export function AppHeaderActions() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isSearchScreen = pathname.includes('/search');

  const handleSearchPress = () => {
    router.push(ROUTES.MAIN.SEARCH as any);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleSearchPress}
        style={styles.searchBtn}
        accessibilityRole="button"
        accessibilityLabel={t('navigation.search')}
        hitSlop={12}
      >
        <Ionicons
          name={isSearchScreen ? "search" : "search-outline"}
          size={24}
          color={isSearchScreen ? colors.primary : colors.text}
        />
      </Pressable>
      <NotificationHeaderButton />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  searchBtn: {
    padding: spacing.xs,
  },
});
}
