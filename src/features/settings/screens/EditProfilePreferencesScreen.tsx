import { Redirect } from 'expo-router';

/** @deprecated Use the consolidated Settings screen. */
export function EditProfilePreferencesScreen() {
  return <Redirect href="/(main)/settings" />;
}
