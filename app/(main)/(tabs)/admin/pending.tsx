import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { AdminPendingQueueScreen } from '@/features/admin/screens';

export default function AdminPendingScreen() {
  const { isReady } = useRequireAdmin();
  if (!isReady) return null;

  return <AdminPendingQueueScreen />;
}
