import { ActivityIndicator } from 'react-native';

import { colors } from '@/constants/theme';

export function LoadingSpinner() {
  return <ActivityIndicator color={colors.primary} />;
}
