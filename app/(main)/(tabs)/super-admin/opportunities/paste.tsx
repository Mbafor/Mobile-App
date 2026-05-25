import { useRouter, type Href } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { OpportunityPasteScreen } from '@/features/admin/screens/OpportunityPasteScreen';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminPasteOpportunities() {
  const router = useRouter();
  const { isReady } = useRequireSuperAdmin();
  if (!isReady) return null;

  return (
    <OpportunityPasteScreen
      onDone={() => router.replace(ROUTES.SUPER_ADMIN.OPPORTUNITIES as Href)}
    />
  );
}
