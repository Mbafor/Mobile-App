import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { AdminPendingReviewScreen } from '@/features/admin/screens';

export default function AdminPendingReviewPage() {
  const { isReady } = useRequireAdmin();
  if (!isReady) return null;

  return <AdminPendingReviewScreen />;
}
