import { useRouter, type Href } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { OpportunityPasteScreen } from '@/features/admin/screens/OpportunityPasteScreen';

export default function AdminPasteScreen() {
  const router = useRouter();
  const { isReady } = useRequireAdmin();
  if (!isReady) return null;

  return (
    <OpportunityPasteScreen
      onDone={() => router.replace(ROUTES.ADMIN.HOME as Href)}
    />
  );
}
