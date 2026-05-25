import { Redirect } from 'expo-router';

/** @deprecated Use the consolidated Settings screen. */
export function PrivacySettingsScreen() {
  return <Redirect href="/(main)/settings" />;
}
