import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { AdminPendingReviewScreen } from '@/features/admin/screens';

export default function SuperAdminPendingReviewPage() {
  const { isReady } = useRequireSuperAdmin();
  if (!isReady) return null;
  return <AdminPendingReviewScreen />;
}
