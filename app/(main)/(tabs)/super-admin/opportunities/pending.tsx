import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { AdminPendingQueueScreen } from '@/features/admin/screens';
import { ROUTES } from '@/constants/routes';

export default function SuperAdminPendingScreen() {
  const { isReady } = useRequireSuperAdmin();
  if (!isReady) return null;

  return <AdminPendingQueueScreen pendingReviewFn={ROUTES.SUPER_ADMIN.pendingReview} />;
}
