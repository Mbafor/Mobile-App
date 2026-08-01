import { SkeletonPageHeader, SkeletonStatsSection } from '../skeleton-parts';

export default function AdminDashboardLoading() {
  return (
    <div>
      <SkeletonPageHeader withAction />
      <SkeletonStatsSection tiles={5} />
      <SkeletonStatsSection tiles={2} />
      <SkeletonStatsSection tiles={2} />
      <SkeletonStatsSection tiles={2} />
    </div>
  );
}
