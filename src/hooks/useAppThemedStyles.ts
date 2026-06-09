import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import type { AppTheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function useAppThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: AppTheme) => T,
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
