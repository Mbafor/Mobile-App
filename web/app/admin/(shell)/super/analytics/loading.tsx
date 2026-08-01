import { SkeletonPageHeader, SkeletonStatsSection } from '../../../skeleton-parts';

export default function SuperAdminAnalyticsLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonStatsSection tiles={5} />
      <SkeletonStatsSection tiles={2} />
      <SkeletonStatsSection tiles={2} />
      <SkeletonStatsSection tiles={2} />
    </div>
  );
}
