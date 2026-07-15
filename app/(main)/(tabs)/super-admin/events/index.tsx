import { type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { EventListScreen } from '@/features/admin/screens/EventListScreen';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminEventsIndex() {
  const { isReady } = useRequireSuperAdmin();
  const { t } = useTranslation();
  if (!isReady) return null;

  return (
    <EventListScreen
      routes={{
        create: ROUTES.SUPER_ADMIN.EVENT_CREATE as Href,
        edit: (id) => ROUTES.SUPER_ADMIN.eventEdit(id) as Href,
      }}
      title={t('events.admin.list.homeTitle')}
      subtitle={t('events.admin.list.homeSubtitle')}
    />
  );
}
