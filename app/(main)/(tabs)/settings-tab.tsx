import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';

/** Tab entry redirects into the settings stack. */
export default function SettingsTab() {
  return <Redirect href={ROUTES.MAIN.SETTINGS} />;
}
