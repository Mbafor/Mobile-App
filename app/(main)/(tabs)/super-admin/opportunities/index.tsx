import { type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { OpportunityListScreen } from '@/features/admin/screens/OpportunityListScreen';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminOpportunitiesIndex() {
  const { isReady } = useRequireSuperAdmin();
  const { t } = useTranslation();
  if (!isReady) return null;

  return (
    <OpportunityListScreen
      routes={{
        create: ROUTES.SUPER_ADMIN.OPPORTUNITY_CREATE as Href,
        paste: ROUTES.SUPER_ADMIN.OPPORTUNITY_PASTE as Href,
        pending: ROUTES.SUPER_ADMIN.OPPORTUNITY_PENDING as Href,
        edit: (id) => ROUTES.SUPER_ADMIN.opportunityEdit(id) as Href,
      }}
      title={t('admin.opportunityList.homeTitle')}
      subtitle={t('superAdmin.opportunities.homeSubtitle')}
    />
  );
}
