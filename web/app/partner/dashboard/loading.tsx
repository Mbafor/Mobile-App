import { SkeletonBar, SkeletonListRows, SkeletonPageHeader, SkeletonSection, SkeletonStatsRow } from './skeleton-parts';

export default function DashboardLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonStatsRow />

      <div className="mb-6">
        <SkeletonSection>
          <SkeletonBar className="h-5 w-44 mb-3" />
          <SkeletonListRows count={5} />
        </SkeletonSection>
      </div>

      <SkeletonSection>
        <SkeletonBar className="h-5 w-28 mb-3" />
        <div className="flex flex-wrap gap-2">
          <SkeletonBar className="h-9 w-28" />
          <SkeletonBar className="h-9 w-28" />
          <SkeletonBar className="h-9 w-28" />
        </div>
      </SkeletonSection>
    </div>
  );
}
