import { Platform, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';

import { webCursorPointer, webTransition } from '@/constants/theme/webTheme';

type PressableStyleFn = (state: PressableStateCallbackType) => StyleProp<ViewStyle>;

/**
 * Wraps base + optional hover styles with web cursor, transitions, and hover feedback.
 * On native, returns only the base style (no hover).
 */
export function webPressableStyle(
  base: StyleProp<ViewStyle>,
  hover?: StyleProp<ViewStyle>,
): PressableStyleFn | StyleProp<ViewStyle> {
  if (Platform.OS !== 'web') {
    return base;
  }

  return (state: PressableStateCallbackType) => [
    webTransition,
    webCursorPointer,
    base,
    state.hovered && hover,
    state.pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
  ];
}
