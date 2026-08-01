import { SkeletonPageHeader, SkeletonStatsSection } from '../../skeleton-parts';

export default function SuperAdminOverviewLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonStatsSection tiles={4} />
      <SkeletonStatsSection tiles={4} />
    </div>
  );
}
