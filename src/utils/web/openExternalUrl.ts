import { Linking, Platform } from 'react-native';

/**
 * Opens an external URL in a new tab on web (preventing the blank about:blank
 * screen on mobile browsers) and in the default browser on native.
 * Do NOT use this for mailto: or tel: links — those go through Linking directly.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    await Linking.openURL(url);
  }
}
