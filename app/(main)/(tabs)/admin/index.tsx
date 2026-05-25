import { type Href } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { OpportunityListScreen } from '@/features/admin/screens/OpportunityListScreen';

export default function AdminHomeScreen() {
  const { isReady } = useRequireAdmin();
  if (!isReady) return null;

  return (
    <OpportunityListScreen
      routes={{
        create: ROUTES.ADMIN.CREATE as Href,
        paste: ROUTES.ADMIN.PASTE as Href,
        edit: (id) => ROUTES.ADMIN.edit(id) as Href,
      }}
      title="Manage opportunities"
      subtitle="Add and maintain listings students see in the app. Analytics are available in Super Admin."
    />
  );
}
