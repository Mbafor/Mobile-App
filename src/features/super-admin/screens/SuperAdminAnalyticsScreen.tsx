import { Screen } from '@/components/layout';
import { PlatformAnalyticsPanel } from '@/features/admin/components/PlatformAnalyticsPanel';

export function SuperAdminAnalyticsScreen() {
  return (
    <Screen padded={false}>
      <PlatformAnalyticsPanel />
    </Screen>
  );
}
