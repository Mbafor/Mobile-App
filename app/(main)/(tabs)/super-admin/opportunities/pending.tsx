import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { AdminPendingQueueScreen } from '@/features/admin/screens';

export default function SuperAdminPendingScreen() {
  const { isReady } = useRequireSuperAdmin();
  if (!isReady) return null;

  return <AdminPendingQueueScreen />;
}
