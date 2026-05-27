import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';

type ResponsiveContainerProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
  minHorizontalPadding?: number;
}>;

function getDesktopGutter(width: number): number {
  if (width >= 1536) {
    return Platform.OS === 'web' ? 56 : 48;
  }
  if (width >= 1280) {
    return Platform.OS === 'web' ? 48 : 40;
  }
  if (width >= 1024) {
    return Platform.OS === 'web' ? 40 : 32;
  }
  if (width >= 768) {
    return 24;
  }
  return 0;
}

export function ResponsiveContainer({
  children,
  style,
  maxWidth = 1200,
  minHorizontalPadding = 0,
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.max(getDesktopGutter(width), minHorizontalPadding);
  const shouldConstrainWidth = width >= 1024;

  return (
    <View
      style={[
        styles.base,
        {
          maxWidth: shouldConstrainWidth ? maxWidth : undefined,
          paddingHorizontal: horizontalPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
  },
});
