import { type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { OpportunityListScreen } from '@/features/admin/screens/OpportunityListScreen';

export default function AdminHomeScreen() {
  const { isReady } = useRequireAdmin();
  const { t } = useTranslation();
  if (!isReady) return null;

  return (
    <OpportunityListScreen
      routes={{
        create: ROUTES.ADMIN.CREATE as Href,
        paste: ROUTES.ADMIN.PASTE as Href,
        pending: ROUTES.ADMIN.PENDING as Href,
        weeklyDigest: ROUTES.ADMIN.WEEKLY_DIGEST as Href,
        edit: (id) => ROUTES.ADMIN.edit(id) as Href,
      }}
      title={t('admin.opportunityList.homeTitle')}
      subtitle={t('admin.opportunityList.homeSubtitle')}
    />
  );
}
