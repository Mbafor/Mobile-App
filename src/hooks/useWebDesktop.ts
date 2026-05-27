import { Platform, useWindowDimensions } from 'react-native';

const DESKTOP_BREAKPOINT = 1024;
const MOBILE_WEB_BREAKPOINT = 768;
const WIDE_BREAKPOINT = 1280;

/**
 * True on web viewports >= 1024px — use for desktop typography and spacing only.
 */
export function useWebDesktop(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
}

export function useWebWide(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= WIDE_BREAKPOINT;
}

/** Web on a phone-sized viewport — use drawer for primary nav instead of top tabs. */
export function useWebMobile(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width < MOBILE_WEB_BREAKPOINT;
}

export function useIsWeb(): boolean {
  return Platform.OS === 'web';
}

/** App uses the fixed web top bar (hide duplicate in-screen headers). */
export function useWebAppShell(): boolean {
  return Platform.OS === 'web';
}
