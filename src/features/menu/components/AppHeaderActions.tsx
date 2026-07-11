import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useAppStore } from '@/store/slices/app.slice';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';
import { ProfileHeaderMenu } from '@/features/menu/components/ProfileHeaderMenu';

/** Header right cluster — profile avatar then notification bell, flush right. */
export function AppHeaderActions() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { isSearchVisible, setSearchVisible } = useAppStore();

  const handleSearchPress = () => {
    router.push('/(main)/(tabs)/dashboard');
    setSearchVisible(!isSearchVisible);
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
          name={isSearchVisible ? "search" : "search-outline"}
          size={24}
          color={isSearchVisible ? colors.primary : colors.text}
        />
      </Pressable>
      <NotificationHeaderButton />
      <ProfileHeaderMenu />
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
