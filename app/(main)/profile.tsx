import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';

/** Legacy drawer profile route → profile & preferences screen. */
export default function ProfileRedirect() {
  return <Redirect href={ROUTES.MAIN.SETTINGS_PROFILE} />;
}
