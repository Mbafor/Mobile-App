import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { AdminWeeklyDigestScreen } from '@/features/admin/screens';

export default function AdminWeeklyDigestRoute() {
  const { isReady } = useRequireAdmin();
  if (!isReady) return null;

  return <AdminWeeklyDigestScreen />;
}
