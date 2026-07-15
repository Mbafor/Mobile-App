import { DrawerToggleButton } from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type ScreenHeaderBarProps = {
  title: string;
};

/** Header for top-level screens reached outside the tab bar (e.g. Events, Settings) — gives them the same drawer toggle + search + notifications every tab screen already has. */
export function ScreenHeaderBar({ title }: ScreenHeaderBarProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top }]}>
      <DrawerToggleButton tintColor={colors.text} />
      <Text style={[styles.title, getWebFontStyle('semibold')]} numberOfLines={1}>
        {title}
      </Text>
      <AppHeaderActions />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.2,
    },
  });
}
