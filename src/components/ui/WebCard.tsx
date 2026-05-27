import type { PropsWithChildren } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { webCardBase, webCardShadowHover, webTransition } from '@/constants/theme/webTheme';
import { webPressableStyle } from '@/utils/web/pressable';

type WebCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  hoverable?: boolean;
  onPress?: () => void;
}>;

/**
 * Card surface with web elevation and optional hover lift. On native, renders a plain bordered View.
 */
export function WebCard({ children, style, hoverable = false, onPress }: WebCardProps) {
  const cardStyle = [styles.card, style];

  if (onPress || (hoverable && Platform.OS === 'web')) {
    return (
      <Pressable
        onPress={onPress}
        style={webPressableStyle(cardStyle, Platform.OS === 'web' ? [webCardShadowHover, styles.cardHover] : undefined)}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...webCardBase,
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  cardHover: Platform.OS === 'web' ? { transform: [{ translateY: -2 }] } : {},
});
