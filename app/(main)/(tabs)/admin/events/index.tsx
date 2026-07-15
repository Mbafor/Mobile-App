import { type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { EventListScreen } from '@/features/admin/screens/EventListScreen';

export default function AdminEventsIndexScreen() {
  const { isReady } = useRequireAdmin();
  const { t } = useTranslation();
  if (!isReady) return null;

  return (
    <EventListScreen
      routes={{
        create: ROUTES.ADMIN.EVENT_CREATE as Href,
        edit: (id) => ROUTES.ADMIN.eventEdit(id) as Href,
      }}
      title={t('events.admin.list.homeTitle')}
      subtitle={t('events.admin.list.homeSubtitle')}
    />
  );
}
