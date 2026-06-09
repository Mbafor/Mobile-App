import { ActivityIndicator } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export function LoadingSpinner() {
  const { colors } = useTheme();
  return <ActivityIndicator color={colors.primary} />;
}
