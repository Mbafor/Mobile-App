import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Must match `app/(main)/(tabs)/_layout.tsx` tab bar sizing. */
export const MAIN_TAB_BAR_BASE_HEIGHT = 56;

export function useMainTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return MAIN_TAB_BAR_BASE_HEIGHT + insets.bottom;
}
